import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { RoleLoginShell } from '@/components/auth/RoleLoginShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginStudent } from '@/features/auth/api';
import { devPreviewSignIn, SEED_DEMO, SKIP_ROLE_AUTH } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';
const schema = z.object({
  schoolSlug: z.string().min(1),
  admissionNumber: z.string().min(1),
  pin: z.string().min(4),
});

type Form = z.infer<typeof schema>;

export function LoginStudentPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolSlug: SEED_DEMO.schoolSlug,
      admissionNumber: SEED_DEMO.studentAdmission,
      ...(SKIP_ROLE_AUTH ? { pin: SEED_DEMO.studentPin } : {}),
    },
  });

  async function onSubmit(values: Form) {
    setError(null);
    if (SKIP_ROLE_AUTH) {
      devPreviewSignIn(setAuth, navigate, 'STUDENT', values.schoolSlug || SEED_DEMO.schoolSlug);
      return;
    }
    try {
      const res = await loginStudent(values.schoolSlug, values.admissionNumber, values.pin);
      setAuth(res.accessToken, res.user.role, values.schoolSlug);
      navigate('/app/student/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    }
  }

  return (
    <RoleLoginShell
      title="Student sign-in"
      description={
        SKIP_ROLE_AUTH
          ? 'UI preview: Sign in skips the server. Fields use the seeded demo student (school code, ID, PIN).'
          : 'Use your school code, student ID, and PIN. Keep your PIN private — never share it with anyone.'
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {SKIP_ROLE_AUTH ? (
          <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-3 py-2 text-xs leading-relaxed text-[var(--color-muted)]">
            Seed student: school <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.schoolSlug}</span>, ID{' '}
            <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.studentAdmission}</span>, PIN{' '}
            <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.studentPin}</span>
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="schoolSlug">School code</Label>
          <Input
            id="schoolSlug"
            autoComplete="organization"
            placeholder="e.g. demo-school"
            {...form.register('schoolSlug')}
          />
          {form.formState.errors.schoolSlug && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.schoolSlug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Student ID</Label>
          <Input
            id="admissionNumber"
            autoComplete="username"
            placeholder="e.g. STU-001"
            {...form.register('admissionNumber')}
          />
          {form.formState.errors.admissionNumber && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.admissionNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="pin">PIN</Label>
            <span className="text-xs text-[var(--color-muted)]">Private</span>
          </div>
          <div className="relative">
            <Input
              id="pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="Enter PIN"
              className="pr-10 tracking-widest"
              {...form.register('pin')}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setShowPin((s) => !s)}
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Forgot your PIN? Ask your class teacher or the school office to reset it.
          </p>
          {form.formState.errors.pin && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.pin.message}</p>
          )}
        </div>

        {error ? <p className="text-sm font-medium text-[var(--color-destructive)]">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="border-t border-[var(--color-border)]/80 pt-4 text-center text-xs text-[var(--color-muted)]">
          Demo: school <span className="font-mono text-[var(--color-foreground)]">demo-school</span>, ID{' '}
          <span className="font-mono text-[var(--color-foreground)]">STU-001</span>, PIN{' '}
          <span className="font-mono text-[var(--color-foreground)]">1234</span>
        </p>
      </form>
    </RoleLoginShell>
  );
}
