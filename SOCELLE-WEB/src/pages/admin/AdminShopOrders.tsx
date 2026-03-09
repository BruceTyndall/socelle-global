// AdminShopOrders.tsx — /admin/shop/orders — Order management (LIVE — orders, order_items tables)
import { useState } from 'react';
import { Package, Eye, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<{ order: ShopOrder; items: ShopOrderItem[] } | null>(null);

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['admin-shop-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      const rows = (data as OrderRow[] | null) ?? [];
      return rows.map(normalizeShopOrder);
    },
  });

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
    queryClient.invalidateQueries({ queryKey: ['admin-shop-orders'] });
  };

  return (
    <div>
      <h1 className="text-2xl font-sans font-semibold text-graphite mb-6">Shop Orders</h1>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-graphite/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-graphite">Order #{detail.order.order_number}</h2>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-graphite/60" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-sans">
              <div><span className="text-graphite/60">Date:</span> <span className="text-graphite">{detail.order.created_at ? new Date(detail.order.created_at).toLocaleDateString() : '—'}</span></div>
              <div><span className="text-graphite/60">Total:</span> <span className="font-semibold text-graphite">{formatCents(detail.order.total_cents)}</span></div>
              <div><span className="text-graphite/60">User ID:</span> <span className="text-graphite font-mono text-xs">{detail.order.user_id}</span></div>
              <div>
                <span className="text-graphite/60">Status: </span>
                <select
                  value={detail.order.status}
                  onChange={e => updateStatus(detail.order.id, e.target.value)}
                  className="ml-1 text-sm border border-accent-soft rounded px-2 py-1"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {detail.order.shipping_address && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-graphite/60 uppercase mb-2">Shipping Address</p>
                {(() => {
                  const a = detail.order.shipping_address as Record<string, string>;
                  return <p className="text-sm font-sans text-graphite">{a.name}, {a.line1}, {a.city} {a.state} {a.zip}</p>;
                })()}
              </div>
            )}

            <p className="text-xs font-semibold text-graphite/60 uppercase mb-2">Items</p>
            <div className="border border-accent-soft rounded-lg overflow-hidden">
              <table className="w-full text-sm font-sans">
                <thead className="bg-accent-soft">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs uppercase text-graphite/60">Item</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-graphite/60">Qty</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-graphite/60">Unit</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-graphite/60">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map(item => {
                    const snapshot = item.product_snapshot as Record<string, unknown> | null;
                    return (
                      <tr key={item.id} className="border-t border-accent-soft/30">
                        <td className="px-3 py-2 text-graphite">{(snapshot?.name as string) ?? 'Product'}</td>
                        <td className="px-3 py-2 text-graphite">{item.quantity}</td>
                        <td className="px-3 py-2 text-graphite">{formatCents(item.unit_price_cents)}</td>
                        <td className="px-3 py-2 font-semibold text-graphite">{formatCents(item.total_price_cents)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-1 text-sm font-sans text-right">
              <p className="text-graphite/60">Subtotal: {formatCents(detail.order.subtotal_cents)}</p>
              <p className="text-graphite/60">Shipping: {formatCents(detail.order.shipping_cents)}</p>
              <p className="text-graphite/60">Tax: {formatCents(detail.order.tax_cents)}</p>
              <p className="font-bold text-graphite text-base">Total: {formatCents(detail.order.total_cents)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-accent-soft border-b border-accent-soft">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Order</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-graphite/60">Loading...</td></tr>}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-graphite/60">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No orders yet
              </td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id} className="border-b border-accent-soft/50 hover:bg-accent-soft/50">
                <td className="px-4 py-3 font-mono font-semibold text-graphite">#{o.order_number}</td>
                <td className="px-4 py-3 text-graphite/60">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-graphite">{formatCents(o.total_cents)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openDetail(o)} className="text-graphite/60 hover:text-graphite"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
