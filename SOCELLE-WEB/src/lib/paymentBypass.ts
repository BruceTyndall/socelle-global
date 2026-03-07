/**
 * Payment Bypass — Autonomous Core Intelligence Mode
 *
 * When true: all subscription/paywall checks are bypassed; every user is
 * treated as PRO. No Stripe/RevenueCat/subscriptions table is used.
 * See /docs/SOCELLE_Master_Strategy_Build_Directive.md.
 *
 * Keep this OFF by default. Enable only in explicit preview/dev contexts.
 */
/** Default false: bypass only when VITE_PAYMENT_BYPASS=true. */
export const PAYMENT_BYPASS =
  import.meta.env.VITE_PAYMENT_BYPASS === 'true';
