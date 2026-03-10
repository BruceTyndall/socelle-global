import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Send,
  Loader2,
  FileText,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useProposals, type ProposalBlock, type ProposalLineItem, type NewProposal } from '../../lib/useProposals';
import { useDeals } from '../../lib/useDeals';

// ── WO-OVERHAUL-14: Proposal Builder ────────────────────────────────────
// Data source: proposals + deals (LIVE when DB-connected)

const BLOCK_TYPES: { value: ProposalBlock['type']; label: string }[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'about', label: 'About Us' },
  { value: 'solution', label: 'Solution' },
  { value: 'pricing', label: 'Pricing Table' },
  { value: 'terms', label: 'Terms' },
  { value: 'signature', label: 'Signature' },
];

function emptyBlock(type: ProposalBlock['type']): ProposalBlock {
  const b: ProposalBlock = { type, title: '', content: '' };
  if (type === 'pricing') b.line_items = [];
  return b;
}

function emptyLineItem(): ProposalLineItem {
  return { description: '', quantity: 1, unit_price: 0, total: 0 };
}

export default function ProposalBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dealIdParam = searchParams.get('deal') ?? '';
  const { deals, loading: dealsLoading, error: dealsError, reload: dealsReload } = useDeals();
  const { createProposal, updateProposal } = useProposals();

  const [dealId, setDealId] = useState(dealIdParam);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ProposalBlock[]>([
    emptyBlock('cover'),
    emptyBlock('about'),
    emptyBlock('solution'),
    emptyBlock('pricing'),
    emptyBlock('terms'),
    emptyBlock('signature'),
  ]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const totalValue = blocks
    .filter((b) => b.type === 'pricing')
    .flatMap((b) => b.line_items ?? [])
    .reduce((s, li) => s + li.total, 0);

  const updateBlock = useCallback((idx: number, updates: Partial<ProposalBlock>) => {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, ...updates } : b)));
  }, []);

  const removeBlock = useCallback((idx: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const addBlock = useCallback((type: ProposalBlock['type']) => {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
  }, []);

  const updateLineItem = useCallback((blockIdx: number, liIdx: number, updates: Partial<ProposalLineItem>) => {
    setBlocks((prev) =>
      prev.map((b, bi) => {
        if (bi !== blockIdx || !b.line_items) return b;
        const items = b.line_items.map((li, li2) => {
          if (li2 !== liIdx) return li;
          const merged = { ...li, ...updates };
          merged.total = merged.quantity * merged.unit_price;
          return merged;
        });
        return { ...b, line_items: items };
      })
    );
  }, []);

  const addLineItem = useCallback((blockIdx: number) => {
    setBlocks((prev) =>
      prev.map((b, bi) => {
        if (bi !== blockIdx) return b;
        return { ...b, line_items: [...(b.line_items ?? []), emptyLineItem()] };
      })
    );
  }, []);

  const removeLineItem = useCallback((blockIdx: number, liIdx: number) => {
    setBlocks((prev) =>
      prev.map((b, bi) => {
        if (bi !== blockIdx || !b.line_items) return b;
        return { ...b, line_items: b.line_items.filter((_, i) => i !== liIdx) };
      })
    );
  }, []);

  const handleSave = useCallback(async (status: 'draft' | 'sent') => {
    if (!dealId || !title.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const proposal: NewProposal = {
        deal_id: dealId,
        title: title.trim(),
        blocks,
        total_value: totalValue,
      };
      const created = await createProposal(proposal);
      if (status === 'sent') {
        await updateProposal(created.id, { status: 'sent' });
      }
      navigate(`/sales/proposals/${created.id}/view`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save proposal. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [dealId, title, blocks, totalValue, createProposal, updateProposal, navigate]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  // Loading state — skeleton shimmer while deals load
  if (dealsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-5 w-16 bg-graphite/8 rounded animate-pulse" />
        <div className="h-8 w-48 bg-graphite/8 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-graphite/8 rounded-xl animate-pulse" />
          <div className="h-10 bg-graphite/8 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-3">
              <div className="h-4 w-20 bg-graphite/8 rounded animate-pulse" />
              <div className="h-9 bg-graphite/5 rounded-lg animate-pulse" />
              <div className="h-16 bg-graphite/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state — deal list failed to load
  if (dealsError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-signal-down mx-auto mb-3" />
          <p className="text-graphite font-sans font-medium">Could not load deals</p>
          <p className="text-graphite/60 font-sans text-sm mt-1">{dealsError}</p>
          <button
            onClick={() => dealsReload()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm font-sans"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state — no open deals exist to attach a proposal to
  const openDeals = deals.filter((d) => d.status === 'open');
  if (openDeals.length === 0 && !dealIdParam) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-sans font-semibold text-graphite mb-2">No open deals</h2>
          <p className="text-graphite/60 font-sans text-sm max-w-sm mx-auto mb-6">
            Proposals must be linked to an open deal. Create a deal in your pipeline first, then return here to build a proposal.
          </p>
          <button
            onClick={() => navigate('/sales/pipeline')}
            className="inline-flex items-center gap-2 h-10 px-6 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Go to Pipeline
          </button>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <button onClick={() => setPreview(false)} className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to editor
        </button>
        <h1 className="text-3xl font-sans font-semibold text-graphite">{title || 'Untitled Proposal'}</h1>
        {blocks.map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-6">
            <h2 className="text-lg font-sans font-semibold text-graphite mb-3">{b.title || b.type}</h2>
            {b.content && <p className="text-sm font-sans text-graphite/70 whitespace-pre-wrap">{b.content}</p>}
            {b.type === 'pricing' && b.line_items && b.line_items.length > 0 && (
              <table className="w-full mt-4 text-sm font-sans">
                <thead>
                  <tr className="border-b border-graphite/10">
                    <th className="text-left py-2 text-xs text-graphite/50">Item</th>
                    <th className="text-right py-2 text-xs text-graphite/50">Qty</th>
                    <th className="text-right py-2 text-xs text-graphite/50">Price</th>
                    <th className="text-right py-2 text-xs text-graphite/50">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {b.line_items.map((li, j) => (
                    <tr key={j} className="border-b border-graphite/5">
                      <td className="py-2 text-graphite">{li.description}</td>
                      <td className="py-2 text-right text-graphite/70">{li.quantity}</td>
                      <td className="py-2 text-right text-graphite/70">{formatCurrency(li.unit_price)}</td>
                      <td className="py-2 text-right font-semibold text-graphite">{formatCurrency(li.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-semibold text-graphite">Total</td>
                    <td className="py-2 text-right font-semibold text-graphite">{formatCurrency(totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-sans font-semibold text-graphite">New Proposal</h1>

      {/* Save error banner */}
      {saveError && (
        <div className="flex items-start gap-3 bg-signal-down/5 border border-signal-down/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-signal-down flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-sans font-medium text-signal-down">Save failed</p>
            <p className="text-xs font-sans text-graphite/60 mt-0.5">{saveError}</p>
          </div>
          <button onClick={() => setSaveError(null)} className="text-graphite/30 hover:text-graphite transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Deal</label>
          <select
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
            className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Select deal...</option>
            {openDeals.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-1">Proposal Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q1 Intelligence Package"
            className="w-full h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-graphite/30" />
                <span className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider">{block.type}</span>
              </div>
              <button onClick={() => removeBlock(idx)} className="text-graphite/30 hover:text-signal-down transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Section title"
              value={block.title}
              onChange={(e) => updateBlock(idx, { title: e.target.value })}
              className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <textarea
              placeholder="Content..."
              value={block.content}
              onChange={(e) => updateBlock(idx, { content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm font-sans text-graphite bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            {/* Pricing line items */}
            {block.type === 'pricing' && (
              <div className="space-y-2">
                {(block.line_items ?? []).map((li, liIdx) => (
                  <div key={liIdx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={li.description}
                      onChange={(e) => updateLineItem(idx, liIdx, { description: e.target.value })}
                      className="flex-1 h-8 px-2 border border-graphite/10 rounded text-xs font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={li.quantity}
                      onChange={(e) => updateLineItem(idx, liIdx, { quantity: Number(e.target.value) })}
                      className="w-16 h-8 px-2 border border-graphite/10 rounded text-xs font-sans text-graphite bg-white text-right focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={li.unit_price}
                      onChange={(e) => updateLineItem(idx, liIdx, { unit_price: Number(e.target.value) })}
                      className="w-24 h-8 px-2 border border-graphite/10 rounded text-xs font-sans text-graphite bg-white text-right focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <span className="text-xs font-sans text-graphite/50 w-20 text-right">{formatCurrency(li.total)}</span>
                    <button onClick={() => removeLineItem(idx, liIdx)} className="text-graphite/30 hover:text-signal-down">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addLineItem(idx)}
                  className="flex items-center gap-1 text-xs font-sans text-accent hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add line item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add block */}
      <div className="flex flex-wrap gap-2">
        {BLOCK_TYPES.map((bt) => (
          <button
            key={bt.value}
            onClick={() => addBlock(bt.value)}
            className="h-8 px-3 border border-dashed border-graphite/20 text-xs font-sans text-graphite/50 rounded-lg hover:border-accent hover:text-accent transition-colors"
          >
            + {bt.label}
          </button>
        ))}
      </div>

      {/* Total + actions */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-graphite/8 p-5">
        <div>
          <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">Total Value</span>
          <p className="text-2xl font-sans font-semibold text-graphite">{formatCurrency(totalValue)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(true)}
            className="inline-flex items-center gap-1.5 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !dealId || !title.trim()}
            className="h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('sent')}
            disabled={saving || !dealId || !title.trim()}
            className="inline-flex items-center gap-1.5 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
