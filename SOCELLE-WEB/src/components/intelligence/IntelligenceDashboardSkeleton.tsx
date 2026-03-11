/* ═══════════════════════════════════════════════════════════════
   IntelligenceDashboardSkeleton — Loading state for the business
   portal Intelligence Hub (IntelligenceHub.tsx)
   Pearl Mineral V2 · matches tab layout + KPI + signal table
   ═══════════════════════════════════════════════════════════════ */

function Bar({ className }: { className: string }) {
  return <div className={`bg-graphite/6 rounded-sm animate-pulse ${className}`} />;
}

function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-graphite/8 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-graphite/6 animate-pulse" />
        <Bar className="h-3 w-20" />
      </div>
      <Bar className="h-8 w-16" />
      <Bar className="h-3 w-full" />
    </div>
  );
}

function SignalRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-graphite/6">
      <Bar className="h-4 w-[40%]" />
      <Bar className="h-4 w-[20%]" />
      <Bar className="h-4 w-[15%]" />
      <Bar className="h-4 w-[10%]" />
    </div>
  );
}

export default function IntelligenceDashboardSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24"
      aria-busy="true"
      aria-label="Loading intelligence dashboard"
    >
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-graphite/8 animate-pulse" />
        <div className="space-y-2">
          <Bar className="h-6 w-40" />
          <Bar className="h-3.5 w-56" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-graphite/8 pb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Signal table */}
      <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-graphite/8 bg-graphite/[0.02]">
          <Bar className="h-3 w-[40%]" />
          <Bar className="h-3 w-[20%]" />
          <Bar className="h-3 w-[15%]" />
          <Bar className="h-3 w-[10%]" />
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <SignalRowSkeleton key={i} />
        ))}
      </div>

      {/* Two-column bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-graphite/8 p-5 space-y-4">
          <Bar className="h-5 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-6 h-6 rounded bg-graphite/6 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Bar className="h-3.5 w-full" />
                <Bar className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-graphite/8 p-5 space-y-4">
          <Bar className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-graphite/6">
              <Bar className="h-3.5 w-32" />
              <Bar className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
