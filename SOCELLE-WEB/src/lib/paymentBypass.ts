/**
 * Payment Bypass — Autonomous Core Intelligence Mode
 *
 * When true: all subscription/paywall checks are bypassed; every user is
 * treated as PRO. No Stripe/RevenueCat/subscriptions table is used.
 * See /docs/SOCELLE_Master_Strategy_Build_Directive.md.
 *
 * Set to false when payments are unblocked and PaywallGate/UpgradeGate
 * should enforce again.
 */
/** Default true: bypass on unless VITE_PAYMENT_BYPASS=false. */
export const PAYMENT_BYPASS =
  import.meta.env.VITE_PAYMENT_BYPASS !== 'false';
