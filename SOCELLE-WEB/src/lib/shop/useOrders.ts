// useOrders — list user's orders, single order detail
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import type { ShopOrder, ShopOrderItem } from './types';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setOrders((data as ShopOrder[]) ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

export function useOrderDetail(orderId: string | undefined) {
  const { user } = useAuth();
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [items, setItems] = useState<ShopOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !user?.id) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const { data: o, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();
        if (oErr) throw oErr;
        if (cancelled) return;
        setOrder(o as ShopOrder);

        const { data: oi } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        if (!cancelled) setItems((oi as ShopOrderItem[]) ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId, user?.id]);

  return { order, items, loading, error };
}
