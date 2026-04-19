import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getEnv } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

function generatePin(): string {
  return String(crypto.randomInt(1000, 9999));
}

export async function listStudents(schoolId: string, take = 50) {
  return prisma.student.findMany({
    where: { schoolId },
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      class: true,
      user: { select: { id: true, status: true } },
      parents: { include: { parent: { select: { id: true, fullName: true, phone: true } } } },
    },
  });
}

export async function createStudent(
  schoolId: string,
  input: {
    admissionNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    classId?: string;
    parentIds?: string[];
  },
) {
  const { BCRYPT_ROUNDS } = getEnv();
  const exists = await prisma.student.findFirst({
    where: { schoolId, admissionNumber: input.admissionNumber.trim() },
  });
  if (exists) {
    throw new HttpError(409, 'Admission number already exists');
  }
  const pin = generatePin();
  const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
  const fullName = `${input.firstName} ${input.lastName}`;
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        schoolId,
        fullName,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });
    const student = await tx.student.create({
      data: {
        schoolId,
        userId: user.id,
        admissionNumber: input.admissionNumber.trim(),
        pinHash,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        gender: input.gender,
        classId: input.classId,
      },
    });
    if (input.parentIds?.length) {
      for (const parentId of input.parentIds) {
        const parent = await tx.user.findFirst({
          where: { id: parentId, schoolId, role: 'PARENT' },
        });
        if (!parent) continue;
        await tx.studentParent.create({
          data: { studentId: student.id, parentId },
        });
      }
    }
    return { student, pin };
  });
  return {
    student: result.student,
    generatedPin: result.pin,
  };
}

export async function updateStudent(
  schoolId: string,
  studentId: string,
  patch: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    classId?: string | null;
    passportPhotoUrl?: string | null;
  },
) {
  const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
  if (!student) {
    throw new HttpError(404, 'Student not found');
  }
  const data: Record<string, unknown> = {};
  if (patch.firstName !== undefined) data.firstName = patch.firstName;
  if (patch.lastName !== undefined) data.lastName = patch.lastName;
  if (patch.dateOfBirth !== undefined) {
    data.dateOfBirth = patch.dateOfBirth === null ? null : new Date(patch.dateOfBirth);
  }
  if (patch.gender !== undefined) data.gender = patch.gender;
  if (patch.classId !== undefined) data.classId = patch.classId;
  if (patch.passportPhotoUrl !== undefined) data.passportPhotoUrl = patch.passportPhotoUrl;
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const fn = (patch.firstName ?? student.firstName) as string;
    const ln = (patch.lastName ?? student.lastName) as string;
    await prisma.user.update({
      where: { id: student.userId },
      data: { fullName: `${fn} ${ln}` },
    });
  }
  return prisma.student.update({
    where: { id: studentId },
    data,
    include: { class: true },
  });
}

export async function resetStudentPin(
  schoolId: string,
  actorId: string,
  studentId: string,
  newPin?: string,
  ip?: string,
) {
  const { BCRYPT_ROUNDS } = getEnv();
  const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
  if (!student) {
    throw new HttpError(404, 'Student not found');
  }
  const pin = newPin ?? generatePin();
  const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { pinHash } }),
    prisma.auditLog.create({
      data: {
        schoolId,
        actorId,
        action: 'STUDENT_PIN_RESET',
        entity: 'Student',
        entityId: studentId,
        metadata: { admissionNumber: student.admissionNumber },
        ip,
      },
    }),
  ]);
  return { newPin: pin };
}
