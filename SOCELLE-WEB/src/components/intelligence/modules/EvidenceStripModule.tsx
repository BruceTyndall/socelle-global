// ── EvidenceStripModule — V2-INTEL-01 ────────────────────────────────
// Wrapper: renders evidence strip with combined feed + platform stats.
// Data source: useModuleAdapters().evidenceCells

import { useModuleAdapters } from './useModuleAdapters';
import { ModuleLoading, ModuleEmpty } from './ModuleStates';
import { formatTimeAgo, getFreshnessColor } from './freshness';

interface EvidenceStripModuleProps {
  dark?: boolean;
}

export function EvidenceStripModule({ dark = false }: EvidenceStripModuleProps) {
  const { evidenceCells, loading } = useModuleAdapters();

  if (loading) return <ModuleLoading label="Loading evidence..." dark={dark} />;
  if (evidenceCells.length === 0) return <ModuleEmpty label="No evidence data." dark={dark} />;

  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const borderClass = dark ? 'border-[#F7F5F2]/10' : 'border-[#141418]/10';
  const valueClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const labelClass = dark ? 'text-[#F7F5F2]/50' : 'text-[#141418]/50';

  return (
    <section className={`${bgClass} py-14 lg:py-18`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-6 lg:gap-0 lg:divide-x lg:divide-inherit">
          {evidenceCells.map((cell) => (
            <div key={cell.id} className={`flex-1 min-w-[140px] text-center px-6 lg:px-10 ${borderClass}`}>
              <div className={`text-3xl lg:text-4xl ${valueClass} mb-1`} style={{ fontFamily: 'var(--font-mono)' }}>
                {cell.value}
              </div>
              <div className={`text-xs tracking-widest uppercase ${labelClass} mb-2`}>
                {cell.label}
              </div>
              {cell.isLive && (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A72] animate-pulse" />
                  <span
                    className="text-[#5F8A72] text-[10px] tracking-widest uppercase"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    LIVE
                  </span>
                </div>
              )}
              {cell.updatedAt && (
                <div
                  className={`text-[10px] mt-1 ${getFreshnessColor(cell.updatedAt)}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatTimeAgo(cell.updatedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
