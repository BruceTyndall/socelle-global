import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mock supabase ────────────────────────────────────────────────────────
// useCmsPages chains: .from().select() then optionally .eq() then .order()
// We build a chainable mock that resolves when awaited.
const { mockFrom, setChainResult, mockCalls } = vi.hoisted(() => {
  let chainResult: { data: unknown[] | null; error: unknown } = { data: [], error: null };
  const mockCalls = { eq: [] as unknown[][] };

  function makeChainable(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      eq: vi.fn((...args: unknown[]) => {
        mockCalls.eq.push(args);
        return obj;
      }),
      order: vi.fn(() => obj),
      select: vi.fn(() => obj),
      then: (resolve: (v: unknown) => void) => resolve(chainResult),
    };
    return obj;
  }

  const mockFrom = vi.fn(() => makeChainable());

  function setChainResult(result: { data: unknown[] | null; error: unknown }) {
    chainResult = result;
  }

  return { mockFrom, setChainResult, mockCalls };
});

vi.mock('../../supabase', () => ({
  supabase: { from: mockFrom },
  isSupabaseConfigured: true,
}));

import { useCmsPages } from '../useCmsPages';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCmsPages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalls.eq = [];
    setChainResult({ data: [], error: null });
  });

  it('returns empty array when no data', async () => {
    setChainResult({ data: [], error: null });
    const { result } = renderHook(() => useCmsPages(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pages).toEqual([]);
    expect(result.current.isLive).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles 42P01 error gracefully (table not found)', async () => {
    setChainResult({
      data: null,
      error: { code: '42P01', message: 'relation "cms_pages" does not exist' },
    });

    const { result } = renderHook(() => useCmsPages(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('query key includes space filter when spaceId provided', async () => {
    setChainResult({ data: [], error: null });
    const { result } = renderHook(
      () => useCmsPages({ spaceId: 'space-123' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFrom).toHaveBeenCalledWith('cms_pages');
    // Verify eq was called with space_id filter
    const spaceEqCall = mockCalls.eq.find(args => args[0] === 'space_id');
    expect(spaceEqCall).toBeTruthy();
    expect(spaceEqCall![1]).toBe('space-123');
  });
});
