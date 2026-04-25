import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function normalizePath(p: string) {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p;
}

/**
 * Browser-style Back for in-app portals: `navigate(-1)` when history exists,
 * otherwise `navigate(fallbackPath)` (e.g. direct deep-link).
 */
export function usePortalBack(fallbackPath: string) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const showBack = useMemo(() => normalizePath(pathname) !== normalizePath(fallbackPath), [pathname, fallbackPath]);

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath);
  }, [navigate, fallbackPath]);

  return { showBack, goBack };
}
