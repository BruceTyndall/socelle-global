// ── StickyConversionBarModule — V2-INTEL-01 ──────────────────────────
// Wrapper: renders sticky conversion bar with email capture.
// No data hook — UI behavior component with EmailCaptureModule.

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EmailCaptureModule } from './EmailCaptureModule';
import { useModuleAdapters } from './useModuleAdapters';

export function StickyConversionBarModule() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { socialProofCount, isLive } = useModuleAdapters();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <div
        className="border-t border-[#F7F5F2]/10"
        style={{
          background: 'rgba(20, 20, 24, 0.85)',
          backdropFilter: 'blur(40px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="hidden md:block shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A72] animate-pulse" />
              <span className="text-[#F7F5F2]/70 text-sm">
                <span className="text-[#F7F5F2]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {isLive ? socialProofCount : '—'}
                </span>{' '}
                operators this week
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <EmailCaptureModule
              dark
              compact
              placeholder="Professional email"
              buttonLabel="Join"
              showTrust={false}
              showSocialProof={false}
              source="sticky_bar"
            />
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1.5 text-[#F7F5F2]/30 hover:text-[#F7F5F2]/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
