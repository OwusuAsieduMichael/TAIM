import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { TeacherWorkspace } from '@/components/teacher/TeacherWorkspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TeacherSection } from '@/features/teacher/types';
import { fetchTeacherWorkforceStatus, postTeacherWorkforceSignIn } from '@/features/teacher/workforceApi';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type Props = { section: TeacherSection };

export function TeacherWorkforceShell({ section }: Props) {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  const online = useOnlineStatus();
  const qc = useQueryClient();
  const [code, setCode] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teacher', 'workforce', 'status'],
    queryFn: () => fetchTeacherWorkforceStatus(token!),
    enabled: !!token && !mock,
    refetchInterval: 45_000,
  });

  const signInMut = useMutation({
    mutationFn: () => postTeacherWorkforceSignIn(token!, code.trim()),
    onSuccess: () => {
      setCode('');
      void qc.invalidateQueries({ queryKey: ['teacher', 'workforce'] });
    },
  });

  if (mock) {
    return <TeacherWorkspace section={section} />;
  }

  if (!online) {
    return (
      <div className="portal-page mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">Connection required</h1>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          Teacher tools use live server time and workforce rules. Reconnect to the internet to continue.
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="portal-page py-16 text-center text-sm text-[var(--color-muted)]">
        Checking workforce session…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="portal-page mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-sm text-red-700 dark:text-red-300">{error instanceof Error ? error.message : 'Could not load status'}</p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (data.workforceDisabled) {
    return <TeacherWorkspace section={section} />;
  }

  const now = Date.now();
  const pastEveningDeadline =
    Boolean(data.eveningDeadlineAt) && now > new Date(data.eveningDeadlineAt!).getTime() && !data.signedOutAt;
  const sessionEnded = Boolean(data.forcedLogoutAt) || pastEveningDeadline;

  if (!data.signedInAt) {
    if (!data.morningIssuedAt) {
      return (
        <div className="portal-page mx-auto max-w-md space-y-4 py-16 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-foreground)]">Morning sign-in not open</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Wait for your administrator to issue today&apos;s SMS codes for teachers ({data.localDate}, {data.schoolTimezone}).
          </p>
        </div>
      );
    }
    return (
      <div className="portal-page mx-auto max-w-md space-y-6 py-10">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">Sign in for today</h1>
          <p className="text-xs text-[var(--color-muted)]">
            Server {new Date(data.serverNow).toLocaleString()} · on-time within {data.punctualityMinutes} min of issue; late
            sign-in still allowed with SMS code.
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-[var(--teacher-rail-border)] bg-[var(--color-card)]/95 p-4 shadow-sm">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Morning SMS code"
            className="h-11 rounded-xl"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <Button
            type="button"
            className="h-11 w-full rounded-xl font-semibold"
            disabled={!code.trim() || signInMut.isPending}
            onClick={() => signInMut.mutate()}
          >
            {signInMut.isPending ? 'Verifying…' : 'Sign in'}
          </Button>
          {signInMut.isError ? (
            <p className="text-center text-xs text-red-700 dark:text-red-300">
              {signInMut.error instanceof Error ? signInMut.error.message : 'Sign-in failed'}
            </p>
          ) : null}
        </div>
        {import.meta.env.DEV ? (
          <p className="text-center text-[10px] text-[var(--color-muted)]">
            API: set <code className="rounded bg-black/[0.06] px-1">TEACHER_WORKFORCE_DISABLED=1</code> to skip OTP locally.
          </p>
        ) : null}
      </div>
    );
  }

  if (sessionEnded) {
    return (
      <div className="portal-page mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-[var(--color-foreground)]">Session closed</h1>
        <p className="text-sm text-[var(--color-muted)]">
          The evening sign-out window has passed or your session was ended automatically. Late sign-out may have been
          recorded. Sign in again after your school issues the next morning code.
        </p>
      </div>
    );
  }

  return <TeacherWorkspace section={section} />;
}
