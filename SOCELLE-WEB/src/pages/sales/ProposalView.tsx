import { useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useProposal } from '../../lib/useProposals';
import { supabase } from '../../lib/supabase';

// ── WO-OVERHAUL-14: Proposal View (Public, no auth required) ────────────
// Data source: proposals (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const { proposal, loading, isLive, reload } = useProposal(id);

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleAccept = useCallback(async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      // Capture signature from canvas
      const signatureData = canvasRef.current?.toDataURL() ?? null;
      await supabase
        .from('proposals')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          signature_data: signatureData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      setAccepted(true);
      reload();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [id, reload]);

  const handleReject = useCallback(async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      setRejected(true);
      reload();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [id, rejectReason, reload]);

  // Simple canvas drawing for signature
  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#141418';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }, [isDrawing]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-graphite/20 mx-auto mb-3" />
          <p className="text-graphite/50 font-sans">Proposal not found.</p>
        </div>
      </div>
    );
  }

  const isAccepted = proposal.status === 'accepted' || accepted;
  const isRejected = proposal.status === 'rejected' || rejected;
  const canRespond = proposal.status === 'sent' && !isAccepted && !isRejected;

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Status banner */}
        {!isLive && (
          <div className="bg-signal-warn/10 text-signal-warn text-xs font-sans font-medium px-4 py-2 text-center rounded-xl">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            DEMO -- This proposal uses demonstration data.
          </div>
        )}

        {isAccepted && (
          <div className="bg-signal-up/10 text-signal-up text-sm font-sans font-semibold px-4 py-3 text-center rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Proposal Accepted
          </div>
        )}

        {isRejected && (
          <div className="bg-signal-down/10 text-signal-down text-sm font-sans font-semibold px-4 py-3 text-center rounded-xl flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4" />
            Proposal Declined
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-sans font-semibold text-graphite">{proposal.title}</h1>
          <p className="text-sm font-sans text-graphite/50 mt-2">
            Created {formatDate(proposal.created_at)}
            {proposal.valid_until && ` | Valid until ${formatDate(proposal.valid_until)}`}
          </p>
        </div>

        {/* Blocks */}
        {proposal.blocks.map((block, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-3">
            <h2 className="text-lg font-sans font-semibold text-graphite">{block.title || block.type}</h2>
            {block.content && (
              <p className="text-sm font-sans text-graphite/70 whitespace-pre-wrap leading-relaxed">{block.content}</p>
            )}
            {block.type === 'pricing' && block.line_items && block.line_items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans mt-2">
                  <thead>
                    <tr className="border-b border-graphite/10">
                      <th className="text-left py-2 text-xs text-graphite/50 font-semibold uppercase">Item</th>
                      <th className="text-right py-2 text-xs text-graphite/50 font-semibold uppercase">Qty</th>
                      <th className="text-right py-2 text-xs text-graphite/50 font-semibold uppercase">Price</th>
                      <th className="text-right py-2 text-xs text-graphite/50 font-semibold uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.line_items.map((li, j) => (
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
                      <td colSpan={3} className="py-3 text-right font-semibold text-graphite">Total</td>
                      <td className="py-3 text-right text-xl font-semibold text-graphite">{formatCurrency(proposal.total_value)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* Signature + Accept/Reject */}
        {canRespond && (
          <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-4">
            <h3 className="text-lg font-sans font-semibold text-graphite">Your Response</h3>

            <div>
              <label className="block text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Signature</label>
              <div className="border border-graphite/15 rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={120}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                />
              </div>
              <button onClick={clearSignature} className="text-xs font-sans text-accent hover:underline mt-1">
                Clear signature
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 h-10 px-6 bg-signal-up text-white text-sm font-sans font-semibold rounded-full hover:bg-signal-up/90 transition-colors disabled:opacity-40"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Accept Proposal
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 h-10 px-6 border border-signal-down/30 text-signal-down text-sm font-sans font-semibold rounded-full hover:bg-signal-down/5 transition-colors disabled:opacity-40"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>

            {showReject && (
              <div className="space-y-3 pt-2 border-t border-graphite/8">
                <textarea
                  placeholder="Reason for declining (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={submitting}
                    className="h-9 px-5 bg-signal-down text-white text-sm font-sans font-semibold rounded-full hover:bg-signal-down/90 transition-colors disabled:opacity-40"
                  >
                    Confirm Decline
                  </button>
                  <button
                    onClick={() => setShowReject(false)}
                    className="h-9 px-5 border border-graphite/15 text-graphite text-sm font-sans rounded-full hover:bg-mn-surface transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-xs font-sans text-graphite/30">Powered by Socelle</p>
        </div>
      </div>
    </div>
  );
}
