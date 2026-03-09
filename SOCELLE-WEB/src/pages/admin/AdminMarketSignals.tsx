// ── AdminMarketSignals — W9-05 ─────────────────────────────────────
// Admin UI for curating Intelligence Hub market signals.
// Create, activate/deactivate, and expire signals surfaced publicly.

import { useState } from 'react';
import {
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

type SignalType =
  | 'product_velocity'
  | 'treatment_trend'
  | 'ingredient_momentum'
  | 'brand_adoption'
  | 'regional'
  | 'pricing_benchmark'
  | 'regulatory_alert'
  | 'education';

type SignalDirection = 'up' | 'down' | 'stable';

interface MarketSignalRow {
  id: string;
  signal_type: SignalType;
  signal_key: string;
  title: string;
  description: string;
  magnitude: number;
  direction: SignalDirection;
  region: string | null;
  category: string | null;
  source: string | null;
  confidence_tier: 'high' | 'medium' | 'low';
  display_order: number;
  active: boolean;
  expires_at: string | null;
  updated_at: string;
  created_at: string;
}

const SIGNAL_TYPES: SignalType[] = [
  'product_velocity',
  'treatment_trend',
  'ingredient_momentum',
  'brand_adoption',
  'regional',
  'pricing_benchmark',
  'regulatory_alert',
  'education',
];

const TYPE_LABELS: Record<SignalType, string> = {
  product_velocity: 'Product Velocity',
  treatment_trend: 'Treatment Trend',
  ingredient_momentum: 'Ingredient Momentum',
  brand_adoption: 'Brand Adoption',
  regional: 'Regional',
  pricing_benchmark: 'Pricing Benchmark',
  regulatory_alert: 'Regulatory Alert',
  education: 'Education',
};

const DIR_ICON: Record<SignalDirection, React.ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const DIR_COLOUR: Record<SignalDirection, string> = {
  up: 'text-[#5F8A72]',
  down: 'text-[#8E6464]',
  stable: 'text-graphite/50',
};

const CONFIDENCE_BADGE: Record<string, string> = {
  high: 'bg-[#5F8A72]/10 text-[#5F8A72]',
  medium: 'bg-accent/10 text-accent',
  low: 'bg-[#A97A4C]/10 text-[#A97A4C]',
};

// ── Blank form ─────────────────────────────────────────────────────

const BLANK: Omit<MarketSignalRow, 'id' | 'created_at' | 'updated_at'> = {
  signal_type: 'product_velocity',
  signal_key: '',
  title: '',
  description: '',
  magnitude: 0,
  direction: 'up',
  region: null,
  category: null,
  source: null,
  confidence_tier: 'medium',
  display_order: 0,
  active: true,
  expires_at: null,
};

// ── Component ──────────────────────────────────────────────────────

export default function AdminMarketSignals() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof BLANK>({ ...BLANK });
  const [saving, setSaving] = useState(false);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ────────────────────────────────────────────────────────

  const { data: signals = [], isLoading: loading, refetch: fetchSignals } = useQuery({
    queryKey: ['admin-market-signals'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('market_signals')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (err) throw new Error(err.message);
      return (data ?? []) as MarketSignalRow[];
    },
  });

  // ── Toggle active ────────────────────────────────────────────────

  const toggleActive = async (id: string, current: boolean) => {
    const { error: err } = await supabase
      .from('market_signals')
      .update({ active: !current })
      .eq('id', id);
    if (err) { showToast('err', err.message); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-market-signals'] });
    showToast('ok', current ? 'Signal deactivated' : 'Signal activated');
  };

  // ── Expire now ───────────────────────────────────────────────────

  const expireNow = async (id: string) => {
    const { error: err } = await supabase
      .from('market_signals')
      .update({ active: false, expires_at: new Date().toISOString() })
      .eq('id', id);
    if (err) { showToast('err', err.message); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-market-signals'] });
    showToast('ok', 'Signal expired');
  };

  // ── Create ───────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.signal_key.trim() || !form.description.trim()) {
      showToast('err', 'Title, signal key, and description are required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      signal_key: form.signal_key.trim().toLowerCase().replace(/\s+/g, '_'),
      region: form.region?.trim() || null,
      category: form.category?.trim() || null,
      source: form.source?.trim() || null,
      expires_at: form.expires_at || null,
    };
    const { error: err } = await supabase.from('market_signals').insert(payload);
    setSaving(false);
    if (err) { showToast('err', err.message); return; }
    showToast('ok', 'Signal created');
    setShowForm(false);
    setForm({ ...BLANK });
    queryClient.invalidateQueries({ queryKey: ['admin-market-signals'] });
  };

  // ── Render ───────────────────────────────────────────────────────

  const active = signals.filter((s) => s.active);
  const inactive = signals.filter((s) => !s.active);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-sans font-medium ${
          toast.type === 'ok' ? 'bg-[#5F8A72] text-white' : 'bg-[#8E6464] text-white'
        }`}>
          {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-sans font-semibold text-graphite">Market Signals</h1>
          <p className="text-sm text-graphite/50 font-sans mt-0.5">
            Curate the Intelligence Hub's public signal feed
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSignals}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite/5 hover:bg-graphite/10 text-graphite text-sm font-sans font-medium transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-sans font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Signal
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total signals', value: signals.length, icon: BarChart3 },
          { label: 'Active / public', value: active.length, icon: Eye },
          { label: 'Inactive / hidden', value: inactive.length, icon: EyeOff },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-graphite/10 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] text-graphite/40 font-sans uppercase tracking-wider">{label}</p>
              <p className="text-lg font-sans font-semibold text-graphite">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-[#8E6464]/10 border border-[#8E6464]/20 rounded-xl px-4 py-3 text-sm text-[#8E6464] font-sans">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-graphite/10 rounded-2xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-base font-sans font-semibold text-graphite mb-4">New Market Signal</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Signal type */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Signal Type *</label>
              <select
                value={form.signal_type}
                onChange={(e) => setForm((f) => ({ ...f, signal_type: e.target.value as SignalType }))}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {SIGNAL_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Direction *</label>
              <select
                value={form.direction}
                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as SignalDirection }))}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="up">Up ↑</option>
                <option value="down">Down ↓</option>
                <option value="stable">Stable →</option>
              </select>
            </div>

            {/* Signal key */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Signal Key * (slug)</label>
              <input
                type="text"
                value={form.signal_key}
                onChange={(e) => setForm((f) => ({ ...f, signal_key: e.target.value }))}
                placeholder="peptide_adoption_q1"
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {/* Magnitude */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Magnitude % (-100 to 100)</label>
              <input
                type="number"
                min={-100}
                max={100}
                step={0.5}
                value={form.magnitude}
                onChange={(e) => setForm((f) => ({ ...f, magnitude: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Peptide Complex Adoption Accelerating"
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Description *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this signal represents and its implications for operators..."
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Region */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Region (optional)</label>
              <input
                type="text"
                value={form.region ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value || null }))}
                placeholder="West Coast"
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Category (optional)</label>
              <input
                type="text"
                value={form.category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value || null }))}
                placeholder="Facial Treatment"
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Confidence Tier</label>
              <select
                value={form.confidence_tier}
                onChange={(e) => setForm((f) => ({ ...f, confidence_tier: e.target.value as 'high' | 'medium' | 'low' }))}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Source */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Source</label>
              <input
                type="text"
                value={form.source ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value || null }))}
                placeholder="Socelle Procurement Network"
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {/* Display order */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Display Order</label>
              <input
                type="number"
                min={0}
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {/* Expires at */}
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1.5">Expires At (optional)</label>
              <input
                type="datetime-local"
                value={form.expires_at ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value || null }))}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm({ ...BLANK }); }}
              className="px-4 py-2 rounded-lg text-sm font-sans font-medium text-graphite/70 hover:bg-graphite/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-sans font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create Signal'}
            </button>
          </div>
        </form>
      )}

      {/* Signal list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-graphite/10 animate-pulse" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-16 text-graphite/40 font-sans text-sm">
          No market signals yet. Create one to populate the Intelligence Hub.
        </div>
      ) : (
        <div className="space-y-2">
          {signals.map((sig) => {
            const DirIcon = DIR_ICON[sig.direction];
            const isExpired = sig.expires_at ? new Date(sig.expires_at) < new Date() : false;
            return (
              <div
                key={sig.id}
                className={`bg-white rounded-xl border px-5 py-4 flex items-center gap-4 transition-colors ${
                  sig.active && !isExpired
                    ? 'border-graphite/10'
                    : 'border-graphite/5 opacity-60'
                }`}
              >
                {/* Direction icon */}
                <DirIcon className={`w-4 h-4 shrink-0 ${DIR_COLOUR[sig.direction]}`} />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-graphite truncate">{sig.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-sans font-medium text-graphite/40 uppercase tracking-wider">
                      {TYPE_LABELS[sig.signal_type]}
                    </span>
                    {sig.category && (
                      <span className="text-[10px] text-graphite/30 font-sans">· {sig.category}</span>
                    )}
                    {sig.region && (
                      <span className="text-[10px] text-graphite/30 font-sans">· {sig.region}</span>
                    )}
                  </div>
                </div>

                {/* Magnitude */}
                <span className={`text-sm font-sans font-semibold shrink-0 ${
                  sig.direction === 'up' ? 'text-[#5F8A72]' : sig.direction === 'down' ? 'text-[#8E6464]' : 'text-graphite/50'
                }`}>
                  {sig.magnitude > 0 ? '+' : ''}{sig.magnitude}%
                </span>

                {/* Confidence badge */}
                <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${CONFIDENCE_BADGE[sig.confidence_tier]}`}>
                  {sig.confidence_tier}
                </span>

                {/* Status badge */}
                <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                  sig.active && !isExpired
                    ? 'bg-[#5F8A72]/10 text-[#5F8A72]'
                    : isExpired
                    ? 'bg-[#A97A4C]/10 text-[#A97A4C]'
                    : 'bg-graphite/5 text-graphite/40'
                }`}>
                  {isExpired ? 'Expired' : sig.active ? 'Live' : 'Hidden'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(sig.id, sig.active)}
                    title={sig.active ? 'Deactivate' : 'Activate'}
                    className="p-1.5 rounded-lg hover:bg-graphite/5 text-graphite/40 hover:text-graphite transition-colors"
                  >
                    {sig.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {sig.active && !isExpired && (
                    <button
                      onClick={() => expireNow(sig.id)}
                      title="Expire now"
                      className="p-1.5 rounded-lg hover:bg-[#8E6464]/5 text-graphite/40 hover:text-[#8E6464] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
