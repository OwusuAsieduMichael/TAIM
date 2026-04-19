import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

/** Shared layout for role sign-in pages: subtle page background + elevated card. */
export function RoleLoginShell({ title, description, children }: Props) {
  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-[var(--color-background)] via-[var(--color-background)] to-[var(--color-border)]/35 dark:via-[var(--color-background)] dark:to-neutral-950">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <Card className="border-[var(--color-border)] shadow-md dark:border-[var(--color-border)] dark:shadow-black/30">
          <CardHeader className="space-y-2 border-b border-[var(--color-border)]/80 bg-[var(--color-card)] pb-5 pt-6 sm:pt-7">
            <CardTitle className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-[var(--color-muted)]">{description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {children}
            <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
              <Link
                to="/"
                className="font-medium text-[var(--color-foreground)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary)]"
              >
                ← All portals
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
