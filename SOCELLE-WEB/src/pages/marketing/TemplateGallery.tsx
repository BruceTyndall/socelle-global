import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle, Loader2, Filter, Layout } from 'lucide-react';
import { useContentTemplates } from '../../lib/useContentTemplates';
import type { ContentTemplate, TemplateType } from '../../lib/useContentTemplates';

// ── WO-OVERHAUL-15: Template Gallery (/marketing/templates) ──────────
// Data source: content_templates table via useContentTemplates()
// isLive flag drives DEMO badge.

const TEMPLATE_TYPES: TemplateType[] = ['email', 'sms', 'push', 'in_app', 'social', 'landing_page'];

const TYPE_COLORS: Record<string, string> = {
  email: 'bg-accent/10 text-accent',
  sms: 'bg-signal-up/10 text-signal-up',
  push: 'bg-signal-warn/10 text-signal-warn',
  in_app: 'bg-graphite/10 text-graphite/60',
  social: 'bg-accent/10 text-accent',
  landing_page: 'bg-signal-up/10 text-signal-up',
};

export default function TemplateGallery() {
  const { templates, isLive, loading } = useContentTemplates();
  const [typeFilter, setTypeFilter] = useState<TemplateType | ''>('');

  const filtered = typeFilter
    ? templates.filter((t: ContentTemplate) => t.type === typeFilter)
    : templates;

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Content Templates</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">Pre-built templates for campaigns and landing pages</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-4 h-4 text-graphite/30" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TemplateType | '')}
            className="h-9 px-3 text-xs font-sans text-graphite bg-mn-card border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
          >
            <option value="">All Types</option>
            {TEMPLATE_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-12 text-center">
            <Layout className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
            <p className="text-sm text-graphite/50 font-sans">No templates available yet. Templates will appear here once created.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template: ContentTemplate) => (
              <div key={template.id} className="bg-mn-card border border-graphite/8 rounded-xl overflow-hidden hover:border-accent/30 transition-colors group">
                {/* Thumbnail */}
                <div className="aspect-[16/10] bg-mn-surface flex items-center justify-center">
                  {template.thumbnail_url ? (
                    <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-10 h-10 text-graphite/15" />
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-graphite font-sans">{template.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-sans uppercase ${TYPE_COLORS[template.type] || 'bg-graphite/10 text-graphite/40'}`}>
                      {template.type.replace('_', ' ')}
                    </span>
                  </div>
                  {template.subject && (
                    <p className="text-xs text-graphite/40 font-sans mb-3 truncate">{template.subject}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-graphite/30 font-sans">
                      {template.is_system ? 'System' : 'Custom'} template
                    </span>
                    <Link
                      to="/marketing/campaigns/new"
                      className="text-xs font-medium text-accent hover:text-accent-hover font-sans"
                    >
                      Use Template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
