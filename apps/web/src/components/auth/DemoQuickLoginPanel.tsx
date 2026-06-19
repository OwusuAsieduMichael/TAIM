import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoAccountForRole, demoQuickSignIn, type DemoRole } from '@/features/auth/demoQuickLogin';
import { SHOW_DEMO_QUICK_LOGIN } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const demoPanelClass =
  'space-y-3 rounded-lg border border-emerald-700/30 bg-emerald-50/90 px-3 py-3 dark:border-emerald-500/35 dark:bg-emerald-950/40';

const demoButtonClass =
  'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500';

type Props = {
  role?: DemoRole;
  roles?: DemoRole[];
  /** Shorter label on the home page portal cards. */
  compact?: boolean;
};

export function DemoQuickLoginPanel({ role, roles, compact = false }: Props) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const roleList = roles ?? (role ? [role] : []);
  const accounts = roleList
    .map((r) => demoAccountForRole(r))
    .filter((account): account is NonNullable<typeof account> => Boolean(account));

  if (!SHOW_DEMO_QUICK_LOGIN || accounts.length === 0) {
    return null;
  }

  async function enterDemo(targetRole: DemoRole) {
    setError(null);
    setLoadingRole(targetRole);
    try {
      await demoQuickSignIn(targetRole, setAuth, navigate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className={cn(demoPanelClass, compact ? 'mt-4' : undefined)}>
      {accounts.map((account, index) => (
        <div
          key={account.role}
          className={cn(index > 0 && 'space-y-3 border-t border-emerald-700/20 pt-3 dark:border-emerald-500/25')}
        >
          <p className="text-xs leading-relaxed text-emerald-900/75 dark:text-emerald-100/80">
            <span className="font-medium text-emerald-950 dark:text-emerald-50">Demo access</span>
            {!compact || accounts.length > 1 ? ' — tap to enter with no typing:' : ':'}
            <br />
            <span className="font-mono text-[11px] text-emerald-950 dark:text-emerald-50">{account.credentials}</span>
          </p>
          <Button
            type="button"
            className={cn('w-full', demoButtonClass)}
            size={compact ? 'sm' : 'default'}
            disabled={loadingRole !== null}
            onClick={() => void enterDemo(account.role)}
          >
            {loadingRole === account.role
              ? 'Signing in…'
              : compact
                ? `Enter as ${account.label}`
                : `Tap to enter as ${account.label}`}
          </Button>
        </div>
      ))}
      {error ? <p className="text-xs text-[var(--color-destructive)]">{error}</p> : null}
    </div>
  );
}
