import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  aggregateAttendanceByClass,
  aggregateAttendanceTrend,
  aggregateClassPerformance,
  mockAttendanceAnalysis,
  mockPerformanceAnalysis,
  type AttendanceAnalysis,
} from '@/lib/adminInsightAnalytics';
import { apiFetch } from '@/lib/api';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type AttRow = { date?: string; status?: string; classId?: string | null; studentId?: string };
type ClassRow = { id: string; name: string };
type StudentRow = { id: string; classId?: string | null };
type ResultRow = { classId?: string | null; finalScore?: number; published?: boolean | string };

export function useAdminInsightAnalytics() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const preview = isDevMockToken(token);
  const enabled = !!token && role === 'ADMIN' && !preview;

  const { data: attendance, isLoading: attLoading } = useQuery({
    queryKey: ['attendance', 'insights'],
    queryFn: () => apiFetch<{ data: AttRow[] }>('/api/v1/attendance', { token }),
    enabled,
  });

  const { data: classes, isLoading: clsLoading } = useQuery({
    queryKey: ['classes', 'insights'],
    queryFn: () => apiFetch<{ data: ClassRow[] }>('/api/v1/classes', { token }),
    enabled,
  });

  const { data: students, isLoading: stuLoading } = useQuery({
    queryKey: ['students', 'insights'],
    queryFn: () => apiFetch<{ data: StudentRow[] }>('/api/v1/students', { token }),
    enabled,
  });

  const { data: results, isLoading: resLoading } = useQuery({
    queryKey: ['results', 'insights'],
    queryFn: () => apiFetch<{ data: ResultRow[] }>('/api/v1/results?published=true', { token }),
    enabled,
  });

  return useMemo(() => {
    const loading = enabled && (attLoading || clsLoading || stuLoading || resLoading);

    if (preview || role !== 'ADMIN') {
      return {
        loading: false,
        source: preview ? ('preview' as const) : ('unavailable' as const),
        attendance: mockAttendanceAnalysis(),
        performance: mockPerformanceAnalysis(),
      };
    }

    const attRows = attendance?.data ?? [];
    const classRows = classes?.data ?? [];
    const studentRows = students?.data ?? [];
    const resultRows = results?.data ?? [];

    let attendanceAnalysis: AttendanceAnalysis = aggregateAttendanceTrend(attRows);
    if (attendanceAnalysis.points.every((p) => p.total === 0)) {
      attendanceAnalysis = mockAttendanceAnalysis();
    } else {
      attendanceAnalysis = {
        ...attendanceAnalysis,
        classSlices: aggregateAttendanceByClass(attRows, classRows, studentRows),
      };
    }

    let performanceAnalysis = aggregateClassPerformance(resultRows, classRows);
    if (performanceAnalysis.classes.length === 0) {
      performanceAnalysis = mockPerformanceAnalysis();
    }

    return {
      loading,
      source: 'live' as const,
      attendance: attendanceAnalysis,
      performance: performanceAnalysis,
    };
  }, [
    preview,
    role,
    enabled,
    attLoading,
    clsLoading,
    stuLoading,
    resLoading,
    attendance?.data,
    classes?.data,
    students?.data,
    results?.data,
  ]);
}
