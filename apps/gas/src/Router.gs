function dispatchRoute_(ctx) {
  var r = ctx.route;
  var m = ctx.method;

  // Auth
  if (r === '/api/v1/auth/admin/login' && m === 'POST') return authAdminLogin_(ctx.body);
  if (r === '/api/v1/auth/teacher/otp/request' && m === 'POST') return authOtpRequest_(ctx.body, 'TEACHER');
  if (r === '/api/v1/auth/teacher/otp/verify' && m === 'POST') return authOtpVerify_(ctx.body, 'TEACHER');
  if (r === '/api/v1/auth/parent/otp/request' && m === 'POST') return authOtpRequest_(ctx.body, 'PARENT');
  if (r === '/api/v1/auth/parent/otp/verify' && m === 'POST') return authOtpVerify_(ctx.body, 'PARENT');
  if (r === '/api/v1/auth/student/login' && m === 'POST') return authStudentLogin_(ctx.body);
  if (r === '/api/v1/auth/me' && m === 'GET') return authMe_(ctx.auth.sub);

  // Schools
  if (r === '/api/v1/schools/me' && m === 'GET') return schoolMe_(ctx.auth);
  if (r === '/api/v1/schools' && m === 'GET') return schoolsList_(ctx.auth);

  // Students / classes / subjects
  if (r === '/api/v1/students' && m === 'GET') return studentsList_(ctx.auth);
  if (r === '/api/v1/students' && m === 'POST') return studentsCreate_(ctx.auth, ctx.body);
  if (r === '/api/v1/classes' && m === 'GET') return classesList_(ctx.auth);
  if (r === '/api/v1/subjects' && m === 'GET') return subjectsList_(ctx.auth);
  if (r === '/api/v1/teacher-subjects' && m === 'GET') return teacherSubjectsList_(ctx.auth);

  // Teacher portal
  if (r === '/api/v1/teacher/workspace' && m === 'GET') return teacherWorkspace_(ctx.auth);

  // Attendance
  if (r.indexOf('/api/v1/attendance') === 0 && m === 'GET') return attendanceList_(ctx.auth, r);
  if (r === '/api/v1/attendance/bulk' && m === 'POST') return attendanceBulk_(ctx.auth, ctx.body);

  // Results
  if (r.indexOf('/api/v1/results') === 0 && m === 'GET') return resultsList_(ctx.auth, r);
  if (r === '/api/v1/results/upsert' && m === 'POST') return resultsUpsert_(ctx.auth, ctx.body);

  // Notifications
  if (r === '/api/v1/notifications' && m === 'GET') return notificationsList_(ctx.auth);
  if (r.indexOf('/api/v1/notifications/') === 0 && r.endsWith('/read') && m === 'POST') {
    return notificationsMarkRead_(ctx.auth, r);
  }

  // Workforce stubs (disabled by default in CONFIG)
  if (r === '/api/v1/teacher/workforce/status' && m === 'GET') return workforceStatus_(ctx.auth);
  if (r === '/api/v1/teacher/workforce/sign-in' && m === 'POST') return workforceSignIn_(ctx.auth);
  if (r === '/api/v1/teacher/workforce/sign-out' && m === 'POST') return workforceSignOut_(ctx.auth);

  throw httpError_(404, 'Route not implemented in GAS backend yet: ' + r);
}
