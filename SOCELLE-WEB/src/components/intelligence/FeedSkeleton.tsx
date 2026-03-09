/* ═══════════════════════════════════════════════════════════════
   FeedSkeleton — Loading state for IntelligenceFeedSection
   Pearl Mineral V2 · matches real card proportions
   Uses Tailwind animate-pulse (no external deps)
   ═══════════════════════════════════════════════════════════════ */

// ─── Shared skeleton primitives ──────────────────────────────────────────────
function SkeletonLine({ widthClass }: { widthClass: string }) {
  return <div className={`h-[14px] bg-graphite/6 rounded-sm animate-pulse ${widthClass}`} />;
}

function SkeletonBlock({ heightClass }: { heightClass: string }) {
  return <div className={`${heightClass} bg-graphite/5 rounded-sm animate-pulse`} />;
}

// ─── Featured card skeleton ───────────────────────────────────────────────────
function FeaturedSkeleton() {
  return (
    <div className="bg-mn-card border border-graphite/8 border-l-[3px] border-l-graphite/12 rounded-card px-8 py-8 lg:px-10 lg:py-9">
      {/* Eyebrow row */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonLine widthClass="w-32" />
        <SkeletonLine widthClass="w-14" />
      </div>
      {/* Headline — 2 lines */}
      <div className="space-y-3 mb-5 pr-8">
        <SkeletonBlock heightClass="h-8" />
        <SkeletonLine widthClass="w-3/4" />
      </div>
      {/* Divider */}
      <div className="border-t border-graphite/7 mb-5" />
      {/* Description — 3 lines */}
      <div className="space-y-2.5 mb-7">
        <SkeletonLine widthClass="w-full" />
        <SkeletonLine widthClass="w-full" />
        <SkeletonLine widthClass="w-2/3" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeletonLine widthClass="w-20" />
          <SkeletonLine widthClass="w-24" />
        </div>
        <SkeletonLine widthClass="w-12" />
      </div>
    </div>
  );
}

// ─── Standard card skeleton ───────────────────────────────────────────────────
function StandardSkeleton() {
  return (
    <div className="bg-mn-card border border-graphite/8 rounded-card overflow-hidden flex flex-col h-full">
      {/* Top accent strip */}
      <div className="h-[3px] w-full bg-graphite/8 animate-pulse" />
      <div className="px-6 pt-5 pb-6 flex flex-col flex-1">
        {/* Eyebrow + magnitude */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <SkeletonLine widthClass="w-24" />
          <SkeletonLine widthClass="w-10" />
        </div>
        {/* Headline — 3 lines */}
        <div className="space-y-2 mb-3 flex-1">
          <SkeletonLine widthClass="w-full" />
          <SkeletonLine widthClass="w-full" />
          <SkeletonLine widthClass="w-3/4" />
        </div>
        {/* Description */}
        <div className="space-y-2 mb-4">
          <SkeletonLine widthClass="w-full" />
          <SkeletonLine widthClass="w-5/6" />
          <SkeletonLine widthClass="w-2/3" />
        </div>
        {/* Footer */}
        <div className="border-t border-graphite/6 pt-3 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonLine widthClass="w-10" />
              <SkeletonLine widthClass="w-8" />
              <SkeletonLine widthClass="w-16" />
            </div>
            <SkeletonLine widthClass="w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar skeleton ─────────────────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div className="space-y-8">
      {/* Signal index */}
      <div className="bg-mn-card border border-graphite/8 rounded-card px-5 py-5">
        <div className="flex items-center justify-between mb-1">
          <SkeletonLine widthClass="w-24" />
          <SkeletonLine widthClass="w-10" />
        </div>
        <div className="h-12 bg-graphite/5 rounded animate-pulse my-3" />
        <SkeletonLine widthClass="w-20" />
        <div className="border-t border-graphite/7 my-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <SkeletonBlock heightClass="h-5" />
            <SkeletonLine widthClass="w-16" />
          </div>
          <div className="space-y-1.5">
            <SkeletonBlock heightClass="h-5" />
            <SkeletonLine widthClass="w-16" />
          </div>
        </div>
      </div>
      {/* Trending */}
      <div className="bg-mn-card border border-graphite/8 rounded-card px-5 py-5">
        <SkeletonLine widthClass="w-24 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <SkeletonLine widthClass="w-4 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <SkeletonLine widthClass="w-full" />
                <SkeletonLine widthClass="w-3/4" />
              </div>
              <SkeletonLine widthClass="w-8 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Default export: full feed skeleton ──────────────────────────────────────
export default function FeedSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-6">
        <FeaturedSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <StandardSkeleton key={i} />
          ))}
        </div>
      </div>
      {/* Sidebar */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0">
        <SidebarSkeleton />
      </div>
    </div>
  );
}
