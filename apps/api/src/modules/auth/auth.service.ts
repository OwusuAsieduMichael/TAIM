import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { getEnv } from '../../config/env.js';
import { signAccessToken } from '../../lib/jwt.js';
import { generateOtpCode, hashOtp, verifyOtpHash } from '../../lib/otp.js';
import { prisma } from '../../lib/prisma.js';
import { sendSms } from '../../lib/sms.js';
import { HttpError } from '../../middleware/errorHandler.js';

const MAX_OTP_ATTEMPTS = 5;

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      status: 'ACTIVE',
    },
  });
  if (!user?.passwordHash) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const token = signAccessToken({
    sub: user.id,
    role: user.role,
    schoolId: user.schoolId,
  });
  return {
    accessToken: token,
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      schoolId: user.schoolId,
      email: user.email,
    },
  };
}

export async function requestOtp(input: {
  schoolSlug: string;
  phone: string;
  role: typeof Role.TEACHER | typeof Role.PARENT;
}) {
  const school = await prisma.school.findUnique({ where: { slug: input.schoolSlug } });
  if (!school) {
    throw new HttpError(404, 'School not found');
  }
  const normalizedPhone = normalizePhone(input.phone);
  const user = await prisma.user.findFirst({
    where: {
      schoolId: school.id,
      phone: normalizedPhone,
      role: input.role,
      status: 'ACTIVE',
    },
  });
  if (!user) {
    throw new HttpError(404, 'No account for this phone and role');
  }
  const { OTP_EXPIRY_MINUTES } = getEnv();
  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await prisma.otpCode.create({
    data: {
      schoolId: school.id,
      phone: normalizedPhone,
      purpose: `${input.role}_LOGIN`,
      codeHash,
      expiresAt,
    },
  });
  await sendSms(normalizedPhone, `Your TAIM code is ${code}. Expires in ${OTP_EXPIRY_MINUTES} minutes.`);
  return { message: 'OTP sent', expiresInMinutes: OTP_EXPIRY_MINUTES };
}

export async function verifyOtp(input: {
  schoolSlug: string;
  phone: string;
  code: string;
  role: typeof Role.TEACHER | typeof Role.PARENT;
}) {
  const school = await prisma.school.findUnique({ where: { slug: input.schoolSlug } });
  if (!school) {
    throw new HttpError(404, 'School not found');
  }
  const normalizedPhone = normalizePhone(input.phone);
  const otp = await prisma.otpCode.findFirst({
    where: {
      schoolId: school.id,
      phone: normalizedPhone,
      purpose: `${input.role}_LOGIN`,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) {
    throw new HttpError(400, 'No active OTP');
  }
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    throw new HttpError(429, 'Too many attempts');
  }
  const valid = verifyOtpHash(input.code, otp.codeHash);
  if (!valid) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(401, 'Invalid OTP');
  }
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
  const user = await prisma.user.findFirst({
    where: {
      schoolId: school.id,
      phone: normalizedPhone,
      role: input.role,
      status: 'ACTIVE',
    },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  const token = signAccessToken({
    sub: user.id,
    role: user.role,
    schoolId: user.schoolId,
  });
  return {
    accessToken: token,
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      schoolId: user.schoolId,
      phone: user.phone,
    },
  };
}

function startOfLocalDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Term whose date range includes today, if any. */
function pickCurrentTermName(terms: { name: string; startsOn: Date; endsOn: Date }[]): string | null {
  if (!terms.length) return null;
  const now = Date.now();
  for (const t of terms) {
    const a = t.startsOn.getTime();
    const b = t.endsOn.getTime();
    if (now >= a && now <= b) return t.name;
  }
  return null;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          school: { select: { id: true, name: true, slug: true } },
          class: {
            select: {
              id: true,
              name: true,
              level: true,
              academicYear: {
                select: {
                  id: true,
                  name: true,
                  terms: {
                    select: { name: true, startsOn: true, endsOn: true, order: true },
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
          parents: {
            include: {
              parent: { select: { fullName: true, phone: true } },
            },
          },
        },
      },
    },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  let studentOut: {
    id: string;
    admissionNumber: string;
    classId: string | null;
    schoolName: string;
    schoolSlug: string;
    className: string | null;
    classLevel: string | null;
    attendanceToday: string | null;
    attendanceRecent: { date: string; status: string }[];
    passportPhotoUrl: string | null;
    firstName: string;
    lastName: string;
    gender: string | null;
    dateOfBirth: string | null;
    academicYearName: string | null;
    currentTermName: string | null;
    guardians: { name: string; phone: string | null; relation: string }[];
  } | null = null;

  if (user.studentProfile) {
    const sp = user.studentProfile;
    const day = startOfLocalDay();
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const todayRow = await prisma.attendance.findFirst({
      where: {
        studentId: sp.id,
        date: { gte: day, lt: next },
      },
    });
    const recent = await prisma.attendance.findMany({
      where: { studentId: sp.id },
      orderBy: { date: 'desc' },
      take: 14,
      select: { date: true, status: true },
    });
    const terms = sp.class?.academicYear?.terms ?? [];
    studentOut = {
      id: sp.id,
      admissionNumber: sp.admissionNumber,
      classId: sp.classId,
      schoolName: sp.school.name,
      schoolSlug: sp.school.slug,
      className: sp.class?.name ?? null,
      classLevel: sp.class?.level ?? null,
      attendanceToday: todayRow?.status ?? null,
      attendanceRecent: recent.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        status: r.status,
      })),
      passportPhotoUrl: sp.passportPhotoUrl ?? null,
      firstName: sp.firstName,
      lastName: sp.lastName,
      gender: sp.gender ?? null,
      dateOfBirth: sp.dateOfBirth ? sp.dateOfBirth.toISOString().slice(0, 10) : null,
      academicYearName: sp.class?.academicYear?.name ?? null,
      currentTermName: pickCurrentTermName(terms),
      guardians: sp.parents.map((row) => ({
        name: row.parent.fullName,
        phone: row.parent.phone,
        relation: row.relation,
      })),
    };
  }

  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    schoolId: user.schoolId,
    email: user.email,
    phone: user.phone,
    accountStatus: user.status,
    lastActivityAt: user.updatedAt.toISOString(),
    student: studentOut,
  };
}

export async function loginStudent(input: {
  schoolSlug: string;
  admissionNumber: string;
  pin: string;
}) {
  const school = await prisma.school.findUnique({ where: { slug: input.schoolSlug } });
  if (!school) {
    throw new HttpError(404, 'School not found');
  }
  const student = await prisma.student.findFirst({
    where: {
      schoolId: school.id,
      admissionNumber: input.admissionNumber.trim(),
    },
    include: { user: true },
  });
  if (!student) {
    throw new HttpError(401, 'Invalid admission number or PIN');
  }
  const ok = await bcrypt.compare(input.pin, student.pinHash);
  if (!ok) {
    throw new HttpError(401, 'Invalid admission number or PIN');
  }
  if (student.user.status !== 'ACTIVE' || student.user.role !== 'STUDENT') {
    throw new HttpError(403, 'Account inactive');
  }
  const token = signAccessToken({
    sub: student.userId,
    role: 'STUDENT',
    schoolId: student.schoolId,
  });
  return {
    accessToken: token,
    user: {
      id: student.userId,
      fullName: `${student.firstName} ${student.lastName}`,
      role: 'STUDENT' as Role,
      schoolId: student.schoolId,
      studentId: student.id,
      admissionNumber: student.admissionNumber,
    },
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `233${digits.slice(1)}`;
  }
  if (digits.startsWith('233')) return digits;
  return digits;
}
