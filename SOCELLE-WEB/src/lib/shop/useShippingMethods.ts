// useShippingMethods — list active shipping methods
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { ShippingMethod } from './types';

export function useShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('shipping_methods')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (err) throw err;
        if (!cancelled) {
          const mapped = ((data as ShippingMethod[] | null) ?? []).map((method) => ({
            ...method,
            price_cents: method.price_cents ?? method.base_rate_cents,
          }));
          setMethods(mapped);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load shipping methods');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { methods, loading, error };
}
