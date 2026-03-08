import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useDeal, useDeals, type NewDeal } from '../../lib/useDeals';
import { usePipelines } from '../../lib/usePipelines';

// ── V2-HUBS-09: Deal Editor (Create / Edit) ─────────────────────────────
// Data source: deals + sales_pipelines (LIVE when DB-connected)
// Full CRUD: create new deal with all fields, edit existing deal.

export default function DealEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const pipelineParam = searchParams.get('pipeline') ?? '';
  const stageParam = searchParams.get('stage') ?? '';
  const isEditing = !!id;

  const { deal, loading: dealLoading } = useDeal(id);
  const { createDeal, updateDeal } = useDeals();
  const { pipelines, loading: pLoading, isLive } = usePipelines();
  const loading = pLoading || (isEditing && dealLoading);

  const [pipelineId, setPipelineId] = useState(pipelineParam);
  const [stageId, setStageId] = useState(stageParam);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('50');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (deal) {
      setPipelineId(deal.pipeline_id);
      setStageId(deal.stage_id);
      setTitle(deal.title);
      setValue(String(deal.value));
      setProbability(String(deal.probability));
      setContactName(deal.contact_name ?? '');
      setContactEmail(deal.contact_email ?? '');
      setCompanyName(deal.company_name ?? '');
      setExpectedCloseDate(deal.expected_close_date ?? '');
    }
  }, [deal]);

  // Set defaults from pipeline
  useEffect(() => {
    if (!pipelineId && pipelines.length > 0) {
      const def = pipelines.find((p) => p.is_default) ?? pipelines[0];
      setPipelineId(def.id);
      if (!stageId && def.stages.length > 0) {
        setStageId(def.stages[0].id);
      }
    }
  }, [pipelineId, stageId, pipelines]);

  const selectedPipeline = pipelines.find((p) => p.id === pipelineId);
  const stages = selectedPipeline?.stages ?? [];

  const handleSave = useCallback(async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!pipelineId) { setError('Select a pipeline.'); return; }
    if (!stageId) { setError('Select a stage.'); return; }
    setError(null);
    setSaving(true);
    try {
      if (isEditing && id) {
        await updateDeal(id, {
          pipeline_id: pipelineId,
          stage_id: stageId,
          title: title.trim(),
          value: Number(value) || 0,
          probability: Number(probability) || 50,
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          company_name: companyName.trim() || null,
          expected_close_date: expectedCloseDate || null,
        });
        navigate(`/sales/deals/${id}`);
      } else {
        const newDeal: NewDeal = {
          pipeline_id: pipelineId,
          stage_id: stageId,
          title: title.trim(),
          value: Number(value) || 0,
          probability: Number(probability) || 50,
          contact_name: contactName.trim() || undefined,
          contact_email: contactEmail.trim() || undefined,
          company_name: companyName.trim() || undefined,
          expected_close_date: expectedCloseDate || undefined,
        };
        const created = await createDeal(newDeal);
        navigate(`/sales/deals/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save deal.');
    } finally {
      setSaving(false);
    }
  }, [isEditing, id, pipelineId, stageId, title, value, probability, contactName, contactEmail, companyName, expectedCloseDate, createDeal, updateDeal, navigate]);

  const handleDelete = useCallback(async () => {
    if (!id || !window.confirm('Are you sure you want to delete this deal? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await updateDeal(id, { status: 'lost', lost_reason: 'Deleted by user' });
      navigate('/sales');
    } catch {
      setError('Failed to delete deal.');
    } finally {
      setDeleting(false);
    }
  }, [id, updateDeal, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-sans font-semibold text-graphite">
            {isEditing ? 'Edit Deal' : 'New Deal'}
          </h1>
          {!isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
              <AlertCircle className="w-3 h-3" />
              DEMO
            </span>
          )}
        </div>
        {isEditing && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 h-9 px-4 border border-signal-down/30 text-signal-down text-sm font-sans font-semibold rounded-full hover:bg-signal-down/5 transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        )}
      </div>

      {error && (
        <div className="bg-signal-down/10 text-signal-down text-sm font-sans px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">
            Deal Title <span className="text-signal-down">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hydrafacial supplier agreement"
            className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* Pipeline + Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Pipeline</label>
            <select
              value={pipelineId}
              onChange={(e) => {
                setPipelineId(e.target.value);
                const p = pipelines.find((pl) => pl.id === e.target.value);
                if (p && p.stages.length > 0) setStageId(p.stages[0].id);
              }}
              className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Select pipeline...</option>
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.is_default ? ' (Default)' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Stage</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Select stage...</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Value + Probability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Deal Value ($)</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Probability (%)</label>
            <input
              type="number"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              placeholder="50"
              min={0}
              max={100}
              className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        {/* Expected Close Date */}
        <div>
          <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Expected Close Date</label>
          <input
            type="date"
            value={expectedCloseDate}
            onChange={(e) => setExpectedCloseDate(e.target.value)}
            className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* Contact Info */}
        <div className="border-t border-graphite/8 pt-5">
          <h3 className="text-sm font-sans font-semibold text-graphite mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Spa Group"
              className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-1.5 h-10 px-6 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Save Changes' : 'Create Deal'}
        </button>
      </div>
    </div>
  );
}
