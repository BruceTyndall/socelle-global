import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

// ── Mock useTier ─────────────────────────────────────────────────────────
const mockUseTier = vi.fn();
vi.mock('../../../hooks/useTier', () => ({
  useTier: () => mockUseTier(),
}));

// ── Mock PaywallOverlay ──────────────────────────────────────────────────
vi.mock('../PaywallOverlay', () => ({
  PaywallOverlay: ({ currentTier, requiredTier }: { currentTier: string; requiredTier: string }) =>
    createElement('div', { 'data-testid': 'paywall-overlay' },
      `Upgrade from ${currentTier} to ${requiredTier}`),
}));

import { TierGate } from '../TierGate';

describe('TierGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when tier meets requirement', () => {
    mockUseTier.mockReturnValue({
      tier: 'pro',
      tierRank: 2,
      isLoading: false,
      isDemo: false,
      meetsMinimumTier: (required: string) => {
        const ranks: Record<string, number> = { free: 0, starter: 1, pro: 2, enterprise: 3 };
        return 2 >= (ranks[required] ?? 0);
      },
    });

    render(
      createElement(TierGate, { requiredTier: 'starter' },
        createElement('div', { 'data-testid': 'gated-content' }, 'Premium Content')),
    );

    expect(screen.getByTestId('gated-content')).toBeInTheDocument();
    expect(screen.queryByTestId('paywall-overlay')).not.toBeInTheDocument();
  });

  it('shows upgrade prompt when tier insufficient', () => {
    mockUseTier.mockReturnValue({
      tier: 'free',
      tierRank: 0,
      isLoading: false,
      isDemo: false,
      meetsMinimumTier: (required: string) => {
        const ranks: Record<string, number> = { free: 0, starter: 1, pro: 2, enterprise: 3 };
        return 0 >= (ranks[required] ?? 0);
      },
    });

    render(
      createElement(TierGate, { requiredTier: 'pro' },
        createElement('div', { 'data-testid': 'gated-content' }, 'Premium Content')),
    );

    expect(screen.getByTestId('paywall-overlay')).toBeInTheDocument();
    expect(screen.getByText('Upgrade from free to pro')).toBeInTheDocument();
  });

  it('shows loading skeleton while tier loading', () => {
    mockUseTier.mockReturnValue({
      tier: 'free',
      tierRank: 0,
      isLoading: true,
      isDemo: false,
      meetsMinimumTier: () => false,
    });

    const { container } = render(
      createElement(TierGate, { requiredTier: 'pro' },
        createElement('div', { 'data-testid': 'gated-content' }, 'Premium Content')),
    );

    // Should show skeleton (animate-pulse class)
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();

    // Should NOT render children or paywall
    expect(screen.queryByTestId('gated-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('paywall-overlay')).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided and tier insufficient', () => {
    mockUseTier.mockReturnValue({
      tier: 'free',
      tierRank: 0,
      isLoading: false,
      isDemo: false,
      meetsMinimumTier: () => false,
    });

    render(
      createElement(TierGate, {
        requiredTier: 'pro',
        fallback: createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom Fallback'),
      },
        createElement('div', { 'data-testid': 'gated-content' }, 'Premium Content')),
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('paywall-overlay')).not.toBeInTheDocument();
  });
});
