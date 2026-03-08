/**
 * Credit Gate — SOCELLE V3
 *
 * Checks tenant credit balance before executing expensive AI engine calls.
 * Deducts credits after successful execution using the `deduct_credits` RPC.
 *
 * Credit costs per engine (defined in V2-INTEL-02):
 *   menuOrchestrator     = 10 credits
 *   planOrchestrator     = 30 credits
 *   documentExtraction   =  5 credits
 *   mappingEngine        = 10 credits
 *   gapAnalysisEngine    = 30 credits
 *   retailAttachEngine   = 10 credits
 *   planOutputGenerator  = 30 credits
 */

import { supabase } from '../supabase';
import { createScopedLogger } from '../logger';
import { AppError } from '../errors';

const log = createScopedLogger('CreditGate');

// ── Credit Cost Map ──────────────────────────────────────────────────────────

export const ENGINE_CREDIT_COSTS: Record<string, number> = {
  menuOrchestrator: 10,
  planOrchestrator: 30,
  documentExtraction: 5,
  mappingEngine: 10,
  gapAnalysisEngine: 30,
  retailAttachEngine: 10,
  planOutputGenerator: 30,
} as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface CreditCheckResult {
  sufficient: boolean;
  currentBalance: number;
  requiredCredits: number;
  shortfall: number;
}

export interface CreditDeductionResult {
  success: boolean;
  newBalance: number;
  deducted: number;
  error?: string;
}

// ── Check Balance ────────────────────────────────────────────────────────────

/**
 * Check whether the user has enough credits for the given engine.
 * Does NOT deduct — call `deductCredits()` after successful execution.
 */
export async function checkCreditBalance(
  userId: string,
  engine: string,
): Promise<CreditCheckResult> {
  const requiredCredits = ENGINE_CREDIT_COSTS[engine];

  if (requiredCredits === undefined) {
    log.warn('Unknown engine for credit check, defaulting to 10', { engine });
  }

  const cost = requiredCredits ?? 10;

  const { data, error } = await supabase
    .from('tenant_balances')
    .select('credit_balance_usd')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    log.error('Failed to check credit balance', { userId, error: error.message });
    // Fail open for now — let the engine run and deduction will catch it
    return {
      sufficient: true,
      currentBalance: 0,
      requiredCredits: cost,
      shortfall: 0,
    };
  }

  const balance = data?.credit_balance_usd ?? 0;
  const sufficient = balance >= cost;

  if (!sufficient) {
    log.info('Insufficient credits', { userId, engine, balance, cost });
  }

  return {
    sufficient,
    currentBalance: balance,
    requiredCredits: cost,
    shortfall: sufficient ? 0 : cost - balance,
  };
}

// ── Deduct Credits ───────────────────────────────────────────────────────────

/**
 * Deduct credits after successful engine execution.
 * Uses the existing `deduct_credits` RPC in Supabase.
 */
export async function deductCredits(
  userId: string,
  engine: string,
  requestId?: string,
): Promise<CreditDeductionResult> {
  const cost = ENGINE_CREDIT_COSTS[engine] ?? 10;

  try {
    const { data: newBalance, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount_usd: cost,
      p_provider: 'socelle',
      p_model: engine,
      p_tier: 1,
      p_feature: engine,
      p_request_id: requestId ?? `${engine}_${Date.now()}`,
    });

    if (error) {
      log.error('Credit deduction failed', {
        userId,
        engine,
        cost,
        error: error.message,
      });
      return {
        success: false,
        newBalance: 0,
        deducted: 0,
        error: error.message,
      };
    }

    log.info('Credits deducted', { userId, engine, cost, newBalance });

    return {
      success: true,
      newBalance: typeof newBalance === 'number' ? newBalance : 0,
      deducted: cost,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Credit deduction exception', { userId, engine, message });
    return {
      success: false,
      newBalance: 0,
      deducted: 0,
      error: message,
    };
  }
}

// ── Gate: Check + Execute + Deduct ───────────────────────────────────────────

/**
 * Full credit gate: check balance, execute engine, deduct credits.
 * Throws `AppError` with a user-friendly message if insufficient credits.
 *
 * Usage:
 * ```ts
 * const result = await withCreditGate(userId, 'menuOrchestrator', async () => {
 *   return runMenuAnalysis(planId, brandId, menuText);
 * });
 * ```
 */
export async function withCreditGate<T>(
  userId: string,
  engine: string,
  fn: () => Promise<T>,
): Promise<T> {
  // 1. Check balance
  const check = await checkCreditBalance(userId, engine);

  if (!check.sufficient) {
    throw new AppError({
      message: `Insufficient credits for ${engine}`,
      code: 'INSUFFICIENT_CREDITS',
      userMessage:
        `You need ${check.requiredCredits} credits for this analysis but have ` +
        `${check.currentBalance}. Please upgrade your plan or purchase additional credits.`,
      isRetryable: false,
    });
  }

  // 2. Execute engine
  const result = await fn();

  // 3. Deduct credits (non-blocking — log failures but don't fail the user)
  const deduction = await deductCredits(userId, engine);
  if (!deduction.success) {
    log.error('Post-execution credit deduction failed — manual reconciliation needed', {
      userId,
      engine,
      error: deduction.error,
    });
  }

  return result;
}
