import type { SparklinePoint } from '../../lib/analyticsService';

interface SparklineChartProps {
  data: SparklinePoint[];
  color?: string;
  height?: number;
  showArea?: boolean;
  label?: string;
}

const DEFAULT_SPARKLINE_COLOR = 'var(--color-accent)';
const SPARKLINE_LABEL_COLOR = 'var(--color-text-muted)';
const SPARKLINE_GRID_COLOR = 'var(--color-surface-alt)';

/**
 * Lightweight inline SVG sparkline — no Recharts dependency for the small
 * trend indicators. For full charts, use the Recharts LineChart below.
 */
export function Sparkline({ data, color = DEFAULT_SPARKLINE_COLOR, height = 32 }: SparklineChartProps) {
  if (!data || data.length < 2) {
    return <div className="skeleton" style={{ height }} />;
  }

  const width = 80;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Full line chart using a simple SVG approach (no Recharts import needed at this point).
 * For advanced charts, Recharts <LineChart> can be dropped in here later.
 */
export default function SparklineChart({ data, color = DEFAULT_SPARKLINE_COLOR, height = 180, label }: SparklineChartProps) {
  if (!data || data.length < 2) {
    return <div className="skeleton rounded-lg" style={{ height }} />;
  }

  const paddingLeft = 40;
  const paddingBottom = 24;
  const paddingTop = 12;
  const paddingRight = 8;
  const svgWidth = 600;
  const svgHeight = height;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i: number) => paddingLeft + (i / (data.length - 1)) * chartWidth;
  const toY = (v: number) => paddingTop + chartHeight - ((v - min) / range) * chartHeight;

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`).join(' ');
  const areaD = `${pathD} L ${toX(data.length - 1)} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`;

  // Y-axis labels
  const yLabels = [min, Math.round((min + max) / 2), max];

  // X-axis labels — show first, middle, last
  const xLabels = [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]];

  return (
    <div>
      {label && <p className="font-sans text-xs font-medium text-graphite/60 mb-2">{label}</p>}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ height }}
        aria-label={label}
      >
        {/* Area fill */}
        <path d={areaD} fill={color} fillOpacity="0.06" />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Last point dot */}
        <circle
          cx={toX(data.length - 1)}
          cy={toY(data[data.length - 1].value)}
          r="3"
          fill={color}
        />

        {/* Y-axis labels */}
        {yLabels.map((v, i) => (
          <text
            key={i}
            x={paddingLeft - 6}
            y={toY(v) + 4}
            textAnchor="end"
            fontSize="10"
            fill={SPARKLINE_LABEL_COLOR}
            fontFamily="General Sans, system-ui, sans-serif"
          >
            {v.toLocaleString()}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((d, i) => {
          const idx = i === 0 ? 0 : i === 1 ? Math.floor(data.length / 2) : data.length - 1;
          return (
            <text
              key={d.date}
              x={toX(idx)}
              y={svgHeight - 4}
              textAnchor="middle"
              fontSize="10"
              fill={SPARKLINE_LABEL_COLOR}
              fontFamily="General Sans, system-ui, sans-serif"
            >
              {d.date.slice(5)}
            </text>
          );
        })}

        {/* Grid lines */}
        {yLabels.map((v, i) => (
          <line
            key={i}
            x1={paddingLeft}
            y1={toY(v)}
            x2={svgWidth - paddingRight}
            y2={toY(v)}
            stroke={SPARKLINE_GRID_COLOR}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}
