import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestTeacherOtp, verifyTeacherOtp } from '@/features/auth/api';
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
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { schoolSlug: 'demo-school' } });

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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Teacher sign-in</CardTitle>
          <CardDescription>OTP is sent to your registered phone (check server logs in development).</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="schoolSlug">School slug</Label>
              <Input id="schoolSlug" {...form.register('schoolSlug')} disabled={step === 'code'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} disabled={step === 'code'} placeholder="0241000001" />
            </div>
            {step === 'code' && (
              <div className="space-y-2">
                <Label htmlFor="code">OTP code</Label>
                <Input id="code" inputMode="numeric" maxLength={6} {...form.register('code')} />
              </div>
            )}
            {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {step === 'phone' ? 'Send OTP' : 'Verify and sign in'}
            </Button>
            {step === 'code' && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('phone')}>
                Change phone
              </Button>
            )}
          </form>
          <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
            <Link className="underline" to="/">
              Back
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
