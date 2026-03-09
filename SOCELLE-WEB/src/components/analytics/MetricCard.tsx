import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiTrend } from '../../lib/analyticsService';

interface MetricCardProps {
  label: string;
  kpi: KpiTrend;
  format?: 'number' | 'currency' | 'percent';
  icon?: React.ReactNode;
}

function formatValue(value: number, format: MetricCardProps['format']): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

export default function MetricCard({ label, kpi, format = 'number', icon }: MetricCardProps) {
  const TrendIcon = kpi.direction === 'up' ? TrendingUp : kpi.direction === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.direction === 'up' ? 'text-graphite' : kpi.direction === 'down' ? 'text-red-500' : 'text-graphite/60';
  const trendBg = kpi.direction === 'up' ? 'bg-accent-soft' : kpi.direction === 'down' ? 'bg-red-50' : 'bg-accent-soft';

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="font-sans text-xs font-medium text-graphite/60 uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <span className="text-graphite/60">{icon}</span>
        )}
      </div>

      <p className="font-sans text-2xl text-graphite mb-2">
        {formatValue(kpi.value, format)}
      </p>

      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans ${trendBg} ${trendColor}`}>
        <TrendIcon className="w-3 h-3" />
        {kpi.direction === 'flat' ? 'No change' : `${kpi.direction === 'up' ? '+' : ''}${kpi.changePercent}% vs last period`}
      </div>
    </div>
  );
}
