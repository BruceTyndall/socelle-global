import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  iconColor = 'text-pro-navy',
  iconBg = 'bg-pro-cream',
  prefix,
  suffix,
  className = '',
}: StatCardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div className={`bg-white rounded-xl border border-brand-border p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-label uppercase tracking-widest text-pro-warm-gray font-sans">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-sans font-bold text-metric-md text-pro-charcoal leading-none tracking-tight">
          {prefix}<span>{value}</span>{suffix}
        </p>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium font-sans mb-0.5 ${
            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-pro-warm-gray'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> :
             isNegative ? <TrendingDown className="w-3.5 h-3.5" /> :
             <Minus className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{delta}%</span>
            {deltaLabel && <span className="text-pro-warm-gray font-normal">{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
