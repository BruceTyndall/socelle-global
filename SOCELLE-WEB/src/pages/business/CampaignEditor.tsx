import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calendar,
  Loader2,
  FileText,
  Users,
} from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { CampaignType, CampaignStatusType } from '../../lib/useCampaigns';
import { useAudienceSegments } from '../../lib/useAudienceSegments';
import { useContentTemplates } from '../../lib/useContentTemplates';

// ── WO-OVERHAUL-15: Campaign Editor / Builder ───────────────────────────
// Portal page — opt-in campaigns only (ZERO cold email/outreach).
// isLive pattern: DEMO badge when DB not connected.

interface Variant {
  id: string;
  label: string;
  subject: string;
  previewText: string;
  body: string;
}

function makeVariant(label: string): Variant {
  return { id: crypto.randomUUID(), label, subject: '', previewText: '', body: '' };
}

const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' },
  { value: 'in_app', label: 'In-App Message' },
  { value: 'social', label: 'Social' },
];

export default function CampaignEditor() {
  const navigate = useNavigate();
  const { createCampaign, isLive: campaignsLive } = useCampaigns();
  const { segments, isLive: segmentsLive, loading: segmentsLoading } = useAudienceSegments();
  const { templates, isLive: templatesLive, loading: templatesLoading } = useContentTemplates();

  const isLive = campaignsLive || segmentsLive || templatesLive;

  const [name, setName] = useState('');
  const [type, setType] = useState<CampaignType>('email');
  const [segmentId, setSegmentId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [variants, setVariants] = useState<Variant[]>([makeVariant('Variant A')]);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const activeVariant = variants[0];

  const addVariant = () => {
    const label = `Variant ${String.fromCharCode(65 + variants.length)}`;
    setVariants((v) => [...v, makeVariant(label)]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) return;
    setVariants((v) => v.filter((vv) => vv.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants((v) => v.map((vv) => (vv.id === id ? { ...vv, [field]: value } : vv)));
  };

  const applyTemplate = useCallback(
    (templateId: string) => {
      setSelectedTemplate(templateId);
      const tpl = templates.find((t) => t.id === templateId);
      if (tpl && variants.length > 0) {
        const updated = [...variants];
        updated[0] = {
          ...updated[0],
          subject: tpl.subject ?? '',
          previewText: tpl.preview_text ?? '',
          body: typeof tpl.body === 'object' ? JSON.stringify(tpl.body, null, 2) : '',
        };
        setVariants(updated);
      }
    },
    [templates, variants],
  );

  const handleSave = async (asDraft: boolean) => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const primary = variants[0];
      const status: CampaignStatusType = asDraft ? 'draft' : scheduledAt ? 'scheduled' : 'draft';
      const result = await createCampaign({
        name: name.trim(),
        type,
        status,
        subject: primary.subject || null,
        preview_text: primary.previewText || null,
        body: primary.body ? { content: primary.body, variants: variants.length > 1 ? variants.map((v) => ({ label: v.label, subject: v.subject, body: v.body })) : undefined } : null,
        audience_segment_id: segmentId || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        sent_at: null,
      });
      if (result) {
        navigate(`/portal/marketing/campaigns/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>New Campaign | Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-8 max-w-4xl">
        {/* ── Back + Header ───────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-pro-charcoal">New Campaign</h1>
            {!isLive && (
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                DEMO
              </span>
            )}
          </div>
          <p className="text-sm text-pro-warm-gray font-sans mt-1">
            Create an opt-in campaign for your consented contacts
          </p>
        </div>

        {/* ── Campaign Basics ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm space-y-5">
          <h2 className="font-serif text-lg text-pro-charcoal">Campaign Details</h2>

          <div>
            <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spring Product Launch"
              className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                Campaign Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CampaignType)}
                className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors bg-white"
              >
                {CAMPAIGN_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Audience Segment
              </label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors bg-white"
              >
                <option value="">All consented contacts</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.estimated_size.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
            />
          </div>
        </div>

        {/* ── Template Selection ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pro-navy" />
            <h2 className="font-serif text-lg text-pro-charcoal">Start from Template</h2>
          </div>
          {templatesLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-pro-warm-gray" />
              <span className="text-sm text-pro-warm-gray font-sans">Loading templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-pro-warm-gray font-sans">No templates available yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {templates.slice(0, 6).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate === tpl.id
                      ? 'border-pro-navy bg-pro-navy/5'
                      : 'border-pro-stone hover:bg-pro-cream/50'
                  }`}
                >
                  <div className="w-full h-16 bg-pro-cream/50 rounded mb-2 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-pro-warm-gray/40" />
                  </div>
                  <p className="text-xs font-sans font-medium text-pro-charcoal truncate">{tpl.name}</p>
                  <p className="text-xs text-pro-warm-gray mt-0.5">{tpl.type}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content / Variants ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-pro-charcoal">
              Content {variants.length > 1 ? '(A/B Test)' : ''}
            </h2>
            <button
              onClick={addVariant}
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-pro-navy hover:text-pro-navy/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Variant
            </button>
          </div>

          {variants.map((v, idx) => (
            <div key={v.id} className="space-y-4 border-t border-pro-stone/50 pt-5 first:border-0 first:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans font-semibold text-pro-charcoal">{v.label}</span>
                {variants.length > 1 && (
                  <button
                    onClick={() => removeVariant(v.id)}
                    className="text-pro-warm-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {type === 'email' && (
                <>
                  <div>
                    <label className="block text-xs font-sans text-pro-warm-gray mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={v.subject}
                      onChange={(e) => updateVariant(v.id, 'subject', e.target.value)}
                      placeholder="Subject line"
                      className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-pro-warm-gray mb-1">Preview Text</label>
                    <input
                      type="text"
                      value={v.previewText}
                      onChange={(e) => updateVariant(v.id, 'previewText', e.target.value)}
                      placeholder="Preview text shown in inbox"
                      className="w-full h-10 px-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-sans text-pro-warm-gray mb-1">Content</label>
                <textarea
                  value={v.body}
                  onChange={(e) => updateVariant(v.id, 'body', e.target.value)}
                  placeholder="Write your message content..."
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors resize-y"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            onClick={() => handleSave(true)}
            disabled={!name.trim() || saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-pro-stone text-sm font-sans font-medium text-pro-charcoal hover:bg-pro-cream transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={!name.trim() || saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-pro-navy text-white text-sm font-sans font-medium hover:bg-pro-navy/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {scheduledAt ? 'Schedule Campaign' : 'Save Campaign'}
          </button>
        </div>
      </div>
    </>
  );
}
