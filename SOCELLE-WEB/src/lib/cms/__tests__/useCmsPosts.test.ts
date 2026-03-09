import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ── Mock supabase (vi.hoisted to avoid factory hoisting issue) ───────────
// useCmsPosts chains: .from().select() then optionally .eq() then .order()
// then optionally .limit(). We make each method return an object with all
// possible next methods so any chain works.
const { mockChain, mockFrom } = vi.hoisted(() => {
  const mockChain: Record<string, ReturnType<typeof vi.fn>> = {};

  // Create a chainable object where every method returns the same object
  const chainObj = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (prop === 'then') return undefined; // don't make it thenable
      if (!mockChain[prop]) {
        mockChain[prop] = vi.fn(() => chainObj);
      }
      return mockChain[prop];
    },
  });

  const mockFrom = vi.fn(() => chainObj);
  return { mockChain, mockFrom };
});

vi.mock('../../supabase', () => ({
  supabase: { from: mockFrom },
  isSupabaseConfigured: true,
}));

import { useCmsPosts } from '../useCmsPosts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

/** Set the final resolved value for the chain (order is the terminal call when no limit). */
function setChainResult(result: { data: unknown; error: unknown }) {
  // order() is always called; it may or may not be followed by limit()
  // We make order resolve (act as terminal) via a thenable-like approach
  // Actually the simplest fix: make order return an object that is both
  // thenable AND has .limit(). We'll just make the proxy resolve.

  // Reset the proxy to resolve the query result
  const resolvedObj = {
    ...result,
    // Also allow .limit() to be called on the result of order()
    limit: vi.fn(() => Promise.resolve(result)),
    eq: vi.fn(() => resolvedObj),
    order: vi.fn(() => resolvedObj),
    select: vi.fn(() => resolvedObj),
    then: (resolve: (v: unknown) => void) => resolve(result),
  };

  mockChain['order'] = vi.fn(() => resolvedObj);
  mockChain['select'] = vi.fn(() => resolvedObj);
}

describe('useCmsPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setChainResult({ data: [], error: null });
  });

  it('returns posts array when data available', async () => {
    const samplePost = {
      id: 'post-1',
      slug: 'test-post',
      title: 'Test Post',
      status: 'published',
      space: { slug: 'blog', name: 'Blog' },
    };
    setChainResult({ data: [samplePost], error: null });

    const { result } = renderHook(() => useCmsPosts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.posts).toEqual([samplePost]);
    expect(result.current.isLive).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles errors and surfaces error message', async () => {
    setChainResult({
      data: null,
      error: { code: 'PGRST000', message: 'Some unexpected error' },
    });

    const { result } = renderHook(() => useCmsPosts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Some unexpected error');
    });
  });

  it('handles 42P01 (table not found) gracefully', async () => {
    setChainResult({
      data: null,
      error: { code: '42P01', message: 'relation "cms_posts" does not exist' },
    });

    const { result } = renderHook(() => useCmsPosts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
