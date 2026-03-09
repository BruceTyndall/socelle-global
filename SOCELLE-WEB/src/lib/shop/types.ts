// Shop ecommerce types — derived from database.types.ts tables
import type { Json, Tables } from '../database.types';

type OrderRow = Tables<'orders'>;
type OrderItemRow = Tables<'order_items'>;

type JsonRecord = Record<string, Json | undefined>;

export type Product = Tables<'products'> & {
  // Some surfaces expect rating projection from views/materialized joins.
  avg_rating?: number | null;
  // Legacy OpenGraph and PDP surfaces still read a single-image alias.
  image_url?: string | null;
};
export type ProductCategory = Tables<'product_categories'>;
export type ProductVariant = Tables<'product_variants'>;
export type Cart = Tables<'carts'>;
export type CartItem = Tables<'cart_items'> & { product?: Product; variant?: ProductVariant };
export type DiscountCode = Tables<'discount_codes'>;
export type ShippingMethod = Tables<'shipping_methods'> & {
  // Legacy UI expects this alias.
  price_cents?: number;
};
export type Review = Tables<'reviews'>;
export type Wishlist = Tables<'wishlists'>;
export type WishlistItem = Tables<'wishlist_items'> & { product?: Product };

export type ShopOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'pending_payment'
  | 'submitted'
  | 'reviewing'
  | 'sent_to_brand'
  | 'fulfilled';

export type ShopOrder = Omit<OrderRow, 'status'> & {
  status: ShopOrderStatus;
  items?: ShopOrderItem[];
  user_id: string | null;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  stripe_charge_id: string | null;
  metadata: JsonRecord;
};

export type ShopOrderItem = Omit<OrderItemRow, 'qty' | 'unit_price' | 'line_total'> & {
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  product_snapshot: JsonRecord;
  variant_name: string | null;
};

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

function toCents(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return fallback;
}

function toDollarsAsCents(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value * 100);
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed * 100);
  }
  return fallback;
}

export function normalizeShopOrder(row: OrderRow): ShopOrder {
  const source = row as unknown as Record<string, unknown>;
  const subtotalCents = toCents(source.subtotal_cents, toDollarsAsCents(row.subtotal, 0));
  const discountCents = toCents(source.discount_cents, 0);
  const taxCents = toCents(source.tax_cents, 0);
  const shippingCents = toCents(source.shipping_cents, 0);
  const totalCents = toCents(
    source.total_cents,
    Math.max(0, subtotalCents - discountCents + taxCents + shippingCents)
  );
  const rawStatus = String(source.status ?? row.status ?? 'pending_payment');
  const statusMap: Record<string, ShopOrderStatus> = {
    pending_payment: 'pending',
    submitted: 'confirmed',
    reviewing: 'processing',
    sent_to_brand: 'processing',
    fulfilled: 'processing',
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'refunded',
  };

  return {
    ...row,
    status: statusMap[rawStatus] ?? 'pending',
    user_id:
      (typeof source.user_id === 'string' ? source.user_id : null) ??
      row.created_by ??
      null,
    subtotal_cents: subtotalCents,
    discount_cents: discountCents,
    tax_cents: taxCents,
    shipping_cents: shippingCents,
    total_cents: totalCents,
    currency: typeof source.currency === 'string' ? source.currency : 'USD',
    stripe_charge_id: typeof source.stripe_charge_id === 'string' ? source.stripe_charge_id : null,
    metadata:
      source.metadata && typeof source.metadata === 'object' && !Array.isArray(source.metadata)
        ? (source.metadata as JsonRecord)
        : {},
  };
}

export function normalizeShopOrderItem(row: OrderItemRow): ShopOrderItem {
  const source = row as unknown as Record<string, unknown>;
  const quantity = toCents(source.quantity, row.qty ?? 1);
  const unitPriceCents = toCents(source.unit_price_cents, toDollarsAsCents(row.unit_price, 0));
  const totalPriceCents = toCents(
    source.total_price_cents,
    toDollarsAsCents(row.line_total, unitPriceCents * quantity)
  );
  const fallbackSnapshot: JsonRecord = {
    id: row.product_id,
    name: row.product_name,
    sku: row.sku ?? undefined,
    product_type: row.product_type,
  };

  return {
    ...row,
    quantity,
    unit_price_cents: unitPriceCents,
    total_price_cents: totalPriceCents,
    product_snapshot:
      source.product_snapshot && typeof source.product_snapshot === 'object' && !Array.isArray(source.product_snapshot)
        ? (source.product_snapshot as JsonRecord)
        : fallbackSnapshot,
    variant_name: typeof source.variant_name === 'string' ? source.variant_name : null,
  };
}
