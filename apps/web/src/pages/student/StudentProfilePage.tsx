import type { ComponentType, ReactNode } from 'react';
import {
  BookMarked,
  CalendarDays,
  Check,
  Copy,
  GraduationCap,
  LogOut,
  Phone,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolLogoFigure } from '@/components/SchoolLogoFigure';
import { Button } from '@/components/ui/button';
import type { MeResponse } from '@/features/auth/api';
import { useStudentMe } from '@/hooks/useStudentPortal';
import { isDevMockToken, SEED_DEMO } from '@/lib/skipRoleAuth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { triggerStudentHaptic } from '@/store/studentPrefsStore';

const MOCK_STUDENT_ME: MeResponse = {
  id: 'seed-student-user',
  fullName: 'Demo Student',
  role: 'STUDENT',
  schoolId: 'seed-school',
  email: null,
  phone: null,
  accountStatus: 'ACTIVE',
  lastActivityAt: new Date().toISOString(),
  student: {
    id: 'seed-student',
    admissionNumber: 'STU-001',
    classId: 'seed-class',
    schoolName: SEED_DEMO.schoolDisplayName,
    schoolSlug: SEED_DEMO.schoolSlug,
    className: 'JHS1-A',
    classLevel: 'JHS1',
    passportPhotoUrl: null,
    firstName: 'Demo',
    lastName: 'Student',
    gender: 'Male',
    dateOfBirth: '2012-03-15',
    academicYearName: '2025/2026',
    currentTermName: 'Term 1',
    guardians: [{ name: 'Demo Parent', phone: '233241000002', relation: 'Mother' }],
  },
};

function formatDob(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatGender(g: string | null | undefined): string {
  if (!g?.trim()) return '—';
  const t = g.trim().toLowerCase();
  if (t === 'm' || t === 'male') return 'Male';
  if (t === 'f' || t === 'female') return 'Female';
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
}

function formatLastActivity(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function accountStatusLabel(status: string | undefined): string {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'INACTIVE') return 'Inactive';
  return status ?? '—';
}

function classLine(st: MeResponse['student']): string {
  if (!st) return '—';
  if (st.className) return st.className;
  if (st.classLevel) return st.classLevel;
  return '—';
}

function ProfileCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--color-border)]/80 bg-[var(--color-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-200 dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
        'active:scale-[0.998] sm:hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:sm:hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 className="text-base font-semibold tracking-tight text-[var(--color-foreground)]">{title}</h2>
      </div>
      <div className="space-y-0">{children}</div>
    </section>
  );
}

function ReadRow({
  label,
  value,
  mono,
  action,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--color-border)]/60 py-3.5 last:border-0 last:pb-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">{label}</p>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <p
        className={cn(
          'text-[15px] font-medium leading-snug text-[var(--color-foreground)]',
          mono && 'font-mono text-[14px] tracking-tight',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function StudentProfilePage() {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  const { data: meApi, isLoading } = useStudentMe();
  const me = mock ? MOCK_STUDENT_ME : meApi;
  const st = me?.student;

  const [copied, setCopied] = useState(false);
  const [pinSheetOpen, setPinSheetOpen] = useState(false);

  const initials = useMemo(() => {
    const fn = st?.firstName ?? me?.fullName?.split(' ')[0] ?? 'S';
    const ln = st?.lastName ?? me?.fullName?.split(' ').slice(1).join(' ') ?? '';
    return `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase() || 'S';
  }, [st, me?.fullName]);

  const copyAdmission = useCallback(async () => {
    const id = st?.admissionNumber;
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      triggerStudentHaptic('light');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [st?.admissionNumber]);

  function signOut() {
    clear();
    navigate('/');
  }

  const primaryGuardian = st?.guardians?.[0];

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-2 sm:max-w-xl sm:px-6 lg:max-w-3xl lg:px-8 lg:pt-4">
      {isLoading && !mock ? (
        <div className="space-y-5 pt-4">
          <div className="h-48 animate-pulse rounded-3xl bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-40 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-40 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* —— Profile header (identity) —— */}
          <header
            className={cn(
              'relative overflow-hidden rounded-3xl px-5 pb-8 pt-10 text-center shadow-[0_8px_32px_rgba(37,99,235,0.12)]',
              'bg-gradient-to-b from-[var(--color-primary)]/18 via-[var(--color-primary)]/8 to-[var(--color-card)]',
              'dark:from-[var(--color-primary)]/25 dark:via-[var(--color-primary)]/12 dark:to-[var(--color-card)]',
            )}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 left-1/2 h-40 w-[120%] -translate-x-1/2 rounded-[100%] bg-[var(--color-primary)]/5 blur-3xl" />

            <div className="relative mx-auto mb-1 flex justify-center">
              <SchoolLogoFigure variant="nav" className="h-8 max-w-[5.5rem] opacity-90 sm:h-9" />
            </div>

            <div className="relative mx-auto mt-3 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
              <div className="absolute inset-0 rounded-full bg-[var(--color-card)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] ring-4 ring-[var(--color-card)] dark:ring-[var(--color-border)]" />
              {st?.passportPhotoUrl ? (
                <img
                  src={st.passportPhotoUrl}
                  alt=""
                  className="relative z-10 h-full w-full rounded-full object-cover"
                  decoding="async"
                />
              ) : (
                <span
                  className="relative z-10 text-2xl font-bold tracking-tight text-[var(--color-primary)] sm:text-3xl"
                  aria-hidden
                >
                  {initials}
                </span>
              )}
            </div>
            <p className="relative mt-5 text-[1.35rem] font-bold leading-tight tracking-tight text-[var(--color-foreground)] sm:text-2xl">
              {me?.fullName ?? 'Student'}
            </p>
            <p className="relative mt-1.5 text-sm font-medium text-[var(--color-muted)]">{classLine(st)}</p>
            <p className="relative mt-1 max-w-[18rem] mx-auto text-xs leading-relaxed text-[var(--color-muted)] sm:text-sm">
              {st?.schoolName ?? '—'}
            </p>
            <div className="relative mt-4 flex justify-center">
              {me?.accountStatus === 'INACTIVE' ? (
                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-500/30 dark:text-amber-100">
                  Account inactive
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-200 dark:ring-emerald-400/30">
                  Active student
                </span>
              )}
            </div>
          </header>

          {/* —— Personal —— */}
          <ProfileCard title="Personal information" icon={User}>
            <ReadRow label="Full name" value={me?.fullName ?? '—'} />
            <ReadRow label="Gender" value={formatGender(st?.gender)} />
            <ReadRow label="Date of birth" value={formatDob(st?.dateOfBirth)} />
            <ReadRow
              label="Student ID"
              value={st?.admissionNumber ?? '—'}
              mono
              action={
                <button
                  type="button"
                  onClick={() => void copyAdmission()}
                  className={cn(
                    'inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors',
                    'hover:bg-[var(--color-primary)]/8 active:scale-95',
                    copied && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
                  )}
                  aria-label={copied ? 'Copied' : 'Copy student ID'}
                >
                  {copied ? <Check className="h-4 w-4" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
                </button>
              }
            />
            {copied ? <p className="-mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">Copied ✓</p> : null}
          </ProfileCard>

          {/* —— Academic + Guardian (desktop: two columns) —— */}
          <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
            <ProfileCard title="Academic details" icon={GraduationCap}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm">
                  {classLine(st)}
                </span>
              </div>
              <ReadRow
                label="Academic year"
                value={
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[var(--color-muted)]" strokeWidth={1.75} />
                    {st?.academicYearName ?? '—'}
                  </span>
                }
              />
              <ReadRow
                label="Current term"
                value={
                  <span className="inline-flex items-center gap-2">
                    <BookMarked className="h-4 w-4 shrink-0 text-[var(--color-muted)]" strokeWidth={1.75} />
                    {st?.currentTermName ?? '—'}
                  </span>
                }
              />
            </ProfileCard>

            <ProfileCard title="Parent / Guardian" icon={Users}>
              {primaryGuardian ? (
                <>
                  <ReadRow label="Name" value={primaryGuardian.name} />
                  <ReadRow
                    label="Phone"
                    value={
                      primaryGuardian.phone ? (
                        <a
                          href={`tel:${primaryGuardian.phone.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
                        >
                          <Phone className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                          {primaryGuardian.phone}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <ReadRow label="Relation" value={primaryGuardian.relation || '—'} />
                </>
              ) : (
                <p className="py-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  No guardian on file yet. Your school can link a parent phone for quick contact.
                </p>
              )}
            </ProfileCard>
          </div>

          {/* —— Account —— */}
          <ProfileCard title="Account" icon={Shield}>
            <ReadRow label="Account status" value={accountStatusLabel(me?.accountStatus)} />
            <ReadRow label="Last activity" value={formatLastActivity(me?.lastActivityAt)} />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl border-[var(--color-border)] text-sm font-semibold transition-transform active:scale-[0.98]"
                onClick={() => {
                  triggerStudentHaptic('light');
                  setPinSheetOpen(true);
                }}
              >
                Change PIN
              </Button>
              <Button
                type="button"
                variant="default"
                className="h-12 flex-1 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]"
                onClick={() => {
                  triggerStudentHaptic('light');
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
                Log out
              </Button>
            </div>
          </ProfileCard>
        </div>
      )}

      {/* Change PIN info sheet */}
      {pinSheetOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-sheet-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={() => setPinSheetOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl">
            <h2 id="pin-sheet-title" className="text-lg font-bold text-[var(--color-foreground)]">
              Change your PIN
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              For your security, PIN changes are handled at school. Visit or call the office and ask them to reset your
              student PIN. You will sign in again with the new PIN they give you.
            </p>
            <Button type="button" className="mt-6 h-11 w-full rounded-xl font-semibold" onClick={() => setPinSheetOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
