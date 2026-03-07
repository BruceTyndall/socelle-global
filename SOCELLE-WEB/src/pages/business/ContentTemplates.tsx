import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Plus,
  Loader2,
  Save,
  X,
  Mail,
  MessageSquare,
  Bell,
  Share2,
  Layout,
} from 'lucide-react';
import { useContentTemplates } from '../../lib/useContentTemplates';
import type { TemplateType } from '../../lib/useContentTemplates';

// ── WO-OVERHAUL-15: Content Templates ───────────────────────────────────
// Portal page — template library for opt-in campaigns.
// isLive pattern: DEMO badge when DB not connected.

const TYPE_META: Record<TemplateType, { icon: React.ElementType; label: string; color: string }> = {
  email:        { icon: Mail,           label: 'Email',        color: 'bg-blue-50 text-blue-700' },
  sms:          { icon: MessageSquare,  label: 'SMS',          color: 'bg-green-50 text-green-700' },
  push:         { icon: Bell,           label: 'Push',         color: 'bg-amber-50 text-amber-700' },
  in_app:       { icon: Layout,         label: 'In-App',       color: 'bg-purple-50 text-purple-700' },
  social:       { icon: Share2,         label: 'Social',       color: 'bg-pink-50 text-pink-700' },
  landing_page: { icon: Layout,         label: 'Landing Page', color: 'bg-indigo-50 text-indigo-700' },
};

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'in_app', label: 'In-App' },
  { value: 'social', label: 'Social' },
  { value: 'landing_page', label: 'Landing Page' },
];

export default function ContentTemplates() {
  const { templates, isLive, loading, createTemplate } = useContentTemplates();

  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TemplateType>('email');
  const [formSubject, setFormSubject] = useState('');
  const [formPreviewText, setFormPreviewText] = useState('');
  const [formBody, setFormBody] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = filterType === 'all' ? templates : templates.filter((t) => t.type === filterType);

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      await createTemplate({
        name: formName.trim(),
        type: formType,
        subject: formSubject.trim() || null,
        preview_text: formPreviewText.trim() || null,
        body: formBody ? { content: formBody } : {},
        thumbnail_url: null,
        is_system: false,
      });
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormName('');
    setFormType('email');
    setFormSubject('');
    setFormPreviewText('');
    setFormBody('');
  };

  return (
    <>
      <Helmet>
        <title>Content Templates | Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-3xl text-pro-charcoal">Content Templates</h1>
                {!isLive && (
                  <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                    DEMO
                  </span>
                )}
              </div>
              <p className="text-sm text-pro-warm-gray font-sans mt-1">
                Reusable templates for your marketing campaigns
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-pro-navy text-white text-sm font-sans font-medium hover:bg-pro-navy/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>

        {/* ── Type Filter ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-pro-navy text-white'
                : 'bg-pro-cream text-pro-charcoal hover:bg-pro-stone/30'
            }`}
          >
            All
          </button>
          {TEMPLATE_TYPES.map((tt) => (
            <button
              key={tt.value}
              onClick={() => setFilterType(tt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                filterType === tt.value
                  ? 'bg-pro-navy text-white'
                  : 'bg-pro-cream text-pro-charcoal hover:bg-pro-stone/30'
              }`}
            >
              {tt.label}
            </button>
          ))}
        </div>

        {/* ── Create Form ─────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-pro-charcoal">Create Template</h2>
              <button onClick={resetForm} className="text-pro-warm-gray hover:text-pro-charcoal transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Welcome Email"
                  className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                  Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TemplateType)}
                  className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                >
                  {TEMPLATE_TYPES.map((tt) => (
                    <option key={tt.value} value={tt.value}>{tt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {formType === 'email' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Default subject"
                    className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                    Preview Text
                  </label>
                  <input
                    type="text"
                    value={formPreviewText}
                    onChange={(e) => setFormPreviewText(e.target.value)}
                    placeholder="Inbox preview text"
                    className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                Content Body
              </label>
              <textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Write your template content..."
                rows={10}
                className="w-full px-3 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={resetForm}
                className="h-9 px-4 rounded-full border border-pro-stone text-sm font-sans font-medium text-pro-charcoal hover:bg-pro-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName.trim() || saving}
                className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-pro-navy text-white text-sm font-sans font-medium hover:bg-pro-navy/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create Template
              </button>
            </div>
          </div>
        )}

        {/* ── Template Grid ───────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-pro-warm-gray animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-pro-warm-gray/40 mx-auto mb-3" />
            <p className="text-sm text-pro-warm-gray font-sans">
              {filterType === 'all' ? 'No templates created yet' : `No ${filterType} templates found`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tpl) => {
              const meta = TYPE_META[tpl.type] ?? TYPE_META.email;
              const Icon = meta.icon;
              return (
                <div
                  key={tpl.id}
                  className="bg-white rounded-xl border border-pro-stone p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail placeholder */}
                  <div className="w-full h-32 bg-pro-cream/50 rounded-lg mb-4 flex items-center justify-center">
                    {tpl.thumbnail_url ? (
                      <img
                        src={tpl.thumbnail_url}
                        alt={tpl.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Icon className="w-8 h-8 text-pro-warm-gray/30" />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-sans font-semibold text-pro-charcoal truncate">{tpl.name}</h3>
                      {tpl.subject && (
                        <p className="text-xs text-pro-warm-gray mt-0.5 truncate">{tpl.subject}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-pro-stone/50">
                    <span className="text-xs text-pro-warm-gray font-sans">
                      {new Date(tpl.created_at).toLocaleDateString()}
                    </span>
                    {tpl.is_system && (
                      <span className="text-xs text-pro-warm-gray bg-pro-cream px-2 py-0.5 rounded">System</span>
                    )}
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
