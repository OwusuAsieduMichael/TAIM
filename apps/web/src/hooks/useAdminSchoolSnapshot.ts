import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { localDateKey } from '@/lib/teacherLocalDate';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type School = { id: string; name: string; slug: string };

type AttRow = { status?: string };

export type AdminDashboardAlertItem = {
  id: string;
  title: string;
  detail: string;
  tone: 'info' | 'warning' | 'success';
};

export type AdminSchoolSnapshot = {
  today: string;
  mock: boolean;
  isSuper: boolean;
  isSchoolAdmin: boolean;
  /** True while any school-admin snapshot query is loading */
  isLoading: boolean;
  studentCount: number | null;
  classCount: number | null;
  teacherCount: number | null;
  teacherAssignmentRows: number | null;
  attendanceRowsToday: number | null;
  presentToday: number | null;
  absentToday: number | null;
  attendanceRatePct: number | null;
  /** Super-admin: number of schools */
  schoolCount: number | null;
};

const MOCK_SNAPSHOT: Omit<AdminSchoolSnapshot, 'today' | 'mock' | 'isSuper' | 'isSchoolAdmin' | 'isLoading'> = {
  studentCount: 248,
  classCount: 9,
  teacherCount: 18,
  teacherAssignmentRows: 52,
  attendanceRowsToday: 220,
  presentToday: 206,
  absentToday: 14,
  attendanceRatePct: Math.round((206 / 220) * 100),
  schoolCount: null,
};

/**
 * Single source of truth for school-admin intelligence used by Dashboard + module summary bars.
 * React Query keys align with `AdminDashboard` so all views stay in sync.
 */
export function useAdminSchoolSnapshot(): AdminSchoolSnapshot {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const mock = isDevMockToken(token);
  const isSuper = role === 'SUPER_ADMIN';
  const isSchoolAdmin = role === 'ADMIN';
  const today = useMemo(() => localDateKey(), []);

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools', 'all'],
    queryFn: () => apiFetch<{ data: School[] }>('/api/v1/schools', { token }),
    enabled: !!token && isSuper && !mock,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => apiFetch<{ data: unknown[] }>('/api/v1/students', { token }),
    enabled: !!token && isSchoolAdmin && !mock,
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', 'admin-dash'],
    queryFn: () => apiFetch<{ data: unknown[] }>('/api/v1/classes', { token }),
    enabled: !!token && isSchoolAdmin && !mock,
  });

  const { data: teacherSubjects, isLoading: tsLoading } = useQuery({
    queryKey: ['teacher-subjects', 'admin-dash'],
    queryFn: () => apiFetch<{ data: { teacherId: string }[] }>('/api/v1/teacher-subjects', { token }),
    enabled: !!token && isSchoolAdmin && !mock,
  });

  const { data: attendanceToday, isLoading: attLoading } = useQuery({
    queryKey: ['attendance', 'admin-dash', today],
    queryFn: () => apiFetch<{ data: AttRow[] }>(`/api/v1/attendance?date=${encodeURIComponent(today)}`, { token }),
    enabled: !!token && isSchoolAdmin && !mock,
  });

  return useMemo(() => {
    if (mock && isSchoolAdmin) {
      return {
        today,
        mock: true,
        isSuper: false,
        isSchoolAdmin: true,
        isLoading: false,
        schoolCount: null,
        ...MOCK_SNAPSHOT,
      };
    }

    if (isSuper) {
      return {
        today,
        mock,
        isSuper: true,
        isSchoolAdmin: false,
        isLoading: schoolsLoading,
        studentCount: null,
        classCount: null,
        teacherCount: null,
        teacherAssignmentRows: null,
        attendanceRowsToday: null,
        presentToday: null,
        absentToday: null,
        attendanceRatePct: null,
        schoolCount: schools?.data?.length ?? null,
      };
    }

    if (!isSchoolAdmin) {
      return {
        today,
        mock,
        isSuper: false,
        isSchoolAdmin: false,
        isLoading: false,
        studentCount: null,
        classCount: null,
        teacherCount: null,
        teacherAssignmentRows: null,
        attendanceRowsToday: null,
        presentToday: null,
        absentToday: null,
        attendanceRatePct: null,
        schoolCount: null,
      };
    }

    const rows = attendanceToday?.data;
    const present =
      rows && rows.length > 0 ? rows.filter((r) => (r.status ?? 'PRESENT') === 'PRESENT').length : rows?.length === 0 ? 0 : null;
    const total = rows?.length ?? null;
    const absent = present != null && total != null ? Math.max(0, total - present) : null;
    const ratePct =
      present != null && total != null && total > 0 ? Math.round((present / total) * 100) : total === 0 ? null : null;

    const tsRows = teacherSubjects?.data;
    const teachers = tsRows?.length ? new Set(tsRows.map((r) => r.teacherId)).size : null;

    return {
      today,
      mock,
      isSuper: false,
      isSchoolAdmin: true,
      isLoading: studentsLoading || classesLoading || tsLoading || attLoading,
      studentCount: students?.data?.length ?? null,
      classCount: classes?.data?.length ?? null,
      teacherCount: teachers,
      teacherAssignmentRows: tsRows?.length ?? null,
      attendanceRowsToday: total,
      presentToday: present,
      absentToday: absent,
      attendanceRatePct: ratePct,
      schoolCount: null,
    };
  }, [
    today,
    mock,
    isSuper,
    isSchoolAdmin,
    schoolsLoading,
    schools?.data?.length,
    studentsLoading,
    students?.data?.length,
    classesLoading,
    classes?.data?.length,
    tsLoading,
    teacherSubjects?.data,
    attLoading,
    attendanceToday?.data,
  ]);
}

/** Feeds the Dashboard alerts panel from the same snapshot as KPIs (data-aware when API is live). */
export function deriveAdminDashboardAlerts(snapshot: AdminSchoolSnapshot): AdminDashboardAlertItem[] {
  if (snapshot.isSuper) {
    return [
      {
        id: 'sup-1',
        title: 'Cross-tenant visibility',
        detail: 'Per-school KPI rollups will appear here as multi-tenant analytics land.',
        tone: 'info',
      },
    ];
  }

  if (!snapshot.isSchoolAdmin) {
    return [
      {
        id: 'na',
        title: 'Workspace',
        detail: 'Switch to a school admin account to see operational alerts.',
        tone: 'info',
      },
    ];
  }

  if (snapshot.mock) {
    return [
      {
        id: 'mock-1',
        title: 'Preview mode',
        detail: 'Connect a real admin session to drive KPIs and alerts from live API data.',
        tone: 'info',
      },
      {
        id: 'mock-2',
        title: 'Attendance pulse',
        detail: `Sample day ${snapshot.today}: ${snapshot.presentToday}/${snapshot.attendanceRowsToday} present (${snapshot.attendanceRatePct}%).`,
        tone: 'success',
      },
      {
        id: 'mock-3',
        title: 'Roster health',
        detail: `${snapshot.studentCount} students across ${snapshot.classCount} classes — keep guardian links current.`,
        tone: 'warning',
      },
    ];
  }

  if (snapshot.isLoading) {
    return [
      {
        id: 'load-1',
        title: 'Syncing intelligence',
        detail: 'Loading students, classes, staff, and attendance for your school…',
        tone: 'info',
      },
    ];
  }

  const out: AdminDashboardAlertItem[] = [];

  if (snapshot.studentCount === 0) {
    out.push({
      id: 'stu-0',
      title: 'Empty student roster',
      detail: 'No enrolled students found — add learners or verify the active academic year.',
      tone: 'warning',
    });
  }

  if (snapshot.classCount === 0 && (snapshot.studentCount ?? 0) > 0) {
    out.push({
      id: 'cls-0',
      title: 'Class structure missing',
      detail: 'Students exist but no classes — create streams before assignments and attendance scale.',
      tone: 'warning',
    });
  }

  if (snapshot.attendanceRowsToday === 0) {
    out.push({
      id: 'att-0',
      title: 'No attendance marks today',
      detail: `No marks recorded for ${snapshot.today}. Open Attendance to start registers.`,
      tone: 'info',
    });
  } else if (
    snapshot.attendanceRatePct != null &&
    snapshot.attendanceRowsToday != null &&
    snapshot.attendanceRowsToday > 0 &&
    snapshot.attendanceRatePct < 85
  ) {
    out.push({
      id: 'att-low',
      title: 'Absenteeism elevated',
      detail: `Today's attendance is ${snapshot.attendanceRatePct}% (${snapshot.absentToday} absent). Review classes with repeated absences.`,
      tone: 'warning',
    });
  } else if (snapshot.attendanceRatePct != null && snapshot.attendanceRatePct >= 92) {
    out.push({
      id: 'att-ok',
      title: 'Attendance looks strong',
      detail: `${snapshot.attendanceRatePct}% present today — keep registers complete through close of day.`,
      tone: 'success',
    });
  }

  if ((snapshot.teacherCount ?? 0) > 0 && (snapshot.classCount ?? 0) > 0 && (snapshot.teacherCount ?? 0) < (snapshot.classCount ?? 0)) {
    out.push({
      id: 'staff-gap',
      title: 'Staffing coverage',
      detail: 'Fewer unique teachers than classes — verify homeroom and subject assignments.',
      tone: 'info',
    });
  }

  if (out.length === 0) {
    out.push({
      id: 'all-clear',
      title: 'No critical signals',
      detail: 'Core counts loaded — continue monitoring attendance and results publish windows.',
      tone: 'success',
    });
  }

  return out.slice(0, 4);
}
