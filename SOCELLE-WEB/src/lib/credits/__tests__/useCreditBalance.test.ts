import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mock supabase (vi.hoisted to avoid factory hoisting issue) ───────────
const { mockLimit, mockOrder, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockOrder = vi.fn(() => ({ limit: mockLimit }));
  const mockSelect = vi.fn(() => ({ order: mockOrder }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockLimit, mockOrder, mockSelect, mockFrom };
});

vi.mock('../../supabase', () => ({
  supabase: { from: mockFrom },
  isSupabaseConfigured: true,
}));

import { useCreditBalance } from '../useCreditBalance';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCreditBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  it('returns DEMO data when table missing (42P01)', async () => {
    mockLimit.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'relation "credit_ledger" does not exist' },
    });

    const { result } = renderHook(() => useCreditBalance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isLive).toBe(false);
    expect(result.current.balance.tier).toBe('pro');
    expect(result.current.balance.allocated).toBe(2500);
    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('returns balance structure with correct fields', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useCreditBalance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { balance } = result.current;
    expect(balance).toHaveProperty('remaining');
    expect(balance).toHaveProperty('used_this_month');
    expect(balance).toHaveProperty('allocated');
    expect(balance).toHaveProperty('tier');
    expect(typeof balance.remaining).toBe('number');
    expect(typeof balance.used_this_month).toBe('number');
    expect(typeof balance.allocated).toBe('number');
  });

  it('calculates live balance from ledger rows', async () => {
    const now = new Date();
    const rows = [
      { id: '1', action: 'Explain Signal', credits_deducted: 10, signal_id: null, created_at: now.toISOString() },
      { id: '2', action: 'Search', credits_deducted: 5, signal_id: null, created_at: now.toISOString() },
    ];
    mockLimit.mockResolvedValue({ data: rows, error: null });

    const { result } = renderHook(() => useCreditBalance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isLive).toBe(true);
    expect(result.current.balance.used_this_month).toBe(15);
    expect(result.current.balance.remaining).toBe(2500 - 15);
  });
});
