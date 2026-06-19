import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoAccountForRole, demoQuickSignIn, type DemoRole } from '@/features/auth/demoQuickLogin';
import { SHOW_DEMO_QUICK_LOGIN } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

type Props = {
  role: DemoRole;
  /** Shorter label on the home page portal cards. */
  compact?: boolean;
};

export function DemoQuickLoginPanel({ role, compact = false }: Props) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const account = demoAccountForRole(role);

  if (!SHOW_DEMO_QUICK_LOGIN || !account) {
    return null;
  }

  async function enterDemo() {
    setError(null);
    setLoading(true);
    try {
      await demoQuickSignIn(role, setAuth, navigate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        compact
          ? 'mt-4 space-y-3 border-t border-[var(--color-border)]/60 pt-4'
          : 'space-y-3 rounded-lg border border-emerald-700/25 bg-emerald-50/80 px-3 py-3 dark:border-emerald-500/30 dark:bg-emerald-950/30'
      }
    >
      <p className="text-xs leading-relaxed text-[var(--color-muted)]">
        <span className="font-medium text-[var(--color-foreground)]">Demo access</span>
        {!compact ? ' — tap to enter with no typing:' : ':'}
        <br />
        <span className="font-mono text-[11px] text-[var(--color-foreground)]">{account.credentials}</span>
      </p>
      <Button
        type="button"
        className="w-full"
        size={compact ? 'sm' : 'default'}
        disabled={loading}
        onClick={() => void enterDemo()}
      >
        {loading ? 'Signing in…' : compact ? `Enter as ${account.label}` : `Tap to enter as ${account.label}`}
      </Button>
      {error ? <p className="text-xs text-[var(--color-destructive)]">{error}</p> : null}
    </div>
  );
}
