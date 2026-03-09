import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  RefreshCw,
  Loader2,
  Layout,
  Mail,
  MessageSquare,
  Bell,
  Share2,
} from 'lucide-react';
import { useContentTemplates } from '../../../lib/useContentTemplates';
import type { TemplateType, ContentTemplate } from '../../../lib/useContentTemplates';

// ── V2-HUBS-08: Marketing Templates ────────────────────────────────
// Grid of templates from content_templates (space='marketing').
// Pearl Mineral V2 tokens. 3 states: skeleton, empty, error.

const CATEGORIES: { value: TemplateType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'in_app', label: 'In-App' },
  { value: 'social', label: 'Social' },
  { value: 'landing_page', label: 'Landing Page' },
];

const TYPE_META: Record<string, { icon: React.ElementType; color: string }> = {
  email: { icon: Mail, color: 'bg-accent/10 text-accent' },
  sms: { icon: MessageSquare, color: 'bg-signal-up/10 text-signal-up' },
  push: { icon: Bell, color: 'bg-signal-warn/10 text-signal-warn' },
  in_app: { icon: Layout, color: 'bg-graphite/10 text-graphite/60' },
  social: { icon: Share2, color: 'bg-accent/10 text-accent' },
  landing_page: { icon: Layout, color: 'bg-signal-up/10 text-signal-up' },
};

/* ── Skeleton Card ────────────────────────────────────────────────── */
function SkeletonTemplateCard() {
  return (
    <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-graphite/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-32 bg-graphite/8 rounded" />
        <div className="h-3 w-20 bg-graphite/5 rounded" />
      </div>
    </div>
  );
}

export default function MarketingTemplates() {
  const { templates, isLive, loading, error, refetch } = useContentTemplates();
  const [categoryFilter, setCategoryFilter] = useState<TemplateType | ''>('');

  const filtered: ContentTemplate[] = categoryFilter
    ? templates.filter((t) => t.type === categoryFilter)
    : templates;

  return (
    <>
      <Helmet>
        <title>Templates | Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans font-semibold text-graphite">Templates</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-sm text-graphite/60 font-sans mt-1">
            Pre-built templates for your marketing campaigns
          </p>
        </div>

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-signal-down" />
              <p className="text-sm font-sans text-graphite">{error}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-graphite/10 text-sm font-sans font-medium text-graphite hover:bg-graphite/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* ── Category Filter ─────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value as TemplateType | '')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                categoryFilter === cat.value
                  ? 'bg-accent text-white'
                  : 'bg-accent-soft text-graphite hover:bg-accent/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Grid ────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonTemplateCard />
            <SkeletonTemplateCard />
            <SkeletonTemplateCard />
            <SkeletonTemplateCard />
            <SkeletonTemplateCard />
            <SkeletonTemplateCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-graphite/8 p-16 text-center">
            <FileText className="w-10 h-10 text-graphite/15 mx-auto mb-3" />
            <p className="text-sm text-graphite/50 font-sans mb-1">
              {categoryFilter ? `No ${categoryFilter.replace('_', ' ')} templates found` : 'No templates available yet'}
            </p>
            <p className="text-xs text-graphite/30 font-sans">
              Templates will appear here once created by your team or admins
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template) => {
              const meta = TYPE_META[template.type] ?? TYPE_META.email;
              const Icon = meta.icon;

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-graphite/8 overflow-hidden hover:border-accent/30 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] bg-accent-soft/30 flex items-center justify-center">
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-10 h-10 text-graphite/10" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-sans font-medium text-graphite truncate">
                        {template.name}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-sans uppercase ${meta.color}`}
                      >
                        {template.type.replace('_', ' ')}
                      </span>
                    </div>

                    {template.subject && (
                      <p className="text-xs text-graphite/40 font-sans mb-3 truncate">
                        {template.subject}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-graphite/30 font-sans">
                        {template.is_system ? 'System' : 'Custom'}
                      </span>
                      <Link
                        to="/portal/marketing/campaigns/new"
                        className="text-xs font-medium text-accent hover:text-accent-hover font-sans transition-colors"
                      >
                        Use template
                      </Link>
                    </div>
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
