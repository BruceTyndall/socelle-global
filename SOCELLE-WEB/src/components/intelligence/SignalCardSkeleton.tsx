/* ═══════════════════════════════════════════════════════════════
   SignalCardSkeleton — Loading placeholder for a single signal card
   Pearl Mineral V2 · matches SignalCard layout proportions
   Uses Tailwind animate-pulse (no external deps)
   ═══════════════════════════════════════════════════════════════ */

function Bar({ className }: { className: string }) {
  return <div className={`bg-graphite/6 rounded-sm animate-pulse ${className}`} />;
}

export default function SignalCardSkeleton() {
  return (
    <div
      className="bg-mn-card rounded-xl border border-graphite/8 p-5 sm:p-6"
      aria-busy="true"
      aria-label="Loading signal"
    >
      {/* Icon + type label + trend */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-graphite/6 animate-pulse" />
          <Bar className="h-[10px] w-20" />
        </div>
        <Bar className="h-4 w-12" />
      </div>

      {/* Title */}
      <Bar className="h-5 w-full mb-1.5" />
      <Bar className="h-5 w-3/4 mb-3" />

      {/* Description */}
      <div className="space-y-1.5 mb-4">
        <Bar className="h-3.5 w-full" />
        <Bar className="h-3.5 w-5/6" />
      </div>

      {/* Pills */}
      <div className="flex items-center gap-2 mb-3">
        <Bar className="h-5 w-16 rounded-full" />
        <Bar className="h-5 w-20 rounded-full" />
      </div>

      {/* Freshness */}
      <Bar className="h-3 w-24" />
    </div>
  );
}
