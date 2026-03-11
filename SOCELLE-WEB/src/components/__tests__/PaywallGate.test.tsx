import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React, { type ReactNode } from 'react';

// ── Hoist mocks ───────────────────────────────────────────────────────────────
const { mockUseAuth, mockUseSubscription, mockUseTier } = vi.hoisted(() => {
  const mockUseAuth = vi.fn(() => ({ user: null }));
  const mockUseSubscription = vi.fn(() => ({
    isPro: false,
    loading: false,
    startCheckout: vi.fn(),
  }));
  const mockUseTier = vi.fn(() => ({
    tier: 'free',
    meetsMinimumTier: vi.fn(() => false),
    isLoading: false,
    error: null,
  }));
  return { mockUseAuth, mockUseSubscription, mockUseTier };
});

vi.mock('../../lib/auth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../lib/useSubscription', () => ({ useSubscription: mockUseSubscription }));
vi.mock('../../hooks/useTier', () => ({ useTier: mockUseTier }));
// PAYMENT_BYPASS always false in these tests — testing gate logic
vi.mock('../../lib/paymentBypass', () => ({ PAYMENT_BYPASS: false }));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => Promise.resolve({ count: 0, error: null })),
        })),
      })),
    })),
  },
  isSupabaseConfigured: true,
}));
vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) =>
    <button onClick={onClick} disabled={disabled}>{children}</button>,
}));

import { PaywallGate } from '../PaywallGate';

function wrap(children: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('PaywallGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
    mockUseSubscription.mockReturnValue({
      isPro: false,
      loading: false,
      startCheckout: vi.fn(),
    });
    mockUseTier.mockReturnValue({
      tier: 'free',
      meetsMinimumTier: vi.fn(() => false),
      isLoading: false,
      error: null,
    });
  });

  it('renders children when isPro is true', () => {
    mockUseSubscription.mockReturnValue({ isPro: true, loading: false, startCheckout: vi.fn() });
    render(wrap(<PaywallGate feature="retail_attach">Pro Content</PaywallGate>));
    expect(screen.getByText('Pro Content')).toBeDefined();
  });

  it('calls onAllow when isPro is true', () => {
    mockUseSubscription.mockReturnValue({ isPro: true, loading: false, startCheckout: vi.fn() });
    const onAllow = vi.fn();
    render(wrap(<PaywallGate feature="gap_analysis" onAllow={onAllow}>Content</PaywallGate>));
    expect(onAllow).toHaveBeenCalled();
  });

  it('renders loading spinner when subscription is loading', () => {
    mockUseSubscription.mockReturnValue({ isPro: false, loading: true, startCheckout: vi.fn() });
    const { container } = render(
      wrap(<PaywallGate feature="gap_analysis">Content</PaywallGate>)
    );
    // Loading spinner should be rendered (no content visible, spinner present)
    expect(screen.queryByText('Content')).toBeNull();
    // Spinner element: div with animate-spin class
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('allows access for gap_analysis when user is anonymous (free, under limit)', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(wrap(<PaywallGate feature="gap_analysis">Free Content</PaywallGate>));
    await waitFor(() => {
      expect(screen.getByText('Free Content')).toBeDefined();
    });
  });

  it('blocks access for pro-only feature and calls onBlock', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const onBlock = vi.fn();
    render(
      wrap(<PaywallGate feature="retail_attach" onBlock={onBlock}>Gated</PaywallGate>)
    );
    await waitFor(() => {
      expect(onBlock).toHaveBeenCalledWith('pro_only');
    });
  });

  it('hides children for pro-only feature when not subscribed', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(
      wrap(<PaywallGate feature="retail_attach">Hidden Content</PaywallGate>)
    );
    await waitFor(() => {
      expect(screen.queryByText('Hidden Content')).toBeNull();
    });
  });

  it('shows custom fallback for pro-only feature', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(
      wrap(
        <PaywallGate
          feature="retail_attach"
          fallback={<div data-testid="custom-fallback">Custom Upgrade UI</div>}
        >
          Hidden
        </PaywallGate>
      )
    );
    await waitFor(() => {
      expect(screen.queryByText('Hidden')).toBeNull();
    });
  });

  it('renders children for gap_analysis when isPro is true (no limit check needed)', () => {
    mockUseSubscription.mockReturnValue({ isPro: true, loading: false, startCheckout: vi.fn() });
    render(wrap(<PaywallGate feature="gap_analysis">Pro Gap Content</PaywallGate>));
    expect(screen.getByText('Pro Gap Content')).toBeDefined();
  });

  it('upgrade card headline contains "Pro feature" for pro_only reason', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(wrap(<PaywallGate feature="activation_assets">Hidden</PaywallGate>));
    await waitFor(() => {
      expect(screen.getByText('Pro feature')).toBeDefined();
    });
  });
});
