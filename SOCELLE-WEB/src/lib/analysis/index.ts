/**
 * Analysis Engine Module — SOCELLE V3
 *
 * Barrel export for the three cross-cutting concerns shared by all engines:
 *   1. Guardrails (AI safety — §O)
 *   2. Credit Gate (credit check + deduction)
 *   3. Signal Enrichment (live market_signals integration)
 */

export {
  validateInput,
  validateOutput,
  blockedResult,
  withGuardrails,
  type GuardrailResult,
  type GuardrailMeta,
  type InputValidationResult,
} from './guardrails';

export {
  checkCreditBalance,
  deductCredits,
  withCreditGate,
  ENGINE_CREDIT_COSTS,
  type CreditCheckResult,
  type CreditDeductionResult,
} from './creditGate';

export {
  fetchRelevantSignals,
  fetchSignalsForServiceCategories,
  fetchPricingBenchmarks,
  type MarketSignal,
  type SignalEnrichment,
} from './signalEnrichment';
