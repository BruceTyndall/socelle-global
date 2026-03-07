interface EvidenceCell {
  id: string;
  value: string;
  label: string;
  isLive?: boolean;
  updatedAt?: Date;
}

interface EvidenceStripNewProps {
  cells: EvidenceCell[];
  dark?: boolean;
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function EvidenceStripNew({ cells, dark = false }: EvidenceStripNewProps) {
  const bgClass = dark ? 'bg-mn-dark' : 'bg-mn-bg';
  const borderClass = dark ? 'border-mn-bg/10' : 'border-graphite/10';
  const valueClass = dark ? 'text-mn-bg' : 'text-graphite';
  const labelClass = dark ? 'text-mn-bg/40' : 'text-graphite/40';

  return (
    <section className={`${bgClass} py-6 border-y ${borderClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {cells.map((cell) => (
            <div key={cell.id} className="text-center">
              <div className={`text-metric-md ${valueClass} font-mono mb-1`}>
                {cell.value}
              </div>
              <div className={`text-xs tracking-widest uppercase ${labelClass} mb-2`}>
                {cell.label}
              </div>
              {cell.isLive && (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-up animate-pulse" />
                  <span className="text-signal-up text-[10px] tracking-widest uppercase font-mono">
                    LIVE
                  </span>
                  {cell.updatedAt && (
                    <span className={`text-[10px] font-mono ${dark ? 'text-mn-bg/20' : 'text-graphite/20'}`}>
                      · {timeSince(cell.updatedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
