import { useState } from 'react';
import { Layers, Plus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmSegments, type NewCrmSegment, type SegmentFilter } from '../../lib/useCrmSegments';
import { useCrmContacts } from '../../lib/useCrmContacts';

const LIFECYCLE_OPTIONS = ['lead', 'prospect', 'client', 'vip', 'inactive', 'churned'];
const TYPE_OPTIONS = ['client', 'lead', 'vendor', 'partner', 'other'];

export default function CrmSegments() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const { segments, loading, isLive, createSegment, deleteSegment } = useCrmSegments(businessId);
  const { contacts } = useCrmContacts(businessId);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filterRules, setFilterRules] = useState<SegmentFilter>({});
  const [saving, setSaving] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  // Count contacts matching a segment's filter rules
  const countMatches = (rules: SegmentFilter): number => {
    let result = contacts;
    if (rules.lifecycle_stages && rules.lifecycle_stages.length > 0) {
      result = result.filter(c => rules.lifecycle_stages!.includes(c.lifecycle_stage));
    }
    if (rules.types && rules.types.length > 0) {
      result = result.filter(c => rules.types!.includes(c.type));
    }
    if (rules.min_visits != null) {
      result = result.filter(c => c.total_visits >= rules.min_visits!);
    }
    if (rules.max_visits != null) {
      result = result.filter(c => c.total_visits <= rules.max_visits!);
    }
    if (rules.min_spend != null) {
      result = result.filter(c => c.total_spend >= rules.min_spend!);
    }
    if (rules.max_spend != null) {
      result = result.filter(c => c.total_spend <= rules.max_spend!);
    }
    if (rules.source) {
      result = result.filter(c => c.source?.toLowerCase().includes(rules.source!.toLowerCase()));
    }
    if (rules.has_email) {
      result = result.filter(c => !!c.email);
    }
    return result.length;
  };

  const handleCreate = async () => {
    if (!businessId || !name.trim()) return;
    setSaving(true);
    try {
      const payload: NewCrmSegment = {
        business_id: businessId,
        name: name.trim(),
        description: description.trim() || undefined,
        filter_rules: filterRules,
      };
      await createSegment(payload);
      setName('');
      setDescription('');
      setFilterRules({});
      setShowCreate(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleLifecycle = (stage: string) => {
    setFilterRules(prev => {
      const current = prev.lifecycle_stages ?? [];
      const updated = current.includes(stage) ? current.filter(s => s !== stage) : [...current, stage];
      return { ...prev, lifecycle_stages: updated.length > 0 ? updated : undefined };
    });
  };

  const toggleType = (type: string) => {
    setFilterRules(prev => {
      const current = prev.types ?? [];
      const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, types: updated.length > 0 ? updated : undefined };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Segments</h1>
          <p className="text-sm text-graphite/60 mt-1">{segments.length} segments</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button onClick={() => setShowCreate(s => !s)} className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" /> New Segment
          </button>
        </div>
      </div>

      {/* Create Segment Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Create Segment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., VIP Clients" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>

          {/* Filter Rules */}
          <div className="border-t border-accent-soft/20 pt-4 space-y-3">
            <p className="text-xs font-medium text-graphite/60 uppercase tracking-wider">Filter Rules</p>

            <div>
              <label className="text-xs text-graphite/60 mb-1 block">Lifecycle Stage</label>
              <div className="flex flex-wrap gap-1.5">
                {LIFECYCLE_OPTIONS.map(stage => (
                  <button key={stage} onClick={() => toggleLifecycle(stage)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${filterRules.lifecycle_stages?.includes(stage) ? 'bg-accent text-white border-accent' : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'}`}>
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-graphite/60 mb-1 block">Contact Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map(type => (
                  <button key={type} onClick={() => toggleType(type)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${filterRules.types?.includes(type) ? 'bg-accent text-white border-accent' : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-graphite/60 mb-1 block">Min Visits</label>
                <input type="number" value={filterRules.min_visits ?? ''} onChange={e => setFilterRules(p => ({ ...p, min_visits: e.target.value ? parseInt(e.target.value, 10) : undefined }))} className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="text-xs text-graphite/60 mb-1 block">Max Visits</label>
                <input type="number" value={filterRules.max_visits ?? ''} onChange={e => setFilterRules(p => ({ ...p, max_visits: e.target.value ? parseInt(e.target.value, 10) : undefined }))} className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="text-xs text-graphite/60 mb-1 block">Min Spend ($)</label>
                <input type="number" value={filterRules.min_spend ?? ''} onChange={e => setFilterRules(p => ({ ...p, min_spend: e.target.value ? parseFloat(e.target.value) : undefined }))} className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="text-xs text-graphite/60 mb-1 block">Max Spend ($)</label>
                <input type="number" value={filterRules.max_spend ?? ''} onChange={e => setFilterRules(p => ({ ...p, max_spend: e.target.value ? parseFloat(e.target.value) : undefined }))} className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-graphite">
              <input type="checkbox" checked={filterRules.has_email ?? false} onChange={e => setFilterRules(p => ({ ...p, has_email: e.target.checked || undefined }))} className="w-4 h-4 rounded border-accent-soft/30 text-accent focus:ring-accent/50" />
              Has email address
            </label>
          </div>

          {/* Preview count */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-2">
            <p className="text-sm text-accent font-medium">
              {countMatches(filterRules)} contacts match this segment
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="h-8 px-4 text-xs text-graphite/60 hover:text-graphite">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !name.trim()} className="h-8 px-4 bg-mn-dark text-white text-xs font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Segment'}
            </button>
          </div>
        </div>
      )}

      {/* Segment List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-accent-soft/30 p-5 animate-pulse">
              <div className="h-4 bg-accent-soft/20 rounded w-40 mb-2" />
              <div className="h-3 bg-accent-soft/20 rounded w-60" />
            </div>
          ))}
        </div>
      ) : segments.length === 0 ? (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-8 text-center">
          <Layers className="w-10 h-10 text-accent-soft mx-auto mb-3" />
          <p className="text-sm text-graphite/60">No segments yet</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1 text-sm font-medium text-accent mt-2 hover:text-accent-hover">
            <Plus className="w-4 h-4" /> Create your first segment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map(seg => {
            const matchCount = countMatches(seg.filter_rules);
            const isActive = activeSegmentId === seg.id;
            const rules = seg.filter_rules;
            return (
              <div key={seg.id} className="bg-white rounded-xl border border-accent-soft/30 p-5">
                <div className="flex items-start justify-between">
                  <button onClick={() => setActiveSegmentId(isActive ? null : seg.id)} className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-accent" />
                      <p className="text-sm font-medium text-graphite">{seg.name}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" /> {matchCount}
                      </span>
                    </div>
                    {seg.description && <p className="text-xs text-graphite/60 mt-1">{seg.description}</p>}
                  </button>
                  <button onClick={() => deleteSegment(seg.id)} className="text-graphite/60 hover:text-signal-down transition-colors flex-shrink-0 ml-3" title="Delete segment">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter rules summary */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {rules.lifecycle_stages?.map(s => (
                    <span key={s} className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Stage: {s}</span>
                  ))}
                  {rules.types?.map(t => (
                    <span key={t} className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Type: {t}</span>
                  ))}
                  {rules.min_visits != null && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Visits &ge; {rules.min_visits}</span>}
                  {rules.max_visits != null && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Visits &le; {rules.max_visits}</span>}
                  {rules.min_spend != null && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Spend &ge; ${rules.min_spend}</span>}
                  {rules.max_spend != null && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Spend &le; ${rules.max_spend}</span>}
                  {rules.has_email && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Has email</span>}
                  {rules.source && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">Source: {rules.source}</span>}
                </div>

                <p className="text-[10px] text-graphite/60 mt-2">
                  Created {new Date(seg.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
