/* ═══════════════════════════════════════════════════════════════
   SignalDetailSkeleton — Loading state for signal detail view
   Pearl Mineral V2 · matches IntelligenceSignalDetail layout
   ═══════════════════════════════════════════════════════════════ */

function Bar({ className }: { className: string }) {
  return <div className={`bg-graphite/6 rounded-sm animate-pulse ${className}`} />;
}

export default function SignalDetailSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto py-10 space-y-8"
      aria-busy="true"
      aria-label="Loading signal detail"
    >
      {/* Back nav placeholder */}
      <Bar className="h-3.5 w-28" />

      {/* Hero image */}
      <div className="w-full aspect-[16/7] bg-graphite/5 rounded-xl animate-pulse" />

      {/* Type label + direction */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-graphite/6 animate-pulse" />
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-16" />
        </div>
        <Bar className="h-5 w-14" />
      </div>

      {/* Title + description (border-left accent) */}
      <div className="border-l-[3px] border-graphite/10 pl-5 space-y-3">
        <Bar className="h-8 w-full" />
        <Bar className="h-8 w-3/4" />
        <div className="pt-2 space-y-2">
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-2/3" />
        </div>
      </div>

      {/* Metadata strip */}
      <div className="flex items-center gap-4">
        <Bar className="h-3 w-16" />
        <Bar className="h-3 w-24" />
        <Bar className="h-3 w-20" />
      </div>

      {/* Confidence + impact row */}
      <div className="flex items-center gap-6 p-4 bg-graphite/[0.03] rounded-lg border border-graphite/6">
        <div className="space-y-2">
          <Bar className="h-2.5 w-16" />
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-graphite/8 rounded-full animate-pulse" />
            <Bar className="h-3.5 w-8" />
          </div>
        </div>
        <div className="space-y-2">
          <Bar className="h-2.5 w-20" />
          <Bar className="h-3.5 w-10" />
        </div>
      </div>

      {/* Related brands */}
      <div className="space-y-2">
        <Bar className="h-2.5 w-24" />
        <div className="flex gap-2">
          <Bar className="h-6 w-16 rounded-full" />
          <Bar className="h-6 w-20 rounded-full" />
          <Bar className="h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* Source */}
      <div className="border-t border-graphite/6 pt-5 space-y-2">
        <Bar className="h-2.5 w-12" />
        <Bar className="h-3.5 w-40" />
      </div>
    </div>
  );
}
