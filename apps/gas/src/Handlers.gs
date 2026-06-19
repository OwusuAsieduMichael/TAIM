// --- Auth ---

function authAdminLogin_(body) {
  var email = String(body.email || '').toLowerCase().trim();
  var password = String(body.password || '');
  var user = findOne_('Users', function (u) {
    return (
      u.email &&
      String(u.email).toLowerCase() === email &&
      (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') &&
      u.status === 'ACTIVE'
    );
  });
  if (!user || !user.passwordHash || !verifyPassword_(password, user.passwordHash)) {
    throw httpError_(401, 'Invalid credentials');
  }
  return tokenResponse_(user);
}

function authOtpRequest_(body, role) {
  var school = findOne_('Schools', function (s) {
    return s.slug === body.schoolSlug;
  });
  if (!school) {
    throw httpError_(404, 'School not found');
  }
  var phone = normalizePhone_(body.phone);
  var user = findSchoolUserByPhoneAndRole_(school.id, phone, role);
  if (!user) {
    throw httpError_(404, 'No account for this phone and role');
  }
  var code = generateOtpCode_();
  insert_('OtpCodes', {
    schoolId: school.id,
    userId: user.id,
    phone: phone,
    purpose: role + '_LOGIN',
    codeHash: hashOtp_(code),
    expiresAt: new Date(Date.now() + CONFIG.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString(),
    attempts: 0,
    consumedAt: null,
  });
  Logger.log('[TAIM OTP] ' + role + ' ' + phone + ' code: ' + code);
  return { message: 'OTP sent', expiresInMinutes: CONFIG.OTP_EXPIRY_MINUTES };
}

function authOtpVerify_(body, role) {
  var school = findOne_('Schools', function (s) {
    return s.slug === body.schoolSlug;
  });
  if (!school) {
    throw httpError_(404, 'School not found');
  }
  var phone = normalizePhone_(body.phone);
  if (String(body.code) === CONFIG.DEMO_OTP_CODE) {
    var demoUser = findDemoSchoolUser_(school.id, phone, role);
    if (demoUser) {
      return tokenResponse_(demoUser);
    }
  }
  var otps = findAll_('OtpCodes', function (o) {
    return (
      o.schoolId === school.id &&
      o.phone === phone &&
      o.purpose === role + '_LOGIN' &&
      !o.consumedAt &&
      new Date(o.expiresAt).getTime() > Date.now()
    );
  });
  otps.sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  var otp = otps[0];
  if (!otp) {
    throw httpError_(400, 'No active OTP');
  }
  if (Number(otp.attempts) >= CONFIG.MAX_OTP_ATTEMPTS) {
    throw httpError_(429, 'Too many attempts');
  }
  if (!verifyOtp_(String(body.code), otp.codeHash)) {
    updateById_('OtpCodes', otp.id, { attempts: Number(otp.attempts || 0) + 1 });
    throw httpError_(401, 'Invalid OTP');
  }
  updateById_('OtpCodes', otp.id, { consumedAt: new Date().toISOString() });
  var user = findSchoolUserByPhoneAndRole_(school.id, phone, role);
  if (!user) {
    throw httpError_(404, 'User not found');
  }
  return tokenResponse_(user);
}

function authStudentLogin_(body) {
  var school = findOne_('Schools', function (s) {
    return s.slug === body.schoolSlug;
  });
  if (!school) {
    throw httpError_(404, 'School not found');
  }
  var student = findOne_('Students', function (st) {
    return st.schoolId === school.id && String(st.admissionNumber) === String(body.admissionNumber).trim();
  });
  if (!student || !verifyPassword_(String(body.pin), student.pinHash)) {
    throw httpError_(401, 'Invalid admission number or PIN');
  }
  var user = findOne_('Users', function (u) {
    return u.id === student.userId;
  });
  if (!user || user.status !== 'ACTIVE' || user.role !== 'STUDENT') {
    throw httpError_(403, 'Account inactive');
  }
  var token = signJwt_({ sub: user.id, role: 'STUDENT', schoolId: student.schoolId });
  return {
    accessToken: token,
    user: {
      id: user.id,
      fullName: student.firstName + ' ' + student.lastName,
      role: 'STUDENT',
      schoolId: student.schoolId,
      studentId: student.id,
      admissionNumber: student.admissionNumber,
    },
  };
}

function authMe_(userId) {
  var user = findOne_('Users', function (u) {
    return u.id === userId;
  });
  if (!user) {
    throw httpError_(404, 'User not found');
  }
  var studentOut = null;
  if (user.role === 'STUDENT') {
    var sp = findOne_('Students', function (s) {
      return s.userId === user.id;
    });
    if (sp) {
      var school = findOne_('Schools', function (s) {
        return s.id === sp.schoolId;
      });
      var klass = sp.classId
        ? findOne_('Classes', function (c) {
            return c.id === sp.classId;
          })
        : null;
      var year = klass && klass.academicYearId
        ? findOne_('AcademicYears', function (y) {
            return y.id === klass.academicYearId;
          })
        : null;
      var terms = year
        ? findAll_('Terms', function (t) {
            return t.academicYearId === year.id;
          })
        : [];
      terms.sort(function (a, b) {
        return Number(a.order) - Number(b.order);
      });
      var today = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd');
      var todayAtt = findOne_('Attendance', function (a) {
        return a.studentId === sp.id && String(a.date).slice(0, 10) === today;
      });
      var recent = findAll_('Attendance', function (a) {
        return a.studentId === sp.id;
      });
      recent.sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
      recent = recent.slice(0, 14);
      var guardians = findAll_('StudentParents', function (l) {
        return l.studentId === sp.id;
      }).map(function (link) {
        var parent = findOne_('Users', function (u) {
          return u.id === link.parentId;
        });
        return {
          name: parent ? parent.fullName : 'Guardian',
          phone: parent ? parent.phone : null,
          relation: link.relation || 'Guardian',
        };
      });
      studentOut = {
        id: sp.id,
        admissionNumber: sp.admissionNumber,
        classId: sp.classId,
        schoolName: school ? school.name : null,
        schoolSlug: school ? school.slug : null,
        className: klass ? klass.name : null,
        classLevel: klass ? klass.level : null,
        attendanceToday: todayAtt ? todayAtt.status : null,
        attendanceRecent: recent.map(function (r) {
          return { date: String(r.date).slice(0, 10), status: r.status };
        }),
        passportPhotoUrl: sp.passportPhotoUrl,
        firstName: sp.firstName,
        lastName: sp.lastName,
        gender: sp.gender,
        dateOfBirth: sp.dateOfBirth ? String(sp.dateOfBirth).slice(0, 10) : null,
        academicYearName: year ? year.name : null,
        currentTermName: pickCurrentTermName_(terms),
        guardians: guardians,
      };
    }
  }
  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    schoolId: user.schoolId,
    email: user.email,
    phone: user.phone,
    accountStatus: user.status,
    lastActivityAt: user.updatedAt,
    student: studentOut,
  };
}

function tokenResponse_(user) {
  return {
    accessToken: signJwt_({ sub: user.id, role: user.role, schoolId: user.schoolId }),
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      schoolId: user.schoolId,
      email: user.email,
      phone: user.phone,
    },
  };
}

function pickCurrentTermName_(terms) {
  var now = Date.now();
  for (var i = 0; i < terms.length; i++) {
    var t = terms[i];
    if (now >= new Date(t.startsOn).getTime() && now <= new Date(t.endsOn).getTime()) {
      return t.name;
    }
  }
  return terms.length ? terms[0].name : null;
}

function requireSchoolId_(auth) {
  if (!auth.schoolId && auth.role !== 'SUPER_ADMIN') {
    throw httpError_(403, 'School context required');
  }
  return auth.schoolId;
}

// --- Schools ---

function schoolMe_(auth) {
  var schoolId = requireSchoolId_(auth);
  var school = findOne_('Schools', function (s) {
    return s.id === schoolId;
  });
  if (!school) {
    throw httpError_(404, 'School not found');
  }
  return school;
}

function schoolsList_(auth) {
  if (auth.role !== 'SUPER_ADMIN') {
    throw httpError_(403, 'Forbidden');
  }
  var data = findAll_('Schools').sort(function (a, b) {
    return String(a.name).localeCompare(String(b.name));
  });
  return { data: data };
}

// --- Students / classes ---

function studentsList_(auth) {
  var schoolId = requireSchoolId_(auth);
  var data = findAll_('Students', function (s) {
    return s.schoolId === schoolId;
  });
  return { data: data };
}

function studentsCreate_(auth, body) {
  var schoolId = requireSchoolId_(auth);
  if (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN') {
    throw httpError_(403, 'Forbidden');
  }
  var pinHash = hashPassword_(String(body.pin || '1234'));
  var user = insert_('Users', {
    schoolId: schoolId,
    fullName: body.firstName + ' ' + body.lastName,
    role: 'STUDENT',
    status: 'ACTIVE',
  });
  var student = insert_('Students', {
    schoolId: schoolId,
    userId: user.id,
    admissionNumber: body.admissionNumber,
    pinHash: pinHash,
    firstName: body.firstName,
    lastName: body.lastName,
    classId: body.classId || null,
    gender: body.gender || null,
    dateOfBirth: body.dateOfBirth || null,
  });
  return { data: student };
}

function classesList_(auth) {
  var schoolId = requireSchoolId_(auth);
  var data = findAll_('Classes', function (c) {
    return c.schoolId === schoolId;
  });
  return { data: data };
}

function subjectsList_(auth) {
  var schoolId = requireSchoolId_(auth);
  var data = findAll_('Subjects', function (s) {
    return s.schoolId === schoolId;
  });
  return { data: data };
}

function teacherSubjectsList_(auth) {
  var schoolId = requireSchoolId_(auth);
  var classIds = findAll_('Classes', function (c) {
    return c.schoolId === schoolId;
  }).map(function (c) {
    return c.id;
  });
  var data = findAll_('TeacherSubjects', function (ts) {
    return classIds.indexOf(ts.classId) >= 0;
  });
  return { data: data };
}

// --- Teacher workspace ---

function teacherWorkspace_(auth) {
  if (auth.role !== 'TEACHER') {
    throw httpError_(403, 'Teachers only');
  }
  var schoolId = requireSchoolId_(auth);
  var students = findAll_('Students', function (s) {
    return s.schoolId === schoolId;
  });
  var classes = findAll_('Classes', function (c) {
    return c.schoolId === schoolId;
  }).map(function (c) {
    return {
      id: c.id,
      name: c.name,
      level: c.level,
      students: students
        .filter(function (s) {
          return s.classId === c.id;
        })
        .map(studentBrief_),
    };
  });
  var assignments = findAll_('TeacherSubjects', function (a) {
    return a.teacherId === auth.sub;
  }).map(function (a) {
    var klass = findOne_('Classes', function (c) {
      return c.id === a.classId;
    });
    var subject = findOne_('Subjects', function (s) {
      return s.id === a.subjectId;
    });
    var year = a.academicYearId
      ? findOne_('AcademicYears', function (y) {
          return y.id === a.academicYearId;
        })
      : null;
    var terms = year
      ? findAll_('Terms', function (t) {
          return t.academicYearId === year.id;
        })
      : [];
    terms.sort(function (x, y) {
      return Number(x.order) - Number(y.order);
    });
    return {
      assignmentId: a.id,
      classId: a.classId,
      className: klass ? klass.name : null,
      classLevel: klass ? klass.level : null,
      subjectId: a.subjectId,
      subjectName: subject ? subject.name : null,
      subjectCode: subject ? subject.code : null,
      academicYearId: a.academicYearId,
      academicYearName: year ? year.name : null,
      terms: terms.map(function (t) {
        return { id: t.id, name: t.name, order: Number(t.order) };
      }),
      students: students
        .filter(function (s) {
          return s.classId === a.classId;
        })
        .map(studentBrief_),
    };
  });
  return { data: assignments, classes: classes };
}

function studentBrief_(s) {
  return {
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    admissionNumber: s.admissionNumber,
  };
}

// --- Attendance ---

function attendanceList_(auth, route) {
  var schoolId = requireSchoolId_(auth);
  var query = parseQuery_(route);
  var date = query.date;
  var studentIds = findAll_('Students', function (s) {
    return s.schoolId === schoolId;
  }).map(function (s) {
    return s.id;
  });
  var data = findAll_('Attendance', function (a) {
    if (studentIds.indexOf(a.studentId) < 0) return false;
    if (date) return String(a.date).slice(0, 10) === date;
    return true;
  });
  return { data: data };
}

function attendanceBulk_(auth, body) {
  if (auth.role !== 'TEACHER' && auth.role !== 'ADMIN') {
    throw httpError_(403, 'Forbidden');
  }
  var entries = body.entries || [];
  var count = 0;
  entries.forEach(function (entry) {
    upsertByUnique_(
      'Attendance',
      function (a) {
        return a.studentId === entry.studentId && String(a.date).slice(0, 10) === String(entry.date).slice(0, 10);
      },
      {
        studentId: entry.studentId,
        date: String(entry.date).slice(0, 10),
        status: entry.status,
        classId: entry.classId || null,
        markedById: auth.sub,
      },
    );
    count++;
  });
  return { ok: true, count: count };
}

// --- Results ---

function computeResult_(caScore, examScore) {
  var ca = Math.min(30, Math.max(0, Number(caScore)));
  var ex = Math.min(70, Math.max(0, Number(examScore)));
  var finalScore = Math.round((ca + ex) * 10) / 10;
  var grade = scoreToGrade_(finalScore);
  return { finalScore: finalScore, grade: grade, remark: gradeToRemark_(grade) };
}

function scoreToGrade_(score) {
  if (score >= 90) return 1;
  if (score >= 80) return 2;
  if (score >= 70) return 3;
  if (score >= 65) return 4;
  if (score >= 60) return 5;
  if (score >= 55) return 6;
  if (score >= 50) return 7;
  if (score >= 45) return 8;
  return 9;
}

function gradeToRemark_(grade) {
  var map = {
    1: 'Outstanding',
    2: 'Excellent',
    3: 'Very Good',
    4: 'Good',
    5: 'Credit',
    6: 'Credit',
    7: 'Pass',
    8: 'Weak Pass',
    9: 'Fail',
  };
  return map[grade] || 'Fail';
}

function resultsList_(auth, route) {
  var schoolId = requireSchoolId_(auth);
  var query = parseQuery_(route);
  var studentIds = findAll_('Students', function (s) {
    return s.schoolId === schoolId;
  }).map(function (s) {
    return s.id;
  });
  var data = findAll_('Results', function (r) {
    if (studentIds.indexOf(r.studentId) < 0) return false;
    if (query.termId && r.termId !== query.termId) return false;
    if (query.published === 'true' && String(r.published) !== 'true' && r.published !== true) return false;
    return true;
  }).map(function (r) {
    var subject = findOne_('Subjects', function (s) {
      return s.id === r.subjectId;
    });
    var term = findOne_('Terms', function (t) {
      return t.id === r.termId;
    });
    return {
      id: r.id,
      studentId: r.studentId,
      subjectId: r.subjectId,
      termId: r.termId,
      caScore: Number(r.caScore),
      examScore: Number(r.examScore),
      finalScore: Number(r.finalScore),
      grade: r.grade,
      remark: r.remark,
      published: r.published,
      subject: { name: subject ? subject.name : 'Subject', code: subject ? subject.code : null },
      term: term ? { name: term.name } : null,
    };
  });
  return { data: data };
}

function resultsUpsert_(auth, body) {
  var schoolId = requireSchoolId_(auth);
  var student = findOne_('Students', function (s) {
    return s.id === body.studentId && s.schoolId === schoolId;
  });
  if (!student) {
    throw httpError_(400, 'Invalid student');
  }
  var computed = computeResult_(body.caScore, body.examScore);
  var row = upsertByUnique_(
    'Results',
    function (r) {
      return r.studentId === body.studentId && r.subjectId === body.subjectId && r.termId === body.termId;
    },
    {
      studentId: body.studentId,
      subjectId: body.subjectId,
      termId: body.termId,
      classId: body.classId,
      caScore: body.caScore,
      examScore: body.examScore,
      finalScore: computed.finalScore,
      grade: computed.grade,
      remark: computed.remark,
      published: false,
    },
  );
  return row;
}

// --- Notifications ---

function notificationsList_(auth) {
  var schoolId = requireSchoolId_(auth);
  var data = findAll_('Notifications', function (n) {
    return n.userId === auth.sub && n.schoolId === schoolId;
  });
  data.sort(function (a, b) {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
  return { data: data.slice(0, 100) };
}

function notificationsMarkRead_(auth, route) {
  var id = route.split('/')[4];
  updateById_('Notifications', id, { readAt: new Date().toISOString() });
  return { ok: true };
}

// --- Workforce stubs ---

function workforceStatus_(auth) {
  var now = new Date().toISOString();
  var tz = 'Africa/Accra';
  var disabled = CONFIG.TEACHER_WORKFORCE_DISABLED;
  return {
    serverNow: now,
    schoolTimezone: tz,
    localDate: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'),
    punctualityMinutes: 15,
    workforceDisabled: disabled,
    morningIssuedAt: disabled ? now : null,
    signedInAt: disabled ? now : null,
    signInLate: false,
    eveningIssuedAt: null,
    eveningDeadlineAt: null,
    signedOutAt: null,
    signOutLate: false,
    forcedLogoutAt: null,
    canOperate: true,
  };
}

function workforceSignIn_(auth) {
  return { ok: true, skipped: CONFIG.TEACHER_WORKFORCE_DISABLED };
}

function workforceSignOut_(auth) {
  return { ok: true, skipped: CONFIG.TEACHER_WORKFORCE_DISABLED };
}

function parseQuery_(route) {
  var parts = route.split('?');
  var out = {};
  if (parts.length < 2) return out;
  parts[1].split('&').forEach(function (pair) {
    var kv = pair.split('=');
    out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
  });
  return out;
}
