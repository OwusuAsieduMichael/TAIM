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

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);
  const school = await prisma.school.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: { name: 'Demo Preparatory School', slug: 'demo-school' },
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

  const term1 = await prisma.term.upsert({
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

  const subject = await prisma.subject.upsert({
    where: { id: 'seed-subject' },
    update: {},
    create: {
      id: 'seed-subject',
      schoolId: school.id,
      name: 'Mathematics',
      code: 'MATH',
    },
  });

  await prisma.teacherSubject.upsert({
    where: { id: 'seed-ts' },
    update: {},
    create: {
      id: 'seed-ts',
      teacherId: teacher.id,
      subjectId: subject.id,
      classId: klass.id,
      academicYearId: year.id,
    },
  });

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

  const student = await prisma.student.upsert({
    where: { id: 'seed-student' },
    update: {},
    create: {
      id: 'seed-student',
      schoolId: school.id,
      userId: studentUser.id,
      admissionNumber: 'STU-001',
      pinHash,
      firstName: 'Demo',
      lastName: 'Student',
      classId: klass.id,
    },
  });

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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
