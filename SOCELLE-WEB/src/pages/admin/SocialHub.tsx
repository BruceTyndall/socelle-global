import { Share2, AlertCircle } from 'lucide-react';

// ── W12-11: Social Hub — Admin Control Center ─────────────────────────────
// Data source: none (Coming Soon)
// isLive = false — DEMO badge displayed

const isLive = false;

export default function SocialHub() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Social Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Social media monitoring and engagement tracking
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
        <Share2 className="w-12 h-12 text-accent-soft mx-auto mb-4" />
        <h3 className="text-lg font-sans text-graphite mb-2">Social Hub</h3>
        <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">
          Social media analytics, engagement metrics, and content scheduling will be available here.
          This hub requires social platform integrations to activate.
        </p>
        <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
          <AlertCircle className="w-3 h-3" />
          Coming Soon
        </span>
      </div>
    </div>
  );
}
