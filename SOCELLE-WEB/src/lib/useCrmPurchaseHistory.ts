import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

type JsonRecord = Record<string, unknown>;

interface UseCrmPurchaseHistoryParams {
  contactId?: string;
  businessId?: string | null;
  email?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ContactPurchaseItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  total_cents: number;
}

export interface ContactPurchase {
  id: string;
  order_number: string;
  status: string;
  placed_at: string;
  total_cents: number;
  item_count: number;
  items: ContactPurchaseItem[];
}

export interface ContactPurchaseSummary {
  total_orders: number;
  total_spent_cents: number;
  last_purchase_at: string | null;
}

function asObject(value: unknown): JsonRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function centsFromOrder(row: JsonRecord): number {
  const totalCents = toNumber(row.total_cents, Number.NaN);
  if (Number.isFinite(totalCents)) return Math.round(totalCents);

  const subtotalCents = toNumber(row.subtotal_cents, Number.NaN);
  if (Number.isFinite(subtotalCents)) return Math.round(subtotalCents);

  const subtotalDollars = toNumber(row.subtotal, Number.NaN);
  if (Number.isFinite(subtotalDollars)) return Math.round(subtotalDollars * 100);

  return 0;
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function normalizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\d]/g, '');
}

function getAddressField(address: unknown, key: string): string {
  const record = asObject(address);
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function rowMatchesContact(
  row: JsonRecord,
  contactId: string,
  registrationUserId: string,
  contactEmail: string,
  contactPhone: string,
): boolean {
  const metadata = asObject(row.metadata);
  const shipping = asObject(row.shipping_address);
  const billing = asObject(row.billing_address);

  const rowCreatedBy = typeof row.created_by === 'string' ? row.created_by : '';
  const rowUserId = typeof row.user_id === 'string' ? row.user_id : '';
  const rowContactId =
    typeof metadata.crm_contact_id === 'string'
      ? metadata.crm_contact_id
      : typeof metadata.contact_id === 'string'
        ? metadata.contact_id
        : '';

  const rowEmails = [
    normalizeEmail(metadata.customer_email),
    normalizeEmail(metadata.shipping_email),
    normalizeEmail(metadata.billing_email),
    normalizeEmail(getAddressField(shipping, 'email')),
    normalizeEmail(getAddressField(billing, 'email')),
  ].filter(Boolean);

  const rowPhones = [
    normalizePhone(metadata.customer_phone),
    normalizePhone(getAddressField(shipping, 'phone')),
    normalizePhone(getAddressField(billing, 'phone')),
  ].filter(Boolean);

  if (rowContactId && rowContactId === contactId) return true;
  if (registrationUserId && (rowCreatedBy === registrationUserId || rowUserId === registrationUserId)) return true;
  if (contactEmail && rowEmails.includes(contactEmail)) return true;
  if (contactPhone && rowPhones.includes(contactPhone)) return true;

  return false;
}

function buildOrderNumber(row: JsonRecord): string {
  if (typeof row.order_number === 'string' && row.order_number.length > 0) {
    return row.order_number;
  }
  const id = typeof row.id === 'string' ? row.id : '';
  return id ? `ORD-${id.slice(0, 8).toUpperCase()}` : 'Order';
}

function buildPurchaseItems(
  orderRows: JsonRecord[],
  itemRows: JsonRecord[],
): ContactPurchase[] {
  const itemsByOrder = new Map<string, ContactPurchaseItem[]>();

  for (const row of itemRows) {
    const orderId = typeof row.order_id === 'string' ? row.order_id : '';
    if (!orderId) continue;

    const snapshot = asObject(row.product_snapshot);
    const name =
      typeof row.product_name === 'string'
        ? row.product_name
        : typeof snapshot.name === 'string'
          ? snapshot.name
          : 'Product';

    const quantity = Math.max(
      1,
      Math.round(
        toNumber(row.quantity, toNumber(row.qty, 1)),
      ),
    );

    const totalCentsRaw = toNumber(row.total_price_cents, Number.NaN);
    const totalCents = Number.isFinite(totalCentsRaw)
      ? Math.round(totalCentsRaw)
      : Math.round(toNumber(row.line_total, 0) * 100);

    const item: ContactPurchaseItem = {
      id: typeof row.id === 'string' ? row.id : `${orderId}-${Math.random().toString(36).slice(2, 8)}`,
      order_id: orderId,
      product_name: name,
      quantity,
      total_cents: totalCents,
    };

    const existing = itemsByOrder.get(orderId) ?? [];
    existing.push(item);
    itemsByOrder.set(orderId, existing);
  }

  return orderRows
    .map((row) => {
      const orderId = typeof row.id === 'string' ? row.id : '';
      if (!orderId) return null;
      const items = itemsByOrder.get(orderId) ?? [];
      const totalFromItems = items.reduce((sum, item) => sum + item.total_cents, 0);
      const totalCents = centsFromOrder(row) || totalFromItems;

      return {
        id: orderId,
        order_number: buildOrderNumber(row),
        status: typeof row.status === 'string' ? row.status : 'pending',
        placed_at:
          typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
        total_cents: totalCents,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        items,
      } satisfies ContactPurchase;
    })
    .filter((purchase): purchase is ContactPurchase => purchase !== null)
    .sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime());
}

export function useCrmPurchaseHistory({
  contactId,
  businessId,
  email,
  phone,
  metadata,
}: UseCrmPurchaseHistoryParams) {
  const registrationUserId =
    metadata && typeof metadata.registration_user_id === 'string'
      ? metadata.registration_user_id
      : '';
  const contactEmail = normalizeEmail(email);
  const contactPhone = normalizePhone(phone);

  const {
    data = { purchases: [] as ContactPurchase[], summary: { total_orders: 0, total_spent_cents: 0, last_purchase_at: null as string | null } },
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['crm_contact_purchase_history', contactId, businessId, registrationUserId, contactEmail, contactPhone],
    queryFn: async () => {
      if (!contactId) {
        return {
          purchases: [] as ContactPurchase[],
          summary: {
            total_orders: 0,
            total_spent_cents: 0,
            last_purchase_at: null as string | null,
          } satisfies ContactPurchaseSummary,
        };
      }

      const orderMap = new Map<string, JsonRecord>();

      if (registrationUserId) {
        const [createdByRes, userIdRes] = await Promise.allSettled([
          supabase
            .from('orders')
            .select('*')
            .eq('created_by', registrationUserId)
            .order('created_at', { ascending: false })
            .limit(200),
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', registrationUserId)
            .order('created_at', { ascending: false })
            .limit(200),
        ]);

        if (createdByRes.status === 'fulfilled') {
          for (const row of (createdByRes.value.data ?? []) as JsonRecord[]) {
            if (typeof row.id === 'string') orderMap.set(row.id, row);
          }
        }
        if (userIdRes.status === 'fulfilled') {
          for (const row of (userIdRes.value.data ?? []) as JsonRecord[]) {
            if (typeof row.id === 'string') orderMap.set(row.id, row);
          }
        }
      }

      if (businessId) {
        const businessRes = await supabase
          .from('orders')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(300);

        for (const row of (businessRes.data ?? []) as JsonRecord[]) {
          if (typeof row.id === 'string') orderMap.set(row.id, row);
        }
      }

      const matchedOrders = Array.from(orderMap.values()).filter((row) =>
        rowMatchesContact(row, contactId, registrationUserId, contactEmail, contactPhone),
      );

      const orderIds = matchedOrders
        .map((row) => (typeof row.id === 'string' ? row.id : ''))
        .filter(Boolean);

      let itemRows: JsonRecord[] = [];
      if (orderIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        itemRows = (itemsData ?? []) as JsonRecord[];
      }

      const purchases = buildPurchaseItems(matchedOrders, itemRows);
      const summary: ContactPurchaseSummary = {
        total_orders: purchases.length,
        total_spent_cents: purchases.reduce((sum, purchase) => sum + purchase.total_cents, 0),
        last_purchase_at: purchases[0]?.placed_at ?? null,
      };

      return { purchases, summary };
    },
    enabled: !!contactId,
  });

  const error = queryError instanceof Error ? queryError.message : null;
  const isLive = data.purchases.length > 0;

  return {
    purchases: data.purchases,
    summary: data.summary,
    loading,
    error,
    isLive,
    refetch,
  };
}

