// ── Multi-Location Context + Hook ──────────────────────────────────────
// WO-22: React context for location switching. Provider wraps business portal.

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import type { OperatorLocation } from './types';
import { getLocations, isMultiLocation as checkMultiLocation } from './mockLocations';

interface LocationContextValue {
  selectedLocationId: string | 'all';
  setSelectedLocation: (id: string | 'all') => void;
  currentLocations: OperatorLocation[];
  isMultiLocation: boolean;
  selectedLocation: OperatorLocation | null; // null when 'all'
}

const LocationCtx = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const locations = useMemo(() => getLocations(), []);
  const multiLocation = useMemo(() => checkMultiLocation(), []);
  const [selectedLocationId, setSelectedLocationId] = useState<string | 'all'>('all');

  const setSelectedLocation = useCallback((id: string | 'all') => {
    setSelectedLocationId(id);
  }, []);

  const selectedLocation = useMemo(
    () => (selectedLocationId === 'all' ? null : locations.find((l) => l.id === selectedLocationId) ?? null),
    [selectedLocationId, locations],
  );

  const value = useMemo<LocationContextValue>(
    () => ({
      selectedLocationId,
      setSelectedLocation,
      currentLocations: locations,
      isMultiLocation: multiLocation,
      selectedLocation,
    }),
    [selectedLocationId, setSelectedLocation, locations, multiLocation, selectedLocation],
  );

  return createElement(LocationCtx.Provider, { value }, children);
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationCtx);
  if (!ctx) {
    // Graceful fallback for components rendered outside the provider
    return {
      selectedLocationId: 'all',
      setSelectedLocation: () => {},
      currentLocations: [],
      isMultiLocation: false,
      selectedLocation: null,
    };
  }
  return ctx;
}
