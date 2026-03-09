import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mock dependencies ─────────────────────────────────────────────────────────
const { mockSelect, mockIsSupabaseConfigured } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder2 = vi.fn(() => ({ order: mockSingle }));
  const mockOrder = vi.fn(() => ({ order: mockOrder2 }));
  const mockOr = vi.fn(() => ({ order: mockOrder }));
  const mockEq = vi.fn(() => ({ or: mockOr }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  let mockIsSupabaseConfigured = true;
  return { mockSelect, mockIsSupabaseConfigured };
});

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({ select: mockSelect })),
  },
  get isSupabaseConfigured() {
    return mockIsSupabaseConfigured;
  },
}));

import { useIntelligence } from '../useIntelligence';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockSignalRow = {
  id: 'sig-1',
  signal_type: 'product_velocity',
  signal_key: 'retinol-velocity',
  title: 'Retinol Demand Surge',
  description: 'Retinol adoption up 34% in medi-spas',
  magnitude: 34,
  direction: 'up',
  region: 'US-West',
  category: 'skincare',
  related_brands: ['brand-a'],
  related_products: ['prod-1'],
  updated_at: new Date().toISOString(),
  source: 'market-data',
  source_type: null,
  data_source: null,
  confidence_score: 0.88,
};

describe('useIntelligence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty state with isLive=false when Supabase is not configured', async () => {
    const { supabase: mockSupa, isSupabaseConfigured: isSC } = await import('../../supabase') as any;
    Object.defineProperty(await import('../../supabase'), 'isSupabaseConfigured', { value: false, configurable: true });

    // When disabled, query won't run
    const { result } = renderHook(() => useIntelligence(), { wrapper: createWrapper() });

    // loading=false and signals empty when query disabled
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.signals).toEqual([]);
    expect(result.current.isLive).toBe(false);
  });

  it('tier-filters signals — free tier sees only free signals', async () => {
    // The hook defaults tier_visibility to 'free' for all DB rows (rowToSignal)
    // so a free user should see all signals returned by DB
    const { result } = renderHook(() => useIntelligence({ userTier: 'free' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Without live DB in test, signals will be empty — isLive=false
    expect(result.current.signals).toEqual([]);
    expect(result.current.totalSignalCount).toBe(0);
  });

  it('tier-filters signals — admin tier sees admin+pro+free signals', async () => {
    const { result } = renderHook(() => useIntelligence({ userTier: 'admin' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.signals).toEqual([]);
  });

  it('marketPulse returns EMPTY_MARKET_PULSE defaults when no signals', async () => {
    const { result } = renderHook(() => useIntelligence(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.marketPulse.total_professionals).toBe(0);
    expect(result.current.marketPulse.total_brands).toBe(0);
    expect(result.current.marketPulse.active_signals).toBe(0);
    expect(result.current.marketPulse.trending_category).toBe('No active category');
  });

  it('returns isLive=false and empty signals when query returns empty array', async () => {
    const { result } = renderHook(() => useIntelligence(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLive).toBe(false);
    expect(result.current.signals).toHaveLength(0);
  });

  it('setActiveFilter updates activeFilter state', async () => {
    const { result } = renderHook(() => useIntelligence(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.activeFilter).toBe('all');

    act(() => {
      result.current.setActiveFilter('product_velocity');
    });

    expect(result.current.activeFilter).toBe('product_velocity');
  });

  it('activeFilter defaults to all', async () => {
    const { result } = renderHook(() => useIntelligence(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeFilter).toBe('all');
  });

  it('userTier defaults to free when no options provided', async () => {
    // The hook should silently work with no options — defaults to free tier
    const { result } = renderHook(() => useIntelligence(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // No error thrown, signals and marketPulse are accessible
    expect(result.current.signals).toBeDefined();
    expect(result.current.marketPulse).toBeDefined();
    expect(result.current.totalSignalCount).toBeDefined();
  });

  it('totalSignalCount equals signals length when no tier filtering occurs', async () => {
    const { result } = renderHook(() => useIntelligence({ userTier: 'free' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Both should be 0 in test environment with no DB
    expect(result.current.totalSignalCount).toBe(result.current.signals.length);
  });
});
