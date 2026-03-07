// useWishlist — add/remove/list wishlist items
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import type { WishlistItem, Product } from './types';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensureWishlist = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;
    try {
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      if (existing) { setWishlistId(existing.id); return existing.id; }

      const { data: newWl, error: err } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, name: 'My Wishlist' })
        .select('id')
        .single();
      if (err) throw err;
      setWishlistId(newWl.id);
      return newWl.id;
    } catch { return null; }
  }, [user?.id]);

  const loadItems = useCallback(async (wid?: string) => {
    const id = wid ?? wishlistId;
    if (!id) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', id)
        .order('added_at', { ascending: false });

      const wlItems = (data ?? []) as WishlistItem[];
      const productIds = [...new Set(wlItems.map(i => i.product_id).filter(Boolean))];
      if (productIds.length > 0) {
        const { data: prods } = await supabase.from('products').select('*').in('id', productIds as string[]);
        const prodMap = new Map((prods ?? []).map(p => [p.id, p as Product]));
        wlItems.forEach(i => { if (i.product_id) i.product = prodMap.get(i.product_id); });
      }
      setItems(wlItems);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [wishlistId]);

  useEffect(() => {
    (async () => {
      const wid = await ensureWishlist();
      if (wid) await loadItems(wid);
      else setLoading(false);
    })();
  }, [ensureWishlist, loadItems]);

  const addItem = useCallback(async (productId: string, variantId: string | null = null) => {
    const wid = wishlistId ?? await ensureWishlist();
    if (!wid) return;
    const exists = items.find(i => i.product_id === productId && i.variant_id === variantId);
    if (exists) return;
    await supabase.from('wishlist_items').insert({ wishlist_id: wid, product_id: productId, variant_id: variantId });
    await loadItems(wid);
  }, [wishlistId, items, ensureWishlist, loadItems]);

  const removeItem = useCallback(async (itemId: string) => {
    await supabase.from('wishlist_items').delete().eq('id', itemId);
    await loadItems();
  }, [loadItems]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(i => i.product_id === productId);
  }, [items]);

  const toggleItem = useCallback(async (productId: string, variantId: string | null = null) => {
    const existing = items.find((i) => i.product_id === productId && i.variant_id === variantId);
    if (existing) {
      await removeItem(existing.id);
      return;
    }
    await addItem(productId, variantId);
  }, [items, addItem, removeItem]);

  return { items, loading, error, addItem, removeItem, toggleItem, isInWishlist, refetch: loadItems };
}
