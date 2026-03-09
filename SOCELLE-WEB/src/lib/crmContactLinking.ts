import { supabase } from './supabase';
import { createScopedLogger } from './logger';

const log = createScopedLogger('CrmContactLinking');

interface UpsertBookingContactParams {
  businessId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
  notes?: string | null;
}

function normalizeEmail(value?: string | null): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

function normalizePhone(value?: string | null): string {
  if (!value) return '';
  return value.trim();
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

async function insertContactRecord(
  payload: Record<string, unknown>,
  ownerId?: string | null,
): Promise<string | null> {
  const attempt = async (row: Record<string, unknown>) =>
    supabase
      .from('crm_contacts')
      .insert(row)
      .select('id')
      .single();

  const primary = await attempt(payload);
  if (!primary.error && primary.data?.id) {
    return primary.data.id as string;
  }

  if (ownerId) {
    const retryPayload = { ...payload, owner_id: ownerId };
    const retry = await attempt(retryPayload);
    if (!retry.error && retry.data?.id) {
      return retry.data.id as string;
    }
  }

  if (primary.error) {
    throw new Error(primary.error.message);
  }

  return null;
}

export async function upsertBookingContact(
  params: UpsertBookingContactParams,
): Promise<string | null> {
  const email = normalizeEmail(params.email);
  const phone = normalizePhone(params.phone);
  if (!params.businessId || (!email && !phone)) {
    return null;
  }

  const now = new Date().toISOString();
  const source = params.source ?? 'booking';

  try {
    let existing:
      | { id: string; metadata: Record<string, unknown> | null }
      | null = null;

    if (email) {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('id, metadata')
        .eq('business_id', params.businessId)
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      existing = (data as { id: string; metadata: Record<string, unknown> | null } | null) ?? null;
    }

    if (!existing && phone) {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('id, metadata')
        .eq('business_id', params.businessId)
        .eq('phone', phone)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      existing = (data as { id: string; metadata: Record<string, unknown> | null } | null) ?? null;
    }

    if (existing?.id) {
      const metadata = {
        ...asObject(existing.metadata),
        booking_linked_at: now,
        booking_source: source,
      };

      await supabase
        .from('crm_contacts')
        .update({
          first_name: params.firstName || undefined,
          last_name: params.lastName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          source,
          metadata,
          last_contacted_at: now,
        })
        .eq('id', existing.id);

      await Promise.allSettled([
        supabase.from('crm_contact_tags').insert({
          contact_id: existing.id,
          tag: 'booking',
        }),
        supabase.from('crm_interactions').insert({
          business_id: params.businessId,
          contact_id: existing.id,
          type: 'meeting',
          subject: 'Appointment scheduled',
          notes: params.notes ?? 'Booking linked to CRM contact.',
          occurred_at: now,
        }),
      ]);

      return existing.id;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const insertPayload: Record<string, unknown> = {
      business_id: params.businessId,
      type: 'client',
      first_name: params.firstName || 'Client',
      last_name: params.lastName || 'Booking',
      email: email || null,
      phone: phone || null,
      lifecycle_stage: 'prospect',
      source,
      last_contacted_at: now,
      metadata: {
        booking_linked_at: now,
        booking_source: source,
      },
    };

    const contactId = await insertContactRecord(insertPayload, user?.id ?? null);
    if (!contactId) return null;

    await Promise.allSettled([
      supabase.from('crm_contact_tags').insert({
        contact_id: contactId,
        tag: 'booking',
      }),
      supabase.from('crm_interactions').insert({
        business_id: params.businessId,
        contact_id: contactId,
        type: 'meeting',
        subject: 'Appointment scheduled',
        notes: params.notes ?? 'Booking linked to CRM contact.',
        occurred_at: now,
      }),
    ]);

    return contactId;
  } catch (error) {
    log.warn('Booking contact upsert skipped', {
      error: error instanceof Error ? error.message : 'unknown',
      businessId: params.businessId,
    });
    return null;
  }
}
