import { UserPlus, AlertCircle } from 'lucide-react';

// ── W12-11: Recruitment Hub — Admin Control Center ────────────────────────
// Data source: none (Coming Soon)
// isLive = false — DEMO badge displayed

const isLive = false;

export default function RecruitmentHub() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-pro-navy">
              Recruitment Hub<span className="text-pro-gold">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-pro-warm-gray font-sans mt-1">
            Talent pipeline and recruitment tracking
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
        <UserPlus className="w-12 h-12 text-pro-stone mx-auto mb-4" />
        <h3 className="text-lg font-serif text-pro-navy mb-2">Recruitment Hub</h3>
        <p className="text-pro-warm-gray font-sans text-sm max-w-md mx-auto">
          Candidate tracking, application management, and hiring pipeline tools will be available here.
          This hub requires the recruitment module to be activated.
        </p>
        <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
          <AlertCircle className="w-3 h-3" />
          Coming Soon
        </span>
      </div>
    </div>
  );
}
