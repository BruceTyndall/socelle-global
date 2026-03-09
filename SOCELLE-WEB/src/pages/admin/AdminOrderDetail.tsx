import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  brand_id: string;
  business_id: string;
  created_by: string;
  status: string;
  subtotal: number;
  commission_percent: number;
  commission_total: number;
  admin_fee: number;
  notes: string;
  admin_notes: string;
  brand_notes: string;
  brand_name?: string;
  brand_contact_email?: string | null;
  business_name?: string;
}

interface OrderItem {
  id: string;
  product_type: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { isLoading: loading, error: queryError, refetch: loadOrder } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: async () => {
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          brands!inner(name, contact_email),
          businesses!inner(name)
        `)
        .eq('id', id!)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id!)
        .order('created_at');

      if (itemsError) throw itemsError;

      const parsed = {
        ...orderResult,
        brand_name: orderResult.brands?.name,
        brand_contact_email: orderResult.brands?.contact_email,
        business_name: orderResult.businesses?.name,
      } as Order;

      setOrder(parsed);
      setItems((itemsData || []) as OrderItem[]);

      return { order: parsed, items: (itemsData || []) as OrderItem[] };
    },
    enabled: !!id,
  });

  const error = queryError
    ? ((queryError as any)?.code === 'PGRST301' || (queryError as any)?.message?.toLowerCase().includes('permission'))
      ? 'Access denied. Your account does not have permission to view this order.'
      : ((queryError as any)?.message?.toLowerCase().includes('fetch') || (queryError as any)?.message?.toLowerCase().includes('network'))
        ? 'Network issue while loading this order. Please refresh and try again.'
        : 'Failed to load order details. Please try again.'
    : null;

  async function handleSave() {
    if (!order) return;

    setSaving(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const commissionTotal = subtotal * (order.commission_percent / 100);

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          subtotal,
          commission_percent: order.commission_percent,
          commission_total: commissionTotal,
          admin_fee: order.admin_fee,
          admin_notes: order.admin_notes,
          brand_notes: order.brand_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      await Promise.all(
        items.map((item) =>
          supabase
            .from('order_items')
            .update({
              qty: item.qty,
              line_total: item.unit_price * item.qty,
            })
            .eq('id', item.id)
        )
      );

      alert('Order saved successfully!');
      loadOrder();
    } catch (err: any) {
      console.error('Error saving order:', err);
      alert('Failed to save order: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });
      alert(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  }

  async function cancelOrder() {
    await updateStatus('cancelled');
    setShowCancelConfirm(false);
  }

  function updateItem(itemId: string, updates: Partial<OrderItem>) {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          if ('qty' in updates) {
            updated.line_total = updated.unit_price * updated.qty;
          }
          return updated;
        }
        return item;
      })
    );
  }

  function removeItem(itemId: string) {
    setItems(items.filter((item) => item.id !== itemId));
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-accent-soft text-graphite',
      sent_to_brand: 'bg-purple-100 text-purple-700',
      confirmed: 'bg-green-100 text-green-700',
      fulfilled: 'bg-accent-soft text-graphite',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-accent-soft text-graphite';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-graphite/60">Loading order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mr-3"
          >
            Retry
          </button>
          <Link to="/admin/orders" className="text-graphite hover:text-graphite">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <p className="text-graphite/60 mb-4">Order not found</p>
          <Link to="/admin/orders" className="text-graphite hover:text-graphite">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const commissionAmount = subtotal * (order.commission_percent / 100);
  const totalMargin = commissionAmount + order.admin_fee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-graphite/60 hover:text-graphite font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-graphite mb-2">Order {order.order_number}</h1>
            <div className="flex items-center gap-4 text-sm text-graphite/60">
              <span>Business: {order.business_name}</span>
              <span>Brand: {order.brand_name}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-white rounded-lg border border-accent-soft p-6">
          <h2 className="text-xl font-bold text-graphite mb-4">Order Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-graphite">{item.product_name}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                      item.product_type === 'pro'
                        ? 'bg-accent-soft text-graphite'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.product_type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-graphite/60">Qty:</span>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, { qty: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 border border-accent-soft rounded"
                    min="1"
                  />
                </div>
                <div className="text-sm text-graphite/60">
                  ${item.unit_price.toFixed(2)} ea
                </div>
                <div className="text-lg font-bold text-graphite min-w-[100px] text-right">
                  ${item.line_total.toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-accent-soft flex items-center justify-between">
            <span className="text-lg font-semibold text-graphite">Subtotal:</span>
            <span className="text-2xl font-bold text-graphite">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-accent-soft p-6">
          <h2 className="text-xl font-bold text-graphite mb-4">Margin Calculation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Subtotal
              </label>
              <div className="text-2xl font-bold text-graphite">${subtotal.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Commission %
              </label>
              <input
                type="number"
                value={order.commission_percent}
                onChange={(e) =>
                  setOrder({ ...order, commission_percent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-accent-soft rounded-lg"
                step="0.5"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Commission Amount
              </label>
              <div className="text-xl font-bold text-green-600">${commissionAmount.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Admin Fee
              </label>
              <input
                type="number"
                value={order.admin_fee}
                onChange={(e) => setOrder({ ...order, admin_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg"
                step="0.01"
                min="0"
              />
            </div>

            <div className="pt-4 border-t border-accent-soft">
              <label className="block text-sm font-medium text-graphite mb-2">
                Total Margin
              </label>
              <div className="text-2xl font-bold text-green-600">${totalMargin.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
        <h2 className="text-xl font-bold text-graphite mb-4">Notes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Business Notes (Read-only)
            </label>
            <textarea
              value={order.notes || ''}
              readOnly
              rows={4}
              className="w-full px-3 py-2 border border-accent-soft rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Internal Admin Notes
            </label>
            <textarea
              value={order.admin_notes || ''}
              onChange={(e) => setOrder({ ...order, admin_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-accent-soft rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Notes to Brand
            </label>
            <textarea
              value={order.brand_notes || ''}
              onChange={(e) => setOrder({ ...order, brand_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-accent-soft rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6">
        <h2 className="text-xl font-bold text-graphite mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-graphite text-white font-semibold rounded-lg hover:bg-graphite transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>

          {order.status === 'submitted' && (
            <button
              onClick={() => updateStatus('reviewing')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-graphite text-white font-semibold rounded-lg hover:bg-graphite transition-colors"
            >
              Start Review
            </button>
          )}

          <a
            href={`mailto:${order.brand_contact_email || import.meta.env.VITE_SUPPORT_EMAIL || ''}?subject=Order ${order.order_number}&body=${encodeURIComponent(
              order.brand_notes || ''
            )}`}
            onClick={() => updateStatus('sent_to_brand')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-graphite text-white font-semibold rounded-lg hover:bg-graphite transition-colors"
          >
            <Send className="w-5 h-5" />
            Send to Brand
          </a>

          {['reviewing', 'sent_to_brand'].includes(order.status) && (
            <button
              onClick={() => updateStatus('confirmed')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Mark Confirmed
            </button>
          )}

          {order.status === 'confirmed' && (
            <button
              onClick={() => updateStatus('fulfilled')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-graphite text-white font-semibold rounded-lg hover:bg-graphite transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Mark Fulfilled
            </button>
          )}

          {!['cancelled', 'fulfilled'].includes(order.status) && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-graphite mb-4">Cancel Order?</h2>
              <p className="text-graphite/60 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelOrder}
                  className="flex-1 py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 px-6 bg-accent-soft text-graphite font-semibold rounded-lg hover:bg-accent-soft transition-colors"
                >
                  No, Keep
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
