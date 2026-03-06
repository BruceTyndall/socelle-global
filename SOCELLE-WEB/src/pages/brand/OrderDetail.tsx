import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertCircle, Check, Truck, RotateCcw, MessageSquare } from 'lucide-react';
import { Badge } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { sendOrderStatusEmailByOrderId } from '../../lib/emailService';

// ── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_name: string;
  product_type: string;
  sku: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
}

interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  notes: string | null;
  brand_notes: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  business_name: string;
  brand_name: string;
  return_status: string;
  return_requested_at: string | null;
  return_reason: string | null;
  items: OrderItem[];
}

// ── Status config ─────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'amber' | 'navy' | 'gray' | 'red';

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  pending_payment: { label: 'Pending Payment', variant: 'gray' },
  submitted:       { label: 'Submitted',       variant: 'gray' },
  reviewing:       { label: 'Reviewing',        variant: 'amber' },
  sent_to_brand:   { label: 'Sent to Brand',    variant: 'amber' },
  confirmed:       { label: 'Confirmed',         variant: 'navy' },
  fulfilled:       { label: 'Fulfilled',         variant: 'navy' },
  shipped:         { label: 'Shipped',           variant: 'green' },
  delivered:       { label: 'Delivered',         variant: 'green' },
  cancelled:       { label: 'Cancelled',         variant: 'red' },
  refunded:        { label: 'Refunded',          variant: 'red' },
};

// Next statuses a brand can set, keyed by current status
const BRAND_STATUS_OPTIONS: Record<string, string[]> = {
  sent_to_brand: ['confirmed', 'cancelled'],
  confirmed:     ['fulfilled', 'cancelled'],
  fulfilled:     ['shipped', 'cancelled'],
  shipped:       ['delivered'],
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirm order',
  fulfilled: 'Mark fulfilled',
  shipped:   'Mark shipped',
  delivered: 'Mark delivered',
  cancelled: 'Cancel order',
};

const CARRIERS = [
  'UPS', 'FedEx', 'USPS', 'DHL', 'OnTrac', 'LaserShip', 'Other',
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function BrandOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { brandId } = useAuth();

  const [order, setOrder]         = useState<OrderData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Status update state
  const [newStatus, setNewStatus]             = useState('');
  const [trackingNumber, setTrackingNumber]   = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [saving, setSaving]                   = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [saveError, setSaveError]             = useState<string | null>(null);
  const [resolveReturnLoading, setResolveReturnLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (brandId && id) fetchOrder();
    else setLoading(false);
  }, [brandId, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select(`
          id, order_number, created_at, status, subtotal,
          notes, brand_notes, tracking_number, tracking_carrier,
          return_status, return_requested_at, return_reason,
          businesses ( name ),
          brands ( name )
        `)
        .eq('id', id!)
        .eq('brand_id', brandId!)
        .single();

      if (orderErr) throw orderErr;
      if (!orderData) throw new Error('Order not found');

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, product_name, product_type, sku, unit_price, qty, line_total')
        .eq('order_id', id!)
        .order('product_name');

      setOrder({
        id:                   orderData.id,
        order_number:         orderData.order_number,
        created_at:           orderData.created_at,
        status:               orderData.status,
        subtotal:             orderData.subtotal,
        notes:                orderData.notes,
        brand_notes:          orderData.brand_notes,
        tracking_number:      orderData.tracking_number,
        tracking_carrier:     orderData.tracking_carrier,
        business_name:        (orderData as any).businesses?.name || 'Unknown Retailer',
        brand_name:           (orderData as any).brands?.name || 'Brand',
        return_status:        orderData.return_status ?? 'none',
        return_requested_at:  orderData.return_requested_at ?? null,
        return_reason:        orderData.return_reason ?? null,
        items:                itemsData || [],
      });

      // Pre-fill tracking if already set
      setTrackingNumber(orderData.tracking_number || '');
      setTrackingCarrier(orderData.tracking_carrier || '');
    } catch {
      setError('Unable to load order. It may not exist or you may not have access.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!order || !newStatus) return;

    // Require tracking for shipped status
    if (newStatus === 'shipped' && !trackingNumber.trim()) {
      setSaveError('Tracking number is required when marking an order as shipped.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const updates: Record<string, unknown> = {
        status:     newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'shipped') {
        updates.tracking_number  = trackingNumber.trim();
        updates.tracking_carrier = trackingCarrier || null;
        updates.shipped_at       = new Date().toISOString();
      }
      if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', order.id)
        .eq('brand_id', brandId!);

      if (updateErr) throw updateErr;

      // Reflect updates locally
      setOrder(prev => prev ? {
        ...prev,
        status:           newStatus,
        tracking_number:  newStatus === 'shipped' ? trackingNumber.trim() : prev.tracking_number,
        tracking_carrier: newStatus === 'shipped' ? (trackingCarrier || null) : prev.tracking_carrier,
      } : prev);
      setNewStatus('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      // Email reseller (best-effort; recipient resolved by Edge Function from order.created_by)
      sendOrderStatusEmailByOrderId(order.id, {
        order_number: order.order_number,
        status:       newStatus,
        brand_name:   order.brand_name,
        subtotal:     order.subtotal,
        ...(newStatus === 'shipped' && trackingNumber.trim() ? { tracking_number: trackingNumber.trim() } : {}),
      });
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMessageReseller = async () => {
    if (!order?.id) return;
    setMessageError(null);
    setMessageLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_or_create_order_conversation', {
        p_order_id: order.id,
      });
      const result = data as { ok?: boolean; error?: string; conversation_id?: string } | null;
      if (rpcErr) throw new Error(rpcErr.message);
      if (result && !result.ok) throw new Error(result.error || 'Could not start conversation');
      if (result?.conversation_id) {
        navigate(`/brand/messages?conversation=${result.conversation_id}`);
      }
    } catch (e: unknown) {
      setMessageError(e instanceof Error ? e.message : 'Could not open conversation.');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleResolveReturn = async (approve: boolean) => {
    if (!order?.id) return;
    setResolveReturnLoading(true);
    setSaveError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc('resolve_return', {
        p_order_id: order.id,
        p_approve: approve,
      });
      const result = data as { ok?: boolean; error?: string } | null;
      if (rpcErr) throw new Error(rpcErr.message);
      if (result && !result.ok) throw new Error(result.error || 'Failed to resolve');
      fetchOrder();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to resolve return.');
    } finally {
      setResolveReturnLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // ── No brand ─────────────────────────────────────────────────────────────

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-pro-warm-gray font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-5 bg-pro-stone/30 rounded w-24" />
        <div className="h-8 bg-pro-stone/30 rounded w-56" />
        <div className="bg-white rounded-xl border border-pro-stone p-6 space-y-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-4 bg-pro-stone/30 rounded" />)}
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/brand/orders"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Orders
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-sans text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status];
  const nextOptions  = BRAND_STATUS_OPTIONS[order.status] ?? [];
  const showTracking = newStatus === 'shipped';

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Back link ── */}
      <Link
        to="/brand/orders"
        className="inline-flex items-center gap-1.5 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Orders
      </Link>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-pro-navy">{order.order_number}</h1>
          <p className="text-sm text-pro-warm-gray font-sans mt-1">
            {order.business_name} · {formatDate(order.created_at)}
          </p>
        </div>
        {statusConfig && (
          <Badge variant={statusConfig.variant} dot>
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* ── Message reseller ── */}
      <div className="bg-white rounded-xl border border-pro-stone p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-pro-navy" />
          <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">Message reseller</p>
        </div>
        <p className="text-sm text-pro-warm-gray font-sans mb-3">
          Chat with the retailer about this order.
        </p>
        <button
          type="button"
          onClick={handleMessageReseller}
          disabled={messageLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium bg-pro-navy text-white hover:bg-pro-charcoal disabled:opacity-60 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {messageLoading ? 'Opening…' : 'Message reseller'}
        </button>
        {messageError && (
          <p className="text-sm text-red-600 font-sans mt-2">{messageError}</p>
        )}
      </div>

      {/* ── Line items ── */}
      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        <div className="px-5 py-4 border-b border-pro-stone">
          <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">
            Items ({order.items.length})
          </p>
        </div>

        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="w-8 h-8 text-pro-stone mb-2" />
            <p className="text-sm text-pro-warm-gray font-sans">No items on this order</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-pro-stone/50">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-lg bg-pro-cream flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-pro-stone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pro-charcoal font-sans">{item.product_name}</p>
                    <p className="text-xs text-pro-warm-gray font-sans">
                      {[item.product_type?.toUpperCase(), item.sku].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-pro-charcoal font-sans">
                      ${item.line_total.toFixed(2)}
                    </p>
                    <p className="text-xs text-pro-warm-gray font-sans">
                      {item.qty} × ${item.unit_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-pro-stone bg-pro-ivory/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold font-sans text-pro-charcoal">Order total</span>
                <span className="text-base font-semibold font-sans text-pro-charcoal">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Tracking info (if already shipped) ── */}
      {(order.tracking_number || order.tracking_carrier) && (
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-pro-warm-gray" />
            <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">
              Tracking
            </p>
          </div>
          <div className="space-y-1">
            {order.tracking_carrier && (
              <p className="text-sm text-pro-charcoal font-sans">
                <span className="text-pro-warm-gray">Carrier:</span> {order.tracking_carrier}
              </p>
            )}
            {order.tracking_number && (
              <p className="text-sm text-pro-charcoal font-sans">
                <span className="text-pro-warm-gray">Tracking #:</span>{' '}
                <span className="font-mono">{order.tracking_number}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Return request (reseller requested return) ── */}
      {order.return_status === 'requested' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <p className="text-xs font-semibold font-sans text-amber-800 uppercase tracking-wider">
              Return requested
            </p>
          </div>
          {order.return_reason && (
            <p className="text-sm text-pro-charcoal font-sans mb-4">{order.return_reason}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleResolveReturn(true)}
              disabled={resolveReturnLoading}
              className="px-4 py-2 rounded-lg text-sm font-sans font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {resolveReturnLoading ? '…' : 'Approve return'}
            </button>
            <button
              type="button"
              onClick={() => handleResolveReturn(false)}
              disabled={resolveReturnLoading}
              className="px-4 py-2 rounded-lg text-sm font-sans font-medium border border-pro-stone text-pro-charcoal hover:bg-pro-cream disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* ── Update status ── */}
      {nextOptions.length > 0 && (
        <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-pro-stone">
            <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">
              Update order status
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">

            {/* Status pills */}
            <div className="flex flex-wrap gap-2">
              {nextOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setNewStatus(newStatus === status ? '' : status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors border ${
                    newStatus === status
                      ? status === 'cancelled'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-pro-navy text-white border-pro-navy'
                      : 'bg-white text-pro-charcoal border-pro-stone hover:border-pro-charcoal'
                  }`}
                >
                  {STATUS_LABELS[status] || status}
                </button>
              ))}
            </div>

            {/* Tracking fields — appear when shipping */}
            {showTracking && (
              <div className="rounded-lg border border-pro-stone/60 bg-pro-ivory p-4 space-y-3">
                <p className="text-xs font-semibold font-sans text-pro-charcoal">
                  Tracking details <span className="text-red-400">*</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs text-pro-warm-gray font-sans">
                      Tracking number <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center">
                      <Truck className="absolute ml-3 w-4 h-4 text-pro-warm-gray pointer-events-none" />
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={e => setTrackingNumber(e.target.value)}
                        placeholder="1Z999AA10123456784"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-pro-stone text-sm font-mono text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs text-pro-warm-gray font-sans">Carrier</label>
                    <select
                      value={trackingCarrier}
                      onChange={e => setTrackingCarrier(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
                    >
                      <option value="">Select carrier</option>
                      {CARRIERS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {saveError && (
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-sans">{saveError}</p>
              </div>
            )}

            {/* Save button */}
            {newStatus && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium font-sans rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    newStatus === 'cancelled'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-pro-navy hover:bg-pro-charcoal'
                  }`}
                >
                  {saving ? 'Saving…' : 'Save status'}
                </button>
                <button
                  onClick={() => { setNewStatus(''); setSaveError(null); }}
                  className="text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors"
                >
                  Cancel
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-sans">
                    <Check className="w-3.5 h-3.5" />
                    Updated
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Notes from retailer ── */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider mb-2">
            Notes from retailer
          </p>
          <p className="text-sm text-pro-charcoal font-sans leading-relaxed">{order.notes}</p>
        </div>
      )}

      {/* ── Brand notes ── */}
      {order.brand_notes && (
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider mb-2">
            Platform notes
          </p>
          <p className="text-sm text-pro-charcoal font-sans leading-relaxed">{order.brand_notes}</p>
        </div>
      )}

    </div>
  );
}
