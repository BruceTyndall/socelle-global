import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Search,
  Download,
  Share2,
  Eye,
  Calendar,
  Megaphone,
  Camera,
  Microscope,
} from 'lucide-react';
import {
  Badge,
  Button,
  Input,
} from '../../components/ui';
import { getAdminReports } from '../../lib/intelligence/adminIntelligence';
import type { AdminReport } from '../../lib/intelligence/adminIntelligence';

type TypeFilter = 'all' | 'campaign' | 'snapshot' | 'report' | 'analysis';
type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

const TYPE_ICONS: Record<string, typeof FileText> = {
  report: FileText,
  campaign: Megaphone,
  snapshot: Camera,
  analysis: Microscope,
};

const TYPE_BADGE_VARIANTS: Record<string, 'navy' | 'gold' | 'green' | 'amber' | 'default'> = {
  report: 'navy',
  campaign: 'gold',
  snapshot: 'green',
  analysis: 'amber',
};

const STATUS_BADGE_VARIANTS: Record<string, 'green' | 'amber' | 'gray'> = {
  published: 'green',
  draft: 'amber',
  archived: 'gray',
};

export default function ReportsLibrary() {
  const allReports = getAdminReports();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = allReports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.brand && r.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (action: string, report: AdminReport) => {
    showToast(`${action} for "${report.title}" (feature coming in Wave 6)`);
  };

  return (
    <>
      <Helmet>
        <title>Reports Library | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-pro-navy text-white text-sm font-sans px-4 py-2.5 rounded-lg shadow-lg">
            {toast}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading text-pro-charcoal">
            Reports &amp; Intelligence Library
          </h1>
          <p className="text-sm text-pro-warm-gray font-sans mt-1">
            Browse, export, and manage marketplace intelligence reports and campaign snapshots
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-pro-stone p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            {/* Search */}
            <div className="w-full lg:w-72">
              <Input
                placeholder="Search reports or brands..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                iconLeft={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-pro-warm-gray font-sans mr-1">Type:</span>
              {(['all', 'report', 'campaign', 'snapshot', 'analysis'] as TypeFilter[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-xs font-medium font-sans rounded-full border transition-colors capitalize ${
                    typeFilter === t
                      ? 'bg-pro-navy text-white border-pro-navy'
                      : 'bg-white text-pro-warm-gray border-pro-stone hover:border-pro-navy hover:text-pro-navy'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-pro-warm-gray font-sans mr-1">Status:</span>
              {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium font-sans rounded-full border transition-colors capitalize ${
                    statusFilter === s
                      ? 'bg-pro-navy text-white border-pro-navy'
                      : 'bg-white text-pro-warm-gray border-pro-stone hover:border-pro-navy hover:text-pro-navy'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-pro-warm-gray font-sans">
          Showing {filtered.length} of {allReports.length} reports
        </p>

        {/* Report Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-pro-stone flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-12 h-12 text-pro-stone mb-4" />
            <p className="text-sm font-sans text-pro-warm-gray">No reports match your current filters.</p>
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}
              className="text-sm text-pro-navy font-sans font-medium mt-2 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(report => {
              const Icon = TYPE_ICONS[report.type] || FileText;
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-pro-stone overflow-hidden hover:shadow-card transition-shadow"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-pro-cream flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-pro-navy" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={TYPE_BADGE_VARIANTS[report.type] || 'default'}>
                          {report.type}
                        </Badge>
                        <Badge variant={STATUS_BADGE_VARIANTS[report.status] || 'gray'} dot>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-medium text-pro-charcoal font-sans text-sm leading-snug mb-1">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-pro-warm-gray font-sans">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {report.brand && (
                        <>
                          <span className="text-pro-stone">&middot;</span>
                          <span>{report.brand}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Metrics Preview */}
                  <div className="px-5 py-3 bg-pro-ivory/50 border-t border-pro-stone/50">
                    <div className="flex items-center justify-between gap-2">
                      {report.metrics.map((m, idx) => (
                        <div key={idx} className="text-center flex-1">
                          <p className="text-[10px] text-pro-warm-gray font-sans uppercase tracking-wider">{m.label}</p>
                          <p className="text-sm font-bold text-pro-charcoal font-sans">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-3 border-t border-pro-stone/50 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => handleAction('View', report)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Download className="w-3.5 h-3.5" />}
                      onClick={() => handleAction('Export', report)}
                    >
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Share2 className="w-3.5 h-3.5" />}
                      onClick={() => handleAction('Share', report)}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
