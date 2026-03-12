import { useEffect, useState } from 'react';
import type { UserTagPreference } from './personalization';
import {
  ANON_SIGNAL_MEMORY_EVENT,
  getAnonymousPreferenceRows,
  getAnonymousSignalEngagement,
  type AnonymousSignalEngagement,
} from './anonymousSignalMemory';

export function useAnonymousTagPreferences(): UserTagPreference[] {
  const [rows, setRows] = useState<UserTagPreference[]>(() => getAnonymousPreferenceRows());

  useEffect(() => {
    const sync = () => setRows(getAnonymousPreferenceRows());

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(ANON_SIGNAL_MEMORY_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(ANON_SIGNAL_MEMORY_EVENT, sync as EventListener);
    };
  }, []);

  return rows;
}

export function useAnonymousSignalEngagement(signalId: string | null | undefined): AnonymousSignalEngagement | null {
  const [engagement, setEngagement] = useState<AnonymousSignalEngagement | null>(() =>
    getAnonymousSignalEngagement(signalId),
  );

  useEffect(() => {
    const sync = () => setEngagement(getAnonymousSignalEngagement(signalId));

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(ANON_SIGNAL_MEMORY_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(ANON_SIGNAL_MEMORY_EVENT, sync as EventListener);
    };
  }, [signalId]);

  return engagement;
}
