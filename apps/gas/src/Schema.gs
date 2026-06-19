var SHEET_SCHEMAS = {
  Schools: ['id', 'name', 'slug', 'timezone', 'createdAt', 'updatedAt'],
  Users: [
    'id',
    'schoolId',
    'email',
    'phone',
    'passwordHash',
    'fullName',
    'role',
    'status',
    'createdAt',
    'updatedAt',
  ],
  Students: [
    'id',
    'schoolId',
    'userId',
    'admissionNumber',
    'pinHash',
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'classId',
    'passportPhotoUrl',
    'createdAt',
    'updatedAt',
  ],
  StudentParents: ['id', 'studentId', 'parentId', 'relation'],
  AcademicYears: ['id', 'schoolId', 'name', 'startsOn', 'endsOn'],
  Terms: ['id', 'academicYearId', 'name', 'order', 'startsOn', 'endsOn'],
  Classes: ['id', 'schoolId', 'academicYearId', 'name', 'level'],
  Subjects: ['id', 'schoolId', 'name', 'code'],
  TeacherSubjects: ['id', 'teacherId', 'subjectId', 'classId', 'academicYearId'],
  Results: [
    'id',
    'studentId',
    'subjectId',
    'termId',
    'classId',
    'caScore',
    'examScore',
    'finalScore',
    'grade',
    'remark',
    'published',
    'createdAt',
    'updatedAt',
  ],
  Attendance: ['id', 'studentId', 'date', 'status', 'classId', 'markedById', 'createdAt'],
  Notifications: [
    'id',
    'schoolId',
    'userId',
    'type',
    'title',
    'body',
    'readAt',
    'metadata',
    'createdAt',
  ],
  OtpCodes: [
    'id',
    'schoolId',
    'userId',
    'phone',
    'purpose',
    'codeHash',
    'expiresAt',
    'attempts',
    'consumedAt',
    'createdAt',
  ],
  TeacherWorkforceDays: [
    'id',
    'teacherId',
    'schoolId',
    'localDate',
    'morningIssuedAt',
    'signInAt',
    'signInLate',
    'eveningIssuedAt',
    'eveningDeadlineAt',
    'signOutAt',
    'signOutLate',
    'forcedLogoutAt',
    'createdAt',
    'updatedAt',
  ],
  ReportCardSubmissions: [
    'id',
    'schoolId',
    'teacherId',
    'termId',
    'classId',
    'status',
    'submittedAt',
    'reviewedAt',
    'reviewerId',
    'note',
  ],
};

function initSheets_(ss) {
  Object.keys(SHEET_SCHEMAS).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    var headers = SHEET_SCHEMAS[name];
    var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (existing.join('') === '') {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
    var phoneCol = headers.indexOf('phone');
    if (phoneCol >= 0) {
      sheet.getRange(2, phoneCol + 1, Math.max(sheet.getMaxRows(), 2), 1).setNumberFormat('@');
    }
  });
}
