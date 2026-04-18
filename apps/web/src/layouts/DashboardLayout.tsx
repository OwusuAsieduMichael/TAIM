import { LogOut, School } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export function DashboardLayout() {
  const clear = useAuthStore((s) => s.clear);
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <School className="h-5 w-5 text-[var(--color-primary)]" />
            <span>TAIM</span>
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]">
              {role}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              clear();
              navigate('/');
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
