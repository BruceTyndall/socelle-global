import { Helmet } from 'react-helmet-async';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Mail,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronRight,
  BarChart3,
  Users,
  Compass,
  Shield,
  Lightbulb,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { IntelligenceReport as IReport, ReportSection } from '../../lib/brandTiers/types';

const SECTION_ICONS: Record<string, typeof BarChart3> = {
  'market-position': BarChart3,
  'reseller-health': Users,
  'category-trends': Compass,
  'competitive-landscape': Shield,
  recommendations: Lightbulb,
};

const SECTION_COLORS: Record<string, string> = {
  'market-position': 'bg-blue-50 text-blue-700 border-blue-200',
  'reseller-health': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'category-trends': 'bg-purple-50 text-purple-700 border-purple-200',
  'competitive-landscape': 'bg-amber-50 text-amber-700 border-amber-200',
  recommendations: 'bg-accent/10 text-accent border-accent/30',
};

interface MarketSignalRow {
  id: string;
  title: string;
  description: string;
  signal_type: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  updated_at: string;
  source: string | null;
  source_name: string | null;
  related_brands: string[] | null;
  region: string | null;
}

interface ReportJobRow {
  id: string;
  report_month: string;
  output_format: 'pdf' | 'email';
  delivery_email: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  status_message: string | null;
  artifact_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-graphite/60" />;
}

function formatReportDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatGeneratedDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatJobStatus(status: ReportJobRow['status']): string {
  if (status === 'queued') return 'Queued';
  if (status === 'processing') return 'Processing';
  if (status === 'completed') return 'Completed';
  return 'Failed';
}

function jobStatusClass(status: ReportJobRow['status']): string {
  if (status === 'queued') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'processing') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function isBrandSignal(signal: MarketSignalRow, brandName: string): boolean {
  const needle = brandName.trim().toLowerCase();
  if (!needle) return false;

  const related = (signal.related_brands ?? []).some((brand) => {
    const normalized = brand.toLowerCase();
    return normalized.includes(needle) || needle.includes(normalized);
  });

  return (
    related ||
    signal.title.toLowerCase().includes(needle) ||
    signal.description.toLowerCase().includes(needle)
  );
}

function buildReportSections(signals: MarketSignalRow[]): ReportSection[] {
  const positive = signals.filter((s) => s.direction === 'up').length;
  const negative = signals.filter((s) => s.direction === 'down').length;
  const sentimentBase = Math.max(1, positive + negative);
  const bullishPct = Math.round((positive / sentimentBase) * 100);

  const byType = signals.reduce<Record<string, number>>((acc, signal) => {
    acc[signal.signal_type] = (acc[signal.signal_type] ?? 0) + 1;
    return acc;
  }, {});

  const topType =
    Object.entries(byType).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'trend';

  const uniqueRegions = Array.from(
    new Set(signals.map((signal) => signal.region).filter(Boolean) as string[])
  );

  const uniqueSources = Array.from(
    new Set(
      signals
        .map((signal) => signal.source_name ?? signal.source)
        .filter(Boolean) as string[]
    )
  );

  const highMagnitude = [...signals]
    .sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude))
    .slice(0, 3);

  const recommendations = highMagnitude.length
    ? highMagnitude.map((signal) => signal.title)
    : ['No high-impact signals available in this period'];

  return [
    {
      id: 'market-position',
      title: 'Market Position',
      summary:
        bullishPct >= 50
          ? 'Brand sentiment is currently positive across tracked market signals.'
          : 'Signal momentum is mixed and requires tighter campaign focus.',
      details: [
        `${signals.length} tracked signals for this period`,
        `${positive} positive signals vs ${negative} negative signals`,
        `Top momentum signal type: ${topType}`,
      ],
      metric: {
        label: 'Bullish Signals',
        value: `${bullishPct}%`,
        trend: bullishPct >= 50 ? 'up' : 'down',
      },
    },
    {
      id: 'reseller-health',
      title: 'Reseller Health',
      summary:
        uniqueRegions.length > 0
          ? 'Signals indicate active reseller movement across multiple regions.'
          : 'Regional tagging is sparse; feed attribution should be expanded.',
      details: [
        `${uniqueRegions.length} regions represented in tracked signals`,
        uniqueRegions.length > 0
          ? `Top regions: ${uniqueRegions.slice(0, 3).join(', ')}`
          : 'No region-tagged signals found',
        `Signal refresh timestamp: ${formatGeneratedDate(signals[0]?.updated_at ?? new Date().toISOString())}`,
      ],
      metric: {
        label: 'Regions',
        value: uniqueRegions.length.toString(),
        trend: uniqueRegions.length >= 3 ? 'up' : 'flat',
      },
    },
    {
      id: 'category-trends',
      title: 'Category Trends',
      summary: `Most active category in this cycle is ${topType}.`,
      details: Object.entries(byType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([type, count]) => `${type}: ${count} signals`),
      metric: {
        label: 'Signal Types',
        value: Object.keys(byType).length.toString(),
        trend: 'up',
      },
    },
    {
      id: 'competitive-landscape',
      title: 'Competitive Landscape',
      summary:
        uniqueSources.length > 0
          ? 'Competitive visibility is backed by multi-source signal coverage.'
          : 'Source diversity is limited for this report period.',
      details: [
        `${uniqueSources.length} unique sources contributed to this report`,
        uniqueSources.length > 0
          ? `Primary sources: ${uniqueSources.slice(0, 3).join(', ')}`
          : 'No source attribution available',
        'Track source diversity to reduce single-feed bias in monthly positioning',
      ],
      metric: {
        label: 'Sources',
        value: uniqueSources.length.toString(),
        trend: uniqueSources.length >= 4 ? 'up' : 'flat',
      },
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      summary:
        'Use the highest-magnitude signals to prioritize product, pricing, and channel actions for next cycle.',
      details: recommendations,
      metric: {
        label: 'Priority Signals',
        value: highMagnitude.length.toString(),
        trend: highMagnitude.length > 0 ? 'up' : 'flat',
      },
    },
  ];
}

function buildReports(signals: MarketSignalRow[], brandId: string, brandName: string): IReport[] {
  const groups = new Map<string, MarketSignalRow[]>();

  for (const signal of signals) {
    const monthKey = signal.updated_at.slice(0, 7);
    const bucket = groups.get(monthKey) ?? [];
    bucket.push(signal);
    groups.set(monthKey, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, monthSignals]) => {
      const reportDate = `${monthKey}-01`;
      const generatedAt = monthSignals
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]?.updated_at ?? new Date().toISOString();

      return {
        id: `${brandId}-${monthKey}`,
        brandId,
        reportDate,
        title: `${brandName} Intelligence Report`,
        generatedAt,
        sections: buildReportSections(monthSignals),
      };
    });
}

function SectionCard({ section }: { section: ReportSection }) {
  const Icon = SECTION_ICONS[section.id] || FileText;
  const colorClass = SECTION_COLORS[section.id] || 'bg-background text-graphite border-accent-soft';

  return (
    <div className="bg-white border border-accent-soft/30 rounded-xl overflow-hidden">
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${colorClass} border`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <h3 className="font-semibold">{section.title}</h3>
        {section.metric && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium">{section.metric.label}:</span>
            <span className="text-lg font-bold">{section.metric.value}</span>
            <TrendIcon trend={section.metric.trend} />
          </div>
        )}
      </div>

      <div className="px-6 py-5 space-y-4">
        <p className="text-sm text-graphite leading-relaxed">{section.summary}</p>
        <ul className="space-y-2">
          {section.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-graphite/60">
              <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function IntelligenceReport() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReportId, setSelectedReportId] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [queueingFormat, setQueueingFormat] = useState<'pdf' | 'email' | null>(null);

  const { data: reportData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['brand-intelligence-report', profile?.brand_id],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return { brandName: 'Your Brand', reports: [] as IReport[], jobs: [] as ReportJobRow[] };
      }

      const brandId = profile!.brand_id!;

      const [{ data: brandRow }, { data: rawSignals, error: signalsError }, { data: jobsData, error: jobsError }] = await Promise.all([
        supabase.from('brands').select('name').eq('id', brandId).maybeSingle(),
        supabase
          .from('market_signals')
          .select('id,title,description,signal_type,magnitude,direction,updated_at,source,source_name,related_brands,region')
          .eq('active', true)
          .eq('is_duplicate', false)
          .order('updated_at', { ascending: false })
          .limit(300),
        supabase
          .from('brand_intelligence_report_jobs')
          .select('id,report_month,output_format,delivery_email,status,status_message,artifact_url,created_at,updated_at,completed_at')
          .eq('brand_id', brandId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (signalsError) throw signalsError;
      if (jobsError) throw jobsError;

      const resolvedBrandName =
        (brandRow?.name as string | undefined) ||
        (user?.user_metadata?.brand_name as string | undefined) ||
        'Your Brand';

      const allSignals = (rawSignals as MarketSignalRow[]) ?? [];
      const brandSignals = allSignals.filter((signal) => isBrandSignal(signal, resolvedBrandName));
      const reportSignals = brandSignals.length > 0 ? brandSignals : allSignals;

      return {
        brandName: resolvedBrandName,
        reports: buildReports(reportSignals, brandId, resolvedBrandName),
        jobs: (jobsData as ReportJobRow[]) ?? [],
      };
    },
    enabled: !!profile?.brand_id,
  });

  const brandName = reportData?.brandName ?? 'Your Brand';
  const reports = reportData?.reports ?? [];
  const jobs = reportData?.jobs ?? [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load intelligence report') : null;

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedReportId('');
      return;
    }

    if (!reports.some((report) => report.id === selectedReportId)) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  const report = useMemo(
    () => reports.find((item) => item.id === selectedReportId),
    [reports, selectedReportId]
  );

  const queueReport = useCallback(
    async (format: 'pdf' | 'email') => {
      if (!profile?.brand_id || !report) return;

      setQueueingFormat(format);
      setActionMessage(null);

      try {
        const statusMessage =
          format === 'email' && user?.email
            ? `Queued for delivery to ${user.email}`
            : 'Queued for generation';

        const { error: queueError } = await supabase
          .from('brand_intelligence_report_jobs')
          .insert({
            brand_id: profile.brand_id,
            requested_by: user?.id ?? null,
            report_month: report.reportDate,
            output_format: format,
            delivery_email: format === 'email' ? user?.email ?? null : null,
            status: 'queued',
            status_message: statusMessage,
          });

        if (queueError) throw queueError;

        setActionMessage(
          format === 'pdf'
            ? 'PDF request queued successfully.'
            : 'Email delivery queued successfully.'
        );

        queryClient.invalidateQueries({ queryKey: ['brand-intelligence-report', profile.brand_id] });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to queue report request';
        setActionMessage(message);
      } finally {
        setQueueingFormat(null);
      }
    },
    [queryClient, profile?.brand_id, report, user?.email, user?.id]
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <Clock className="w-12 h-12 text-accent-soft mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-graphite">Loading Report...</h2>
        <p className="text-graphite/60 mt-2">Compiling live market signals for your brand.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-graphite">Unable to Load Report</h2>
        <p className="text-graphite/60 mt-2">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 text-accent-soft mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-graphite">No Live Reports Available</h2>
        <p className="text-graphite/60 mt-2">
          Reports publish when active market signals are available for your brand.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Intelligence Report | Socelle</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white border border-accent-soft/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-graphite/60 mb-1">
                <Calendar className="w-4 h-4" />
                <span>{formatReportDate(report.reportDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-playfair text-graphite">{report.title}</h1>
                <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
              </div>
              <p className="text-sm text-graphite/60 mt-1">
                Prepared for <span className="font-medium text-graphite">{brandName}</span>
                {' | '}Generated {formatGeneratedDate(report.generatedAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => void queueReport('pdf')}
                disabled={queueingFormat !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft/50 text-sm font-medium text-graphite hover:bg-background transition-colors disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {queueingFormat === 'pdf' ? 'Queueing...' : 'Queue PDF'}
              </button>
              <button
                onClick={() => void queueReport('email')}
                disabled={queueingFormat !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite text-white text-sm font-medium hover:bg-graphite/90 transition-colors disabled:opacity-60"
              >
                <Mail className="w-4 h-4" />
                {queueingFormat === 'email' ? 'Queueing...' : 'Queue Email'}
              </button>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-lg border border-accent-soft/40">
            <CheckCircle2 className="w-4 h-4 text-graphite flex-shrink-0" />
            <p className="text-xs font-sans text-graphite">{actionMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {report.sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        <div className="bg-white border border-accent-soft/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-graphite mb-4">Delivery Queue</h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-graphite/60">
              No report jobs queued yet. Use Queue PDF or Queue Email to create a tracked delivery request.
            </p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-accent-soft/40 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-graphite">
                      {formatReportDate(job.report_month)} {job.output_format.toUpperCase()} request
                    </p>
                    <p className="text-xs text-graphite/60">
                      Created {formatGeneratedDate(job.created_at)}
                      {job.delivery_email ? ` | ${job.delivery_email}` : ''}
                    </p>
                    {job.status_message && (
                      <p className="text-xs text-graphite/60">{job.status_message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${jobStatusClass(job.status)}`}>
                      {formatJobStatus(job.status)}
                    </span>
                    {job.artifact_url && (
                      <a
                        href={job.artifact_url}
                        className="text-xs font-semibold text-graphite hover:text-graphite"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-accent-soft/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-graphite mb-4">Previous Reports</h2>
          <div className="space-y-2">
            {reports.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedReportId(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                  item.id === selectedReportId
                    ? 'bg-graphite/5 border border-graphite/20 text-graphite font-medium'
                    : 'hover:bg-background/50 text-graphite/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>{item.title}</span>
                </div>
                <span className="text-xs">{formatReportDate(item.reportDate)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
