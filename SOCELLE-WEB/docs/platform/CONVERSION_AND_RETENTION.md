# CONVERSION AND RETENTION MECHANICS
**The PRO Edit — Brand Discovery & Activation Platform**
*Version 1.0 | February 2026 | Principal Product Design + Revenue Architecture*

---

## Overview

Conversion and retention design for this platform follows one rule: **earn trust before asking for money, then ask at exactly the moment value is proven.**

This is a B2B product. B2B buyers are skeptical, time-poor, and slow to trust. Generic "sign up to unlock" paywalls destroy B2B conversion. The mechanics here are built around a single behavioral insight: **the moment of perceived value must immediately precede the ask**.

Revenue levers:
1. Business subscription tiers (recurring SaaS)
2. Brand subscription + placement products (recurring + CPM/CPC)
3. Transaction commissions on PRO + retail orders (variable, scales with GMV)
4. Data products (benchmarks, analytics upgrades) (recurring)

---

## 1. Free Tier Design

### What's Always Free (No Account Required)
| Feature | Why Free |
|---|---|
| Brand Directory (browse only) | Acquisition — show the product exists |
| Brand Profile teaser (first screen only) | Hook — prove we know what brands are |
| Landing page social proof | Trust building |

### What Requires Free Account
The account creation moment is the first conversion event. It must feel worth it.

| Feature | Why Require Account |
|---|---|
| Full brand profile view | Identity capture; enables personalization |
| Brand fit teaser ("Good fit for your business type") | Light personalization hooks them |
| Menu upload (step 1 only) | Deep engagement signal; intent data |
| First 3 service matches | Immediate value delivery — prove the AI works |
| First 1 gap analysis result (teaser) | Show the money, don't give it away |

**Free account limits:**
- 1 active plan
- 3 gap results visible (rest locked)
- No revenue simulator
- No activation kit generation
- No export
- No order placement

### What Requires Paid Tier

| Feature | Starter | Growth | Pro |
|---|---|---|---|
| Active plans | 1 | 5 | Unlimited |
| Gap results visible | 3 | All | All |
| Revenue simulator | ❌ | ✅ | ✅ |
| Activation kit generation | ❌ | ✅ | ✅ |
| Export center | ❌ | ✅ | ✅ |
| Order placement (PRO + retail) | ❌ | ✅ | ✅ |
| Comparison tool | ❌ | ✅ | ✅ |
| Team members | 1 | 3 | Unlimited |
| Monthly insights | ❌ | ✅ | ✅ |
| Benchmarks | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |

**ASSUMPTION:** Specific pricing TBD by commercial team. Recommended anchors: Starter $0, Growth $79/mo, Pro $199/mo (annual discount 20%). Subject to market testing.

---

## 2. Paywall Placement — The "Earned Gate" Model

The core principle: **the paywall must appear immediately after the user sees value, not before.**

### Paywall Trigger 1 — Gap Results (Highest-Leverage)
**Where:** Gap Analysis tab, after showing 2–3 gaps
**What the user sees:**

```
┌────────────────────────────────────────────────────────────┐
│  YOUR REVENUE GAPS  (8 identified)                         │
│                                                            │
│  ✅ Hot Stone Massage Add-On        +$2,340/mo  [See →]    │
│  ✅ Scalp Treatment Upgrade         +$1,890/mo  [See →]    │
│  ✅ Lash Lift + Tint Package        +$1,200/mo  [See →]    │
│                                                            │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ [5 more]│
│                                                            │
│  Upgrade to Growth to unlock all 5 remaining gaps         │
│  Estimated additional uplift: $4,200–$6,800/month         │
│  [Unlock All Gaps →]                          $79/month   │
└────────────────────────────────────────────────────────────┘
```

**Why it works:** User has already seen 3 gaps with dollar values. They believe the model. The locked gaps have an aggregate dollar range (not exact) to drive FOMO without overpromising.

**Do NOT:** Show blurred/greyed-out gap names. Show an aggregate value range instead. Blurred content is visually noisy and feels dishonest.

---

### Paywall Trigger 2 — Revenue Simulator (Second-Highest)
**Where:** After user views any gap detail, "Simulate Revenue Impact" CTA in the footer of the gap detail page
**What the user sees:** Simulator preview (read-only, non-interactive) with your numbers pre-filled + lock overlay

```
┌─────────────────────────────────────────────────────────┐
│  REVENUE SIMULATION PREVIEW              🔒 Growth Plan │
│                                                         │
│  Based on your analysis:                                │
│  Estimated annual uplift: $42,000 – $68,000             │
│  Monthly run rate: $3,500 – $5,700                      │
│  Payback on opening order: ~3.4 months                  │
│                                                         │
│  [Customize assumptions and see full breakdown →]       │
│                              Upgrade to Growth $79/mo   │
└─────────────────────────────────────────────────────────┘
```

**Why it works:** Shows a concrete dollar range (not zero) before the lock. The act of wanting to adjust the assumptions = upgrade motivation.

---

### Paywall Trigger 3 — Activation Kit
**Where:** After plan is analyzed, Activation Kit tab shows a preview of assets
**What the user sees:** Kit file icons (Menu PDF, Training Plan, Retail Scripts) with names visible but download buttons locked

**Why it works:** The kit represents tangible, shareable work product. Business owners want to take something to their team. The shareability of the kit is the purchase trigger.

---

## 3. First-Session Wow Moment Design

**Target:** Value delivered within 60 seconds of completing menu upload.

### The "60-Second Wow" Flow

```
T+0s   User uploads menu (PDF or paste)
T+3s   "Analyzing your menu..." progress screen
T+8s   First 3 services appear: normalized, categorized
T+15s  "Mapping to brand protocols..." (animated)
T+22s  First match appears: "Hydrating Facial → HydraLux Protocol (92% match)"
T+30s  Matches screen loads: "14 of your 18 services matched"
T+38s  Gap summary banner: "We found 8 revenue opportunities in your menu"
T+45s  First gap card: "Hot Stone Add-On → +$2,340/month estimated"
T+60s  "Upgrade to see all 8 gaps →"
```

**Critical UX requirement:** The progress states between upload and results must feel active and specific, not generic. "Mapping 'Deep Tissue Massage' to protocols..." is better than "Analyzing...". Users must feel the AI is reading THEIR menu, not running a generic process.

**Current bug note:** There is a race condition in `handleAnalyze()` where navigation to PlanResults happens before `saveOutputs()` completes. This means the first-session wow moment currently shows an empty state ("No results — click Reanalyze") before results populate. **This is the single highest-priority UX fix.** Fix: implement Supabase Realtime subscription on `plans.status` or a polling mechanism, navigate only after status = 'ready'.

---

## 4. Repeat Usage Mechanics

The challenge with B2B tools: after initial activation, usage drops. This platform must create multiple reasons to return.

### Monthly Optimization Loop
**Trigger:** Automated monthly digest (email + in-app notification)
**Content:**
- "Your plan is 30 days old. Here's what's changed:"
- Seasonal service recommendations (from `marketing_calendar`)
- "Businesses like yours added [X] this season"
- Reorder alert if first order was placed

**Design principle:** Monthly insights must have a clear action attached. "Here's what changed" without "here's what to do" = email ignored.

---

### Reorder Triggers
**Trigger:** `orders` table → time since last order > (average_usage_days - 7 days)
**Average usage estimate:** Opening order ÷ sessions_per_week × product_usage_per_service
**In-app:** Banner in sidebar "Your [Brand X] backbar is estimated to run out in ~2 weeks"
**Email:** Triggered 7 days before estimated depletion

---

### Seasonal Promotions
**Trigger:** `marketing_calendar` upcoming seasonal events
**Who sees:** Businesses whose plans include protocols linked to seasonal items
**Example:** "Summer prep: 5 businesses in your category added body exfoliation protocols last March. Your plan includes a gap for this. [View Gap →]"

---

### "Upgrade Your Plan" Loop
**Trigger:** New brand joins the platform whose protocols would fill a gap in existing plans
**Who sees:** Business users with plans that have low match rates for the new brand's category
**Message:** "New brand added: [Brand X] — we found 4 matches for your menu. [View Analysis →]"

---

## 5. Brand Monetization Mechanics

### Brand Subscription Tiers
| Tier | Features | Revenue Driver |
|---|---|---|
| **Listed** (free) | Basic profile, visible in directory | Platform growth |
| **Partner** | Analytics, placement in category, featured in plans | $X/mo subscription |
| **Featured** | Boosted placement, promoted in onboarding, access to benchmark data | $X/mo premium |
| **Data Pro** | Full benchmark access, API, retailer insights, custom reports | $X/mo enterprise |

**ASSUMPTION:** Specific brand pricing TBD. Recommended anchor: Partner $299/mo, Featured $799/mo, Data Pro custom contract. Test at $199/$499 initially.

---

### Placement Products
| Placement | What It Does | Monetization Model |
|---|---|---|
| Category Top | Appears first in Brand Directory filter for their category | Flat monthly fee |
| Onboarding Suggestion | Shown as "recommended" during Plan Wizard step 3 | Flat monthly fee or CPM |
| Gap Recommendation Boost | Protocol shows first in Gap Analysis when multiple brands match | Per-impression or flat |
| Email Feature | Brand featured in monthly business digest | Per-send fee |

**Hard rule:** Paid placement must be disclosed to business users ("Sponsored" label). Platform trust depends on it. Any undisclosed paid placement is an existential risk.

---

### Data Products
| Product | What It Is | Who Buys It |
|---|---|---|
| Benchmark Access | Brand sees anonymized category averages vs their own metrics | All brand tiers (gated by tier) |
| Retailer Segment Report | Anonymized breakdown of adopting businesses by size/type | Featured+ tier |
| Demand Signal Alerts | "10 businesses searched for this protocol in the last 7 days" | Data Pro tier |
| Custom Analysis | One-time report on brand performance in a specific market | Enterprise contracts |

---

## 6. Transaction Commission Model

| Transaction Type | Commission Rate | Notes |
|---|---|---|
| PRO (backbar) product orders | 8–12% | Negotiate per brand |
| Retail product orders | 10–15% | Higher margin product |
| Opening order (first order per brand) | Reduce to 5% | Acquisition incentive |
| Reorder | Full rate | Recurring revenue |

**Commission logic:** Tracked in `orders` table, reconciled monthly, displayed in admin commission dashboard. Brand is paid `order_total × (1 - commission_rate)` net 30.

**Current gap:** No `commission_ledger` table exists. This is a P0 commerce prerequisite.

---

## 7. Anti-Patterns to Avoid

| Anti-Pattern | Why It Destroys Conversion | Correct Alternative |
|---|---|---|
| "Sign up to see pricing" | B2B buyers need to know cost before they can justify a meeting | Show pricing page openly |
| Paywall before ANY value delivery | User has no reason to pay | Show 2–3 gaps free, every time |
| "Free Trial" with credit card required | Kills B2B signups (procurement friction) | Free tier, no card; upgrade when ready |
| Aggressive upsell modals every session | Feels desperate; trains users to dismiss | Single upsell trigger per session, contextual |
| Fake urgency ("Limited spots!") | B2B buyers see through it immediately | Show real data: "87 businesses upgraded this month" |
| Making the simulator feel inaccurate | Destroys trust in the entire platform | Label every estimate clearly; show confidence ranges, not single numbers |
| Hiding brand placement as organic results | One incident of discovery = catastrophic trust loss | Always label "Sponsored" |

---

## 8. Success Metrics

### Business Funnel Metrics
| Stage | Metric | Target (ASSUMPTION) |
|---|---|---|
| Acquisition | Signups / unique visitors | >15% (B2B landing page) |
| Activation | Menu uploaded / signups | >60% within 7 days |
| Value delivery | Plan analyzed / menu uploaded | >85% (automated) |
| Conversion | Upgraded to paid / plan analyzed | >20% within 14 days |
| Purchase | Order placed / paid tier | >50% within 30 days |
| Retention | Monthly active (logged in + action) / paid | >70% at 90 days |
| Expansion | Reorder placed / first order | >60% at 60 days |

### Brand Funnel Metrics
| Stage | Metric | Target (ASSUMPTION) |
|---|---|---|
| Onboarding | Catalog complete / brand signed | >80% within 30 days |
| Engagement | Analytics viewed weekly / active brands | >50% |
| Monetization | Placement product purchased / active brands | >30% |
| Retention | Renewal rate / annual contracts | >85% |

---

*Last updated: 2026-02-22 | Owner: Revenue + Product Design*
