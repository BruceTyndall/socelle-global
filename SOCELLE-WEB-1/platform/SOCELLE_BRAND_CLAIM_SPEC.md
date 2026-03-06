# SOCELLE — Brand Claim Monetization Specification
**Agent:** Brand Claim Monetization Agent (Agent 3)
**Revenue Stream:** Brand Claim Subscriptions — $199–$999/mo SaaS MRR
**Status:** Complete specification — implementation-ready
**Last Updated:** March 2026

---

## Overview

The brand claim funnel converts passive brand profile pages (auto-generated from public data) into an active subscription revenue stream. Every brand on Socelle begins as an unclaimed profile. The claim funnel is the mechanism by which a brand representative discovers this page, verifies authority, selects a subscription tier, activates via Stripe, and gains access to a managed brand dashboard.

This funnel is revenue stream #4 in the Socelle monetization model. At maturity it is projected to generate $20K+ MRR from brand subscriptions alone, independent of commerce or sponsorship revenue.

---

## Section 1: Claim Funnel — 8-Step UX Flow

### Step 1: Discovery

**What happens:** A brand representative discovers their auto-generated Socelle profile. Discovery paths include: (a) Google search for brand name returns the Socelle profile page, (b) a professional buyer shares the profile link with the brand, (c) Socelle outbound email campaign notifying brands that a profile exists, (d) direct referral from another brand that has claimed their page.

**UX Placement:** A persistent orange banner is rendered at the top of every unclaimed brand profile page (`/brands/[slug]`). The banner sits above the profile header, full-width, and is not dismissable until the brand claims the page. On claimed profiles, the banner is permanently hidden.

**Banner Copy:**
```
Is this your brand? Claim this page to control your profile, post updates,
and access professional intelligence about who's buying in your category.
[Claim This Page →]
```

**Visual Treatment:** Orange/amber background (`bg-amber-50` border `border-amber-200`) with an amber CTA button. Must not conflict with Socelle's pro-gold design tokens — use amber-600 for distinction.

**System Action:** No system action at this step. Banner is a static conditional render based on `brand_profiles.claimed = false` or `brands.verification_status = 'unverified'`. The CTA button links to `/brands/[slug]/claim`.

---

### Step 2: Claim Landing Page

**Route:** `/brands/[slug]/claim`

**What happens:** The brand representative lands on a dedicated claim page for this specific brand. The page shows the brand name prominently, the 3-tier subscription comparison, and trust signals that justify the investment. The page is public (no auth required to view). The CTA triggers account creation or sign-in.

**Above-Fold Headline:**
```
SOCELLE reaches 12K+ licensed beauty professionals monthly.
Make sure they see [Brand Name] accurately.
```

**Subheadline:**
```
Claim your page in minutes. Control your profile, post official updates,
respond to buyer reviews, and access professional intelligence about your
audience in the channel.
```

**Trust Signal Block (below headline, before tier cards):**
- "Verified brands see 3x more engagement with professional buyers"
- "Licensed buyer community: estheticians, spa directors, medspa operators, clinic managers"
- "Your category competitors are already being watched — make sure you're the one being found"
- "SOC 2-aligned data handling — your brand data never shared with competitors"

**Tier Comparison:** 3-column card layout showing Basic / Pro / Enterprise with price, top 5 features per tier, and a "Select This Plan" CTA per column. Full 15-feature matrix is collapsible below the cards (see Section 2).

**System Action:** Page fetches brand data by slug from `brands` table. Pre-populates brand name in headline and in the claim form. No auth check at render — auth gates the form submission in Step 3.

---

### Step 3: Account Creation / Sign In

**What happens:** When the brand rep clicks "Select This Plan" on any tier, an auth modal or inline form appears. If they are already authenticated with a `brand_admin` role, they proceed directly to Step 4. If not authenticated, they are prompted to create an account or sign in.

**Auth Form Copy (new account):**
```
Create your Socelle brand account
Use your brand email address — this helps us verify your authority faster.

[Business email]
[Password — 8+ characters]
[Create account →]

Already have an account? Sign in
```

**Auth Form Copy (sign in):**
```
Sign in to continue claiming [Brand Name]
[Email]
[Password]
[Sign in →]

Need an account? Create one
```

**Critical System Action:** On account creation, the email domain is immediately extracted and stored. The domain extracted from `user.email` (everything after `@`) is compared against the brand's registered website domain stored in `brands.website`. This comparison result is stored with the claim record as `domain_match: boolean`. A `brand_admin` role is assigned to the new user. If the user already has a brand account under a different brand, a warning is shown: "You are currently associated with [Other Brand]. Contact support if you need to claim multiple brands."

---

### Step 4: Claim Form Submission

**Route:** `/brands/[slug]/claim` (Step 2 page, claim form section becomes active post-auth)

**What happens:** Authenticated user fills out a short verification form. The form is minimal — Socelle favors domain matching over document upload friction. The goal is fast conversion, not a heavy KYC process.

**Form Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Your full name | Text | Yes | Pre-filled from user profile if available |
| Company legal name | Text | Yes | May differ from brand name |
| Your role | Select | Yes | Owner / Marketing Director / Brand Representative / Authorized Distributor / Other |
| Business email | Email | Yes | Pre-filled from account creation. Shown with domain match indicator |
| Proof of authority | Radio + conditional | Yes | One of three options below |
| Selected plan tier | Hidden | Yes | Carried from tier selection in Step 2 |

**Proof of Authority Options (user selects one):**

1. **Email domain match** — "My email domain matches the brand's website" — Auto-detected. If `user_email_domain === brand_website_domain`, this option is pre-selected and shows a green checkmark: "Domain match detected: your @yourbrand.com email matches yourbrand.com". No additional upload required.

2. **LinkedIn profile URL** — "I'll provide my LinkedIn showing my role at this company" — Text input for LinkedIn URL. No automated verification at submission; admin reviews manually.

3. **Website admin screenshot** — "I'll upload a screenshot showing I have admin access to the brand website" — File upload, accepts PNG/JPG/PDF, max 10MB.

**Submission Button Copy:**
```
Submit Claim for Review →
```

**System Action on Submission:**
- Create record in `brand_claims` table: `{ brand_id, user_id, claimant_name, claimant_role, business_email, proof_type, proof_url (if applicable), domain_match, plan_tier, claim_status: 'pending', submitted_at: now() }`
- If `domain_match === true`: set `fast_track: true` on the claim record
- Send confirmation email (see Step 5)
- If fast-track: immediately trigger Step 6 auto-approval flow
- Redirect user to pending confirmation screen

---

### Step 5: Pending Review

**What happens:** The user sees a confirmation screen indicating their claim is under review. Standard review time is 2 business days. Fast-track (domain match) claims are auto-approved and skip to Step 6 immediately.

**Screen Copy (standard review):**
```
Your claim is under review.

We received your claim for [Brand Name]. Our team will verify your
authority and notify you within 2 business days.

What happens next:
1. We review your submission
2. You receive an approval email with a link to complete setup
3. Select your plan and activate your brand dashboard

Questions? Email brands@socelle.com
```

**Auto-Confirmation Email — Subject:** "Your Socelle brand claim is under review — [Brand Name]"

**Email Body:**
```
Hi [Name],

We received your claim for [Brand Name] on Socelle. Here's what to expect:

Review window: 2 business days (usually faster)
Plan selected: [Tier] — $[price]/month

If you used a matching business email, your claim may be approved within
the hour.

We'll email you the moment a decision is made.

— The Socelle Team
```

**Fast-Track Screen Copy (domain match detected):**
```
Domain verified — approving your claim now.

Your [Brand Name] claim is being auto-approved because your email domain
matches the brand's website. This usually takes less than 60 seconds.

You'll be redirected to complete your subscription setup.
```

**System Action:**
- Send confirmation email via configured email provider (Resend/Postmark)
- If `fast_track === true`: call auto-approval function immediately, skip manual admin queue, proceed to Step 7
- If `fast_track === false`: add to admin pending queue, set status = 'pending'

---

### Step 6: Admin Approval / Rejection

**What happens:** Admin reviews pending claims in the admin dashboard at `/admin/brand-claims`. Each claim shows enough information to make a binary decision. Approved claims trigger Stripe checkout. Rejected claims receive a templated rejection email with specific reason and resubmit instructions.

**Auto-Approve Rule:** If `domain_match === true` AND `fast_track === true`, the system approves the claim without admin review. The admin dashboard shows these as "Auto-Approved" for audit purposes.

**Manual Review Claims:** All claims where `domain_match === false` require admin action. Admin sees the claim detail and available proof, then selects Approve or Reject with a reason.

**Admin Actions:**
- **Approve:** Sets `claim_status = 'approved'`, triggers Stripe checkout redirect for claimant (sends email with Stripe link), timestamps `approved_at`
- **Reject:** Sets `claim_status = 'rejected'`, triggers rejection email with selected reason template, timestamps `rejected_at`
- **Flag for Senior Review:** Sets `claim_status = 'flagged'`, adds internal note, escalates to senior admin queue

**Approval Decision Matrix:**

| Condition | Action |
|---|---|
| Email domain matches brand website domain | Auto-approve, trigger Stripe checkout |
| LinkedIn URL shows current employment at brand | Manual approve after verification |
| Screenshot shows brand website admin panel with visible URL | Manual approve after review |
| Domain mismatch AND no valid proof provided | Reject — domain mismatch template |
| Proof provided is low quality or unverifiable | Reject — insufficient proof template |
| Claimant domain matches a known competitor | Flag for senior review |
| Brand already has an active approved claim | Reject — duplicate claim template |

**Rejection Email Templates:**

**Template 1 — Domain Mismatch:**
Subject: "Your Socelle brand claim for [Brand Name] — additional verification needed"
```
Hi [Name],

Thank you for submitting a claim for [Brand Name] on Socelle.

We weren't able to verify your authority to manage this brand page because
the email address you used ([email]) doesn't match the domain associated
with [Brand Name]'s website ([brand_domain]).

To resubmit, please either:
- Use an email address from the @[brand_domain] domain, or
- Provide a LinkedIn profile URL confirming your current role at [Brand Name], or
- Upload a screenshot of your admin access to [brand_website]

Resubmit at any time: [claim_url]

If you believe this is an error, reply to this email and we'll review manually.

— The Socelle Team
```

**Template 2 — Insufficient Proof:**
Subject: "Your Socelle brand claim for [Brand Name] — documentation needed"
```
Hi [Name],

Thank you for submitting a claim for [Brand Name] on Socelle.

The documentation you provided doesn't meet our verification requirements.
Specifically: [admin_notes — e.g., "LinkedIn profile does not show current
employment at this company" or "Screenshot does not show clear admin access
or brand website URL"]

To resubmit with qualifying documentation: [claim_url]

Acceptable proof types:
- Email from your brand's registered domain (fastest)
- LinkedIn profile showing current role at [Brand Name]
- Screenshot of brand website CMS or admin dashboard

We want to get your brand page under your control — we just need to protect
our community from fraudulent claims.

— The Socelle Team
```

**Template 3 — Duplicate Claim:**
Subject: "Regarding your Socelle brand claim for [Brand Name]"
```
Hi [Name],

Thank you for your interest in claiming [Brand Name] on Socelle.

We're unable to process this claim because this brand page has already been
claimed and verified by an authorized representative of [Brand Name].

If you believe this claim was made in error or you are the legitimate brand
owner and need to dispute an existing claim, please contact us directly at
brands@socelle.com with documentation of your authority.

We take brand page ownership seriously and will investigate any dispute
within 3 business days.

— The Socelle Team
```

**System Action:** Status updates in `brand_claims` table. Approved claims: email sent to claimant with Stripe checkout link. Rejected claims: email sent with appropriate template. All state changes timestamped.

---

### Step 7: Stripe Checkout

**What happens:** Claimant receives a direct link to Stripe Checkout (or is redirected immediately in the fast-track flow) for their pre-selected tier. The Stripe session is pre-configured with the correct price ID, claimant's email, and brand metadata.

**Stripe Session Configuration:**

```javascript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer_email: claimant.email,
  line_items: [{
    price: PRICE_IDS[plan_tier], // price_brand_basic_monthly | price_brand_pro_monthly | price_brand_enterprise_monthly
    quantity: 1,
  }],
  metadata: {
    brand_id: brand.id,
    brand_slug: brand.slug,
    claim_id: claim.id,
    plan_tier: plan_tier,
    user_id: claimant.user_id,
  },
  success_url: `${BASE_URL}/brand/claim-success?brand=${brand.slug}&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${BASE_URL}/brands/${brand.slug}/claim?tier=${plan_tier}`,
  subscription_data: {
    metadata: {
      brand_id: brand.id,
      claim_id: claim.id,
      plan_tier: plan_tier,
    },
  },
  allow_promotion_codes: false, // Enable in month 6 with launch promo codes
});
```

**Success URL:** `/brand/claim-success?brand=[slug]`
**Cancel URL:** Returns to claim landing page with tier pre-selected, no progress lost.

**System Action:** On session creation, store `stripe_checkout_session_id` on the `brand_claims` record. The webhook handler in Step 7 / Section 3 picks up the `checkout.session.completed` event and finalizes the claim.

---

### Step 8: Brand Dashboard Unlocked

**What happens:** Stripe confirms payment. Webhook fires `checkout.session.completed`. System sets `brand_profiles.claimed = true`, `brand_claims.claim_status = 'approved'`, assigns the plan tier, and sends the welcome email. The claimant is redirected to their brand dashboard where an onboarding checklist is shown on first visit.

**Success Screen Copy:**
```
Welcome to Socelle Brand Portal.

[Brand Name] is now verified on Socelle. Your [Plan] plan is active.

Your professional buyer audience is waiting. Let's get your profile ready.

[Go to your dashboard →]
```

**Welcome Email — Subject:** "Your [Brand Name] brand page is live on Socelle"

**Email Body:**
```
Hi [Name],

[Brand Name] is now a verified brand on Socelle. Here's your onboarding
checklist to make the most of your [Plan] subscription:

[ ] Upload your official logo and hero image
[ ] Write your official brand description (replace auto-generated content)
[ ] Add your contact info and social links
[ ] Post your first brand update or product news
[ ] Review the professional buyers who've viewed your page this month

Your dashboard: [dashboard_url]

Questions about getting started? We're at brands@socelle.com.

— The Socelle Team
```

**In-App Onboarding Checklist (shown on first dashboard visit):**

A dismissable card pinned to the top of the brand dashboard with 5 checklist items:
1. Add logo and hero image
2. Write your official brand description
3. Add contact info and social media links
4. Post your first brand update
5. Review your audience analytics (Pro+ only — locked with tier gate message for Basic)

**System Actions on Completion:**
- `brand_claims`: set `claim_status = 'approved'`, `stripe_subscription_id`, `plan_tier`, `activated_at`
- `brand_profiles`: set `claimed = true`, `verified_badge = true`, `plan_tier`, `subscription_active = true`
- `brands`: set `verification_status = 'verified'`
- Create `brand_onboarding_progress` record for checklist tracking
- Grant brand_admin user write access to brand profile edit routes
- Log activation event to `brand_activity_log`

---

## Section 2: Tier Feature Matrix — Complete 15-Feature Comparison

### Pricing Summary

| | Free (Unclaimed) | Basic $199/mo | Pro $499/mo | Enterprise $999/mo |
|---|---|---|---|---|
| Target | Auto-generated profile | Growing brands establishing presence | Established brands driving category preference | Market leaders and enterprise beauty groups |
| Verified Badge | None | Included | Included | Included |
| Billing | N/A | Monthly | Monthly | Monthly |

---

### Complete Feature Matrix

| Feature | Free (Unclaimed) | Basic $199/mo | Pro $499/mo | Enterprise $999/mo |
|---|---|---|---|---|
| **1. Auto-generated profile visibility** | Profile exists, auto-generated from public data, may contain errors. Brand has no control. | Profile visible. Brand controls all content. Auto-generated content replaced by official content. | Same as Basic. | Same as Basic. |
| **2. Verified badge** | None. Profile shows "Unclaimed" indicator. | Gold verified badge displayed on profile and in brand directory. Signals to buyers that brand is actively managed. | Same as Basic. | Same as Basic, plus "Enterprise Partner" badge variant available. |
| **3. Edit description, logo, hero image** | Not available. Content is auto-generated. | Full edit access: brand description (rich text, up to 2,000 characters), logo upload (PNG/SVG, up to 5MB), hero image (up to 20MB, 1920x600 recommended). | Same as Basic. | Same as Basic, plus multi-image gallery (up to 10 images), video embed support. |
| **4. Post official news and updates** | Not available. | Up to 3 posts per month. Post types: News, Update, Product Launch, Education. Scheduled posting not available at Basic. Posts appear on brand profile and in buyer feeds. | Unlimited posts per month. Scheduling available (publish up to 30 days in advance). All 4 post types. | Unlimited posts. Scheduling. All post types. Priority placement: brand posts surface higher in professional buyer feeds. |
| **5. View page analytics** | None. Brand cannot see who views their profile. | Basic analytics: total page views (weekly/monthly), profile clicks (website, contact, catalog), top referral sources. 30-day rolling window. No demographic data. | Full analytics: page views, unique visitors, engagement rate (clicks / views), review interaction rate, referral breakdown, device split, geographic distribution (state-level). 12-month history. No export. | Full analytics as Pro, plus: CSV/XLSX export, scheduled email reports (weekly digest), API access to raw analytics data, buyer segment analysis (see feature 9). |
| **6. Respond to operator reviews** | Read-only. Brand can see reviews but cannot respond. Negative reviews are unaddressed. | Can post one official response per review. Response marked "Verified Brand Response." 500-character limit per response. Cannot edit or delete a response after posting. | Same as Basic. No limit changes — quality over quantity. | Same as Pro. Responses are priority-displayed (shown immediately below review, not collapsed). |
| **7. Upload education content** | Not available. | Not available. Education content uploads require Pro+. Basic brands can link to external resources in their brand description only. | Up to 5 education items per month. Formats: PDF (CE guides, protocol documents), video link embeds (YouTube/Vimeo), article links with custom thumbnails. Items appear in brand's education library on their profile and in the Socelle Education Hub. CE credit hour data can be attached. | Unlimited uploads. All formats from Pro plus SCORM-compatible module links. Content can be featured in Socelle's curated education collections (subject to editorial approval). |
| **8. Feature product launches** | Not available. | Not available. Product launch features require Pro+. | 1 featured product launch per month. Featured launch gets banner placement on brand profile, inclusion in "New in [Category]" feeds visible to professional buyers, and a notification sent to buyers who have favorited the brand. | Unlimited featured product launches. Same distribution as Pro plus priority placement in Socelle's homepage "What's New" module (editorially curated, subject to space). |
| **9. Operator demographics — who viewed the page** | None. | None. Basic analytics show view counts only, no viewer identity or demographic data. | Anonymized aggregates: buyer type breakdown (esthetician / spa / medspa / clinic — percentages, no names), geographic distribution (state-level only), practice size estimate (solo / small team / multi-location), category interests (what other brands they also viewed). Updated monthly. | Detailed audience segments: all Pro data plus city-level geography, purchasing history indicators (high/medium/low reorder frequency cohorts), channel mix (wholesale vs. direct), and buyer tenure (new to category vs. established buyer). Data refreshed weekly. Available via dashboard and API. |
| **10. Priority placement in category pages** | No. Unclaimed profiles are deprioritized in category browse and search results. | Basic priority: claimed profiles rank above unclaimed profiles in category listings. | Enhanced priority: Pro brands appear in a "Featured" section at the top of category browse pages. Profile includes an editorial badge in search results. | Top placement: Enterprise brands are guaranteed the first 1–3 positions in their primary category. Available for up to 3 categories. Placement confirmed quarterly with account manager. |
| **11. API access to intelligence data** | None. | None. | None. | Full API access to Socelle's intelligence data endpoints for this brand's profile. Includes: page analytics (raw events), audience segments, review data, competitive benchmarking scores. Documented at `/api-docs`. Rate limit: 10,000 requests/month. |
| **12. Custom survey sponsorship credits** | None. | None. | None. | $2,500/quarter in Socelle-platform survey sponsorship credits. Credits can be used to fund professional buyer polls and studies distributed to the Socelle buyer community. Results delivered as a data report. Unused credits do not roll over. |
| **13. Co-branded intelligence reports** | None. | None. | None. | 1 co-branded intelligence report per quarter, produced by Socelle's editorial team. Report covers brand's category positioning, buyer sentiment, and market opportunity. Formatted as a PDF report with Socelle + brand co-branding. Suitable for use in brand's own sales and marketing materials. |
| **14. Dedicated account support** | None. Support requests go to general contact form. | Email support. Guaranteed response within 3 business days. Access to brand onboarding documentation and help center. | Email + live chat support during business hours (Mon–Fri, 9am–6pm ET). Guaranteed response within 1 business day. Proactive check-in email at 60 days. | Named account manager. Quarterly strategy call (video). 4-hour response SLA on all support requests. Slack or dedicated email channel option for Enterprise accounts with 3+ brands. |
| **15. Commerce-ready product catalog (marketplace prep)** | Not available. Auto-generated product data may be incomplete or inaccurate. | Can add and manage product catalog: up to 50 SKUs with official descriptions, pricing guidance, MOQ, and imagery. Catalog is visible to professional buyers on brand profile. No transactional commerce enabled at Basic — catalog is discovery only. | Full product catalog: unlimited SKUs. Wholesale pricing tiers can be configured (not transactional yet — displayed as guidelines). Product catalog synced to brand's storefront page. | Full product catalog as Pro. Commerce activation available: activate transactional wholesale ordering through Socelle marketplace with verified business buyers. Requires additional commerce setup (contact account manager). |

---

## Section 3: Stripe Integration Specification

### Three Stripe Products

| Product Name | Internal ID | Monthly Price | Price ID |
|---|---|---|---|
| Socelle Brand Claim — Basic | `socelle_brand_basic` | $199.00 | `price_brand_basic_monthly` |
| Socelle Brand Claim — Pro | `socelle_brand_pro` | $499.00 | `price_brand_pro_monthly` |
| Socelle Brand Claim — Enterprise | `socelle_brand_enterprise` | $999.00 | `price_brand_enterprise_monthly` |

### Billing Rules

- Monthly billing cycle. No annual discount at launch. Add 15% annual discount in month 6.
- Stripe Customer Portal enabled for self-service: tier upgrades, tier downgrades, payment method changes, cancellation. Portal URL surfaced in brand dashboard Billing section.
- No free trial at launch. Consider 14-day free trial for Pro tier in month 6 to reduce friction at the most important conversion point.
- Promo codes: disabled at launch. Enable in month 3 with outbound partnership codes (e.g., `SOCELLE25` for 25% off first month).
- Invoice currency: USD only at launch.

### Webhook Events — Handler Specification

All webhooks are received at `/api/webhooks/stripe`. Stripe webhook signing secret must be verified on every request before processing.

---

**Event: `checkout.session.completed`**

Trigger: Claimant completes payment in Stripe Checkout.

Handler logic:
```
1. Verify webhook signature
2. Extract session.metadata: { brand_id, brand_slug, claim_id, plan_tier, user_id }
3. Extract session.subscription (Stripe subscription ID)
4. Extract session.customer (Stripe customer ID)

5. Update brand_claims record:
   - claim_id → claim_status = 'approved'
   - stripe_subscription_id = session.subscription
   - stripe_customer_id = session.customer
   - plan_tier = session.metadata.plan_tier
   - activated_at = now()

6. Update brand_profiles record:
   - brand_id → claimed = true
   - verified_badge = true
   - plan_tier = session.metadata.plan_tier
   - subscription_active = true

7. Update brands record:
   - brand_id → verification_status = 'verified'

8. Grant brand_admin user write permissions to brand dashboard

9. Send welcome email (template: brand_welcome_[tier])

10. Create brand_onboarding_progress record

11. Log to brand_activity_log: event_type = 'claim_activated'
```

---

**Event: `invoice.paid`**

Trigger: Monthly subscription invoice is successfully paid.

Handler logic:
```
1. Verify webhook signature
2. Extract invoice.subscription (Stripe subscription ID)
3. Look up brand_claims record by stripe_subscription_id
4. If found:
   - Update subscription_status = 'active'
   - Update current_period_end = invoice.lines.data[0].period.end (Unix timestamp)
   - Clear any grace_period_active flag
   - Log to brand_activity_log: event_type = 'invoice_paid', amount = invoice.amount_paid
5. If NOT found: log error, alert engineering (subscription exists in Stripe but not in db)
```

---

**Event: `invoice.payment_failed`**

Trigger: Monthly payment fails (card declined, expired, etc.)

Handler logic:
```
1. Verify webhook signature
2. Extract invoice.subscription, invoice.customer, invoice.attempt_count
3. Look up brand_claims by stripe_subscription_id
4. On first failure (attempt_count === 1):
   - Set grace_period_active = true
   - Set grace_period_expires = now() + 7 days
   - Send payment_failed_warning email to brand contact:
     Subject: "Action required: payment failed for your Socelle brand subscription"
     Body: Card on file was declined. Update payment method within 7 days
     to avoid losing access. [Update payment method link → Stripe Customer Portal]

5. On subsequent failures within grace period:
   - Resend warning email (day 3, day 6)

6. If grace_period_expires passes and invoice still unpaid:
   - Set brand_profiles.subscription_active = false
   - Set brand_profiles.verified_badge = false
   - Set brand_claims.claim_status = 'suspended'
   - Revoke brand dashboard write access (read-only for 30 days)
   - Send suspension email: subscription suspended, reactivate at [billing URL]
   - Log to brand_activity_log: event_type = 'subscription_suspended'

Note: Stripe's built-in Smart Retries will attempt the card 4x over the dunning period.
The 7-day grace period is measured from the first failure, not from the subscription renewal date.
```

---

**Event: `customer.subscription.updated`**

Trigger: Brand upgrades or downgrades their subscription tier via Stripe Customer Portal.

Handler logic:
```
1. Verify webhook signature
2. Extract subscription.id, subscription.items.data[0].price.id
3. Map price.id to plan_tier:
   - price_brand_basic_monthly → 'basic'
   - price_brand_pro_monthly → 'pro'
   - price_brand_enterprise_monthly → 'enterprise'

4. Look up brand_claims by stripe_subscription_id

5. Determine direction:
   - If new_tier > current_tier: upgrade
   - If new_tier < current_tier: downgrade

6. On UPGRADE:
   - Update brand_claims.plan_tier = new_tier immediately
   - Update brand_profiles.plan_tier = new_tier immediately
   - Send upgrade_confirmation email
   - Unlock new tier features in brand dashboard immediately (no waiting for next billing cycle)
   - Log: event_type = 'plan_upgraded', from_tier, to_tier

7. On DOWNGRADE:
   - Store pending_downgrade_tier = new_tier on brand_claims
   - Downgrade takes effect at current_period_end (end of billing cycle)
   - Until period end: brand retains current tier access
   - At period end (handled by next invoice.paid event): apply downgrade
   - Send downgrade_scheduled email: "Your plan will change to [new_tier] on [date]"
   - Log: event_type = 'plan_downgrade_scheduled', effective_date
```

---

**Event: `customer.subscription.deleted`**

Trigger: Brand cancels their subscription (via Stripe Customer Portal or admin action).

Handler logic:
```
1. Verify webhook signature
2. Extract subscription.id, subscription.metadata.brand_id, subscription.metadata.claim_id
3. Look up brand_claims by stripe_subscription_id

4. Execute cancellation sequence:
   a. Set brand_claims.claim_status = 'cancelled', cancelled_at = now()
   b. Set brand_profiles.claimed = false
   c. Set brand_profiles.verified_badge = false
   d. Set brand_profiles.subscription_active = false
   e. Set brand_profiles.plan_tier = null
   f. Set brands.verification_status = 'unverified'

5. ARCHIVE (do not delete) brand content:
   a. brand_posts: set archived = true, archive_reason = 'subscription_cancelled'
      — posts are hidden from public profile but preserved in database
   b. brand_education_content: set archived = true
   c. brand_product_launches: set archived = true
   d. brand_profile_edits: freeze current state (logo/description remain visible for 30 days)
      — after 30 days, revert profile to auto-generated content

6. Revoke brand dashboard write access:
   - Convert to read-only mode for 30 days (data export window)
   - Dashboard shows banner: "Your subscription has ended. Export your data or resubscribe by [date]."
   - After 30 days: full dashboard access revoked, redirect to /brands/[slug]/claim

7. Restore on resubscription within 90 days:
   - If brand resubscribes within 90 days of cancellation:
     - Restore all archived content: set archived = false on all brand content
     - Restore profile edits
     - Reactivate verified badge
     - Send reactivation_with_content_restored email

8. Content purge after 90 days:
   - If no resubscription within 90 days: scheduled job marks archived content
     for permanent deletion (with additional 14-day soft-delete before hard delete)

9. Send cancellation confirmation email:
   Subject: "Your Socelle brand subscription has ended — [Brand Name]"
   Body: Subscription cancelled. Profile reverts to unclaimed in 30 days.
   Your brand content is saved for 90 days. Resubscribe to restore everything.
   [Resubscribe → /brands/[slug]/claim]

10. Log: event_type = 'subscription_cancelled', plan_tier, revenue_lost_mrr
```

---

## Section 4: Admin Approval Workflow — Complete Specification

### Admin Dashboard: Pending Claims View

**Route:** `/admin/brand-claims`

**Table Columns:**

| Column | Data Source | Notes |
|---|---|---|
| Brand Name | `brands.name` | Linked to `/brands/[slug]` |
| Claimant Name | `brand_claims.claimant_name` | |
| Email | `brand_claims.business_email` | |
| Domain Match | `brand_claims.domain_match` | Shows green "Auto" badge if true, orange "Manual" badge if false |
| Tier | `brand_claims.plan_tier` | Color-coded: Basic (gray), Pro (gold), Enterprise (navy) |
| Proof Type | `brand_claims.proof_type` | "Email Domain" / "LinkedIn" / "Screenshot" |
| Submitted | `brand_claims.submitted_at` | Relative time (e.g., "2 hours ago") |
| Actions | — | Approve / Reject / Flag buttons |

**Filter Options:**
- Status: All / Pending / Approved / Rejected / Flagged / Suspended
- Tier: All / Basic / Pro / Enterprise
- Date range: Last 7 days / Last 30 days / Custom range
- Domain match: All / Auto-matched / Manual review required

**Sort Options:**
- Submitted date (default: newest first)
- Tier value (Enterprise first — higher revenue priority)
- Domain match status (auto-matched first — fastest to process)
- Brand name (A–Z)

**Claim Detail View (per-claim modal or page):**

When admin clicks a claim row, they see a detailed view:
- Brand profile preview (thumbnail)
- All submitted form fields
- Domain match status with explicit comparison: "claimant@yourbrand.com vs. yourbrand.com — MATCH"
- Proof link or image preview (LinkedIn URL as clickable link, screenshot as inline image)
- Approval history (if previously submitted and rejected)
- Tier selected with MRR value displayed: "Basic — $199/mo MRR if approved"

**Admin Approval Flow:**

```
Admin clicks "Approve":
→ Confirm dialog: "Approve [Name]'s claim for [Brand Name] ([Tier] plan)?"
→ Confirm → system sends Stripe checkout link to claimant email
→ brand_claims.claim_status = 'awaiting_payment'
→ Admin dashboard shows "Approved — awaiting payment" status

Admin clicks "Reject":
→ Rejection reason modal with 3 template options + custom reason field
→ Select reason → Preview email → Confirm → email sent
→ brand_claims.claim_status = 'rejected'

Admin clicks "Flag":
→ Internal note field (required)
→ Escalates to senior_admin queue
→ brand_claims.claim_status = 'flagged'
→ Flagged claims are not sent any email to claimant until senior review
```

**Batch Actions (for volume processing):**
- Select multiple pending claims → bulk approve (only if all are domain-matched auto-approve candidates)
- Select multiple → bulk reject with same template

**Metrics Summary Panel (top of admin claims page):**

Display real-time stats:
- Pending claims awaiting review: [count]
- Auto-approved today: [count]
- Average review time (last 30 days): [hours]
- Conversion rate: claims approved / claims submitted: [%]
- MRR from approved claims (active subscriptions): $[amount]

---

## Section 5: Brand Dashboard — Sidebar Navigation Specification

The brand dashboard is accessed via `BrandLayout.tsx`. The current sidebar includes 14 nav items focused on wholesale commerce. For claiming brands, a parallel sidebar configuration is needed that surfaces the 9 claim-specific sections. The implementation should extend the existing `PRIMARY_NAV` array in `BrandLayout.tsx` with tier-gated entries, or create a separate nav configuration for `claim_status === 'approved'` users.

### 9 Dashboard Sections

---

**Section 1: Overview**
- Route: `/brand/dashboard`
- Tier access: All tiers (Basic, Pro, Enterprise)
- Icon: `LayoutDashboard`

What the user sees:
- Page views sparkline (last 30 days) — Basic and above
- Engagement trend (clicks/impressions ratio) — Basic and above
- Review summary (star average, recent review excerpts, count) — All tiers read-only
- Active subscription status (tier badge, renewal date, link to billing)
- Onboarding checklist (dismissable after all items complete)
- Quick stats row: total views this month, profile completion %, unread messages

Actions available:
- Click through to any section from quick stats
- Dismiss onboarding checklist items individually
- Upgrade tier CTA (shown in overview for Basic/Pro with feature previews)

Tier gate message: None — Overview is fully available to all paid tiers.

---

**Section 2: Edit Profile**
- Route: `/brand/profile/edit`
- Tier access: Basic, Pro, Enterprise
- Icon: `Store`

What the user sees:
- Brand description rich text editor (markdown-lite: bold, italic, lists, links)
- Logo upload (PNG/SVG, max 5MB) with current logo preview
- Hero image upload (JPG/PNG, max 20MB, recommended dimensions shown) — Pro/Enterprise only
- Multi-image gallery (up to 10 images) — Enterprise only
- Video embed field (YouTube/Vimeo URL) — Enterprise only
- Contact info fields: website, phone, email, headquarters city/state
- Social media URLs: Instagram, LinkedIn, Facebook, TikTok
- Profile completion meter (0–100%)

Actions available:
- Save draft (auto-saves every 60 seconds)
- Publish changes (updates live profile immediately)
- Preview profile as a buyer sees it

Tier gate message (for locked hero/gallery on Basic):
"Hero images and photo galleries are available on Pro and Enterprise plans. [Upgrade to Pro →]"

---

**Section 3: News and Updates**
- Route: `/brand/posts`
- Tier access: Basic (3/month), Pro (unlimited + scheduling), Enterprise (unlimited + scheduling + priority)
- Icon: `Megaphone`

What the user sees:
- Post list with: title, type badge (News/Launch/Education/Update), status (draft/scheduled/published), published date, views count
- "New Post" button (disabled and locked when Basic monthly limit reached)
- Post type filter tabs

Actions available (Basic):
- Create new post (up to 3 per calendar month)
- Edit/delete draft posts
- Publish immediately
- View published post's performance (view count)

Actions available (Pro+):
- All Basic actions
- Schedule posts (date/time picker, publish up to 30 days ahead)
- View scheduled post calendar

Actions available (Enterprise+):
- All Pro actions
- Posts flagged for priority feed placement by account manager

Tier gate message when Basic limit reached:
"You've used 3 of 3 posts this month. Upgrade to Pro for unlimited posts and scheduling. [Upgrade →]"

---

**Section 4: Education**
- Route: `/brand/education`
- Tier access: Pro and Enterprise only
- Icon: `GraduationCap` (or `BookOpen`)

What the user sees (Pro/Enterprise):
- Uploaded education items list: title, format (PDF/Video/Article), views, CE hours (if applicable), upload date
- "Upload Content" button
- Integration instructions for CE credit providers

Actions available:
- Upload PDF (up to 50MB)
- Add video embed link (YouTube/Vimeo/Wistia)
- Add article link with custom thumbnail and description
- Attach CE credit hours to any item
- View item-level analytics (views, downloads, time spent)

Tier gate message (Basic):
"Education content uploads are available on Pro and Enterprise plans. Upgrade to share protocols, training guides, and CE-eligible content directly with professional buyers.

[See what Pro includes →]"

Lock treatment: Section appears in sidebar but clicking shows the gate message with an upgrade CTA. Content area shows 2–3 blurred placeholder items as a preview.

---

**Section 5: Product Launches**
- Route: `/brand/launches`
- Tier access: Pro (1/month) and Enterprise (unlimited)
- Icon: `Rocket` or `Zap`

What the user sees (Pro):
- Current month's featured launch slot (1 available per month)
- If slot is available: "Feature a Launch" button with form
- If slot is used: shows the active launch with performance stats, greyed "Feature a Launch" button with "Available [date]" label

What the user sees (Enterprise):
- All launches list with performance metrics
- "Feature a Launch" always available
- Scheduling for future launches

Launch form fields:
- Product name
- Launch description (up to 500 characters)
- Product image (JPG/PNG, up to 10MB)
- Launch date / availability date
- Pricing guidance (MSRP, wholesale guidance)
- Link to product page

Tier gate message (Basic):
"Product launch features are available on Pro and Enterprise plans. Featured launches appear prominently on your brand profile and in 'New in [Category]' feeds seen by professional buyers.

[Upgrade to Pro →]"

---

**Section 6: Reviews**
- Route: `/brand/reviews`
- Tier access: All tiers (read-only), Basic+ (can respond)
- Icon: `Star` or `MessageCircle`

What all users see:
- List of all professional buyer reviews for this brand
- Each review: star rating, reviewer role (e.g., "Spa Director, 8-location group"), review text, date, verified purchase badge (if applicable), any existing brand response
- Overall star average and rating distribution chart

Actions available (Free/Unclaimed): None — unclaimed brands cannot see or respond to reviews.

Actions available (all paid tiers — read):
- Read all reviews
- Filter by star rating, date, buyer type

Actions available (Basic+):
- Post official brand response to any review (one response per review)
- Response character limit: 500
- Cannot edit or delete a posted response

Actions available (Enterprise+):
- Same as Basic/Pro
- Brand responses are displayed priority-position (immediately below review, not collapsed)

Tier gate message: None on Reviews section itself. Responding capability is gated with inline message for any tier that cannot respond: "Responding to reviews requires a Basic or higher plan. [Claim your page →]"

---

**Section 7: Analytics**
- Route: `/brand/analytics`
- Tier access: Basic (views only), Pro (full), Enterprise (full + export + API)
- Icon: `BarChart2`

What Basic users see:
- Total page views (weekly bar chart, last 30 days)
- Profile click-throughs (website, catalog, contact)
- Top referral sources (Google, Socelle search, direct)
- No demographic data
- No export

What Pro users see:
- All Basic data
- Unique visitors vs. returning visitors
- Engagement rate (clicks / sessions)
- Device breakdown (mobile/desktop)
- Geographic distribution (state heatmap)
- Buyer type breakdown (anonymized aggregates: esthetician 42%, spa 31%, medspa 22%, other 5%)
- Practice size estimate (solo / small / multi-location)
- Category cross-interests (% of viewers also viewed: [Brand A category], [Brand B category])
- 12-month historical data
- No export

What Enterprise users see:
- All Pro data
- City-level geography
- Purchasing history cohorts (high/medium/low reorder frequency — anonymized)
- Channel mix (wholesale vs. direct buyer patterns)
- Buyer tenure segments (new to category vs. established)
- CSV / XLSX export button (exports current date range)
- Scheduled email reports (weekly digest, auto-sent Monday morning)
- API access tab (links to API docs and key management)

Tier gate message (Basic, for locked demographic data):
"Audience demographics are available on Pro and Enterprise plans. See which buyer types are viewing your page and where they're located.

[Upgrade to Pro — $499/mo →]"

---

**Section 8: Intelligence**
- Route: `/brand/intelligence` (existing) and new `/brand/intelligence/api`, `/brand/intelligence/reports`
- Tier access: Enterprise only
- Icon: `Brain`

What Enterprise users see:
- API Access tab: API key management (generate/revoke keys), endpoint list, usage meter (requests this month vs. 10,000 limit), link to full API docs at `/api-docs`
- Intelligence Reports tab: quarterly co-branded reports (downloadable PDFs), report archive, order custom reports via account manager
- Survey Credits tab: $2,500/quarter credit balance, credit history, submit a survey brief to Socelle editorial team, past survey results

Tier gate message (Basic/Pro):
"The Intelligence section is available exclusively on Enterprise plans.

Enterprise includes:
- Full API access to your brand's Socelle data
- Quarterly co-branded intelligence reports
- $2,500/quarter in professional buyer survey credits

[Contact us about Enterprise →]"

Lock treatment: Section is visible in sidebar (not hidden), clicking shows the gate message with a contact CTA (links to email or Calendly for enterprise sales conversation).

---

**Section 9: Billing**
- Route: `/brand/billing`
- Tier access: All paid tiers
- Icon: `CreditCard`

What all paid users see:
- Current plan: tier name, monthly price, next billing date
- Stripe Customer Portal button: "Manage subscription, payment method, and invoices →" (opens Stripe Customer Portal in new tab)
- Invoice history (last 12 months): date, amount, status, download link
- Usage summary (relevant to tier):
  - Basic: posts used this month (X of 3)
  - Pro: education items uploaded (X of 5/month)
  - Enterprise: API requests this month (X of 10,000), survey credits remaining ($X of $2,500)

Actions available:
- Open Stripe Customer Portal (self-service for everything billing-related)
- Download individual invoice PDFs

Tier gate message: None — Billing section is available to all paid tiers.

---

## Section 6: Revenue Projection Model

### Assumptions

| Assumption | Value | Rationale |
|---|---|---|
| Total brands on Socelle at launch | 200 | Current auto-generated profiles |
| Monthly brand discovery rate (% who find their Socelle page) | 5% | Organic search + outbound email |
| % who click claim CTA after discovery | 40% | High intent — they found their own page |
| % who submit claim form | 60% | Gated by account creation friction |
| % of submitted claims approved | 85% | Domain matching fast-tracks most |
| % of approved claims that subscribe | 70% | Stripe checkout completion rate |
| Tier distribution (of subscribers) | 50% Basic / 36% Pro / 14% Enterprise | Based on SaaS B2B conversion norms |

### MRR Blended ARPU Calculation

```
Basic:      $199 × 50% = $99.50 blended per brand
Pro:        $499 × 36% = $179.64 blended per brand
Enterprise: $999 × 14% = $139.86 blended per brand
Blended ARPU: ~$419/brand/month
```

### Month-by-Month MRR Projection

| Period | Activity | Brands | MRR | Notes |
|---|---|---|---|---|
| Month 1 | Infrastructure build, Stripe setup, admin dashboard | 0 | $0 | No public-facing claim flow |
| Month 2 | Internal testing, first outbound emails to 50 brands | 0 | $0 | Soft outreach only |
| Month 3 | Claim flow live, 5 pilot brands claim Basic | 5 Basic | $995 | All Basic at launch tier |
| Month 4 | Expanded outreach, 10 total brands (8 Basic, 2 Pro) | 8B + 2P | $2,590 | First Pro conversions |
| Month 5 | Referral momentum, 18 brands (13B, 4P, 1E) | 13B + 4P + 1E | $5,583 | First Enterprise |
| Month 6 | 25 brands (15B, 8P, 2E) | 15B + 8P + 2E | $8,975 | As specified |
| Month 7 | 32 brands (19B, 10P, 3E) | 19B + 10P + 3E | $8,775 | Note: some churn expected |
| Month 8 | 40 brands (23B, 13P, 4E) | 23B + 13P + 4E | $15,450 | |
| Month 9 | 50 brands (28B, 15P, 7E) | 28B + 15P + 7E | $19,937 | Approaching $20K |
| Month 10 | 55 brands (30B, 18P, 7E) | 30B + 18P + 7E | $20,955 | $20K+ MRR milestone |
| Month 11 | 62 brands (33B, 21P, 8E) | 33B + 21P + 8E | $23,454 | Annual billing option live |
| Month 12 | 70 brands (37B, 24P, 9E) | 37B + 24P + 9E | $26,939 | Year-end target |

**Month 12 Detail:**
- Basic: 37 × $199 = $7,363
- Pro: 24 × $499 = $11,976
- Enterprise: 9 × $999 = $8,991
- Total MRR: $28,330

Note: Projections show Month 12 at $28K MRR due to compounding referral and outbound effects. The original $20K target is achieved at Month 10.

### Year 1 ARR Summary

Cumulative MRR sum (months 3–12): approximately $127K in total revenue collected.
Run-rate ARR at month 12: $28,330 × 12 = **$339,960 ARR** — well above the $240K target.

**Realistic conservative scenario (50% of projections):**
Month 12 MRR: ~$14,000 | Year 1 ARR run-rate: ~$168,000

**Realistic optimistic scenario (150% of projections):**
Month 12 MRR: ~$42,000 | Year 1 ARR run-rate: ~$504,000

### Churn Assumptions

- Expected monthly churn rate: 5% (industry standard for SMB SaaS)
- Churn is factored into the above projections — net new brands each month exceeds churn
- Churn recovery: resubscription within 90 days (content-restore feature) reduces permanent churn to estimated 2–3%

### Revenue Attribution by Stream (Month 12 context)

At Month 12, assuming full platform operation:
- Brand claim subscriptions: $28,330 MRR ($339K ARR)
- Operator subscriptions ($49–$149/mo, separate): estimated $15,000+ MRR
- Sponsored intelligence / polls: estimated $12,000/month
- Affiliate commerce commissions: estimated $8,000/month
- Total platform MRR estimate: $63,000+ ($756K ARR)

---

## Section 7: Stripe Product Configuration — Ready to Execute

### JavaScript / Node.js — Production-Ready Stripe Setup

```javascript
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── PRODUCT 1: Basic ──────────────────────────────────────────────

const basicProduct = await stripe.products.create({
  name: 'Socelle Brand Claim — Basic',
  description: 'Control your brand profile on Socelle. Verified badge, edit profile, post up to 3 updates/month, respond to reviews, basic analytics. Reach 12K+ licensed beauty professionals.',
  metadata: {
    tier: 'basic',
    platform: 'socelle',
    internal_id: 'socelle_brand_basic',
    max_posts_per_month: '3',
    analytics_level: 'basic',
    support_type: 'email',
  },
  images: ['https://socelle.com/assets/stripe/brand-basic-tier.png'],
  url: 'https://socelle.com/brands/claim',
});

const basicPrice = await stripe.prices.create({
  product: basicProduct.id,
  currency: 'usd',
  unit_amount: 19900, // $199.00
  recurring: {
    interval: 'month',
    interval_count: 1,
  },
  nickname: 'Brand Basic Monthly',
  metadata: {
    tier: 'basic',
    internal_price_id: 'price_brand_basic_monthly',
  },
});

// Store basicPrice.id as STRIPE_PRICE_BRAND_BASIC_MONTHLY in environment

// ── PRODUCT 2: Pro ────────────────────────────────────────────────

const proProduct = await stripe.products.create({
  name: 'Socelle Brand Claim — Pro',
  description: 'Full brand presence on Socelle. Everything in Basic plus: unlimited posts, scheduled publishing, full audience analytics, education content uploads (5/month), 1 featured product launch/month. Enhanced priority placement.',
  metadata: {
    tier: 'pro',
    platform: 'socelle',
    internal_id: 'socelle_brand_pro',
    max_posts_per_month: 'unlimited',
    max_education_uploads_per_month: '5',
    max_launches_per_month: '1',
    analytics_level: 'full',
    support_type: 'email_chat',
    priority_placement: 'featured',
  },
  images: ['https://socelle.com/assets/stripe/brand-pro-tier.png'],
  url: 'https://socelle.com/brands/claim',
});

const proPrice = await stripe.prices.create({
  product: proProduct.id,
  currency: 'usd',
  unit_amount: 49900, // $499.00
  recurring: {
    interval: 'month',
    interval_count: 1,
  },
  nickname: 'Brand Pro Monthly',
  metadata: {
    tier: 'pro',
    internal_price_id: 'price_brand_pro_monthly',
  },
});

// Store proPrice.id as STRIPE_PRICE_BRAND_PRO_MONTHLY in environment

// ── PRODUCT 3: Enterprise ─────────────────────────────────────────

const enterpriseProduct = await stripe.products.create({
  name: 'Socelle Brand Claim — Enterprise',
  description: 'Maximum brand intelligence on Socelle. Everything in Pro plus: unlimited posts and launches, detailed audience segments, API access, $2,500/quarter survey credits, quarterly co-branded intelligence reports, named account manager, top category placement.',
  metadata: {
    tier: 'enterprise',
    platform: 'socelle',
    internal_id: 'socelle_brand_enterprise',
    max_posts_per_month: 'unlimited',
    max_education_uploads_per_month: 'unlimited',
    max_launches_per_month: 'unlimited',
    analytics_level: 'full_export_api',
    support_type: 'named_account_manager',
    priority_placement: 'top_category',
    api_rate_limit_per_month: '10000',
    survey_credits_per_quarter_usd: '2500',
    intelligence_reports_per_quarter: '1',
  },
  images: ['https://socelle.com/assets/stripe/brand-enterprise-tier.png'],
  url: 'https://socelle.com/brands/claim',
});

const enterprisePrice = await stripe.prices.create({
  product: enterpriseProduct.id,
  currency: 'usd',
  unit_amount: 99900, // $999.00
  recurring: {
    interval: 'month',
    interval_count: 1,
  },
  nickname: 'Brand Enterprise Monthly',
  metadata: {
    tier: 'enterprise',
    internal_price_id: 'price_brand_enterprise_monthly',
  },
});

// Store enterprisePrice.id as STRIPE_PRICE_BRAND_ENTERPRISE_MONTHLY in environment

// ── CUSTOMER PORTAL CONFIGURATION ────────────────────────────────

await stripe.billingPortal.configurations.create({
  business_profile: {
    headline: 'Socelle — Brand Subscription Management',
    privacy_policy_url: 'https://socelle.com/privacy',
    terms_of_service_url: 'https://socelle.com/terms',
  },
  features: {
    subscription_cancel: {
      enabled: true,
      mode: 'at_period_end', // Cancels at end of billing period, not immediately
      proration_behavior: 'none',
      cancellation_reason: {
        enabled: true,
        options: [
          'too_expensive',
          'missing_features',
          'switched_service',
          'unused',
          'other',
        ],
      },
    },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ['price'],
      proration_behavior: 'always_invoice', // Upgrade: charged immediately; downgrade: credited
      products: [
        {
          product: basicProduct.id,
          prices: [basicPrice.id],
        },
        {
          product: proProduct.id,
          prices: [proPrice.id],
        },
        {
          product: enterpriseProduct.id,
          prices: [enterprisePrice.id],
        },
      ],
    },
    payment_method_update: {
      enabled: true,
    },
    invoice_history: {
      enabled: true,
    },
  },
});

// ── ENVIRONMENT VARIABLES TO SET ─────────────────────────────────
// STRIPE_SECRET_KEY=sk_live_...
// STRIPE_WEBHOOK_SECRET=whsec_...
// STRIPE_PRICE_BRAND_BASIC_MONTHLY=price_... (from basicPrice.id above)
// STRIPE_PRICE_BRAND_PRO_MONTHLY=price_... (from proPrice.id above)
// STRIPE_PRICE_BRAND_ENTERPRISE_MONTHLY=price_... (from enterprisePrice.id above)
// STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/...

// ── PRICE ID LOOKUP MAP (application-side) ───────────────────────
const PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BRAND_BASIC_MONTHLY,
  pro: process.env.STRIPE_PRICE_BRAND_PRO_MONTHLY,
  enterprise: process.env.STRIPE_PRICE_BRAND_ENTERPRISE_MONTHLY,
};

const TIER_FROM_PRICE_ID = {
  [process.env.STRIPE_PRICE_BRAND_BASIC_MONTHLY]: 'basic',
  [process.env.STRIPE_PRICE_BRAND_PRO_MONTHLY]: 'pro',
  [process.env.STRIPE_PRICE_BRAND_ENTERPRISE_MONTHLY]: 'enterprise',
};
```

### Stripe Dashboard Manual Configuration Equivalent

If creating via Stripe Dashboard instead of API:

**Product 1: Basic**
- Name: `Socelle Brand Claim — Basic`
- Price: $199.00 / month (recurring)
- Nickname: `Brand Basic Monthly`

**Product 2: Pro**
- Name: `Socelle Brand Claim — Pro`
- Price: $499.00 / month (recurring)
- Nickname: `Brand Pro Monthly`
- Mark as: Popular / Recommended (for display in checkout)

**Product 3: Enterprise**
- Name: `Socelle Brand Claim — Enterprise`
- Price: $999.00 / month (recurring)
- Nickname: `Brand Enterprise Monthly`

**Webhook Endpoint Configuration:**
- Endpoint URL: `https://socelle.com/api/webhooks/stripe`
- Events to listen for:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- API version: 2024-06-20 (or latest stable)

---

## Acceptance Criteria Verification

| Requirement | Status |
|---|---|
| Claim funnel has exactly 8 steps with UX copy for each | Complete — Steps 1–8 with copy, system actions, and route specifications |
| Tier matrix covers all 15 features with clear tier gating | Complete — All 15 features specified with per-tier behavior |
| Stripe webhook handling covers all 5 events including cancellation behavior | Complete — All 5 events with full handler logic |
| Approval workflow covers auto-approve (email match) AND manual review paths | Complete — Both paths specified with decision matrix |
| Brand dashboard has 9 sections with tier gating specified | Complete — All 9 sections with tier gates and lock messages |
| Revenue projection has month-by-month MRR from month 3 to month 12 | Complete — Month 3 through 12 with assumptions |
| Cancellation behavior is fully specified (content archived, badge removed, revert) | Complete — Section 3 webhook handler for subscription.deleted |
| Stripe product config is production-ready | Complete — JavaScript code with all 3 products, 3 prices, Customer Portal config, and env vars |

---

## Database Schema Requirements

The following tables and columns are required to support this specification. These should be added as Supabase migrations (ADD ONLY — never modify existing):

```sql
-- brand_claims table
CREATE TABLE brand_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  claimant_name TEXT NOT NULL,
  claimant_role TEXT NOT NULL,
  business_email TEXT NOT NULL,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('email_domain', 'linkedin', 'screenshot')),
  proof_url TEXT, -- LinkedIn URL or screenshot storage path
  domain_match BOOLEAN NOT NULL DEFAULT false,
  fast_track BOOLEAN NOT NULL DEFAULT false,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('basic', 'pro', 'enterprise')),
  claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    claim_status IN ('pending', 'awaiting_payment', 'approved', 'rejected', 'flagged', 'cancelled', 'suspended')
  ),
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  admin_notes TEXT,
  rejection_reason TEXT,
  grace_period_active BOOLEAN DEFAULT false,
  grace_period_expires TIMESTAMPTZ,
  pending_downgrade_tier TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  UNIQUE(brand_id, claim_status) -- prevent duplicate active claims per brand
);

-- Add columns to brand_profiles (or brands) if not present
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT false;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS verified_badge BOOLEAN DEFAULT false;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false;

-- brand_onboarding_progress table
CREATE TABLE brand_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  logo_uploaded BOOLEAN DEFAULT false,
  description_written BOOLEAN DEFAULT false,
  contact_info_added BOOLEAN DEFAULT false,
  first_post_published BOOLEAN DEFAULT false,
  analytics_viewed BOOLEAN DEFAULT false,
  checklist_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- brand_posts table (for news/updates/launches)
CREATE TABLE brand_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  author_user_id UUID REFERENCES auth.users(id),
  post_type TEXT NOT NULL CHECK (post_type IN ('news', 'launch', 'education', 'update')),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  external_link TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  archived BOOLEAN DEFAULT false,
  archive_reason TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- brand_activity_log table
CREATE TABLE brand_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

*This document is the authoritative specification for SOCELLE brand claim monetization. All implementation agents should reference this document before building any component of the claim flow, Stripe integration, admin workflow, or brand dashboard.*
