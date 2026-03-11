/* ═══════════════════════════════════════════════════════════════
   SignalErrorState — Error states for intelligence views
   Pearl Mineral V2 · Four variants:
     - 'load-failed' (default): generic data load failure + retry
     - 'ai-error': AI tool failure
     - 'rate-limited': rate limit hit with countdown
     - 'insufficient-credits': credits depleted, upgrade CTA
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Clock, Zap } from 'lucide-react';

type ErrorVariant = 'load-failed' | 'ai-error' | 'rate-limited' | 'insufficient-credits';

interface SignalErrorStateProps {
  variant?: ErrorVariant;
  /** Human-readable error message (optional override) */
  message?: string;
  /** Retry callback — shown for load-failed and ai-error */
  onRetry?: () => void;
  /** Seconds until rate limit expires (for rate-limited variant) */
  retryAfterSeconds?: number;
}

export default function SignalErrorState({
  variant = 'load-failed',
  message,
  onRetry,
  retryAfterSeconds = 60,
}: SignalErrorStateProps) {
  if (variant === 'rate-limited') {
    return (
      <RateLimitedState
        message={message}
        retryAfterSeconds={retryAfterSeconds}
        onRetry={onRetry}
      />
    );
  }

  if (variant === 'insufficient-credits') {
    return <InsufficientCreditsState message={message} />;
  }

  // load-failed | ai-error
  const heading = variant === 'ai-error'
    ? 'Intelligence engine error'
    : 'Unable to load signals';

  const defaultMessage = variant === 'ai-error'
    ? 'The intelligence engine encountered an error processing your request. Please try again.'
    : 'There was a problem fetching market signals. Please try again.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-signal-down/10 flex items-center justify-center mb-5">
        <AlertTriangle className="w-6 h-6 text-signal-down" />
      </div>

      <p className="text-sm font-semibold text-graphite/60 mb-1.5">
        {heading}
      </p>
      <p className="text-sm text-graphite/35 max-w-sm leading-relaxed mb-6">
        {message ?? defaultMessage}
      </p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        <Link
          to="/intelligence"
          className="px-4 py-2 text-sm font-medium text-graphite/50 hover:text-graphite transition-colors"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}

// ── Rate Limited sub-component with countdown ──────────────────────────

function RateLimitedState({
  message,
  retryAfterSeconds,
  onRetry,
}: {
  message?: string;
  retryAfterSeconds: number;
  onRetry?: () => void;
}) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, '0')}`
    : `${seconds}s`;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-signal-warn/10 flex items-center justify-center mb-5">
        <Clock className="w-6 h-6 text-signal-warn" />
      </div>

      <p className="text-sm font-semibold text-graphite/60 mb-1.5">
        Rate limit reached
      </p>
      <p className="text-sm text-graphite/35 max-w-sm leading-relaxed mb-4">
        {message ?? 'You have reached the request limit for this tool. Please wait before trying again.'}
      </p>

      {remaining > 0 ? (
        <p className="font-mono text-lg font-semibold text-signal-warn tabular-nums mb-6">
          {timeDisplay}
        </p>
      ) : (
        onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors mb-6"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry now
          </button>
        )
      )}
    </div>
  );
}

// ── Insufficient Credits sub-component ─────────────────────────────────

function InsufficientCreditsState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-signal-warn/10 flex items-center justify-center mb-5">
        <Zap className="w-6 h-6 text-signal-warn" />
      </div>

      <p className="text-sm font-semibold text-graphite/60 mb-1.5">
        Insufficient credits
      </p>
      <p className="text-sm text-graphite/35 max-w-sm leading-relaxed mb-6">
        {message ?? 'You do not have enough credits for this action. Upgrade your plan to continue using intelligence tools.'}
      </p>

      <Link
        to="/plans"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-graphite rounded-lg hover:bg-graphite/85 transition-colors"
      >
        <Zap className="w-4 h-4" />
        View plans
      </Link>
    </div>
  );
}
