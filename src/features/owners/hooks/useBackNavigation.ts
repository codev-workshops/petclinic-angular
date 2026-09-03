import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * `navigate(-1)` when there is a previous history entry, otherwise go to `fallback`
 * (the route the Angular component navigated to) so deep links still have a way back.
 */
export function useBackNavigation(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== 'default';
  return useCallback(() => {
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [fallback, hasHistory, navigate]);
}
