import { prisma } from '../../lib/prisma.js';
import { generateOtpCode, hashOtp, verifyOtpHash } from '../../lib/otp.js';
import { sendSms } from '../../lib/sms.js';
import { calendarDateInTimeZone, punctualityDeadline } from '../../lib/schoolTime.js';
import { HttpError } from '../../middleware/errorHandler.js';

const MAX_OTP_ATTEMPTS = 5;
const PUNCTUALITY_MINUTES = Number(process.env.WORKFORCE_PUNCTUALITY_MINUTES ?? 15);
const WORKFORCE_OTP_PURPOSE_SIGNIN = (localDate: string) => `TEACHER_WORKFORCE_SIGNIN|${localDate}`;
const WORKFORCE_OTP_PURPOSE_SIGNOUT = (localDate: string) => `TEACHER_WORKFORCE_SIGNOUT|${localDate}`;

function workforceDisabled(): boolean {
  return process.env.TEACHER_WORKFORCE_DISABLED === '1' || process.env.TEACHER_WORKFORCE_DISABLED === 'true';
}

function workforceOtpExpiresAt(): Date {
  return new Date(Date.now() + 48 * 60 * 60 * 1000);
}

export async function sweepEveningDeadlinesForSchool(schoolId: string): Promise<number> {
  const now = new Date();
  const rows = await prisma.teacherWorkforceDay.findMany({
    where: {
      schoolId,
      signInAt: { not: null },
      signOutAt: null,
      eveningDeadlineAt: { not: null, lte: now },
      forcedLogoutAt: null,
    },
  });
  for (const row of rows) {
    await prisma.teacherWorkforceDay.update({
      where: { id: row.id },
      data: {
        signOutLate: true,
        forcedLogoutAt: now,
      },
    });
  }
  return rows.length;
}

export async function sweepEveningDeadlinesForTeacher(teacherId: string, schoolId: string): Promise<void> {
  await sweepEveningDeadlinesForSchool(schoolId);
}

export async function canTeacherOperate(teacherId: string, schoolId: string): Promise<boolean> {
  if (workforceDisabled()) return true;
  await sweepEveningDeadlinesForTeacher(teacherId, schoolId);
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { timezone: true } });
  const tz = school?.timezone ?? 'UTC';
  const localDate = calendarDateInTimeZone(new Date(), tz);
  const day = await prisma.teacherWorkforceDay.findUnique({
    where: { teacherId_localDate: { teacherId, localDate } },
  });
  if (!day?.signInAt) return false;
  if (day.forcedLogoutAt) return false;
  if (day.eveningDeadlineAt && new Date() > day.eveningDeadlineAt && !day.signOutAt) {
    return false;
  }
  return true;
}

export async function getWorkforceStatus(teacherId: string, schoolId: string) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { timezone: true, name: true },
  });
  if (!school) throw new HttpError(404, 'School not found');
  const tz = school.timezone ?? 'UTC';
  const now = new Date();
  const localDate = calendarDateInTimeZone(now, tz);
  if (!workforceDisabled()) {
    await sweepEveningDeadlinesForSchool(schoolId);
  }
  const day = await prisma.teacherWorkforceDay.findUnique({
    where: { teacherId_localDate: { teacherId, localDate } },
  });
  const canOperate = workforceDisabled() ? true : await canTeacherOperate(teacherId, schoolId);
  return {
    serverNow: now.toISOString(),
    schoolTimezone: tz,
    localDate,
    punctualityMinutes: PUNCTUALITY_MINUTES,
    workforceDisabled: workforceDisabled(),
    morningIssuedAt: day?.morningIssuedAt?.toISOString() ?? null,
    signedInAt: day?.signInAt?.toISOString() ?? null,
    signInLate: day?.signInLate ?? false,
    eveningIssuedAt: day?.eveningIssuedAt?.toISOString() ?? null,
    eveningDeadlineAt: day?.eveningDeadlineAt?.toISOString() ?? null,
    signedOutAt: day?.signOutAt?.toISOString() ?? null,
    signOutLate: day?.signOutLate ?? false,
    forcedLogoutAt: day?.forcedLogoutAt?.toISOString() ?? null,
    canOperate,
  };
}

export async function verifySignIn(teacherId: string, schoolId: string, code: string) {
  if (workforceDisabled()) return { ok: true, signInLate: false, skipped: true };
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { timezone: true } });
  if (!school) throw new HttpError(404, 'School not found');
  const localDate = calendarDateInTimeZone(new Date(), school.timezone ?? 'UTC');
  const day = await prisma.teacherWorkforceDay.findUnique({
    where: { teacherId_localDate: { teacherId, localDate } },
  });
  if (!day?.morningIssuedAt) {
    throw new HttpError(400, 'Morning attendance has not been opened yet. Wait for admin to issue OTPs.');
  }
  if (day.signInAt) {
    throw new HttpError(400, 'Already signed in today');
  }
  const purpose = WORKFORCE_OTP_PURPOSE_SIGNIN(localDate);
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: teacherId,
      schoolId,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) throw new HttpError(400, 'No active sign-in code');
  if (otp.attempts >= MAX_OTP_ATTEMPTS) throw new HttpError(429, 'Too many attempts');
  const valid = verifyOtpHash(code, otp.codeHash);
  if (!valid) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(401, 'Invalid code');
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  const now = new Date();
  const lateBoundary = punctualityDeadline(day.morningIssuedAt!, PUNCTUALITY_MINUTES);
  const signInLate = now > lateBoundary;
  await prisma.teacherWorkforceDay.update({
    where: { id: day.id },
    data: { signInAt: now, signInLate },
  });
  return { ok: true, signInLate };
}

export async function verifySignOut(teacherId: string, schoolId: string, code: string) {
  if (workforceDisabled()) return { ok: true, signOutLate: false, skipped: true };
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { timezone: true } });
  if (!school) throw new HttpError(404, 'School not found');
  const localDate = calendarDateInTimeZone(new Date(), school.timezone ?? 'UTC');
  const day = await prisma.teacherWorkforceDay.findUnique({
    where: { teacherId_localDate: { teacherId, localDate } },
  });
  if (!day?.signInAt) throw new HttpError(400, 'Sign in first');
  if (day.signOutAt) throw new HttpError(400, 'Already signed out today');
  if (!day.eveningIssuedAt || !day.eveningDeadlineAt) {
    throw new HttpError(400, 'Evening sign-out has not been opened yet');
  }
  const now = new Date();
  if (now > day.eveningDeadlineAt) {
    throw new HttpError(400, 'Sign-out window has closed');
  }
  const purpose = WORKFORCE_OTP_PURPOSE_SIGNOUT(localDate);
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: teacherId,
      schoolId,
      purpose,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) throw new HttpError(400, 'No active sign-out code');
  if (otp.attempts >= MAX_OTP_ATTEMPTS) throw new HttpError(429, 'Too many attempts');
  const valid = verifyOtpHash(code, otp.codeHash);
  if (!valid) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(401, 'Invalid code');
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: now } });
  await prisma.teacherWorkforceDay.update({
    where: { id: day.id },
    data: { signOutAt: now, signOutLate: false },
  });
  return { ok: true, signOutLate: false };
}

export async function issueMorningOtps(schoolId: string) {
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { timezone: true, name: true } });
  if (!school) throw new HttpError(404, 'School not found');
  const localDate = calendarDateInTimeZone(new Date(), school.timezone ?? 'UTC');
  const issuedAt = new Date();
  const teachers = await prisma.user.findMany({
    where: { schoolId, role: 'TEACHER', status: 'ACTIVE' },
    select: { id: true, phone: true, fullName: true },
  });
  let sent = 0;
  for (const t of teachers) {
    await prisma.teacherWorkforceDay.upsert({
      where: { teacherId_localDate: { teacherId: t.id, localDate } },
      create: {
        teacherId: t.id,
        schoolId,
        localDate,
        morningIssuedAt: issuedAt,
      },
      update: { morningIssuedAt: issuedAt },
    });
    if (!t.phone) continue;
    const code = generateOtpCode();
    const codeHash = hashOtp(code);
    await prisma.otpCode.create({
      data: {
        schoolId,
        userId: t.id,
        phone: t.phone,
        purpose: WORKFORCE_OTP_PURPOSE_SIGNIN(localDate),
        codeHash,
        expiresAt: workforceOtpExpiresAt(),
      },
    });
    await sendSms(
      t.phone,
      `TAIM ${school.name}: Morning sign-in code ${code}. On-time window ${PUNCTUALITY_MINUTES} min from issue; after that you may still sign in as late. Valid 48h.`,
    );
    sent += 1;
  }
  return { localDate, teachers: teachers.length, smsSent: sent };
}

export async function issueEveningOtps(schoolId: string) {
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { timezone: true, name: true } });
  if (!school) throw new HttpError(404, 'School not found');
  const localDate = calendarDateInTimeZone(new Date(), school.timezone ?? 'UTC');
  const issuedAt = new Date();
  const deadline = punctualityDeadline(issuedAt, PUNCTUALITY_MINUTES);
  const rows = await prisma.teacherWorkforceDay.findMany({
    where: { schoolId, localDate, signInAt: { not: null }, signOutAt: null, forcedLogoutAt: null },
    include: { teacher: { select: { id: true, phone: true, fullName: true } } },
  });
  let sent = 0;
  for (const row of rows) {
    await prisma.teacherWorkforceDay.update({
      where: { id: row.id },
      data: { eveningIssuedAt: issuedAt, eveningDeadlineAt: deadline },
    });
    const t = row.teacher;
    if (!t.phone) continue;
    const code = generateOtpCode();
    const codeHash = hashOtp(code);
    await prisma.otpCode.create({
      data: {
        schoolId,
        userId: t.id,
        phone: t.phone,
        purpose: WORKFORCE_OTP_PURPOSE_SIGNOUT(localDate),
        codeHash,
        expiresAt: workforceOtpExpiresAt(),
      },
    });
    await sendSms(
      t.phone,
      `TAIM ${school.name}: Evening sign-out code ${code}. Use within ${PUNCTUALITY_MINUTES} minutes or you will be signed out as late and logged off.`,
    );
    sent += 1;
  }
  return { localDate, eligibleTeachers: rows.length, smsSent: sent, eveningDeadlineAt: deadline.toISOString() };
}
