import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

function ensurePgbouncer(url: string): string {
  if (url.includes('pgbouncer=true')) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`;
}

/**
 * Seed must use a URL your machine can reach.
 * - Many networks block direct Postgres (db.*.supabase.co:5432) → "Can't reach database server".
 * - Prefer DATABASE_URL (transaction pooler :6543) + pgbouncer=true (avoids 42P05 prepared statement errors).
 * - Set SEED_USE_DIRECT=1 to force DIRECT_URL when port 5432 works (e.g. office / CI).
 */
function seedDatabaseUrl(): string {
  const pooler = process.env.DATABASE_URL?.trim();
  const direct = process.env.DIRECT_URL?.trim();
  const forceDirect = process.env.SEED_USE_DIRECT === '1';

  if (forceDirect && direct) {
    console.info('[seed] Using DIRECT_URL (SEED_USE_DIRECT=1).');
    return direct;
  }

  const looksLikePooler =
    pooler && (pooler.includes('pooler.supabase') || pooler.includes(':6543'));
  if (looksLikePooler && pooler) {
    console.info('[seed] Using DATABASE_URL (pooler) so outbound :5432 is not required.');
    return ensurePgbouncer(pooler);
  }

  if (direct) {
    console.info('[seed] Using DIRECT_URL (no pooler DATABASE_URL detected).');
    return direct;
  }

  if (pooler) {
    return ensurePgbouncer(pooler);
  }

  throw new Error('Set DATABASE_URL (and ideally DIRECT_URL) in apps/api/.env.');
}

const prisma = new PrismaClient({
  datasources: { db: { url: seedDatabaseUrl() } },
});

/** True when migration for passport photo URL has been applied (avoids seed failure on older DBs). */
async function studentHasPassportPhotoColumn(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ n: bigint }>>`
      SELECT COUNT(*)::bigint AS n
      FROM pg_attribute a
      INNER JOIN pg_class c ON c.oid = a.attrelid
      INNER JOIN pg_namespace ns ON ns.oid = c.relnamespace
      WHERE ns.nspname = 'public'
        AND c.relname = 'Student'
        AND a.attnum > 0
        AND NOT a.attisdropped
        AND a.attname = 'passportPhotoUrl'
    `;
    return Number(rows[0]?.n ?? 0) >= 1;
  } catch {
    return false;
  }
}

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);
  const school = await prisma.school.upsert({
    where: { slug: 'demo-school' },
    update: { name: 'Tomhel Preparatory/JHS', timezone: 'Africa/Accra' },
    create: { name: 'Tomhel Preparatory/JHS', slug: 'demo-school', timezone: 'Africa/Accra' },
  });

  await prisma.user.upsert({
    where: { id: 'seed-super-admin' },
    update: {},
    create: {
      id: 'seed-super-admin',
      schoolId: null,
      email: 'super@taim.local',
      passwordHash: password,
      fullName: 'Platform Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.upsert({
    where: { id: 'seed-admin' },
    update: {},
    create: {
      id: 'seed-admin',
      schoolId: school.id,
      email: 'admin@demo-school.gh',
      passwordHash: password,
      fullName: 'School Admin',
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { id: 'seed-teacher' },
    update: {},
    create: {
      id: 'seed-teacher',
      schoolId: school.id,
      phone: '233241000001',
      fullName: 'Demo Teacher',
      role: 'TEACHER',
    },
  });

  const parent = await prisma.user.upsert({
    where: { id: 'seed-parent' },
    update: {},
    create: {
      id: 'seed-parent',
      schoolId: school.id,
      phone: '233241000002',
      fullName: 'Demo Parent',
      role: 'PARENT',
    },
  });

  const year = await prisma.academicYear.upsert({
    where: { id: 'seed-year' },
    update: {},
    create: {
      id: 'seed-year',
      schoolId: school.id,
      name: '2025/2026',
      startsOn: new Date('2025-09-01'),
      endsOn: new Date('2026-08-31'),
    },
  });

  await prisma.term.upsert({
    where: { id: 'seed-term1' },
    update: {},
    create: {
      id: 'seed-term1',
      academicYearId: year.id,
      name: 'Term 1',
      order: 1,
      startsOn: new Date('2025-09-01'),
      endsOn: new Date('2025-12-20'),
    },
  });

  await prisma.term.upsert({
    where: { id: 'seed-term2' },
    update: {},
    create: {
      id: 'seed-term2',
      academicYearId: year.id,
      name: 'Term 2',
      order: 2,
      startsOn: new Date('2026-01-06'),
      endsOn: new Date('2026-04-30'),
    },
  });

  const klass = await prisma.class.upsert({
    where: { id: 'seed-class' },
    update: {},
    create: {
      id: 'seed-class',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'JHS1-A',
      level: 'JHS1',
    },
  });

  const klassKg1 = await prisma.class.upsert({
    where: { id: 'seed-class-kg1' },
    update: { academicYearId: year.id, name: 'KG1-A', level: 'KG1' },
    create: {
      id: 'seed-class-kg1',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'KG1-A',
      level: 'KG1',
    },
  });
  const klassKg1b = await prisma.class.upsert({
    where: { id: 'seed-class-kg1b' },
    update: { academicYearId: year.id, name: 'KG1-B', level: 'KG1' },
    create: {
      id: 'seed-class-kg1b',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'KG1-B',
      level: 'KG1',
    },
  });
  const klassKg2 = await prisma.class.upsert({
    where: { id: 'seed-class-kg2' },
    update: { academicYearId: year.id, name: 'KG2-A', level: 'KG2' },
    create: {
      id: 'seed-class-kg2',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'KG2-A',
      level: 'KG2',
    },
  });
  const klassKg2b = await prisma.class.upsert({
    where: { id: 'seed-class-kg2b' },
    update: { academicYearId: year.id, name: 'KG2-B', level: 'KG2' },
    create: {
      id: 'seed-class-kg2b',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'KG2-B',
      level: 'KG2',
    },
  });
  const klassJhs1b = await prisma.class.upsert({
    where: { id: 'seed-class-jhs1b' },
    update: { academicYearId: year.id, name: 'JHS1-B', level: 'JHS1' },
    create: {
      id: 'seed-class-jhs1b',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'JHS1-B',
      level: 'JHS1',
    },
  });
  const klassJhs2 = await prisma.class.upsert({
    where: { id: 'seed-class-jhs2' },
    update: { academicYearId: year.id, name: 'JHS2-A', level: 'JHS2' },
    create: {
      id: 'seed-class-jhs2',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'JHS2-A',
      level: 'JHS2',
    },
  });
  const klassJhs3 = await prisma.class.upsert({
    where: { id: 'seed-class-jhs3' },
    update: { academicYearId: year.id, name: 'JHS3-A', level: 'JHS3' },
    create: {
      id: 'seed-class-jhs3',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'JHS3-A',
      level: 'JHS3',
    },
  });
  const klassJhs2b = await prisma.class.upsert({
    where: { id: 'seed-class-jhs2b' },
    update: { academicYearId: year.id, name: 'JHS2-B', level: 'JHS2' },
    create: {
      id: 'seed-class-jhs2b',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'JHS2-B',
      level: 'JHS2',
    },
  });
  const klassJhs3b = await prisma.class.upsert({
    where: { id: 'seed-class-jhs3b' },
    update: { academicYearId: year.id, name: 'JHS3-B', level: 'JHS3' },
    create: {
      id: 'seed-class-jhs3b',
      schoolId: school.id,
      academicYearId: year.id,
      name: 'JHS3-B',
      level: 'JHS3',
    },
  });

  const PRIMARY_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
  const primaryKlasses: { id: string }[] = [];
  for (const lv of PRIMARY_LEVELS) {
    const digit = lv.slice(1);
    for (const sec of ['A', 'B'] as const) {
      const slug = sec.toLowerCase();
      const id = `seed-class-p${digit}${slug}`;
      const name = `${lv}-${sec}`;
      const k = await prisma.class.upsert({
        where: { id },
        update: { academicYearId: year.id, name, level: lv },
        create: {
          id,
          schoolId: school.id,
          academicYearId: year.id,
          name,
          level: lv,
        },
      });
      primaryKlasses.push({ id: k.id });
    }
  }

  /** One record (`seed-subj-twi`) — linked to KG, primary, and JHS classes. */
  const TWI_SUBJECT = { id: 'seed-subj-twi', name: 'Ghanaian Language (Twi)', code: 'TWI' } as const;

  /** KG curriculum — shown in teacher subject pickers for KG classes. */
  const KG_SUBJECTS = [
    { id: 'seed-subj-kg-lit', name: 'Language & Literacy', code: 'KG-LIT' },
    { id: 'seed-subj-kg-num', name: 'Numeracy', code: 'KG-NUM' },
    { id: 'seed-subj-kg-ca', name: 'Creative Arts', code: 'KG-CA' },
    { id: 'seed-subj-kg-pdw', name: 'Physical Development & Well-being', code: 'KG-PDW' },
    TWI_SUBJECT,
  ] as const;

  /** JHS core subjects — stable ids `seed-subject` / `seed-subject-en` kept for existing references. */
  const JHS_SUBJECTS = [
    { id: 'seed-subject-en', name: 'English Language', code: 'JHS-ENG' },
    { id: 'seed-subject', name: 'Mathematics', code: 'JHS-MATH' },
    { id: 'seed-subj-jhs-is', name: 'Integrated Science', code: 'JHS-SCI' },
    { id: 'seed-subj-jhs-ss', name: 'Social Studies', code: 'JHS-SS' },
    { id: 'seed-subj-jhs-rme', name: 'Religious & Moral Education (RME)', code: 'JHS-RME' },
    { id: 'seed-subj-jhs-cad', name: 'Creative Arts & Design', code: 'JHS-CAD' },
    { id: 'seed-subj-jhs-ct', name: 'Career Technology', code: 'JHS-CT' },
    TWI_SUBJECT,
  ] as const;

  /** Primary curriculum — P1–P6 subject pickers. */
  const PRIMARY_SUBJECTS = [
    { id: 'seed-subj-p-en', name: 'English Language', code: 'P-ENG' },
    { id: 'seed-subj-p-math', name: 'Mathematics', code: 'P-MATH' },
    { id: 'seed-subj-p-sci', name: 'Science', code: 'P-SCI' },
    { id: 'seed-subj-p-gh', name: 'Our World & Our People', code: 'P-OWP' },
    { id: 'seed-subj-p-rme', name: 'Religious & Moral Education', code: 'P-RME' },
    { id: 'seed-subj-p-ca', name: 'Creative Arts & Design', code: 'P-CAD' },
    { id: 'seed-subj-p-pe', name: 'Physical Education & Well-being', code: 'P-PE' },
    { id: 'seed-subj-p-ict', name: 'Computing', code: 'P-ICT' },
    TWI_SUBJECT,
  ] as const;

  for (const s of [...KG_SUBJECTS, ...JHS_SUBJECTS, ...PRIMARY_SUBJECTS]) {
    await prisma.subject.upsert({
      where: { id: s.id },
      update: { name: s.name, code: s.code },
      create: { id: s.id, schoolId: school.id, name: s.name, code: s.code },
    });
  }

  await prisma.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });

  const teacherSubjectCreates: { id: string; classId: string; subjectId: string }[] = [];
  const kgClasses = [klassKg1, klassKg1b, klassKg2, klassKg2b];
  const jhsClasses = [klass, klassJhs1b, klassJhs2, klassJhs2b, klassJhs3, klassJhs3b];
  for (const cl of kgClasses) {
    for (const s of KG_SUBJECTS) {
      teacherSubjectCreates.push({ id: `seed-ts-${cl.id}-${s.id}`, classId: cl.id, subjectId: s.id });
    }
  }
  for (const cl of jhsClasses) {
    for (const s of JHS_SUBJECTS) {
      teacherSubjectCreates.push({ id: `seed-ts-${cl.id}-${s.id}`, classId: cl.id, subjectId: s.id });
    }
  }
  for (const cl of primaryKlasses) {
    for (const s of PRIMARY_SUBJECTS) {
      teacherSubjectCreates.push({ id: `seed-ts-${cl.id}-${s.id}`, classId: cl.id, subjectId: s.id });
    }
  }
  for (const row of teacherSubjectCreates) {
    await prisma.teacherSubject.create({
      data: {
        id: row.id,
        teacherId: teacher.id,
        subjectId: row.subjectId,
        classId: row.classId,
        academicYearId: year.id,
      },
    });
  }

  const pinHash = await bcrypt.hash('1234', 10);
  const studentUser = await prisma.user.upsert({
    where: { id: 'seed-student-user' },
    update: {},
    create: {
      id: 'seed-student-user',
      schoolId: school.id,
      fullName: 'Demo Student',
      role: 'STUDENT',
    },
  });

  const demoPassportPhoto = 'https://picsum.photos/seed/taim-passport-photo/420/540';

  const withPassportPhotoCol = await studentHasPassportPhotoColumn();
  if (!withPassportPhotoCol) {
    console.warn(
      '[seed] Student.passportPhotoUrl is missing in the database. Apply migrations (`npx prisma migrate deploy` from apps/api) or run prisma/sql/apply_passport_columns.sql in Supabase SQL Editor. Seeding without passport photo URL.',
    );
  }
  const passportSeed = withPassportPhotoCol ? { passportPhotoUrl: demoPassportPhoto } : {};

  const student = await prisma.student.upsert({
    where: { id: 'seed-student' },
    update: {
      ...passportSeed,
      ...(Object.keys(passportSeed).length === 0
        ? { firstName: 'Demo', lastName: 'Student', classId: klass.id }
        : {}),
    },
    create: {
      id: 'seed-student',
      schoolId: school.id,
      userId: studentUser.id,
      admissionNumber: 'STU-001',
      pinHash,
      firstName: 'Demo',
      lastName: 'Student',
      classId: klass.id,
      ...passportSeed,
    },
  });

  /** Extra demo learners in JHS1-A (IDs are zod-safe `cuid()` strings for attendance bulk API tests). */
  const demoClassExtras: {
    studentId: string;
    userId: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  }[] = [
    { studentId: 'cltaimdemo020000000000000', userId: 'seed-student-user-02', admissionNumber: 'STU-002', firstName: 'Kofi', lastName: 'Mensah' },
    { studentId: 'cltaimdemo030000000000000', userId: 'seed-student-user-03', admissionNumber: 'STU-003', firstName: 'Ama', lastName: 'Serwaa' },
    { studentId: 'cltaimdemo040000000000000', userId: 'seed-student-user-04', admissionNumber: 'STU-004', firstName: 'Kwame', lastName: 'Boateng' },
    { studentId: 'cltaimdemo050000000000000', userId: 'seed-student-user-05', admissionNumber: 'STU-005', firstName: 'Yaa', lastName: 'Osei' },
    { studentId: 'cltaimdemo060000000000000', userId: 'seed-student-user-06', admissionNumber: 'STU-006', firstName: 'Joseph', lastName: 'Adjei' },
    { studentId: 'cltaimdemo070000000000000', userId: 'seed-student-user-07', admissionNumber: 'STU-007', firstName: 'Abena', lastName: 'Owusu' },
    { studentId: 'cltaimdemo080000000000000', userId: 'seed-student-user-08', admissionNumber: 'STU-008', firstName: 'Kwesi', lastName: 'Twumasi' },
    { studentId: 'cltaimdemo090000000000000', userId: 'seed-student-user-09', admissionNumber: 'STU-009', firstName: 'Efua', lastName: 'Hammond' },
    { studentId: 'cltaimdemo100000000000000', userId: 'seed-student-user-10', admissionNumber: 'STU-010', firstName: 'Malik', lastName: 'Ibrahim' },
    { studentId: 'cltaimdemo110000000000000', userId: 'seed-student-user-11', admissionNumber: 'STU-011', firstName: 'Nadia', lastName: 'Mahama' },
    { studentId: 'cltaimdemo120000000000000', userId: 'seed-student-user-12', admissionNumber: 'STU-012', firstName: 'Samuel', lastName: 'Darko' },
    { studentId: 'cltaimdemo130000000000000', userId: 'seed-student-user-13', admissionNumber: 'STU-013', firstName: 'Afua', lastName: 'Prempeh' },
    { studentId: 'cltaimdemo140000000000000', userId: 'seed-student-user-14', admissionNumber: 'STU-014', firstName: 'Peter', lastName: 'Tettey' },
    { studentId: 'cltaimdemo150000000000000', userId: 'seed-student-user-15', admissionNumber: 'STU-015', firstName: 'Linda', lastName: 'Appiah' },
    { studentId: 'cltaimdemo160000000000000', userId: 'seed-student-user-16', admissionNumber: 'STU-016', firstName: 'David', lastName: 'Koomson' },
    { studentId: 'cltaimdemo170000000000000', userId: 'seed-student-user-17', admissionNumber: 'STU-017', firstName: 'Grace', lastName: 'Ankrah' },
    { studentId: 'cltaimdemo180000000000000', userId: 'seed-student-user-18', admissionNumber: 'STU-018', firstName: 'Emmanuel', lastName: 'Sarpong' },
    { studentId: 'cltaimdemo190000000000000', userId: 'seed-student-user-19', admissionNumber: 'STU-019', firstName: 'Patricia', lastName: 'Agyei' },
    { studentId: 'cltaimdemo200000000000000', userId: 'seed-student-user-20', admissionNumber: 'STU-020', firstName: 'Daniel', lastName: 'Frimpong' },
  ];

  for (const row of demoClassExtras) {
    const fullName = `${row.firstName} ${row.lastName}`;
    await prisma.user.upsert({
      where: { id: row.userId },
      update: { fullName },
      create: {
        id: row.userId,
        schoolId: school.id,
        fullName,
        role: 'STUDENT',
      },
    });
    await prisma.student.upsert({
      where: { id: row.studentId },
      update: {
        firstName: row.firstName,
        lastName: row.lastName,
        classId: klass.id,
        admissionNumber: row.admissionNumber,
        ...passportSeed,
      },
      create: {
        id: row.studentId,
        schoolId: school.id,
        userId: row.userId,
        admissionNumber: row.admissionNumber,
        pinHash,
        firstName: row.firstName,
        lastName: row.lastName,
        classId: klass.id,
        ...passportSeed,
      },
    });
  }

  /** Demo rosters for non–JHS1-A classes (12 learners each; IDs are zod-safe fixed-length strings). */
  function rosterStudentId(tag: string, index1: number): string {
    const idx = String(index1).padStart(2, '0');
    const base = `clseed${tag}${idx}`;
    return (base + '0'.repeat(Math.max(0, 25 - base.length))).slice(0, 25);
  }

  const rosterByClass: { klass: { id: string }; tag: string; admPrefix: string }[] = [
    { klass: klassKg1, tag: 'kg1a', admPrefix: 'K1A' },
    { klass: klassKg1b, tag: 'kg1b', admPrefix: 'K1B' },
    { klass: klassKg2, tag: 'kg2a', admPrefix: 'K2A' },
    { klass: klassKg2b, tag: 'kg2b', admPrefix: 'K2B' },
    { klass: klassJhs1b, tag: 'j1b', admPrefix: 'J1B' },
    { klass: klassJhs2, tag: 'j2a', admPrefix: 'J2A' },
    { klass: klassJhs2b, tag: 'j2b', admPrefix: 'J2B' },
    { klass: klassJhs3, tag: 'j3a', admPrefix: 'J3A' },
    { klass: klassJhs3b, tag: 'j3b', admPrefix: 'J3B' },
  ];
  for (const lv of PRIMARY_LEVELS) {
    const digit = lv.slice(1);
    for (const sec of ['A', 'B'] as const) {
      const slug = sec.toLowerCase();
      const id = `seed-class-p${digit}${slug}`;
      const pk = primaryKlasses.find((c) => c.id === id);
      if (!pk) continue;
      rosterByClass.push({
        klass: pk,
        tag: `p${digit}${slug}`,
        admPrefix: `${lv}${sec}`,
      });
    }
  }
  const rosterNames = demoClassExtras.slice(0, 12);
  for (const { klass: k, tag, admPrefix } of rosterByClass) {
    for (let i = 0; i < rosterNames.length; i++) {
      const row = rosterNames[i]!;
      const num = i + 1;
      const studentId = rosterStudentId(tag, num);
      const userId = `seed-roster-${tag}-u${String(num).padStart(2, '0')}`;
      const admissionNumber = `${admPrefix}-${String(num).padStart(2, '0')}`;
      const fullName = `${row.firstName} ${row.lastName}`;
      await prisma.user.upsert({
        where: { id: userId },
        update: { fullName },
        create: {
          id: userId,
          schoolId: school.id,
          fullName,
          role: 'STUDENT',
        },
      });
      await prisma.student.upsert({
        where: { id: studentId },
        update: {
          firstName: row.firstName,
          lastName: row.lastName,
          classId: k.id,
          admissionNumber,
          ...passportSeed,
        },
        create: {
          id: studentId,
          schoolId: school.id,
          userId,
          admissionNumber,
          pinHash,
          firstName: row.firstName,
          lastName: row.lastName,
          classId: k.id,
          ...passportSeed,
        },
      });
    }
  }

  await prisma.studentParent.upsert({
    where: { id: 'seed-sp' },
    update: {},
    create: {
      id: 'seed-sp',
      studentId: student.id,
      parentId: parent.id,
      relation: 'Mother',
    },
  });

  console.log('Seed complete.');
  console.log('School slug: demo-school');
  console.log('Super admin: super@taim.local / Admin123!');
  console.log('School admin: admin@demo-school.gh / Admin123!');
  console.log('Teacher phone (OTP): 0241000001 or +233241000001');
  console.log('Parent phone (OTP): 0241000002 or +233241000002');
  console.log('Student: admission STU-001 / PIN 1234');
  console.log(
    `Demo JHS1-A: ${1 + demoClassExtras.length} learners (STU-001–STU-020). All other KG / Primary / JHS streams (A & B): 12 learners each with class-prefixed admissions; PIN 1234 (school code demo-school).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
