// ── PWAInstallPrompt — Build 5 PWA Enhancement ─────────────────────────────
// Shows an install prompt when the browser fires beforeinstallprompt.
// Respects user dismissal (localStorage) — won't re-appear for 14 days.
// Subscribes to push notifications after install if permission is granted.

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Bell } from 'lucide-react';

const DISMISSED_KEY = 'socelle_pwa_prompt_dismissed_until';
const SNOOZE_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [pushRequested, setPushRequested] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed recently
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    // Don't show if already installed (display-mode: standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShow(false);
        // Offer push notifications after successful install
        if ('Notification' in window && Notification.permission === 'default') {
          setPushRequested(true);
        }
      }
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    const snoozeUntil = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, String(snoozeUntil));
    setShow(false);
    setDeferredPrompt(null);
  }, []);

  const handleEnablePush = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        // The app server must supply the VAPID public key via env.
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (vapidKey) {
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
        }
      }
    } catch {
      // Push subscription failed — non-critical, silently ignore
    } finally {
      setPushRequested(false);
    }
  }, []);

  // Push permission prompt (shown after install accepted)
  if (pushRequested) {
    return (
      <div
        role="dialog"
        aria-label="Enable push notifications"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white border border-[#E8EDF1] rounded-xl shadow-lg p-4"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E8EDF1]">
            <Bell className="h-4 w-4 text-[#6E879B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#141418]">Stay informed</p>
            <p className="mt-0.5 text-xs text-[#141418]/60">
              Get notified when new market signals drop or appointments need attention.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleEnablePush}
            className="flex-1 rounded-lg bg-[#6E879B] py-1.5 text-xs font-semibold text-white hover:bg-[#5A7185] transition-colors"
          >
            Enable
          </button>
          <button
            onClick={() => setPushRequested(false)}
            className="flex-1 rounded-lg border border-[#E8EDF1] py-1.5 text-xs font-semibold text-[#141418]/60 hover:bg-[#F6F3EF] transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Install SOCELLE app"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white border border-[#E8EDF1] rounded-xl shadow-lg p-4"
    >
      <div className="flex items-start gap-3">
        <img
          src="/socelle-icon-192.png"
          alt="SOCELLE"
          className="h-10 w-10 rounded-xl flex-shrink-0 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#141418]">Install SOCELLE</p>
          <p className="mt-0.5 text-xs text-[#141418]/60">
            Add to your home screen for fast access to market intelligence and your portal.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="flex-shrink-0 rounded-md p-1 text-[#141418]/40 hover:bg-[#F6F3EF] hover:text-[#141418]/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstall}
          disabled={installing}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#6E879B] py-1.5 text-xs font-semibold text-white hover:bg-[#5A7185] disabled:opacity-60 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {installing ? 'Installing…' : 'Install'}
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-lg border border-[#E8EDF1] py-1.5 text-xs font-semibold text-[#141418]/60 hover:bg-[#F6F3EF] transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

/**
 * Converts a VAPID base64 URL-safe key to a Uint8Array for the push API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
