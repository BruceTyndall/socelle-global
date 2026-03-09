import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws on render (for testing)
function ThrowOnRender({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error message');
  return createElement('div', null, 'Normal render');
}

// Suppress React error boundary console output in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      createElement(
        ErrorBoundary,
        null,
        createElement('div', null, 'Child content')
      )
    );
    expect(screen.getByText('Child content')).toBeDefined();
  });

  it('renders error UI when child throws', () => {
    render(
      createElement(
        ErrorBoundary,
        null,
        createElement(ThrowOnRender, { shouldThrow: true })
      )
    );
    expect(screen.getByText('Application Error')).toBeDefined();
  });

  it('displays the error message in the error UI', () => {
    render(
      createElement(
        ErrorBoundary,
        null,
        createElement(ThrowOnRender, { shouldThrow: true })
      )
    );
    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('shows Reload Application button in error state', () => {
    render(
      createElement(
        ErrorBoundary,
        null,
        createElement(ThrowOnRender, { shouldThrow: true })
      )
    );
    const button = screen.getByRole('button', { name: /reload application/i });
    expect(button).toBeDefined();
  });

  it('reload button calls window.location.reload', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
      configurable: true,
    });

    render(
      createElement(
        ErrorBoundary,
        null,
        createElement(ThrowOnRender, { shouldThrow: true })
      )
    );

    const button = screen.getByRole('button', { name: /reload application/i });
    fireEvent.click(button);
    expect(reloadSpy).toHaveBeenCalledOnce();
  });

  it('shows descriptive error paragraph', () => {
    render(
      createElement(
        ErrorBoundary,
        null,
        createElement(ThrowOnRender, { shouldThrow: true })
      )
    );
    expect(
      screen.getByText(/The application encountered an error/i)
    ).toBeDefined();
  });

  it('does not render error UI when children are healthy', () => {
    render(
      createElement(
        ErrorBoundary,
        null,
        createElement('span', null, 'Healthy child')
      )
    );
    expect(screen.queryByText('Application Error')).toBeNull();
    expect(screen.getByText('Healthy child')).toBeDefined();
  });

  it('getDerivedStateFromError sets hasError=true', () => {
    const state = ErrorBoundary.getDerivedStateFromError(new Error('boundary error'));
    expect(state.hasError).toBe(true);
    expect((state as any).error?.message).toBe('boundary error');
  });
});
