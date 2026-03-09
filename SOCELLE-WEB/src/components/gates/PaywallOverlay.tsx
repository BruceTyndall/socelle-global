/**
 * PaywallOverlay — Blur overlay for gated content (V2-PLAT-05)
 *
 * Renders children with CSS blur + pointer-events-none,
 * then overlays the UpgradePrompt centered on top.
 * Smooth animation on mount via CSS transitions.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { UpgradePrompt } from './UpgradePrompt';
import type { Tier } from '../../hooks/useTier';

interface PaywallOverlayProps {
  children: ReactNode;
  currentTier: Tier;
  requiredTier: Tier;
  /** Optional contextual message for the upgrade prompt. */
  contextMessage?: string;
}

export function PaywallOverlay({
  children,
  currentTier,
  requiredTier,
  contextMessage,
}: PaywallOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger mount animation on next frame
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div
        className="pointer-events-none select-none transition-all duration-500"
        style={{
          filter: mounted ? 'blur(8px)' : 'blur(0px)',
          opacity: mounted ? 0.35 : 1,
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay with upgrade prompt */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-500"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        <UpgradePrompt
          currentTier={currentTier}
          requiredTier={requiredTier}
          contextMessage={contextMessage}
        />
      </div>
    </div>
  );
}
