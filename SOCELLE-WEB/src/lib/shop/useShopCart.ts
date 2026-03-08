// useShopCart — cart CRUD, persists to carts table for auth users, localStorage session_id for guests
// Migrated to TanStack Query v5 (V2-TECH-04).
// NOTE: Retains useEffect for cart initialization (ensureCart is a side-effect with DB writes).
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import type { CartItem, CartSummary, Product, ProductVariant } from './types';

const SESSION_KEY = 'socelle_shop_session';

function getSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function useShopCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ensure active cart exists
  const ensureCart = useCallback(async (): Promise<string | null> => {
    try {
      const userId = user?.id ?? null;
      const sessionId = userId ? null : getSessionId();

      let query = supabase.from('carts').select('id').eq('status', 'active');
      if (userId) query = query.eq('user_id', userId);
      else if (sessionId) query = query.eq('session_id', sessionId);

      const { data: existing } = await query.limit(1).single();
      if (existing) {
        setCartId(existing.id);
        return existing.id;
      }

      const { data: newCart, error: cErr } = await supabase
        .from('carts')
        .insert({ user_id: userId, session_id: sessionId, status: 'active' as const })
        .select('id')
        .single();
      if (cErr) throw cErr;
      setCartId(newCart.id);
      return newCart.id;
    } catch {
      return null;
    }
  }, [user?.id]);

  // Initialize cart on mount
  useEffect(() => {
    (async () => {
      const cid = await ensureCart();
      if (!cid) setCartId(null);
    })();
  }, [ensureCart]);

  const queryKey = ['shop_cart_items', cartId];

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId!)
        .order('created_at');

      const cartItems = (data ?? []) as CartItem[];

      // Enrich with product data
      const productIds = [...new Set(cartItems.map(ci => ci.product_id).filter(Boolean))];
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds as string[]);
        const prodMap = new Map((prods ?? []).map(p => [p.id, p as Product]));
        cartItems.forEach(ci => {
          if (ci.product_id) ci.product = prodMap.get(ci.product_id);
        });
      }

      const variantIds = [...new Set(cartItems.map(ci => ci.variant_id).filter(Boolean))];
      if (variantIds.length > 0) {
        const { data: vars } = await supabase
          .from('product_variants')
          .select('*')
          .in('id', variantIds as string[]);
        const varMap = new Map((vars ?? []).map(v => [v.id, v as ProductVariant]));
        cartItems.forEach(ci => {
          if (ci.variant_id) ci.variant = varMap.get(ci.variant_id);
        });
      }

      return cartItems;
    },
    enabled: !!cartId,
  });

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]);

  const addItem = useCallback(async (productId: string, variantId: string | null, quantity: number, unitPriceCents: number) => {
    const cid = cartId ?? await ensureCart();
    if (!cid) return;

    const existing = items.find(i => i.product_id === productId && i.variant_id === variantId);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cid, product_id: productId, variant_id: variantId, quantity, unit_price_cents: unitPriceCents });
    }
    invalidate();
  }, [cartId, items, ensureCart, invalidate]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(itemId);
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    invalidate();
  }, [invalidate]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeItem = useCallback(async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    invalidate();
  }, [invalidate]);

  const clearCart = useCallback(async () => {
    if (!cartId) return;
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
    invalidate();
  }, [cartId, invalidate]);

  const summary: CartSummary = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
    return {
      subtotal_cents: subtotal,
      discount_cents: 0,
      shipping_cents: 0,
      tax_cents: Math.round(subtotal * 0.08),
      total_cents: subtotal + Math.round(subtotal * 0.08),
      item_count: items.reduce((s, i) => s + i.quantity, 0),
    };
  }, [items]);

  return {
    cartId, items, loading, error, summary,
    addItem, updateQuantity, removeItem, clearCart,
    refetch: invalidate,
  };
}
