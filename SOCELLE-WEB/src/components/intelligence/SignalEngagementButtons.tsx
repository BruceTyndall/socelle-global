import { Bookmark, Heart } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import type { IntelligenceSignal } from '../../lib/intelligence/types';
import { useSignalEngagement } from '../../lib/intelligence/useSignalEngagement';

interface SignalEngagementButtonsProps {
  signal: IntelligenceSignal;
  surface: string;
  compact?: boolean;
}

function buttonClasses(isActive: boolean, compact: boolean): string {
  const base = compact
    ? 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors'
    : 'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors';

  return `${base} ${
    isActive
      ? 'border-accent/30 bg-accent/10 text-graphite'
      : 'border-graphite/12 bg-white text-graphite/62 hover:border-graphite/20 hover:bg-graphite/[0.03]'
  }`;
}

export function SignalEngagementButtons({
  signal,
  surface,
  compact = false,
}: SignalEngagementButtonsProps) {
  const { user } = useAuth();
  const {
    isSaved,
    isLiked,
    isPending,
    toggleSaved,
    toggleLiked,
  } = useSignalEngagement(signal, { surface });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={isSaved}
        disabled={isPending}
        onClick={() => { void toggleSaved(); }}
        className={buttonClasses(isSaved, compact)}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        {isSaved ? 'Saved' : 'Save'}
      </button>

      <button
        type="button"
        aria-pressed={isLiked}
        disabled={isPending}
        onClick={() => { void toggleLiked(); }}
        className={buttonClasses(isLiked, compact)}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        {isLiked ? 'Liked' : 'Like'}
      </button>

      {!user && (
        <span className="text-[11px] text-graphite/42">
          Saved locally until you sign in.
        </span>
      )}
    </div>
  );
}
