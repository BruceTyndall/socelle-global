import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useAuth } from '../lib/auth';

/**
 * Sets Sentry user context when auth state changes.
 * Only sends user ID — no PII (email, name) per SOCELLE data policy.
 */
export function SentryUserContext() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      Sentry.setUser({ id: user.id });
    } else {
      Sentry.setUser(null);
    }
  }, [user?.id]);

  return null;
}
