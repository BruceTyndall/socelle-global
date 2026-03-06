import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  productType: 'pro' | 'retail';
  unitPrice: number;
  qty: number;
  sku?: string;
}

function getStorageKey(brandId: string) {
  return `cart_${brandId}`;
}

function loadFromStorage(brandId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(brandId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(brandId: string, items: CartItem[]) {
  try {
    localStorage.setItem(getStorageKey(brandId), JSON.stringify(items));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) — fail silently
  }
}

export function useCart(brandId: string) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage(brandId));

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveToStorage(brandId, items);
  }, [brandId, items]);

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i => i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i));
    }
  }, []);

  const removeItem = useCallback(
    (productId: string) => setItems(prev => prev.filter(i => i.productId !== productId)),
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(getStorageKey(brandId)); } catch { /* ignore */ }
  }, [brandId]);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount };
}
