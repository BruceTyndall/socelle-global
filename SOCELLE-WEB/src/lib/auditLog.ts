// ── Audit Logger Utility — CTRL-WO-03 ───────────────────────────────────────
// Writes structured audit events to audit_logs table.
// Safe no-op when Supabase is not configured or user is not authenticated.

import { supabase, isSupabaseConfigured } from './supabase';

export type AuditAction =
  | 'feature_flag.create' | 'feature_flag.update' | 'feature_flag.delete'
  | 'entitlement.change' | 'module.toggle'
  | 'ai.request' | 'ai.blocked' | 'ai.rate_limited'
  | 'admin.login' | 'admin.action'
  | 'content.publish' | 'content.unpublish'
  | 'user.role_change' | 'user.tier_change'
  | 'credit.deduct' | 'credit.purchase';

export async function logAudit(params: {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId ?? null,
    details: params.details ?? {},
  });
}
