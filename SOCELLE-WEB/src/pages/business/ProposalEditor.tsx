import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Send,
  Download,
  Save,
} from 'lucide-react';
import { useProposals, type NewProposal, type ProposalLineItem, type ProposalBlock } from '../../lib/useProposals';

// ── WO-OVERHAUL-14: Proposal Editor (Business Portal) ───────────────────
// Data source: proposals table (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
}

interface LineItemRow {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function ProposalEditor() {
  const [searchParams] = useSearchParams();
  const dealId = searchParams.get('deal_id') ?? '';
  const navigate = useNavigate();
  const { isLive, createProposal } = useProposals(dealId || undefined);

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [terms, setTerms] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalValue = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [lineItems]);

  const updateLineItem = useCallback((index: number, field: keyof LineItemRow, value: string | number) => {
    setLineItems((prev) => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    }));
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async (andSend: boolean) => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!dealId) {
      setError('No deal selected. Navigate from a deal page.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const pricingItems: ProposalLineItem[] = lineItems
        .filter((li) => li.description.trim())
        .map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unit_price: li.unitPrice,
          total: li.quantity * li.unitPrice,
        }));

      const blocks: ProposalBlock[] = [
        {
          type: 'cover',
          title: title.trim(),
          content: `Prepared for ${clientName || 'Client'}${clientCompany ? ` at ${clientCompany}` : ''}`,
        },
        {
          type: 'pricing',
          title: 'Pricing',
          content: '',
          line_items: pricingItems,
        },
      ];

      if (terms.trim()) {
        blocks.push({
          type: 'terms',
          title: 'Terms & Conditions',
          content: terms.trim(),
        });
      }

      const proposal: NewProposal = {
        deal_id: dealId,
        title: title.trim(),
        blocks,
        total_value: totalValue,
        valid_until: validUntil || undefined,
      };

      const created = await createProposal(proposal);

      if (andSend && created) {
        // In the future, trigger a send-email Edge Function
        // For now, just mark status as sent
        // updateProposal(created.id, { status: 'sent' });
      }

      navigate(`/portal/sales/deals/${dealId}`);
    } catch {
      setError('Failed to save proposal.');
    } finally {
      setSubmitting(false);
    }
  }, [title, dealId, lineItems, terms, validUntil, totalValue, clientName, clientCompany, createProposal, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          to={dealId ? `/portal/sales/deals/${dealId}` : '/portal/sales'}
          className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-sans font-semibold text-graphite">New Proposal</h1>
          {!isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
              <AlertCircle className="w-3 h-3" />
              DEMO
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-signal-down/10 text-signal-down text-sm font-sans px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Title + Client Info */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-4">
        <h2 className="text-base font-sans font-semibold text-graphite">Proposal Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-sans text-graphite/60 mb-1 block">Proposal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quarterly Treatment Package"
              className="w-full h-10 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-sans text-graphite/60 mb-1 block">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full h-10 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-xs font-sans text-graphite/60 mb-1 block">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full h-10 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-xs font-sans text-graphite/60 mb-1 block">Company</label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Glow Spa"
                className="w-full h-10 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6">
        <h2 className="text-base font-sans font-semibold text-graphite mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-graphite/8">
                <th className="px-3 py-2 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider w-1/2">Product / Service</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider w-20">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider w-28">Unit Price</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider w-28">Total</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite/5">
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full h-8 px-2 border border-graphite/15 rounded text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value) || 1)}
                      className="w-full h-8 px-2 border border-graphite/15 rounded text-sm font-sans text-graphite bg-white text-right focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value) || 0)}
                      className="w-full h-8 px-2 border border-graphite/15 rounded text-sm font-sans text-graphite bg-white text-right focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-sans text-graphite font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                  <td className="px-3 py-2">
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(idx)}
                        className="w-8 h-8 flex items-center justify-center text-graphite/30 hover:text-signal-down transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-graphite/10">
                <td colSpan={3} className="px-3 py-3 text-right text-sm font-sans font-semibold text-graphite">
                  Total
                </td>
                <td className="px-3 py-3 text-right text-lg font-sans font-semibold text-graphite">
                  {formatCurrency(totalValue)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <button
          onClick={addLineItem}
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-sans text-accent hover:text-accent/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add line item
        </button>
      </div>

      {/* Terms + Validity */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-4">
        <h2 className="text-base font-sans font-semibold text-graphite">Terms & Validity</h2>
        <div>
          <label className="text-xs font-sans text-graphite/60 mb-1 block">Terms & Conditions</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Payment terms, delivery schedule, warranty details..."
            rows={4}
            className="w-full px-3 py-2 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
        </div>
        <div className="max-w-xs">
          <label className="text-xs font-sans text-graphite/60 mb-1 block">Valid Until</label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full h-10 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={submitting}
          className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={submitting}
          className="inline-flex items-center gap-2 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Save & Send
        </button>
        <button
          onClick={() => {/* Future: generate PDF */}}
          className="inline-flex items-center gap-2 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
}
