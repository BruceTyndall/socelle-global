import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertCircle, Truck, ExternalLink, RotateCcw, MessageSquare } from 'lucide-react';
import { Badge } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface OrderItem {
  id: string;
  product_name: string;
  product_type: string;
  sku: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  notes: string | null;
  brand_name: string;
  tracking_number: string | null;
  tracking_carrier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  return_status: string;
  return_requested_at: string | null;
  return_reason: string | null;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'amber' | 'gray' | 'green' | 'navy' | 'red' }> = {
  submitted:    { label: 'Submitted',     variant: 'amber' },
  reviewing:    { label: 'Reviewing',     variant: 'gray' },
  sent_to_brand:{ label: 'Sent to Brand', variant: 'navy' },
  confirmed:    { label: 'Confirmed',     variant: 'green' },
  fulfilled:    { label: 'Fulfilled',     variant: 'green' },
  shipped:      { label: 'Shipped',       variant: 'green' },
  delivered:    { label: 'Delivered',     variant: 'green' },
  cancelled:    { label: 'Cancelled',     variant: 'red' },
};

const STATUS_STEPS = ['submitted', 'reviewing', 'sent_to_brand', 'confirmed', 'fulfilled', 'shipped', 'delivered'];

export default function BusinessOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnRequesting, setReturnRequesting] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && id) fetchOrder();
  }, [user, id]);

  const fetchOrder = async () => {
    if (!user || !id) return;
    try {
      setLoading(true);
      setError(null);

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, subtotal, notes, tracking_number, tracking_carrier, shipped_at, delivered_at, return_status, return_requested_at, return_reason, brands(name)')
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (orderErr) throw orderErr;
      if (!orderData) throw new Error('Order not found');

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, product_name, product_type, sku, unit_price, qty, line_total')
        .eq('order_id', id)
        .order('product_name');

      const row = orderData as any;
      setOrder({
        id: row.id,
        order_number: row.order_number,
        created_at: row.created_at,
        status: row.status,
        subtotal: row.subtotal,
        notes: row.notes,
        brand_name: row.brands?.name || '—',
        tracking_number: row.tracking_number ?? null,
        tracking_carrier: row.tracking_carrier ?? null,
        shipped_at: row.shipped_at ?? null,
        delivered_at: row.delivered_at ?? null,
        return_status: row.return_status ?? 'none',
        return_requested_at: row.return_requested_at ?? null,
        return_reason: row.return_reason ?? null,
        items: itemsData || [],
      });
    } catch {
      setError('Unable to load order. It may not exist or you may not have access.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = (status: string) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? -1 : idx;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleMessageOrder = async () => {
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
        navigate(`/portal/messages?conversation=${result.conversation_id}`);
      }
    } catch (err: unknown) {
      setMessageError(err instanceof Error ? err.message : 'Could not open conversation.');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!order?.id) return;
    setReturnRequesting(true);
    setError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc('request_return', {
        p_order_id: order.id,
        p_reason: returnReason.trim() || 'Requested by reseller',
      });
      const result = data as { ok?: boolean; error?: string } | null;
      if (rpcErr) throw new Error(rpcErr.message);
      if (result && !result.ok) throw new Error(result.error || 'Request failed');
      setShowReturnForm(false);
      setReturnReason('');
      fetchOrder();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not submit return request.');
    } finally {
      setReturnRequesting(false);
    }
  };

  // Build track URL for common carriers (reseller can open in new tab)
  const trackUrl = order?.tracking_number && order?.tracking_carrier
    ? (() => {
        const num = order.tracking_number.trim();
        const carrier = (order.tracking_carrier || '').toLowerCase();
        if (carrier.includes('ups')) return `https://www.ups.com/track?tracknum=${num}`;
        if (carrier.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
        if (carrier.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`;
        if (carrier.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${num}`;
        return null;
      })()
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <Link
            to="/portal/orders"
            className="flex items-center gap-1.5 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Orders
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-pro-stone/30 rounded w-48" />
            <div className="h-4 bg-pro-stone/30 rounded w-32" />
            <div className="bg-white rounded-xl border border-pro-stone p-6 space-y-3">
              {[0,1,2,3].map(i => <div key={i} className="h-4 bg-pro-stone/30 rounded" />)}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-sans text-sm">{error}</p>
          </div>
        ) : order ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-sans font-semibold text-pro-charcoal tracking-tight">
                  {order.order_number}
                </h1>
                <p className="text-sm text-pro-warm-gray font-sans mt-1">
                  {order.brand_name} · {formatDate(order.created_at)}
                </p>
              </div>
              {STATUS_CONFIG[order.status] && (
                <Badge variant={STATUS_CONFIG[order.status].variant}>
                  {STATUS_CONFIG[order.status].label}
                </Badge>
              )}
            </div>

            {/* Status timeline — only for non-cancelled orders */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-xl border border-pro-stone p-5">
                <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider mb-4">Order status</p>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                  {STATUS_STEPS.map((step, i) => {
                    const config = STATUS_CONFIG[step];
                    const current = stepIndex(order.status);
                    const done = i <= current;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-colors ${
                            done ? 'bg-pro-charcoal text-white' : 'bg-pro-stone/40 text-pro-warm-gray'
                          }`}>
                            {i + 1}
                          </div>
                          <p className={`text-[10px] font-sans mt-1.5 text-center whitespace-nowrap ${done ? 'text-pro-charcoal font-medium' : 'text-pro-stone'}`}>
                            {config.label}
                          </p>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-0.5 mx-0.5 mb-3 transition-colors min-w-[8px] ${i < current ? 'bg-pro-charcoal' : 'bg-pro-stone/40'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tracking — when brand has entered tracking info */}
            {(order.tracking_number || order.tracking_carrier || order.shipped_at) && (
              <div className="bg-white rounded-xl border border-pro-stone p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-pro-navy" />
                  <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">Tracking</p>
                </div>
                <div className="space-y-2 text-sm font-sans">
                  {order.shipped_at && (
                    <p className="text-pro-charcoal">
                      Shipped {formatDateTime(order.shipped_at)}
                      {order.delivered_at && (
                        <span className="text-pro-warm-gray"> · Delivered {formatDateTime(order.delivered_at)}</span>
                      )}
                    </p>
                  )}
                  {order.tracking_carrier && (
                    <p className="text-pro-warm-gray">
                      <span className="font-medium text-pro-charcoal">Carrier:</span> {order.tracking_carrier}
                    </p>
                  )}
                  {order.tracking_number && (
                    <p className="text-pro-warm-gray">
                      <span className="font-medium text-pro-charcoal">Tracking number:</span>{' '}
                      <span className="font-mono text-pro-charcoal">{order.tracking_number}</span>
                      {trackUrl && (
                        <a
                          href={trackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-1 text-pro-navy hover:text-pro-gold font-medium transition-colors"
                        >
                          Track package
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Line items */}
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
                          <p className="text-sm font-medium text-pro-charcoal font-sans">
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
                      <span className="text-sm font-semibold font-sans text-pro-charcoal">Subtotal</span>
                      <span className="text-sm font-semibold font-sans text-pro-charcoal">
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Message about this order */}
            <div className="bg-white rounded-xl border border-pro-stone p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-pro-navy" />
                <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">Message brand</p>
              </div>
              <p className="text-sm text-pro-warm-gray font-sans mb-3">
                Need help with this order? Start a conversation with the brand.
              </p>
              <button
                type="button"
                onClick={handleMessageOrder}
                disabled={messageLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium bg-pro-navy text-white hover:bg-pro-charcoal disabled:opacity-60 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {messageLoading ? 'Opening…' : 'Message about this order'}
              </button>
              {messageError && (
                <p className="text-sm text-red-600 font-sans mt-2">{messageError}</p>
              )}
            </div>

            {/* Return request — only when shipped/delivered and no return yet, or show status */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="bg-white rounded-xl border border-pro-stone p-5">
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw className="w-5 h-5 text-pro-navy" />
                  <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider">Return</p>
                </div>
                {order.return_status === 'none' && !showReturnForm && (
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(true)}
                    className="text-sm font-sans font-medium text-pro-gold hover:text-pro-navy transition-colors"
                  >
                    Request return
                  </button>
                )}
                {order.return_status === 'none' && showReturnForm && (
                  <div className="space-y-3">
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Reason for return (optional)"
                      className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans text-pro-charcoal"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleRequestReturn}
                        disabled={returnRequesting}
                        className="btn-gold px-4 py-2 rounded-lg text-sm font-sans font-medium"
                      >
                        {returnRequesting ? 'Submitting…' : 'Submit request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowReturnForm(false); setReturnReason(''); }}
                        className="px-4 py-2 border border-pro-stone rounded-lg text-sm font-sans text-pro-charcoal hover:bg-pro-cream"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {order.return_status === 'requested' && (
                  <p className="text-sm font-sans text-pro-charcoal">
                    Return requested{order.return_reason ? `: ${order.return_reason}` : ''}. The brand will review.
                  </p>
                )}
                {order.return_status === 'approved' && (
                  <p className="text-sm font-sans text-green-700">Return approved. Refund will be processed per brand policy.</p>
                )}
                {order.return_status === 'rejected' && (
                  <p className="text-sm font-sans text-pro-warm-gray">Return request was declined.</p>
                )}
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl border border-pro-stone p-5">
                <p className="text-xs font-semibold font-sans text-pro-warm-gray uppercase tracking-wider mb-2">Order notes</p>
                <p className="text-sm text-pro-charcoal font-sans leading-relaxed">{order.notes}</p>
              </div>
            )}
          </>
        ) : null}
    </div>
  );
}
