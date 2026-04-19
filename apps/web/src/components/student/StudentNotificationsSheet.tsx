import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { listNotifications, markNotificationRead, type InAppNotification } from '@/lib/notificationsApi';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

type StudentNotificationsSheetProps = {
  triggerClassName?: string;
};

export function StudentNotificationsSheet({ triggerClassName }: StudentNotificationsSheetProps = {}) {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'student'],
    queryFn: () => listNotifications(token!),
    enabled: !!token && !mock,
    staleTime: 20_000,
  });

  const readMut = useMutation({
    mutationFn: (id: string) => {
      if (!token || mock) return Promise.resolve();
      return markNotificationRead(token, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'student'] }),
  });

  const list: InAppNotification[] = data?.data ?? [];
  const unread = list.filter((n) => !n.readAt).length;

  function onOpenItem(n: InAppNotification) {
    if (!n.readAt) readMut.mutate(n.id);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-foreground)] transition-colors hover:bg-black/[0.06] active:scale-95 motion-reduce:transition-none',
          triggerClassName,
        )}
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-destructive)] ring-2 ring-[var(--color-card)]" />
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-[2px] motion-safe:animate-[fade-in_200ms_ease-out]" role="dialog" aria-modal="true" aria-labelledby="notif-sheet-title">
          <button type="button" className="min-h-0 flex-1 cursor-default" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl motion-safe:animate-[slide-in_240ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
              <h2 id="notif-sheet-title" className="text-lg font-semibold text-[var(--color-foreground)]">
                Updates
              </h2>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/[0.06]"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
              {isLoading && (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-black/[0.06]" />
                  ))}
                </div>
              )}
              {!isLoading && list.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                  <Bell className="h-10 w-10 text-[var(--color-muted)]" strokeWidth={1.25} />
                  <p className="text-sm font-medium text-[var(--color-foreground)]">You&apos;re all caught up</p>
                  <p className="text-xs text-[var(--color-muted)]">Attendance alerts and new results will show up here.</p>
                </div>
              )}
              {!isLoading && list.length > 0 ? (
                <ul className="space-y-2">
                  {list.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem(n)}
                        className={cn(
                          'student-interactive-well w-full rounded-xl border px-4 py-3 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
                          !n.readAt
                            ? 'border-[var(--color-primary)]/35 bg-[var(--color-primary)]/5'
                            : 'border-[var(--color-border)] bg-[var(--color-background)]',
                        )}
                      >
                        <p className="font-semibold text-[var(--color-foreground)]">{n.title}</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{n.body}</p>
                        <p className="mt-2 text-xs text-[var(--color-muted)]">{formatWhen(n.createdAt)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
