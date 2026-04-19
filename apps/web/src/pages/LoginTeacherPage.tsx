import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { RoleLoginShell } from '@/components/auth/RoleLoginShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestTeacherOtp, verifyTeacherOtp } from '@/features/auth/api';
import { devPreviewSignIn, SEED_DEMO, SKIP_ROLE_AUTH } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  schoolSlug: z.string().min(1),
  phone: z.string().min(8),
  code: z.string().length(6).optional(),
});

type Form = z.infer<typeof schema>;

export function LoginTeacherPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolSlug: SEED_DEMO.schoolSlug,
      ...(SKIP_ROLE_AUTH ? { phone: SEED_DEMO.teacherPhone } : {}),
    },
  });

  async function sendOtp() {
    setError(null);
    const schoolSlug = form.getValues('schoolSlug');
    const phone = form.getValues('phone');
    try {
      await requestTeacherOtp(schoolSlug, phone);
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    }
  }

  async function onSubmit(values: Form) {
    setError(null);
    if (SKIP_ROLE_AUTH) {
      devPreviewSignIn(setAuth, navigate, 'TEACHER', values.schoolSlug || SEED_DEMO.schoolSlug);
      return;
    }
    if (step === 'phone') {
      await sendOtp();
      return;
    }
    if (!values.code) {
      setError('Enter the 6-digit code');
      return;
    }
    try {
      const res = await verifyTeacherOtp(values.schoolSlug, values.phone, values.code);
      setAuth(res.accessToken, res.user.role, values.schoolSlug);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    }
  }

  return (
    <RoleLoginShell
      title="Teacher sign-in"
      description={
        SKIP_ROLE_AUTH
          ? 'UI preview: Sign in skips OTP and opens the teacher workspace. Fields show the seeded demo school and phone.'
          : step === 'phone'
            ? 'Enter your school code and registered phone number. We will send a one-time code to verify it is you.'
            : 'Enter the 6-digit code we sent to your phone. In development, check the API server logs for the code.'
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {SKIP_ROLE_AUTH ? (
          <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-3 py-2 text-xs leading-relaxed text-[var(--color-muted)]">
            Seed teacher phone: <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.teacherPhone}</span>{' '}
            (or 0241000001) · school <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.schoolSlug}</span>
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="schoolSlug">School code</Label>
          <Input id="schoolSlug" autoComplete="organization" {...form.register('schoolSlug')} disabled={step === 'code'} />
          {form.formState.errors.schoolSlug && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.schoolSlug.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="e.g. 0241000001"
            {...form.register('phone')}
            disabled={step === 'code'}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.phone.message}</p>
          )}
        </div>
        {step === 'code' && (
          <div className="space-y-2">
            <Label htmlFor="code">One-time code</Label>
            <Input id="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" {...form.register('code')} />
          </div>
        )}
        {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {SKIP_ROLE_AUTH ? 'Sign in' : step === 'phone' ? 'Send code' : 'Verify and sign in'}
        </Button>
        {!SKIP_ROLE_AUTH && step === 'code' && (
          <Button type="button" variant="outline" className="w-full" onClick={() => setStep('phone')}>
            Use a different number
          </Button>
        )}
      </form>
    </RoleLoginShell>
  );
}
