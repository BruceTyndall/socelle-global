import { supabase } from './supabase';
import { createScopedLogger } from './logger';

const log = createScopedLogger('CrmRegistration');

type SignupSource = 'portal_signup' | 'claim_business_signup' | 'claim_business_existing';

interface SyncSignupToCrmParams {
  businessId: string;
  userId: string;
  email: string;
  source: SignupSource;
  metadata?: Record<string, unknown>;
}

interface SyncSignupToCrmResult {
  ok: boolean;
  contactId?: string;
  error?: string;
}

function toTitleCase(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;
}

function deriveNameFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split('@')[0] ?? 'new.user';
  const parts = local
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .split(/[._-]+/)
    .filter(Boolean);

  const firstName = toTitleCase(parts[0] ?? 'New');
  const lastName = toTitleCase(parts[1] ?? 'User');
  return { firstName, lastName };
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export async function syncSignupToCrm(
  params: SyncSignupToCrmParams,
): Promise<SyncSignupToCrmResult> {
  const normalizedEmail = params.email.trim().toLowerCase();
  if (!params.businessId || !params.userId || !normalizedEmail) {
    return { ok: false, error: 'Missing required CRM registration fields.' };
  }

  const now = new Date().toISOString();
  const { firstName, lastName } = deriveNameFromEmail(normalizedEmail);

  try {
    const { data: existing, error: existingError } = await supabase
      .from('crm_contacts')
      .select('id, metadata, first_name, last_name')
      .eq('business_id', params.businessId)
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const registrationMetadata = {
      registration_source: params.source,
      registration_user_id: params.userId,
      registration_synced_at: now,
      ...(params.metadata ?? {}),
    };

    let contactId: string;

    if (existing?.id) {
      const baseMetadata = asObject(existing.metadata);
      const mergedMetadata: Record<string, unknown> = {
        ...baseMetadata,
        ...registrationMetadata,
      };

      const updatePayload: Record<string, unknown> = {
        source: params.source,
        last_contacted_at: now,
        metadata: mergedMetadata,
      };

      const currentFirst = (existing.first_name ?? '').toLowerCase();
      const currentLast = (existing.last_name ?? '').toLowerCase();
      if (currentFirst === 'new' || currentFirst === 'user' || !existing.first_name) {
        updatePayload.first_name = firstName;
      }
      if (currentLast === 'user' || !existing.last_name) {
        updatePayload.last_name = lastName;
      }

      const { error: updateError } = await supabase
        .from('crm_contacts')
        .update(updatePayload)
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      contactId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('crm_contacts')
        .insert({
          business_id: params.businessId,
          type: 'lead',
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          lifecycle_stage: 'lead',
          source: params.source,
          last_contacted_at: now,
          metadata: registrationMetadata,
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      contactId = inserted.id as string;
    }

    await Promise.allSettled([
      supabase.from('crm_contact_tags').insert({
        contact_id: contactId,
        tag: 'signup',
      }),
      supabase.from('crm_interactions').insert({
        business_id: params.businessId,
        contact_id: contactId,
        type: 'note',
        subject: 'Signup captured',
        notes: `Signup source: ${params.source}`,
        occurred_at: now,
      }),
    ]);

    return { ok: true, contactId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync signup to CRM.';
    log.warn('Signup to CRM sync failed', {
      error: message,
      businessId: params.businessId,
      userId: params.userId,
      source: params.source,
    });
    return { ok: false, error: message };
  }
}
