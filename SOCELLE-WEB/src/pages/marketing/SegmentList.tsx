import { useState } from 'react';
import { Users, Plus, AlertCircle, Loader2, X } from 'lucide-react';
import { useAudienceSegments } from '../../lib/useAudienceSegments';
import type { AudienceSegment, SegmentFilter } from '../../lib/useAudienceSegments';

// ── WO-OVERHAUL-15: Segment List (/marketing/segments) ───────────────
// Data source: audience_segments table via useAudienceSegments()
// isLive flag drives DEMO badge.

const FILTER_FIELDS = ['role', 'location', 'plan_tier', 'signup_date', 'last_active'];
const FILTER_OPERATORS: SegmentFilter['operator'][] = ['equals', 'contains', 'gt', 'lt', 'in'];

export default function SegmentList() {
  const { segments, isLive, loading, createSegment } = useAudienceSegments();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [filters, setFilters] = useState<SegmentFilter[]>([{ field: 'role', operator: 'equals', value: '' }]);
  const [creating, setCreating] = useState(false);

  const addFilter = () => setFilters([...filters, { field: 'role', operator: 'equals', value: '' }]);
  const removeFilter = (i: number) => setFilters(filters.filter((_, idx) => idx !== i));
  const updateFilter = (i: number, updates: Partial<SegmentFilter>) => {
    setFilters(filters.map((f, idx) => idx === i ? { ...f, ...updates } : f));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await createSegment({
      name: newName.trim(),
      description: newDescription.trim() || null,
      filters,
      estimated_size: 0,
      last_calculated_at: null,
    });
    setCreating(false);
    setShowCreate(false);
    setNewName('');
    setNewDescription('');
    setFilters([{ field: 'role', operator: 'equals', value: '' }]);
  };

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Audience Segments</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">Define and manage audience segments for targeted campaigns</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Segment
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-graphite font-sans">Create Segment</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg text-graphite/30 hover:text-graphite transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Segment Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. High-value operators"
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description"
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              {/* Filter Builder */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Filters</label>
                <div className="space-y-2">
                  {filters.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={f.field}
                        onChange={(e) => updateFilter(i, { field: e.target.value })}
                        className="h-9 px-2 text-xs font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg"
                      >
                        {FILTER_FIELDS.map((ff) => <option key={ff} value={ff}>{ff}</option>)}
                      </select>
                      <select
                        value={f.operator}
                        onChange={(e) => updateFilter(i, { operator: e.target.value as SegmentFilter['operator'] })}
                        className="h-9 px-2 text-xs font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg"
                      >
                        {FILTER_OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <input
                        type="text"
                        value={String(f.value)}
                        onChange={(e) => updateFilter(i, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1 h-9 px-2 text-xs font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg"
                      />
                      {filters.length > 1 && (
                        <button onClick={() => removeFilter(i)} className="p-1 text-graphite/30 hover:text-signal-down transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addFilter} className="mt-2 text-xs font-medium text-accent hover:text-accent-hover font-sans">
                  + Add filter
                </button>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowCreate(false)} className="h-9 px-4 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="h-9 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors disabled:opacity-40"
                >
                  {creating ? 'Creating...' : 'Create Segment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Segments Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : segments.length === 0 ? (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-12 text-center">
            <Users className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
            <p className="text-sm text-graphite/50 font-sans">No audience segments yet. Create one to target specific groups.</p>
          </div>
        ) : (
          <div className="bg-mn-card border border-graphite/8 rounded-xl overflow-hidden">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Est. Size</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Filters</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Last Calculated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {segments.map((seg: AudienceSegment) => (
                  <tr key={seg.id} className="hover:bg-mn-surface/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-graphite">{seg.name}</p>
                      {seg.description && <p className="text-xs text-graphite/40 mt-0.5">{seg.description}</p>}
                    </td>
                    <td className="px-5 py-3 text-graphite/60">{seg.estimated_size.toLocaleString()}</td>
                    <td className="px-5 py-3 text-graphite/40 text-xs">{seg.filters?.length || 0} rules</td>
                    <td className="px-5 py-3 text-graphite/40 text-xs">
                      {seg.last_calculated_at ? new Date(seg.last_calculated_at).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
