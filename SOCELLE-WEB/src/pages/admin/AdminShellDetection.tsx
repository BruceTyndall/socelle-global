import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { exportToCsv } from '../../lib/csvExport';

interface ShellHubSummary {
  live: number;
  demo: number;
  shell: number;
}

interface ShellReport {
  scan_date: string;
  summary: {
    total: number;
    live: number;
    demo: number;
    shell: number;
    shell_rate: string;
  };
  by_hub: Record<string, ShellHubSummary>;
}

interface ShellBaseline {
  created: string;
  shell_count: number;
}

interface ShellDashboardData {
  report: ShellReport;
  baseline: ShellBaseline | null;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

async function fetchShellDashboard(): Promise<ShellDashboardData> {
  const [report, baseline] = await Promise.all([
    fetchJson<ShellReport>('/docs/qa/shell_detector_report.json'),
    fetchJson<ShellBaseline>('/docs/qa/shell_detector_baseline.json'),
  ]);

  if (!report) {
    throw new Error('Shell detector report not found. Run `npm run shell:check` to generate it.');
  }

  return {
    report,
    baseline,
  };
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function AdminShellDetection() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'shell-detection-dashboard'],
    queryFn: fetchShellDashboard,
    staleTime: 30_000,
  });

  const hubRows = useMemo(() => {
    const report = data?.report;
    if (!report) return [];

    return Object.entries(report.by_hub)
      .map(([hub, summary]) => {
        const total = summary.live + summary.demo + summary.shell;
        return {
          hub,
          live: summary.live,
          demo: summary.demo,
          shell: summary.shell,
          total,
          shellRate: percentage(summary.shell, total),
        };
      })
      .sort((a, b) => b.shell - a.shell || a.hub.localeCompare(b.hub));
  }, [data]);

  const topRemediation = useMemo(
    () => hubRows.filter((row) => row.shell > 0).slice(0, 10),
    [hubRows]
  );

  const delta = useMemo(() => {
    if (!data?.baseline) return null;
    return data.report.summary.shell - data.baseline.shell_count;
  }, [data]);

  const exportMatrix = () => {
    exportToCsv(
      hubRows.map((row) => ({
        hub: row.hub,
        live: row.live,
        demo: row.demo,
        shell: row.shell,
        total: row.total,
        shell_rate: row.shellRate.toFixed(1),
      })),
      'socelle_shell_matrix',
      [
        { key: 'hub', label: 'Hub' },
        { key: 'live', label: 'LIVE' },
        { key: 'demo', label: 'DEMO' },
        { key: 'shell', label: 'SHELL' },
        { key: 'total', label: 'Total' },
        { key: 'shell_rate', label: 'Shell Rate %' },
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
          <div className="h-10 w-32 bg-accent-soft rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-accent-soft rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-accent-soft rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Shell Dashboard Unavailable</h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">
          {error instanceof Error ? error.message : 'Failed to load shell detector telemetry.'}
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

  const report = data?.report;

  if (!report || hubRows.length === 0) {
    return (
      <div className="py-16 text-center bg-white border border-accent-soft rounded-xl">
        <BarChart3 className="w-10 h-10 text-graphite/30 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-graphite font-sans">No Shell Data Yet</h3>
        <p className="text-sm text-graphite/60 mt-1 font-sans">
          Run <code className="font-mono">npm run shell:check</code> to generate the shell report.
        </p>
      </div>
    );
  }

  const totalWithShells = hubRows.filter((row) => row.shell > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-graphite font-sans">Shell Detection Dashboard</h1>
          <p className="text-graphite/60 font-sans mt-1 text-sm">
            Current matrix and remediation status by hub. Last scan {formatDate(report.scan_date)}.
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
            onClick={exportMatrix}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Total Pages</p>
          <p className="text-3xl font-semibold text-graphite font-sans">{report.summary.total}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Shell Pages</p>
          <p className="text-3xl font-semibold text-[#8E6464] font-sans">{report.summary.shell}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Shell Rate</p>
          <p className="text-3xl font-semibold text-graphite font-sans">{report.summary.shell_rate}%</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Hubs Needing Fixes</p>
          <p className="text-3xl font-semibold text-[#A97A4C] font-sans">{totalWithShells}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <h2 className="text-lg font-semibold text-graphite font-sans mb-4">Hub Shell Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent-soft bg-[#F6F3EF]">
                  <th className="text-left px-3 py-2 font-medium text-graphite/70 font-sans">Hub</th>
                  <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">LIVE</th>
                  <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">DEMO</th>
                  <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">SHELL</th>
                  <th className="text-right px-3 py-2 font-medium text-graphite/70 font-sans">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft">
                {hubRows.map((row) => (
                  <tr key={row.hub}>
                    <td className="px-3 py-2 font-sans text-graphite capitalize">{row.hub}</td>
                    <td className="px-3 py-2 text-right text-[#5F8A72] font-medium">{row.live}</td>
                    <td className="px-3 py-2 text-right text-[#6E879B] font-medium">{row.demo}</td>
                    <td className="px-3 py-2 text-right text-[#8E6464] font-semibold">{row.shell}</td>
                    <td className="px-3 py-2 text-right text-graphite/70">{row.shellRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <h2 className="text-lg font-semibold text-graphite font-sans mb-4">Remediation Status</h2>
          <div className="space-y-2">
            {topRemediation.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#5F8A72] mx-auto mb-2" />
                <p className="text-sm text-graphite/60 font-sans">No shell pages remain.</p>
              </div>
            )}
            {topRemediation.map((row) => {
              const status = row.shell >= 20 ? 'critical' : row.shell >= 5 ? 'active' : 'low';
              return (
                <div
                  key={`remediation-${row.hub}`}
                  className="flex items-center justify-between rounded-lg border border-accent-soft px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-graphite font-sans capitalize">{row.hub}</p>
                    <p className="text-xs text-graphite/60 font-sans">
                      {row.shell} shell pages out of {row.total}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      status === 'critical'
                        ? 'bg-[#8E6464]/10 text-[#8E6464]'
                        : status === 'active'
                          ? 'bg-[#A97A4C]/10 text-[#A97A4C]'
                          : 'bg-[#6E879B]/10 text-[#6E879B]'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <h2 className="text-lg font-semibold text-graphite font-sans mb-3">Trend vs Baseline</h2>
        {data?.baseline ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-graphite/60 font-sans">Baseline snapshot</p>
              <p className="text-sm text-graphite font-sans">{formatDate(data.baseline.created)}</p>
            </div>
            <div>
              <p className="text-xs text-graphite/60 font-sans">Baseline shells</p>
              <p className="text-xl font-semibold text-graphite font-sans">{data.baseline.shell_count}</p>
            </div>
            <div>
              <p className="text-xs text-graphite/60 font-sans">Current shells</p>
              <p className="text-xl font-semibold text-graphite font-sans">{report.summary.shell}</p>
            </div>
            <div>
              <p className="text-xs text-graphite/60 font-sans">Delta</p>
              <p className={`inline-flex items-center gap-1 text-xl font-semibold font-sans ${delta !== null && delta > 0 ? 'text-[#8E6464]' : 'text-[#5F8A72]'}`}>
                {delta !== null && delta > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {delta !== null ? `${delta > 0 ? '+' : ''}${delta}` : '0'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-[#A97A4C] font-sans">
            <AlertTriangle className="w-4 h-4" />
            Baseline file not found. Run <code className="font-mono">npm run shell:baseline</code> to enable trend tracking.
          </div>
        )}
      </div>
    </div>
  );
}
