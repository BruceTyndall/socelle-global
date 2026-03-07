import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EmailCapture } from './EmailCapture';

export function StickyConversionBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div
        className="bg-mn-dark/90 backdrop-blur-xl border-t border-mn-bg/10"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <div className="hidden sm:block text-mn-bg text-sm font-medium whitespace-nowrap">
            Get intelligence access
          </div>
          <div className="flex-1">
            <EmailCapture
              dark
              compact
              buttonLabel="Join"
              source="sticky_bar"
            />
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-mn-bg/40 hover:text-mn-bg/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
