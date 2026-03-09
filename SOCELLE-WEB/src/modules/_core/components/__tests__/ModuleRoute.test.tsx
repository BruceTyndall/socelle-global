import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ModuleAccessResult } from '../../hooks/useModuleAccess';
import ModuleRoute from '../ModuleRoute';

const { mockUseModuleAccess } = vi.hoisted(() => ({
  mockUseModuleAccess: vi.fn<(moduleKey: string) => ModuleAccessResult>(),
}));

vi.mock('../../hooks/useModuleAccess', () => ({
  useModuleAccess: (moduleKey: string) => mockUseModuleAccess(moduleKey),
}));

vi.mock('../UpgradePrompt', () => ({
  default: ({ moduleKey }: { moduleKey: string }) => (
    <div data-testid="upgrade-prompt">Upgrade required: {moduleKey}</div>
  ),
}));

describe('ModuleRoute entitlement gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while access check is in progress', () => {
    mockUseModuleAccess.mockReturnValue({
      hasAccess: false,
      isLoading: true,
      accessType: null,
      expiresAt: null,
    });

    const { container } = render(
      <ModuleRoute moduleKey="MODULE_CRM">
        <div>Allowed Content</div>
      </ModuleRoute>,
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders children when access is granted', () => {
    mockUseModuleAccess.mockReturnValue({
      hasAccess: true,
      isLoading: false,
      accessType: 'plan',
      expiresAt: null,
    });

    render(
      <ModuleRoute moduleKey="MODULE_CRM">
        <div>Allowed Content</div>
      </ModuleRoute>,
    );

    expect(screen.getByText('Allowed Content')).toBeTruthy();
  });

  it('renders UpgradePrompt when access is denied', () => {
    mockUseModuleAccess.mockReturnValue({
      hasAccess: false,
      isLoading: false,
      accessType: null,
      expiresAt: null,
    });

    render(
      <ModuleRoute moduleKey="MODULE_CRM">
        <div>Allowed Content</div>
      </ModuleRoute>,
    );

    expect(screen.getByTestId('upgrade-prompt')).toHaveTextContent('MODULE_CRM');
  });
});
