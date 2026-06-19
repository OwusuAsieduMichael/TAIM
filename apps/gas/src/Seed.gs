function seedDemoData_() {
  Object.keys(SHEET_SCHEMAS).forEach(clearSheetData_);

  var pw = hashPassword_('Admin123!');
  var pin = hashPassword_('1234');

  insert_('Schools', {
    id: 'seed-school',
    name: 'Tomhel Preparatory/JHS',
    slug: 'demo-school',
    timezone: 'Africa/Accra',
  });

  insert_('Users', {
    id: 'seed-super-admin',
    schoolId: null,
    email: 'super@taim.local',
    passwordHash: pw,
    fullName: 'Platform Super Admin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });

  insert_('Users', {
    id: 'seed-admin',
    schoolId: 'seed-school',
    email: 'admin@demo-school.gh',
    passwordHash: pw,
    fullName: 'School Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  insert_('Users', {
    id: 'seed-teacher',
    schoolId: 'seed-school',
    phone: '233241000001',
    fullName: 'Demo Teacher',
    role: 'TEACHER',
    status: 'ACTIVE',
  });

  insert_('Users', {
    id: 'seed-parent',
    schoolId: 'seed-school',
    phone: '233241000002',
    fullName: 'Demo Parent',
    role: 'PARENT',
    status: 'ACTIVE',
  });

  insert_('AcademicYears', {
    id: 'seed-year',
    schoolId: 'seed-school',
    name: '2025/2026',
    startsOn: '2025-09-01',
    endsOn: '2026-08-31',
  });

  insert_('Terms', {
    id: 'seed-term1',
    academicYearId: 'seed-year',
    name: 'Term 1',
    order: 1,
    startsOn: '2025-09-01',
    endsOn: '2025-12-20',
  });

  insert_('Classes', {
    id: 'seed-class-jhs1',
    schoolId: 'seed-school',
    academicYearId: 'seed-year',
    name: 'JHS 1A',
    level: 'JHS 1',
  });

  insert_('Subjects', {
    id: 'seed-subject-math',
    schoolId: 'seed-school',
    name: 'Mathematics',
    code: 'MATH',
  });

  insert_('Subjects', {
    id: 'seed-subject-eng',
    schoolId: 'seed-school',
    name: 'English Language',
    code: 'ENG',
  });

  insert_('TeacherSubjects', {
    id: 'seed-ts1',
    teacherId: 'seed-teacher',
    subjectId: 'seed-subject-math',
    classId: 'seed-class-jhs1',
    academicYearId: 'seed-year',
  });

  insert_('Users', {
    id: 'seed-student-user',
    schoolId: 'seed-school',
    fullName: 'Ama Mensah',
    role: 'STUDENT',
    status: 'ACTIVE',
  });

  insert_('Students', {
    id: 'seed-student',
    schoolId: 'seed-school',
    userId: 'seed-student-user',
    admissionNumber: 'STU-001',
    pinHash: pin,
    firstName: 'Ama',
    lastName: 'Mensah',
    classId: 'seed-class-jhs1',
    gender: 'Female',
    dateOfBirth: '2012-05-10',
  });

  insert_('StudentParents', {
    id: 'seed-sp1',
    studentId: 'seed-student',
    parentId: 'seed-parent',
    relation: 'Mother',
  });

  var result = computeResult_(24, 56);
  insert_('Results', {
    id: 'seed-result1',
    studentId: 'seed-student',
    subjectId: 'seed-subject-math',
    termId: 'seed-term1',
    classId: 'seed-class-jhs1',
    caScore: 24,
    examScore: 56,
    finalScore: result.finalScore,
    grade: result.grade,
    remark: result.remark,
    published: true,
  });

  insert_('Notifications', {
    id: 'seed-notif1',
    schoolId: 'seed-school',
    userId: 'seed-parent',
    type: 'RESULT_PUBLISHED',
    title: 'Results available',
    body: 'Term 1 Mathematics results for Ama Mensah are now published.',
    readAt: null,
    metadata: '{}',
  });

  Logger.log('Demo data seeded.');
  Logger.log('Super admin: super@taim.local / Admin123!');
  Logger.log('School admin: admin@demo-school.gh / Admin123!');
  Logger.log('Teacher phone: 0241000001 (OTP logged when requested)');
  Logger.log('Parent phone: 0241000002');
  Logger.log('Student: demo-school / STU-001 / PIN 1234');
}
