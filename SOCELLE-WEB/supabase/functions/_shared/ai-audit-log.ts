/**
 * AI-specific audit logging for edge functions.
 *
 * Writes to the `ai_audit_log` table (detailed AI call tracking)
 * in addition to the generic `audit_logs` table used by CTRL-WO-03.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

export type AuditStatus = 'success' | 'blocked' | 'error';

export interface AiAuditEntry {
  userId: string;
  toolName: string;
  tier: string;
  creditsBefore?: number;
  creditsAfter?: number;
  tokensUsed?: number;
  durationMs?: number;
  status: AuditStatus;
  blockedReason?: string;
  requestMeta?: Record<string, unknown>;
}

/**
 * Write a row to the `ai_audit_log` table.
 * Non-blocking — logs failures to console but does not throw.
 */
export async function writeAiAuditLog(
  supabaseAdmin: SupabaseClient,
  entry: AiAuditEntry,
): Promise<void> {
  const { error } = await supabaseAdmin.from('ai_audit_log').insert({
    user_id: entry.userId,
    tool_name: entry.toolName,
    tier: entry.tier,
    credits_before: entry.creditsBefore ?? null,
    credits_after: entry.creditsAfter ?? null,
    tokens_used: entry.tokensUsed ?? null,
    duration_ms: entry.durationMs ?? null,
    status: entry.status,
    blocked_reason: entry.blockedReason ?? null,
    request_meta: entry.requestMeta ?? null,
  });

  if (error) {
    console.warn('[ai-audit-log] write failed:', error.message);
  }
}

/**
 * Write to the generic audit_logs table (CTRL-WO-03 format).
 * Used for high-level action tracking.
 */
export async function writeGenericAuditLog(
  supabaseAdmin: SupabaseClient,
  params: {
    userId: string;
    action: 'ai.request' | 'ai.blocked' | 'ai.rate_limited';
    resourceType?: string;
    resourceId?: string | null;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    resource_type: params.resourceType ?? 'ai_orchestrator',
    resource_id: params.resourceId ?? null,
    details: params.details ?? {},
  });

  if (error) {
    console.warn('[audit-log] write failed:', error.message);
  }
}
