/**
 * send-email — Supabase Edge Function
 *
 * Handles transactional emails for:
 *   - welcome: sent when a new user signs up
 *   - plan_complete: sent when a plan analysis finishes
 *   - order_status: sent when an order status changes (to reseller; recipient resolved from order_id when to is omitted)
 *   - new_order: sent to brand when a reseller places an order
 *   - access_request: sent to admin (ADMIN_EMAIL) when a new access request is submitted
 *
 * Uses Resend (https://resend.com) as the email provider.
 * Requires RESEND_API_KEY and FROM_EMAIL to be set as Supabase secrets.
 * For order_status with data.order_id (no to), requires SUPABASE_SERVICE_ROLE_KEY (auto-injected).
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  type: 'welcome' | 'plan_complete' | 'order_status' | 'new_order' | 'access_request';
  to?: string; // optional for order_status (resolved from order_id) and access_request (resolved from ADMIN_EMAIL)
  data?: Record<string, any>;
}

async function sendWithResend(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('FROM_EMAIL') || 'noreply@brandplatform.com';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — email not sent');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return false;
  }

  return true;
}

function buildWelcomeEmail(data: Record<string, any>): { subject: string; html: string } {
  const name = data.spa_name || data.email || 'there';
  return {
    subject: 'Welcome to Socelle — See where your revenue is hiding',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #8C6B6E;">socelle</span><span style="color: #D4A44C; font-family: Georgia, serif; font-size: 22px;">.</span>
        </div>
        <h1 style="color: #1A1714; margin-bottom: 8px; font-size: 24px;">Welcome, ${name}!</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Your account is ready. Upload your service menu and we'll show you exactly where you're
          leaving revenue on the table — in under 2 minutes.
        </p>
        <div style="background: #FFF8E1; border: 1px solid #D4A44C40; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <div style="font-size: 13px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">What you'll see</div>
          <div style="font-size: 15px; color: #1A1714; line-height: 1.6;">
            ✦ Protocol match score across your menu<br/>
            ✦ Revenue gaps with dollar estimates<br/>
            ✦ Personalized brand recommendations
          </div>
        </div>
        <div style="margin: 32px 0;">
          <a href="${data.app_url || 'https://yourapp.com'}/portal"
             style="background: #8C6B6E; color: white; padding: 14px 28px; border-radius: 12px;
                    text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">
            Upload Your Menu →
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
  };
}

function buildPlanCompleteEmail(data: Record<string, any>): { subject: string; html: string } {
  const spaName = data.spa_name || 'Your spa';
  const brandName = data.brand_name || 'the brand';
  const fitScore = data.fit_score != null ? `${data.fit_score}%` : 'N/A';
  const planUrl = data.plan_url || `${data.app_url || 'https://yourapp.com'}/portal/plans/${data.plan_id}`;

  return {
    subject: `Your implementation plan for ${brandName} is ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f; margin-bottom: 8px;">Your Plan Is Ready</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          We've completed the analysis for <strong>${spaName}</strong> with <strong>${brandName}</strong>.
        </p>
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <div style="font-size: 14px; color: #0369a1; margin-bottom: 4px;">Brand Fit Score</div>
          <div style="font-size: 36px; font-weight: 700; color: #1e40af;">${fitScore}</div>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Your plan includes protocol matches, service gap analysis, retail recommendations,
          and a personalized 90-day implementation roadmap.
        </p>
        <div style="margin: 32px 0;">
          <a href="${planUrl}"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px;
                    text-decoration: none; font-weight: 600; display: inline-block;">
            View Your Plan
          </a>
        </div>
      </div>
    `,
  };
}

function buildOrderStatusEmail(data: Record<string, any>): { subject: string; html: string } {
  const status = data.status || 'updated';
  const orderNumber = data.order_number || data.order_id || 'N/A';
  const brandName = data.brand_name || 'the brand';

  const statusMessages: Record<string, { label: string; color: string; message: string }> = {
    submitted: {
      label: 'Order Submitted',
      color: '#f59e0b',
      message: 'Your order has been submitted and is awaiting review.',
    },
    reviewing: {
      label: 'Under Review',
      color: '#3b82f6',
      message: `${brandName} is reviewing your order. You'll hear back soon.`,
    },
    confirmed: {
      label: 'Order Confirmed',
      color: '#10b981',
      message: `Your order has been confirmed by ${brandName} and is being processed.`,
    },
    fulfilled: {
      label: 'Order Fulfilled',
      color: '#059669',
      message: 'Your order has been fulfilled and is on its way.',
    },
    shipped: {
      label: 'Order Shipped',
      color: '#10b981',
      message: `Your order has shipped. ${data.tracking_number ? `Tracking: ${data.tracking_number}` : ''}`,
    },
    delivered: {
      label: 'Order Delivered',
      color: '#059669',
      message: 'Your order has been delivered.',
    },
    cancelled: {
      label: 'Order Cancelled',
      color: '#ef4444',
      message: 'Your order has been cancelled. Please contact support if you have questions.',
    },
  };

  const statusInfo = statusMessages[status] || {
    label: 'Order Updated',
    color: '#6b7280',
    message: `Your order #${orderNumber} has been updated to: ${status}.`,
  };

  return {
    subject: `Order #${orderNumber} — ${statusInfo.label}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f; margin-bottom: 8px;">${statusInfo.label}</h1>
        <div style="display: inline-block; background: ${statusInfo.color}1a; border: 1px solid ${statusInfo.color}40;
                    color: ${statusInfo.color}; padding: 4px 12px; border-radius: 999px; font-size: 14px;
                    font-weight: 600; margin-bottom: 16px;">
          ${statusInfo.label}
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          ${statusInfo.message}
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">Order Number</div>
          <div style="font-size: 18px; font-weight: 600; color: #1e293b;">#${orderNumber}</div>
          ${data.subtotal ? `<div style="font-size: 13px; color: #94a3b8; margin-top: 8px;">Subtotal: $${Number(data.subtotal).toFixed(2)}</div>` : ''}
        </div>
        <div style="margin: 32px 0;">
          <a href="${data.app_url || 'https://yourapp.com'}/portal/orders"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px;
                    text-decoration: none; font-weight: 600; display: inline-block;">
            View My Orders
          </a>
        </div>
      </div>
    `,
  };
}

function buildNewOrderEmail(data: Record<string, any>): { subject: string; html: string } {
  const orderNumber = data.order_number || data.order_id || 'N/A';
  const businessName = data.business_name || 'A retailer';
  const brandName = data.brand_name || 'your brand';
  const subtotal = data.subtotal != null ? `$${Number(data.subtotal).toFixed(2)}` : '';

  return {
    subject: `New order #${orderNumber} from ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f; margin-bottom: 8px;">New order received</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          <strong>${businessName}</strong> has placed an order for <strong>${brandName}</strong>.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <div style="font-size: 13px; color: #166534; margin-bottom: 4px;">Order Number</div>
          <div style="font-size: 18px; font-weight: 600; color: #14532d;">#${orderNumber}</div>
          ${subtotal ? `<div style="font-size: 13px; color: #166534; margin-top: 8px;">Subtotal: ${subtotal}</div>` : ''}
        </div>
        <div style="margin: 32px 0;">
          <a href="${data.app_url || 'https://yourapp.com'}/brand/orders"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px;
                    text-decoration: none; font-weight: 600; display: inline-block;">
            View order in Socelle
          </a>
        </div>
      </div>
    `,
  };
}

function buildAccessRequestEmail(data: Record<string, any>): { subject: string; html: string } {
  const contactName  = data.contact_name  || 'Unknown';
  const businessName = data.business_name || 'Unknown';
  const businessType = data.business_type || '—';
  const email        = data.email         || '—';
  const referral     = data.referral_source || '—';
  const createdAt    = data.created_at    || 'just now';
  const requestId    = data.request_id    || '';
  const adminUrl     = Deno.env.get('APP_URL') || 'https://app.socelle.com';

  return {
    subject: `New access request — ${businessName} (${email})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #8C6B6E;">socelle</span><span style="color: #D4A44C; font-family: Georgia, serif; font-size: 22px;">.</span>
        </div>
        <h1 style="color: #141418; margin-bottom: 8px; font-size: 22px;">New access request</h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          A new operator has requested intelligence access. Review and approve in the admin portal.
        </p>
        <div style="background: #F6F3EF; border: 1px solid #D4A44C40; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 12px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px;">Contact</td>
              <td style="font-size: 15px; color: #141418; padding: 6px 0 2px;">${contactName}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px;">Business</td>
              <td style="font-size: 15px; color: #141418; padding: 6px 0 2px;">${businessName}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px;">Type</td>
              <td style="font-size: 15px; color: #141418; padding: 6px 0 2px;">${businessType}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px;">Email</td>
              <td style="font-size: 15px; color: #141418; padding: 6px 0 2px;">${email}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px;">Referral</td>
              <td style="font-size: 15px; color: #141418; padding: 6px 0 2px;">${referral}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #8C6B6E; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px;">Submitted</td>
              <td style="font-size: 15px; color: #141418; padding: 6px 0 2px;">${createdAt}</td>
            </tr>
          </table>
        </div>
        <div style="margin: 24px 0;">
          <a href="${adminUrl}/admin/access-requests${requestId ? `?highlight=${requestId}` : ''}"
             style="background: #8C6B6E; color: white; padding: 14px 28px; border-radius: 12px;
                    text-decoration: none; font-weight: 600; display: inline-block; font-size: 15px;">
            Review in Admin Portal →
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
          This is an automated notification from the Socelle access request system.
        </p>
      </div>
    `,
  };
}

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('send-email', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { type, data = {} } = payload;
    let { to } = payload;

    // access_request: recipient is ADMIN_EMAIL env var (falls back to FROM_EMAIL)
    if (type === 'access_request' && !to) {
      to = Deno.env.get('ADMIN_EMAIL') || Deno.env.get('FROM_EMAIL');
      if (!to) {
        return new Response(JSON.stringify({ error: 'ADMIN_EMAIL not configured for access_request notifications' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // order_status: resolve recipient from order_id when to is not provided
    if (type === 'order_status' && !to && data.order_id) {
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      if (!serviceRoleKey || !supabaseUrl) {
        return new Response(JSON.stringify({ error: 'Server config missing for order_status lookup' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: orderRow, error: orderErr } = await admin
        .from('orders')
        .select('created_by')
        .eq('id', data.order_id)
        .single();
      if (orderErr || !orderRow?.created_by) {
        console.warn('Order or created_by not found for order_status email', data.order_id);
        return new Response(JSON.stringify({ error: 'Order or recipient not found' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      const { data: userData, error: userErr } = await admin.auth.admin.getUserById(orderRow.created_by);
      if (userErr || !userData?.user?.email) {
        console.warn('User email not found for order_status', orderRow.created_by);
        return new Response(JSON.stringify({ error: 'Recipient email not found' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      to = userData.user.email;
    }

    if (!to) {
      return new Response(JSON.stringify({ error: 'Missing recipient email' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let subject = '';
    let html = '';

    if (type === 'welcome') {
      ({ subject, html } = buildWelcomeEmail(data));
    } else if (type === 'plan_complete') {
      ({ subject, html } = buildPlanCompleteEmail(data));
    } else if (type === 'order_status') {
      ({ subject, html } = buildOrderStatusEmail(data));
    } else if (type === 'new_order') {
      ({ subject, html } = buildNewOrderEmail(data));
    } else if (type === 'access_request') {
      ({ subject, html } = buildAccessRequestEmail(data));
    } else {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const sent = await sendWithResend(to, subject, html);

    return new Response(
      JSON.stringify({ success: sent, type, to }),
      {
        status: sent ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('send-email error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
