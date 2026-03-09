import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Filter,
  Save,
  X,
} from 'lucide-react';
import { useAudienceSegments } from '../../lib/useAudienceSegments';
import type { SegmentFilter } from '../../lib/useAudienceSegments';

// ── WO-OVERHAUL-15: Audience Segments ───────────────────────────────────
// Portal page — opt-in audience management (ZERO cold email/outreach).
// isLive pattern: DEMO badge when DB not connected.

const FIELD_OPTIONS = [
  { value: 'role', label: 'Role' },
  { value: 'location', label: 'Location' },
  { value: 'plan_tier', label: 'Plan Tier' },
  { value: 'signup_date', label: 'Signup Date' },
  { value: 'last_active', label: 'Last Active' },
  { value: 'total_orders', label: 'Total Orders' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'business_type', label: 'Business Type' },
];

const OPERATOR_OPTIONS: { value: SegmentFilter['operator']; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
  { value: 'in', label: 'Is one of' },
];

interface RuleRow {
  id: string;
  field: string;
  operator: SegmentFilter['operator'];
  value: string;
}

function makeRule(): RuleRow {
  return { id: crypto.randomUUID(), field: 'role', operator: 'equals', value: '' };
}

export default function AudienceSegments() {
  const { segments, isLive, loading, createSegment, refetch } = useAudienceSegments();

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [rules, setRules] = useState<RuleRow[]>([makeRule()]);
  const [saving, setSaving] = useState(false);

  const addRule = () => setRules((r) => [...r, makeRule()]);

  const removeRule = (id: string) => {
    if (rules.length <= 1) return;
    setRules((r) => r.filter((rr) => rr.id !== id));
  };

  const updateRule = (id: string, field: keyof RuleRow, value: string) => {
    setRules((r) => r.map((rr) => (rr.id === id ? { ...rr, [field]: value } : rr)));
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const filters: SegmentFilter[] = rules
        .filter((r) => r.value.trim())
        .map((r) => ({
          field: r.field,
          operator: r.operator,
          value: r.value,
        }));

      await createSegment({
        name: formName.trim(),
        description: formDescription.trim() || null,
        filters,
        estimated_size: 0,
        last_calculated_at: null,
      });

      setShowForm(false);
      setFormName('');
      setFormDescription('');
      setRules([makeRule()]);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormName('');
    setFormDescription('');
    setRules([makeRule()]);
  };

  return (
    <>
      <Helmet>
        <title>Audience Segments | Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-sans text-3xl text-graphite">Audience Segments</h1>
                {!isLive && (
                  <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                    DEMO
                  </span>
                )}
              </div>
              <p className="text-sm text-graphite/60 font-sans mt-1">
                Organize your consented contacts into targeted segments
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-graphite text-white text-sm font-sans font-medium hover:bg-graphite/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Segment
            </button>
          </div>
        </div>

        {/* ── Create Form ─────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-lg text-graphite">Create Segment</h2>
              <button onClick={resetForm} className="text-graphite/60 hover:text-graphite transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-sans text-graphite/60 uppercase tracking-wider mb-1.5">
                  Segment Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Active Estheticians"
                  className="w-full h-10 px-3 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-graphite/60/50 focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-graphite/60 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full h-10 px-3 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-graphite/60/50 focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                />
              </div>
            </div>

            {/* Rule Builder */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-graphite" />
                <span className="text-sm font-sans font-semibold text-graphite">Filter Rules</span>
              </div>

              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div key={rule.id} className="flex items-center gap-3 flex-wrap">
                    {idx > 0 && (
                      <span className="text-xs font-sans font-medium text-graphite/60 w-8 text-center">AND</span>
                    )}
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
                      className="h-9 px-3 rounded-lg border border-accent-soft text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-graphite/20"
                    >
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, 'operator', e.target.value as SegmentFilter['operator'])}
                      className="h-9 px-3 rounded-lg border border-accent-soft text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-graphite/20"
                    >
                      {OPERATOR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 min-w-[120px] h-9 px-3 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-graphite/60/50 focus:outline-none focus:ring-2 focus:ring-graphite/20"
                    />
                    {rules.length > 1 && (
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-graphite/60 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addRule}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans font-medium text-graphite hover:text-graphite/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={resetForm}
                className="h-9 px-4 rounded-full border border-accent-soft text-sm font-sans font-medium text-graphite hover:bg-accent-soft transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName.trim() || saving}
                className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-graphite text-white text-sm font-sans font-medium hover:bg-graphite/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create Segment
              </button>
            </div>
          </div>
        )}

        {/* ── Segments List ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-accent-soft shadow-sm overflow-hidden">
          <div className="p-6 border-b border-accent-soft">
            <h2 className="font-sans text-xl text-graphite">All Segments</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-graphite/60 animate-spin" />
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="w-10 h-10 text-graphite/60/40 mx-auto mb-3" />
              <p className="text-sm text-graphite/60 font-sans">No segments created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="bg-accent-soft/50 text-graphite/60 text-left">
                    <th className="px-6 py-3 font-medium">Segment</th>
                    <th className="px-6 py-3 font-medium text-right">Size</th>
                    <th className="px-6 py-3 font-medium">Filters</th>
                    <th className="px-6 py-3 font-medium text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-soft/50">
                  {segments.map((seg) => (
                    <tr key={seg.id} className="hover:bg-accent-soft/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-graphite">{seg.name}</p>
                        {seg.description && (
                          <p className="text-xs text-graphite/60 mt-0.5">{seg.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-graphite font-medium">
                          {seg.estimated_size.toLocaleString()}
                        </span>
                        <span className="text-graphite/60 ml-1">contacts</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(seg.filters ?? []).slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-accent-soft text-graphite"
                            >
                              {f.field} {f.operator} {String(f.value)}
                            </span>
                          ))}
                          {(seg.filters ?? []).length > 3 && (
                            <span className="text-xs text-graphite/60">
                              +{seg.filters.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-graphite/60">
                        {new Date(seg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
