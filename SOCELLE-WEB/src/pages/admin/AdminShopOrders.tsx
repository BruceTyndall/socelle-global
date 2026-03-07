// AdminShopOrders.tsx — /admin/shop/orders — Order management (LIVE — orders, order_items tables)
import { useState, useEffect, useCallback } from 'react';
import { Package, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../lib/database.types';
import {
  formatCents,
  normalizeShopOrder,
  normalizeShopOrderItem,
} from '../../lib/shop/types';
import type { ShopOrder, ShopOrderItem } from '../../lib/shop/types';

type OrderRow = Tables<'orders'>;
type OrderItemRow = Tables<'order_items'>;

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-blue-50 text-blue-600',
  processing: 'bg-indigo-50 text-indigo-600',
  shipped: 'bg-green-50 text-green-600',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-50 text-red-500',
  refunded: 'bg-red-50 text-red-500',
};

const DB_STATUS_MAP: Record<string, string> = {
  pending: 'pending_payment',
  processing: 'reviewing',
};

export default function AdminShopOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ order: ShopOrder; items: ShopOrderItem[] } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const rows = (data as OrderRow[] | null) ?? [];
    setOrders(rows.map(normalizeShopOrder));
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (order: ShopOrder) => {
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setDetail({
      order,
      items: (((items as OrderItemRow[] | null) ?? []).map(normalizeShopOrderItem) as ShopOrderItem[]),
    });
  };

  const updateStatus = async (orderId: string, status: string) => {
    const dbStatus = DB_STATUS_MAP[status] ?? status;
    await supabase.from('orders').update({ status: dbStatus }).eq('id', orderId);
    if (detail && detail.order.id === orderId) {
      setDetail({ ...detail, order: { ...detail.order, status: status as ShopOrder['status'] } });
    }
    fetchOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-sans font-semibold text-pro-charcoal mb-6">Shop Orders</h1>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-pro-charcoal/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-pro-charcoal">Order #{detail.order.order_number}</h2>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-pro-warm-gray" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-sans">
              <div><span className="text-pro-warm-gray">Date:</span> <span className="text-pro-charcoal">{new Date(detail.order.created_at).toLocaleDateString()}</span></div>
              <div><span className="text-pro-warm-gray">Total:</span> <span className="font-semibold text-pro-charcoal">{formatCents(detail.order.total_cents)}</span></div>
              <div><span className="text-pro-warm-gray">User ID:</span> <span className="text-pro-charcoal font-mono text-xs">{detail.order.user_id}</span></div>
              <div>
                <span className="text-pro-warm-gray">Status: </span>
                <select
                  value={detail.order.status}
                  onChange={e => updateStatus(detail.order.id, e.target.value)}
                  className="ml-1 text-sm border border-pro-stone rounded px-2 py-1"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {detail.order.shipping_address && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-pro-warm-gray uppercase mb-2">Shipping Address</p>
                {(() => {
                  const a = detail.order.shipping_address as Record<string, string>;
                  return <p className="text-sm font-sans text-pro-charcoal">{a.name}, {a.line1}, {a.city} {a.state} {a.zip}</p>;
                })()}
              </div>
            )}

            <p className="text-xs font-semibold text-pro-warm-gray uppercase mb-2">Items</p>
            <div className="border border-pro-stone rounded-lg overflow-hidden">
              <table className="w-full text-sm font-sans">
                <thead className="bg-pro-cream">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs uppercase text-pro-warm-gray">Item</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-pro-warm-gray">Qty</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-pro-warm-gray">Unit</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-pro-warm-gray">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map(item => {
                    const snapshot = item.product_snapshot as Record<string, unknown> | null;
                    return (
                      <tr key={item.id} className="border-t border-pro-stone/30">
                        <td className="px-3 py-2 text-pro-charcoal">{(snapshot?.name as string) ?? 'Product'}</td>
                        <td className="px-3 py-2 text-pro-charcoal">{item.quantity}</td>
                        <td className="px-3 py-2 text-pro-charcoal">{formatCents(item.unit_price_cents)}</td>
                        <td className="px-3 py-2 font-semibold text-pro-charcoal">{formatCents(item.total_price_cents)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-1 text-sm font-sans text-right">
              <p className="text-pro-warm-gray">Subtotal: {formatCents(detail.order.subtotal_cents)}</p>
              <p className="text-pro-warm-gray">Shipping: {formatCents(detail.order.shipping_cents)}</p>
              <p className="text-pro-warm-gray">Tax: {formatCents(detail.order.tax_cents)}</p>
              <p className="font-bold text-pro-charcoal text-base">Total: {formatCents(detail.order.total_cents)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-pro-cream border-b border-pro-stone">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Order</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-pro-warm-gray">Loading...</td></tr>}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-pro-warm-gray">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No orders yet
              </td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id} className="border-b border-pro-stone/50 hover:bg-pro-cream/50">
                <td className="px-4 py-3 font-mono font-semibold text-pro-charcoal">#{o.order_number}</td>
                <td className="px-4 py-3 text-pro-warm-gray">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-pro-charcoal">{formatCents(o.total_cents)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openDetail(o)} className="text-pro-warm-gray hover:text-pro-charcoal"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
