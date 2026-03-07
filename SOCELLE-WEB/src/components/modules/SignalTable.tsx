import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Signal {
  id: string;
  signal_type: string;
  title: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  category?: string;
  source?: string;
  updated_at: string;
}

interface SignalTableProps {
  signals: Signal[];
  title?: string;
  maxRows?: number;
  /** W15-08: Optional click handler for signal rows (analytics) */
  onClickRow?: (signal: Signal) => void;
}

const TYPE_STYLES: Record<string, string> = {
  ingredient_demand: 'bg-signal-up/10 text-signal-up',
  pricing_shift: 'bg-signal-warn/10 text-signal-warn',
  competitive_move: 'bg-accent/10 text-accent',
  clinical_citation: 'bg-signal-up/10 text-signal-up',
  regulatory_update: 'bg-signal-down/10 text-signal-down',
  consumer_sentiment: 'bg-accent/10 text-accent',
};

function formatType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SignalTable({ signals, title, maxRows = 10, onClickRow }: SignalTableProps) {
  const displayed = signals.slice(0, maxRows);

  return (
    <section className="bg-mn-bg py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-up animate-pulse" />
              <h3 className="text-eyebrow text-graphite/50">{title}</h3>
            </div>
            <span className="text-graphite/30 text-xs font-mono">{signals.length} signals</span>
          </div>
        )}

        <div className="bg-white rounded-card border border-graphite/5 overflow-hidden shadow-soft">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-graphite/5 text-label text-graphite/40">
            <div className="col-span-2">Type</div>
            <div className="col-span-5">Signal</div>
            <div className="col-span-2 text-right">Impact</div>
            <div className="col-span-1 text-center">Dir</div>
            <div className="col-span-2 text-right">Updated</div>
          </div>

          {/* Rows */}
          {displayed.map((signal) => (
            <div
              key={signal.id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-graphite/5 last:border-b-0 hover:bg-mn-surface/50 transition-colors group ${onClickRow ? 'cursor-pointer' : ''}`}
              onClick={onClickRow ? () => onClickRow(signal) : undefined}
              role={onClickRow ? 'button' : undefined}
              tabIndex={onClickRow ? 0 : undefined}
              onKeyDown={onClickRow ? (e) => { if (e.key === 'Enter') onClickRow(signal); } : undefined}
            >
              <div className="col-span-2">
                <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${TYPE_STYLES[signal.signal_type] || 'bg-accent/10 text-accent'}`}>
                  {formatType(signal.signal_type)}
                </span>
              </div>
              <div className="col-span-5 text-graphite text-sm font-medium truncate">
                {signal.title}
              </div>
              <div className="col-span-2 text-right">
                <span className={`font-mono text-sm ${
                  signal.magnitude >= 7 ? 'text-signal-up font-semibold' : signal.magnitude >= 4 ? 'text-signal-warn' : 'text-graphite/50'
                }`}>
                  {signal.magnitude.toFixed(1)}
                </span>
              </div>
              <div className="col-span-1 flex justify-center">
                {signal.direction === 'up' && <TrendingUp className="w-4 h-4 text-signal-up" />}
                {signal.direction === 'down' && <TrendingDown className="w-4 h-4 text-signal-down" />}
                {signal.direction === 'stable' && <Minus className="w-4 h-4 text-graphite/30" />}
              </div>
              <div className="col-span-2 text-right text-graphite/30 text-xs font-mono">
                {timeAgo(signal.updated_at)}
              </div>
            </div>
          ))}
        </div>

        {signals.length > maxRows && (
          <div className="text-center mt-6">
            <span className="text-accent text-sm cursor-pointer hover:text-accent-hover transition-colors">
              View all {signals.length} signals →
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
