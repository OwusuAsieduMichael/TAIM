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

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    schoolId: user.schoolId,
    email: user.email,
    phone: user.phone,
    student: user.studentProfile
      ? {
          id: user.studentProfile.id,
          admissionNumber: user.studentProfile.admissionNumber,
          classId: user.studentProfile.classId,
        }
      : null,
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
