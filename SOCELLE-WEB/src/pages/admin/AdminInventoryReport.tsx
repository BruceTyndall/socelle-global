import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Download,
  FileText,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { exportToCsv } from '../../lib/csvExport';

type InventoryValue = number | string | null | undefined;
type InventoryMetrics = Record<string, InventoryValue>;

interface InventoryDashboardData {
  current: InventoryMetrics;
  previous: InventoryMetrics | null;
  markdown: string;
}

const METRICS: Array<{ key: string; label: string; unit?: string }> = [
  { key: 'webPages', label: 'Web pages' },
  { key: 'webComponents', label: 'Web components' },
  { key: 'webRoutes', label: 'Web routes' },
  { key: 'moduleRoutes', label: 'ModuleRoute wrappers' },
  { key: 'hooks', label: 'Hooks' },
  { key: 'edgeFunctions', label: 'Edge functions' },
  { key: 'migrations', label: 'Migrations' },
  { key: 'unitTestFiles', label: 'Unit test files' },
  { key: 'e2eSpecFiles', label: 'E2E spec files' },
  { key: 'skills', label: 'Installed skills' },
  { key: 'livePages', label: 'LIVE pages' },
  { key: 'shellPages', label: 'SHELL pages' },
  { key: 'shellRate', label: 'Shell rate', unit: '%' },
  { key: 'fontSerifInSrc', label: 'font-serif in src' },
  { key: 'proTokensInSrc', label: 'pro-* tokens in src' },
  { key: 'sentryInSrc', label: '@sentry in src' },
  { key: 'bannedTermsPublic', label: 'Banned terms (public)' },
];

async function fetchJson(path: string): Promise<InventoryMetrics | null> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as InventoryMetrics;
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return response.text();
}

async function fetchInventoryDashboard(): Promise<InventoryDashboardData> {
  const [current, previous, markdown] = await Promise.all([
    fetchJson('/docs/qa/inventory_report.json'),
    fetchJson('/docs/qa/inventory_report.previous.json'),
    fetchText('/docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md'),
  ]);

  if (!current) {
    throw new Error('Inventory report not found. Run `npm run inventory` to generate it.');
  }

  return {
    current,
    previous,
    markdown,
  };
}

function asNumber(value: InventoryValue): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatValue(value: InventoryValue, unit?: string): string {
  if (value === null || value === undefined) return '--';
  if (typeof value === 'number') return unit ? `${value}${unit}` : String(value);
  if (typeof value === 'string') return unit && value !== '--' ? `${value}${unit}` : value;
  return '--';
}

function timestamp(value: InventoryValue): string {
  if (typeof value !== 'string' || !value) return '--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function AdminInventoryReport() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'inventory-report-viewer'],
    queryFn: fetchInventoryDashboard,
    staleTime: 30_000,
  });

  const rows = useMemo(() => {
    if (!data) return [];

    return METRICS.map((metric) => {
      const currentValue = data.current[metric.key];
      const previousValue = data.previous?.[metric.key];
      const currentNumber = asNumber(currentValue);
      const previousNumber = asNumber(previousValue);
      const delta =
        currentNumber !== null && previousNumber !== null
          ? currentNumber - previousNumber
          : null;

      return {
        key: metric.key,
        label: metric.label,
        unit: metric.unit,
        currentValue,
        previousValue,
        delta,
      };
    });
  }, [data]);

  const exportDiffCsv = () => {
    exportToCsv(
      rows.map((row) => ({
        metric: row.label,
        current: formatValue(row.currentValue, row.unit),
        previous: formatValue(row.previousValue, row.unit),
        delta: row.delta === null ? '--' : row.delta,
      })),
      'socelle_inventory_diff',
      [
        { key: 'metric', label: 'Metric' },
        { key: 'current', label: 'Current' },
        { key: 'previous', label: 'Previous' },
        { key: 'delta', label: 'Delta' },
      ]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-56 bg-accent-soft rounded" />
            <div className="h-4 w-80 bg-accent-soft rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-accent-soft rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-accent-soft rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-accent-soft rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Inventory Report Unavailable</h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">
          {error instanceof Error ? error.message : 'Failed to load inventory artifacts.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || rows.length === 0) {
    return (
      <div className="py-16 text-center bg-white border border-accent-soft rounded-xl">
        <FileText className="w-10 h-10 text-graphite/30 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-graphite font-sans">No Inventory Data Yet</h3>
        <p className="text-sm text-graphite/60 mt-1 font-sans">
          Run <code className="font-mono">npm run inventory</code> to generate inventory artifacts.
        </p>
      </div>
    );
  }

  const shellRate = formatValue(data.current.shellRate, '%');
  const webPages = formatValue(data.current.webPages);
  const skills = formatValue(data.current.skills);
  const generatedAt = timestamp(data.current.timestamp);
  const previousAt = timestamp(data.previous?.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-graphite font-sans">Inventory Report Viewer</h1>
          <p className="text-graphite/60 font-sans mt-1 text-sm">
            Generated artifact with metric diffs against previous snapshot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportDiffCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Diff CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Generated At</p>
          <p className="text-sm font-semibold text-graphite font-sans">{generatedAt}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Previous Snapshot</p>
          <p className="text-sm font-semibold text-graphite font-sans">{previousAt}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Web Pages</p>
          <p className="text-3xl font-semibold text-graphite font-sans">{webPages}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Shell Rate</p>
          <p className="text-3xl font-semibold text-[#A97A4C] font-sans">{shellRate}</p>
          <p className="text-xs text-graphite/50 font-sans mt-1">Skills installed: {skills}</p>
        </div>
      </div>

      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <h2 className="text-lg font-semibold text-graphite font-sans mb-4">Metric Diff</h2>
        {!data.previous && (
          <div className="flex items-center gap-2 text-sm text-[#A97A4C] font-sans mb-4">
            <AlertTriangle className="w-4 h-4" />
            Previous snapshot missing. Run <code className="font-mono">npm run inventory</code> again to populate diff baseline.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-soft bg-[#F6F3EF]">
                <th className="text-left px-3 py-2 font-medium text-graphite/70 font-sans">Metric</th>
                <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">Current</th>
                <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">Previous</th>
                <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {rows.map((row) => {
                const deltaClass =
                  row.delta === null
                    ? 'text-graphite/50'
                    : row.delta > 0
                      ? 'text-[#8E6464]'
                      : row.delta < 0
                        ? 'text-[#5F8A72]'
                        : 'text-graphite/50';

                return (
                  <tr key={row.key}>
                    <td className="px-3 py-2 text-graphite font-sans">{row.label}</td>
                    <td className="px-3 py-2 text-right text-graphite font-medium">
                      {formatValue(row.currentValue, row.unit)}
                    </td>
                    <td className="px-3 py-2 text-right text-graphite/70">
                      {formatValue(row.previousValue, row.unit)}
                    </td>
                    <td className={`px-3 py-2 text-right font-semibold ${deltaClass}`}>
                      {row.delta === null ? (
                        '--'
                      ) : row.delta > 0 ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          <TrendingUp className="w-4 h-4" />+{row.delta}
                        </span>
                      ) : row.delta < 0 ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          <TrendingDown className="w-4 h-4" />{row.delta}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <h2 className="text-lg font-semibold text-graphite font-sans mb-3">Generated Markdown</h2>
        <pre className="text-xs text-graphite/80 bg-[#F6F3EF] border border-accent-soft rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
          {data.markdown}
        </pre>
      </div>
    </div>
  );
}
