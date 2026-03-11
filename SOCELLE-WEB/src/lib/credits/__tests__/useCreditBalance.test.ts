import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mock supabase ───────────
const { mockMaybeSingle, mockEq, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle, single: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockMaybeSingle, mockEq, mockSelect, mockFrom };
});

vi.mock('../../supabase', () => ({
  supabase: { from: mockFrom },
  isSupabaseConfigured: true,
}));

vi.mock('../../auth', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } })
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
  });

  it('returns DEMO data when table missing (42P01)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'relation "tenant_balances" does not exist' },
    });

    const { result } = renderHook(() => useCreditBalance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.balance.isLive).toBe(false);
    expect(result.current.balance.credit_balance_usd).toBe(87.34);
    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('returns balance structure with correct fields', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        credit_balance_usd: 100,
        lifetime_spent_usd: 10,
        lifetime_requests: 5
      },
      error: null
    });

    const { result } = renderHook(() => useCreditBalance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { balance } = result.current;
    expect(balance).toHaveProperty('credit_balance_usd');
    expect(balance).toHaveProperty('lifetime_spent_usd');
    expect(balance).toHaveProperty('lifetime_requests');
    expect(balance).toHaveProperty('display');
    expect(typeof balance.credit_balance_usd).toBe('number');
  });
});
