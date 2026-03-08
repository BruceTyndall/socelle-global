// useOrders — list user's orders, single order detail
// Migrated to TanStack Query v5 (V2-TECH-04).
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import type { Tables } from '../database.types';
import {
  normalizeShopOrder,
  normalizeShopOrderItem,
  type ShopOrder,
  type ShopOrderItem,
} from './types';

type OrderRow = Tables<'orders'>;
type OrderItemRow = Tables<'order_items'>;

export function useOrders() {
  const { user } = useAuth();

  const { data: orders = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return ((data as OrderRow[] | null) ?? []).map(normalizeShopOrder);
    },
    enabled: !!user?.id,
  });

  const error = queryError instanceof Error ? queryError.message : null;
  return { orders, loading, error, refetch };
}

export function useOrderDetail(orderId: string | undefined) {
  const { user } = useAuth();

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['order_detail', orderId, user?.id],
    queryFn: async (): Promise<{ order: ShopOrder; items: ShopOrderItem[] }> => {
      const { data: o, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId!)
        .eq('created_by', user!.id)
        .single();
      if (oErr) throw new Error(oErr.message);

      const { data: oi } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId!);

      return {
        order: normalizeShopOrder(o as OrderRow),
        items: ((oi as OrderItemRow[] | null) ?? []).map(normalizeShopOrderItem),
      };
    },
    enabled: !!orderId && !!user?.id,
  });

  const order = data?.order ?? null;
  const items = data?.items ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  return { order, items, loading, error };
}
