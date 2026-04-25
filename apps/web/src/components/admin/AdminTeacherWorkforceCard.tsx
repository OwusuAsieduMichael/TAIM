import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sun, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { postSchoolEveningWorkforceOtps, postSchoolMorningWorkforceOtps } from '@/features/teacher/workforceApi';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

export function AdminTeacherWorkforceCard() {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  const qc = useQueryClient();

  const morning = useMutation({
    mutationFn: () => postSchoolMorningWorkforceOtps(token!),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['admin'] });
      window.alert(`Morning OTPs issued for ${r.localDate}. SMS sent: ${r.smsSent} of ${r.teachers} teachers (others may lack phone).`);
    },
    onError: (e) => window.alert(e instanceof Error ? e.message : 'Failed'),
  });

  const evening = useMutation({
    mutationFn: () => postSchoolEveningWorkforceOtps(token!),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['admin'] });
      window.alert(
        `Evening OTPs issued. Eligible: ${r.eligibleTeachers}. SMS: ${r.smsSent}. Deadline: ${new Date(r.eveningDeadlineAt).toLocaleString()}`,
      );
    },
    onError: (e) => window.alert(e instanceof Error ? e.message : 'Failed'),
  });

  if (mock) return null;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Teacher workforce (SMS OTP)</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Issue morning sign-in codes for all teachers, then evening sign-out codes. Uses server time and each school&apos;s
          timezone.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="student-interactive-well gap-2 rounded-xl border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] font-semibold text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)]"
          disabled={morning.isPending}
          onClick={() => morning.mutate()}
        >
          <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Issue morning OTPs
        </Button>
        <Button
          type="button"
          variant="outline"
          className="student-interactive-well gap-2 rounded-xl border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] font-semibold text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)]"
          disabled={evening.isPending}
          onClick={() => evening.mutate()}
        >
          <Sunset className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Issue evening OTPs
        </Button>
      </div>
    </section>
  );
}
