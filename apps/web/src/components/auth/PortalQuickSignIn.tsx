import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoAccountForRole, demoQuickSignIn, type DemoRole } from '@/features/auth/demoQuickLogin';
import { portalSignInErrorMessage } from '@/features/auth/portalSignInErrors';
import { SHOW_DEMO_QUICK_LOGIN } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  role?: DemoRole;
  roles?: DemoRole[];
  /** Tighter layout for portal cards on the home page. */
  compact?: boolean;
};

export function PortalQuickSignIn({ role, roles, compact = false }: Props) {
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

  async function continueAs(targetRole: DemoRole) {
    setError(null);
    setLoadingRole(targetRole);
    try {
      await demoQuickSignIn(targetRole, setAuth, navigate);
    } catch (e) {
      setError(portalSignInErrorMessage(e));
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className={cn('space-y-2', compact ? 'mt-5' : 'mt-1')} role="group" aria-label="Quick portal access">
      {accounts.map((account) => (
        <Button
          key={account.role}
          type="button"
          variant="school"
          className="w-full font-semibold shadow-sm"
          size={compact ? 'default' : 'lg'}
          disabled={loadingRole !== null}
          aria-busy={loadingRole === account.role}
          onClick={() => void continueAs(account.role)}
        >
          {loadingRole === account.role ? 'Signing in…' : `Continue as ${account.label}`}
        </Button>
      ))}
      {error ? (
        <p className="text-xs leading-relaxed text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
