// useShippingMethods — list active shipping methods
// Migrated to TanStack Query v5 (V2-TECH-04).
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { ShippingMethod } from './types';

export function useShippingMethods() {
  const { data: methods = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['shipping_methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw new Error(error.message);
      return ((data as ShippingMethod[] | null) ?? []).map((method) => ({
        ...method,
        price_cents: method.price_cents ?? method.base_rate_cents,
      }));
    },
  });

  const error = queryError instanceof Error ? queryError.message : null;
  return { methods, loading, error };
}
