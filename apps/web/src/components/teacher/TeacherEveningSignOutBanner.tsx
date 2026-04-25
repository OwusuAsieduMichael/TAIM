import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchTeacherWorkforceStatus, postTeacherWorkforceSignOut } from '@/features/teacher/workforceApi';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

export function TeacherEveningSignOutBanner() {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  const qc = useQueryClient();
  const [code, setCode] = useState('');

  const { data } = useQuery({
    queryKey: ['teacher', 'workforce', 'status'],
    queryFn: () => fetchTeacherWorkforceStatus(token!),
    enabled: !!token && !mock,
    refetchInterval: 60_000,
  });

  const signOutMut = useMutation({
    mutationFn: () => postTeacherWorkforceSignOut(token!, code.trim()),
    onSuccess: () => {
      setCode('');
      void qc.invalidateQueries({ queryKey: ['teacher', 'workforce'] });
    },
  });

  if (mock || !data || data.workforceDisabled) return null;
  if (!data.signedInAt || data.signedOutAt || !data.eveningIssuedAt) return null;
  if (data.eveningDeadlineAt && Date.now() > new Date(data.eveningDeadlineAt).getTime()) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)]/80 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-[var(--teacher-rail-fg)]">Evening sign-out</p>
        <p className="text-xs text-[var(--teacher-rail-muted)]">
          Enter your SMS sign-out code before{' '}
          {data.eveningDeadlineAt ? new Date(data.eveningDeadlineAt).toLocaleString() : 'the deadline'} to avoid automatic
          logout.
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Evening code"
          className="h-10 w-full rounded-xl sm:w-40"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 rounded-xl border-[var(--teacher-rail-border)] font-semibold"
          disabled={!code.trim() || signOutMut.isPending}
          onClick={() => signOutMut.mutate()}
        >
          {signOutMut.isPending ? '…' : 'Sign out'}
        </Button>
      </div>
      {signOutMut.isError ? (
        <p className="text-xs text-red-700 dark:text-red-300 sm:col-span-2">
          {signOutMut.error instanceof Error ? signOutMut.error.message : 'Sign-out failed'}
        </p>
      ) : null}
    </div>
  );
}
