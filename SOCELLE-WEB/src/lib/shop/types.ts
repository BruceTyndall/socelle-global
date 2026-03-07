// Shop ecommerce types — derived from database.types.ts tables
import type { Tables } from '../database.types';

export type Product = Tables<'products'>;
export type ProductCategory = Tables<'product_categories'>;
export type ProductVariant = Tables<'product_variants'>;
export type ShopOrder = Tables<'orders'> & { items?: ShopOrderItem[] };
export type ShopOrderItem = Tables<'order_items'>;
export type Cart = Tables<'carts'>;
export type CartItem = Tables<'cart_items'> & { product?: Product; variant?: ProductVariant };
export type DiscountCode = Tables<'discount_codes'>;
export type ShippingMethod = Tables<'shipping_methods'>;
export type Review = Tables<'reviews'>;
export type Wishlist = Tables<'wishlists'>;
export type WishlistItem = Tables<'wishlist_items'> & { product?: Product };

export interface ProductFilters {
  category_id?: string;
  search?: string;
  min_price_cents?: number;
  max_price_cents?: number;
  in_stock?: boolean;
  min_rating?: number;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  per_page?: number;
}

export interface CartSummary {
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  item_count: number;
}

export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
