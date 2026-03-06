// ── Intelligence Report Viewer ────────────────────────────────────
// WO-24: Brand Intelligence Packages (Monetization)

import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getMonthlyReport, getAllReports } from '../../lib/brandTiers/mockTierData';
import type { IntelligenceReport as IReport, ReportSection } from '../../lib/brandTiers/types';

// ── Section icon mapping ─────────────────────────────────────────

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
  recommendations: 'bg-pro-gold/10 text-pro-gold border-pro-gold/30',
};

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-pro-warm-gray" />;
}

function formatReportDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
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

// ── Section Card Component ───────────────────────────────────────

function SectionCard({ section }: { section: ReportSection }) {
  const Icon = SECTION_ICONS[section.id] || FileText;
  const colorClass = SECTION_COLORS[section.id] || 'bg-pro-ivory text-pro-charcoal border-pro-stone';

  return (
    <div className="bg-white border border-pro-stone/30 rounded-xl overflow-hidden">
      {/* Section Header */}
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

      {/* Section Body */}
      <div className="px-6 py-5 space-y-4">
        <p className="text-sm text-pro-charcoal leading-relaxed">{section.summary}</p>
        <ul className="space-y-2">
          {section.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-pro-warm-gray">
              <ChevronRight className="w-4 h-4 text-pro-gold mt-0.5 flex-shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Main Report Component ────────────────────────────────────────

export default function IntelligenceReport() {
  const { user } = useAuth();
  const allReports = getAllReports();
  const [selectedReportId, setSelectedReportId] = useState<string>(allReports[0]?.id ?? '');

  const report: IReport | undefined = getMonthlyReport(selectedReportId);
  const brandName = user?.user_metadata?.brand_name || 'Your Brand';

  const handleDownloadPdf = () => {
    alert('PDF report generation coming soon');
  };

  const handleEmailReport = () => {
    alert('Email delivery coming soon');
  };

  if (!report) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 text-pro-stone mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-pro-charcoal">No Reports Available</h2>
        <p className="text-pro-warm-gray mt-2">
          Your first intelligence report will be generated at the start of next month.
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
        {/* ── Report Header ───────────────────────────────────── */}
        <div className="bg-white border border-pro-stone/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-pro-warm-gray mb-1">
                <Calendar className="w-4 h-4" />
                <span>{formatReportDate(report.reportDate)}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-playfair text-pro-charcoal">
                  {report.title}
                </h1>
                <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">Demo Data</span>
              </div>
              <p className="text-sm text-pro-warm-gray mt-1">
                Prepared for <span className="font-medium text-pro-charcoal">{brandName}</span>
                {' · '}Generated {formatGeneratedDate(report.generatedAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-pro-stone/50 text-sm font-medium text-pro-charcoal hover:bg-pro-ivory transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handleEmailReport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pro-navy text-white text-sm font-medium hover:bg-pro-navy/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Report
              </button>
            </div>
          </div>
        </div>

        {/* ── Report Sections ─────────────────────────────────── */}
        <div className="space-y-6">
          {report.sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* ── Previous Reports ────────────────────────────────── */}
        <div className="bg-white border border-pro-stone/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-pro-charcoal mb-4">Previous Reports</h2>
          <div className="space-y-2">
            {allReports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReportId(r.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                  r.id === selectedReportId
                    ? 'bg-pro-navy/5 border border-pro-navy/20 text-pro-charcoal font-medium'
                    : 'hover:bg-pro-ivory/50 text-pro-warm-gray'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>{r.title}</span>
                </div>
                <span className="text-xs">
                  {formatReportDate(r.reportDate)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
