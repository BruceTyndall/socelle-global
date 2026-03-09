import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mock dependencies (vi.hoisted to avoid factory hoisting issue) ───────
const { mockMaybeSingle, mockFrom, mockUseAuth } = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockLimit = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockOrder = vi.fn(() => ({ limit: mockLimit }));
  const mockIn = vi.fn(() => ({ order: mockOrder }));
  const mockEq = vi.fn((): Record<string, unknown> => ({ in: mockIn, maybeSingle: mockMaybeSingle, eq: mockEq }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockUseAuth = vi.fn(() => ({ user: null }));
  return { mockMaybeSingle, mockFrom, mockUseAuth };
});

vi.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom },
  isSupabaseConfigured: true,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: mockUseAuth,
}));

import { useTier } from '../useTier';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useTier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  it('returns free as default tier when no user is logged in', async () => {
    const { result } = renderHook(() => useTier(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tier).toBe('free');
    expect(result.current.tierRank).toBe(0);
    expect(result.current.isDemo).toBe(false);
  });

  it('meetsMinimumTier returns correct boolean for each tier comparison', async () => {
    const { result } = renderHook(() => useTier(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Default tier is 'free' (rank 0)
    expect(result.current.meetsMinimumTier('free')).toBe(true);
    expect(result.current.meetsMinimumTier('starter')).toBe(false);
    expect(result.current.meetsMinimumTier('pro')).toBe(false);
    expect(result.current.meetsMinimumTier('enterprise')).toBe(false);
  });

  it('tierRank values are correct (free=0, starter=1, pro=2, enterprise=3)', async () => {
    // Test with a logged in user who gets 'pro' from DEMO fallback
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });

    // Subscriptions table missing (42P01) => falls back to demo 'pro'
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'relation "subscriptions" does not exist' },
    });

    const { result } = renderHook(() => useTier(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tier).toBe('pro');
    expect(result.current.tierRank).toBe(2);
    expect(result.current.isDemo).toBe(true);

    // Verify rank comparisons
    expect(result.current.meetsMinimumTier('free')).toBe(true);
    expect(result.current.meetsMinimumTier('starter')).toBe(true);
    expect(result.current.meetsMinimumTier('pro')).toBe(true);
    expect(result.current.meetsMinimumTier('enterprise')).toBe(false);
  });
});
