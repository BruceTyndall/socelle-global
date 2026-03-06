/**
 * Email templates for all retention/churn/resurrection interventions.
 * Each function returns { subject, html, text }.
 *
 * Copy follows the blueprint verbatim:
 * - No shame framing
 * - Honest, specific, one CTA
 * - Forward-looking, not loss-focused
 */

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const APP_URL = "https://app.slotforce.app";
const SUPPORT_EMAIL = "support@slotforce.app";

// ── Tier 2: Value Memory (8-14 days absent) ───────────────────────────────────

export function tier2ValueMemory(params: {
  name: string;
  lastRecoveryAmount: number;
  cumulativeLeakage: number;
  openGapCount: number;
}): EmailContent {
  const { name, lastRecoveryAmount, cumulativeLeakage, openGapCount } = params;
  const subject = `You recovered $${Math.round(lastRecoveryAmount)} last time you were active`;
  const body =
    `Hi ${firstName(name)},\n\n` +
    `Last time you were active in SLOTFORCE, you recovered $${Math.round(lastRecoveryAmount)}.\n\n` +
    `Your schedule has moved on — new gaps are open that weren't there before.\n` +
    (openGapCount > 0
      ? `Right now, you have ${openGapCount} open gap${openGapCount === 1 ? "" : "s"} this week.\n\n`
      : `\n`) +
    `All-time leakage detected: $${Math.round(cumulativeLeakage)}.\n\n` +
    `See what's open now: ${APP_URL}\n\n` +
    `— The SLOTFORCE team`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Tier 3: Account Summary (15-29 days absent) ───────────────────────────────

export function tier3AccountSummary(params: {
  name: string;
  totalLeakage: number;
  recovered: number;
  openGaps: number;
  renewalDate?: string;
}): EmailContent {
  const { name, totalLeakage, recovered, openGaps, renewalDate } = params;
  const subject = `Your SLOTFORCE account — ${currentMonthYear()} summary`;
  const body =
    `Hi ${firstName(name)},\n\n` +
    `Total detected leakage since signup: $${Math.round(totalLeakage)}\n` +
    `Total recovered (if any): $${Math.round(recovered)}\n` +
    `Current open gaps this week: ${openGaps}\n\n` +
    (renewalDate ? `Your subscription renews on ${renewalDate}. ` : "") +
    `Here's what's open right now: ${APP_URL}\n\n` +
    `— The SLOTFORCE team`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Tier 4: Renewal Awareness (7 days before charge) ─────────────────────────

export function tier4RenewalAwareness(params: {
  name: string;
  renewalDate: string;
  amount: number;
  gapCount: number;
  estimatedLeakage: number;
}): EmailContent {
  const { name, renewalDate, amount, gapCount, estimatedLeakage } = params;
  const subject = `Your SLOTFORCE subscription renews in 7 days`;
  const body =
    `Hi ${firstName(name)} —\n\n` +
    `Your subscription renews ${renewalDate} at $${Math.round(amount)}/month.\n\n` +
    `Since your last login, your calendar has had ${gapCount} detectable gap${gapCount === 1 ? "" : "s"} ` +
    `totaling $${Math.round(estimatedLeakage)}. We haven't been able to flag them in time ` +
    `because the app wasn't open.\n\n` +
    `If you want to pause or cancel, you can do that in settings — no questions asked.\n` +
    `If you want to see what's currently open: ${APP_URL}\n\n` +
    `Either way, we wanted you to know before the renewal hit.\n\n` +
    `— The SLOTFORCE team`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Tier 4: Account Health (non-renewal period) ───────────────────────────────

export function tier4AccountHealth(params: {
  name: string;
  daysSinceOpen: number;
  openGapCount: number;
}): EmailContent {
  const { name, daysSinceOpen, openGapCount } = params;
  const subject = `Something's off with your SLOTFORCE account`;
  const body =
    `Hi ${firstName(name)},\n\n` +
    `We haven't seen any activity on your account in ${daysSinceOpen} days, ` +
    `which usually means one of a few things:\n\n` +
    `— You've been too busy to check in (we get it)\n` +
    `— The calendar sync may have drifted and gaps aren't showing correctly\n` +
    `— The product isn't working the way you hoped\n\n` +
    `If it's the third one, reply to this email. ` +
    (openGapCount > 0
      ? `If it's the first or second, here's what's open right now: ${APP_URL}`
      : `We're here either way.`) +
    `\n\n— The SLOTFORCE team\n${SUPPORT_EMAIL}`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Day 30 Resurrection ────────────────────────────────────────────────────────

export function day30Resurrection(params: {
  name: string;
  estimatedMissedValue: number;
  gapCount: number;
}): EmailContent {
  const { name, estimatedMissedValue, gapCount } = params;
  const subject = `What your schedule looked like last month`;
  const body =
    `Hi ${firstName(name)},\n\n` +
    `It's been about a month since you cancelled SLOTFORCE. ` +
    `We ran your calendar data one last time (we'll stop after this).\n\n` +
    `In the 30 days since you left, your schedule would have shown ` +
    `${gapCount} detectable gap${gapCount === 1 ? "" : "s"} totaling ` +
    `$${Math.round(estimatedMissedValue)}.\n\n` +
    `We're not sending this to pressure you. We're sending it because some providers ` +
    `come back after seeing the number, and we'd rather you make that call with the ` +
    `real data in front of you.\n\n` +
    `If you want to restart: ${APP_URL}\n\n` +
    `If not, no hard feelings — we hope the work is going well.\n\n` +
    `— The SLOTFORCE team`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Seasonal Re-entry ─────────────────────────────────────────────────────────

export function seasonalReEntry(params: {
  name: string;
  season: string;
  providerType: string;
}): EmailContent {
  const { name, season, providerType } = params;
  const providerLabel = formatProviderType(providerType);
  const subject = `${season} is a high-gap period for ${providerLabel}s`;
  const body =
    `Hi ${firstName(name)},\n\n` +
    `${season} is historically when ${providerLabel}s see the most schedule volatility ` +
    `— both demand spikes and unexpected gaps.\n\n` +
    `If you want to try SLOTFORCE again for 30 days, your account is still there.\n\n` +
    `Restart my account: ${APP_URL}\n\n` +
    `— The SLOTFORCE team`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Product Update Resurrection ───────────────────────────────────────────────

export function productUpdateReEntry(params: {
  name: string;
  featureHighlight: string;
}): EmailContent {
  const { name, featureHighlight } = params;
  const subject = `New in SLOTFORCE: ${featureHighlight}`;
  const body =
    `Hi ${firstName(name)},\n\n` +
    `We've made some significant improvements to SLOTFORCE since you left.\n\n` +
    `${featureHighlight}\n\n` +
    `If you want to check it out, your account is still there: ${APP_URL}\n\n` +
    `— The SLOTFORCE team`;

  return {
    subject,
    html: wrapHtml(subject, body),
    text: body,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function firstName(name: string): string {
  if (!name || name.trim() === "") return "there";
  return name.split(" ")[0];
}

function currentMonthYear(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatProviderType(type: string): string {
  return {
    hair_stylist: "hair stylist",
    barber: "barber",
    nail_tech: "nail tech",
    esthetician: "esthetician",
    massage_therapist: "massage therapist",
    tattoo_artist: "tattoo artist",
    brow_lash: "brow/lash artist",
  }[type] ?? "service provider";
}

function wrapHtml(title: string, body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           color: #142538; background: #fcf8f0; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 40px auto; padding: 32px;
                 background: #fff; border-radius: 16px; }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 16px; color: #0f8a73; }
    p { font-size: 15px; line-height: 1.6; color: #4c6076; margin: 0 0 12px; }
    a { color: #0f8a73; }
    .footer { margin-top: 32px; font-size: 12px; color: #7d8fa2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>SLOTFORCE</h1>
    <p>${escaped}</p>
    <div class="footer">
      You're receiving this because you have a SLOTFORCE account.<br>
      <a href="${APP_URL}/unsubscribe">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
}
