import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginStudent } from '@/features/auth/api';
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
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { schoolSlug: 'demo-school', admissionNumber: 'STU-001' },
  });

  async function onSubmit(values: Form) {
    setError(null);
    try {
      const res = await loginStudent(values.schoolSlug, values.admissionNumber, values.pin);
      setAuth(res.accessToken, res.user.role, values.schoolSlug);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Student sign-in</CardTitle>
          <CardDescription>Admission number and PIN from your school.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="schoolSlug">School slug</Label>
              <Input id="schoolSlug" {...form.register('schoolSlug')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionNumber">Admission number</Label>
              <Input id="admissionNumber" {...form.register('admissionNumber')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input id="pin" type="password" autoComplete="off" {...form.register('pin')} />
            </div>
            {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
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
