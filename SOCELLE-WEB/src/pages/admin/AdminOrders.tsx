import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, AlertCircle, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { exportToCSV } from '../../lib/csvExport';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  brand_id: string;
  business_id: string;
  subtotal: number;
  commission_total: number;
  status: string;
  items_count?: number;
  brand_name?: string;
  business_name?: string;
}

interface BrandOption {
  id: string;
  name: string;
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-orders-brands'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brands').select('id, name').order('name');
      if (error) throw error;
      return (data || []) as BrandOption[];
    },
  });

  const { data: orders = [], isLoading: loading, error: queryError, refetch: loadOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data: ordersData, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          brands!inner(name),
          businesses!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const ordersWithCounts = await Promise.all(
        (ordersData || []).map(async (order: Record<string, unknown>) => {
          const { count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id as string);

          return {
            ...order,
            items_count: count || 0,
            brand_name: (order.brands as Record<string, unknown>)?.name,
            business_name: (order.businesses as Record<string, unknown>)?.name,
          };
        })
      );

      return ordersWithCounts as Order[];
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) =>
      ['submitted', 'reviewing'].includes(o.status)
    ).length;
    const sentOrders = orders.filter((o) => o.status === 'sent_to_brand').length;
    const revenue = orders
      .filter((o) => ['confirmed', 'fulfilled'].includes(o.status))
      .reduce((sum, o) => sum + (o.commission_total || 0), 0);
    return { total: totalOrders, pending: pendingOrders, sent: sentOrders, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.brand_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || order.brand_id === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  }), [orders, searchTerm, statusFilter, brandFilter]);

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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          icon={AlertCircle}
          title="Failed to Load Orders"
          message={error}
          action={{
            label: 'Retry',
            onClick: loadOrders,
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-graphite">Order Management</h1>
        <button
          onClick={() =>
            exportToCSV(
              filteredOrders.map(o => ({
                order_number: o.order_number,
                brand: o.brand_name || '',
                business: o.business_name || '',
                status: o.status,
                subtotal: o.subtotal,
                commission: o.commission_total,
                items: o.items_count || 0,
                created_at: new Date(o.created_at).toLocaleDateString(),
              })),
              `orders_export_${new Date().toISOString().split('T')[0]}.csv`,
              [
                { key: 'order_number', label: 'Order #' },
                { key: 'brand', label: 'Brand' },
                { key: 'business', label: 'Business' },
                { key: 'status', label: 'Status' },
                { key: 'subtotal', label: 'Subtotal ($)' },
                { key: 'commission', label: 'Commission ($)' },
                { key: 'items', label: 'Items' },
                { key: 'created_at', label: 'Created' },
              ]
            )
          }
          disabled={filteredOrders.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-accent-soft text-graphite rounded-lg text-sm font-medium hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV ({filteredOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-accent-soft p-6">
          <p className="text-sm text-graphite/60 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-graphite">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-accent-soft p-6">
          <p className="text-sm text-graphite/60 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-accent-soft p-6">
          <p className="text-sm text-graphite/60 mb-1">Sent to Brands</p>
          <p className="text-3xl font-bold text-purple-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-lg border border-accent-soft p-6">
          <p className="text-sm text-graphite/60 mb-1">Revenue Earned</p>
          <p className="text-3xl font-bold text-green-600">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite/60" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="sent_to_brand">Sent to Brand</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-accent-soft">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-accent-soft rounded-full animate-pulse w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-accent-soft rounded animate-pulse w-16"></div></td>
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-graphite">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/60">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite">
                      {order.business_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite">
                      {order.brand_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/60">
                      {order.items_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite">
                      ${order.subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite">
                      ${order.commission_total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-graphite hover:text-graphite font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12 text-graphite/60">No orders found</div>
        )}
      </div>
    </div>
  );
}
