import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const portals = [
  { to: '/login/admin', title: 'Administrator', desc: 'Email and password' },
  { to: '/login/teacher', title: 'Teacher', desc: 'Phone OTP' },
  { to: '/login/parent', title: 'Parent', desc: 'Phone OTP' },
  { to: '/login/student', title: 'Student', desc: 'Admission number and PIN' },
];

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TAIM</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Tomhel Academic Information Manager</p>
      </div>
      <div className="grid gap-3">
        {portals.map((p) => (
          <Link key={p.to} to={p.to} className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
            <Card className="transition hover:border-[var(--color-primary)]/40">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
                <p className="pt-2 text-sm font-medium text-[var(--color-primary)]">Continue →</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
