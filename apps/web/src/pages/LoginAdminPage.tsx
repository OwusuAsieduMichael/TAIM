import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { RoleLoginShell } from '@/components/auth/RoleLoginShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAdmin } from '@/features/auth/api';
import { devPreviewSignIn, SEED_DEMO, SKIP_ROLE_AUTH } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export function LoginAdminPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: SKIP_ROLE_AUTH
      ? { email: SEED_DEMO.adminEmail, password: SEED_DEMO.adminPassword }
      : undefined,
  });

  async function onSubmit(values: Form) {
    setError(null);
    if (SKIP_ROLE_AUTH) {
      devPreviewSignIn(setAuth, navigate, 'ADMIN', null);
      return;
    }
    try {
      const res = await loginAdmin(values.email, values.password);
      setAuth(res.accessToken, res.user.role, null);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    }
  }

  return (
    <RoleLoginShell
      title="Administrator sign-in"
      description="Use your school admin email and password issued by Tomhel."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {SKIP_ROLE_AUTH ? (
          <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-3 py-2 text-xs leading-relaxed text-[var(--color-muted)]">
            UI preview: Sign in skips the server. Seed school admin is{' '}
            <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.adminEmail}</span> /{' '}
            <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.adminPassword}</span>. Platform
            super-admin: <span className="font-mono text-[var(--color-foreground)]">{SEED_DEMO.superAdminEmail}</span>{' '}
            (same password).
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
          {form.formState.errors.password && (
            <p className="text-sm text-[var(--color-destructive)]">{form.formState.errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </RoleLoginShell>
  );
}
