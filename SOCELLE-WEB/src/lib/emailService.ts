/**
 * emailService.ts — Client-side wrapper for the send-email Edge Function.
 *
 * Usage:
 *   await sendWelcomeEmail(user.email, { spa_name: 'Zen Spa' });
 *   await sendPlanCompleteEmail(user.email, { plan_id, spa_name, brand_name, fit_score });
 *   await sendOrderStatusEmail(user.email, { order_number, status, brand_name, subtotal });
 *   await sendOrderStatusEmailByOrderId(orderId, { order_number, status, brand_name, subtotal }); // recipient resolved server-side
 *   await sendNewOrderEmail(brandContactEmail, { order_number, business_name, brand_name, subtotal });
 */

import { supabase } from './supabase';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
const APP_URL = window.location.origin;

async function callEmailFunction(
  type: string,
  data: Record<string, any>,
  to?: string
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const body: Record<string, unknown> = { type, data: { ...data, app_url: APP_URL } };
    if (to) body.to = to;

    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`Email (${type}) failed:`, err);
    }
  } catch (err) {
    // Email is best-effort — never block the main flow
    console.warn(`Email (${type}) exception:`, err);
  }
}

export async function sendWelcomeEmail(
  to: string,
  data: { spa_name?: string }
): Promise<void> {
  await callEmailFunction('welcome', data, to);
}

export async function sendPlanCompleteEmail(
  to: string,
  data: {
    plan_id: string;
    spa_name?: string;
    brand_name?: string;
    fit_score?: number | null;
  }
): Promise<void> {
  await callEmailFunction('plan_complete', data, to);
}

export async function sendOrderStatusEmail(
  to: string,
  data: {
    order_id?: string;
    order_number?: string;
    status: string;
    brand_name?: string;
    subtotal?: number;
  }
): Promise<void> {
  await callEmailFunction('order_status', data, to);
}

/** Send order status email to the reseller who placed the order; recipient is resolved by the Edge Function from order_id. */
export async function sendOrderStatusEmailByOrderId(
  orderId: string,
  data: {
    order_number?: string;
    status: string;
    brand_name?: string;
    subtotal?: number;
    tracking_number?: string;
  }
): Promise<void> {
  await callEmailFunction('order_status', { ...data, order_id: orderId });
}

export async function sendNewOrderEmail(
  to: string,
  data: {
    order_number?: string;
    order_id?: string;
    business_name?: string;
    brand_name?: string;
    subtotal?: number;
  }
): Promise<void> {
  await callEmailFunction('new_order', data, to);
}
