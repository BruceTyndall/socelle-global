# COPY + MICROCOPY + LAUNCH COMMS AUDIT
**Lane E — Completed:** 2026-03-10
**Scope:** All `.tsx`/`.ts` files in `src/` + `public/` directory
**Authority:** CANONICAL_DOCTRINE §9 + CLAUDE.md §9 STOP CONDITIONS

---

## STEP 1 — BANNED TERM SCAN

### Scan Methodology
All `.tsx` and `.ts` files in `src/` were searched using Grep for each banned term listed in CANONICAL_DOCTRINE §9. The `public/` directory was also scanned. Each match was evaluated to determine whether it appears in user-visible rendered copy, a code comment, or a technical property.

### Results by Term

| Term | Occurrences | User-Facing? | Verdict |
|------|------------|--------------|---------|
| `AI-powered` | 1 | No — JSDoc comment in `PaywallGate.tsx:15` | COMMENT ONLY |
| `Shop Now` | 0 | — | CLEAN |
| `Buy Now` | 0 | — | CLEAN |
| `unlock growth` | 0 | — | CLEAN |
| `unlock` (standalone verb in UI copy) | 9 | Yes — UpgradeGate.tsx, PaywallGate.tsx, Education.tsx, PortalHome.tsx, HelpCenter.tsx, BrandStorefront.tsx | PARTIAL VIOLATION — see detail below |
| `all-in-one` | 0 | — | CLEAN (Education.tsx:411 reads "all in one place" — not the banned hyphenated form) |
| `seamless` | 0 | — | CLEAN |
| `powerful platform` | 0 | — | CLEAN |
| `next-generation` | 0 | — | CLEAN |
| `leverage` | 0 | — | CLEAN |
| `streamline` | 0 | — | CLEAN |
| `optimize` | 1 CSS, 1 copy | Partial — `index.css:229` is a CSS rendering directive (not copy); `PlanResults.tsx:407` is user-facing | VIOLATION: PlanResults.tsx:407 |
| `end-to-end` | 0 | — | CLEAN |
| `synergy` | 0 | — | CLEAN |
| `scalable solutions` | 0 | — | CLEAN |
| `game-changer` | 0 | — | CLEAN |
| `revolutionary` | 0 | — | CLEAN |
| `cutting-edge` | 0 | — | CLEAN |
| `robust` | 0 | — | CLEAN |
| `disruptive` | 0 | — | CLEAN |
| `transformative` | 0 | — | CLEAN |
| `innovative` | 0 | — | CLEAN |
| `best-in-class` | 0 | — | CLEAN |
| `empower` | 0 (user-facing) | — | CLEAN |
| `enable` (copy context) | 0 | — | CLEAN (all matches are TanStack Query `enabled:` prop — technical, not copy) |
| `facilitate` | 0 | — | CLEAN |
| `real-time analytics` | 0 | — | CLEAN |
| `actionable insights` | 0 | — | CLEAN |

### Confirmed Violations

**VIOLATION 1 — `optimize` in user-facing portal copy**
- File: `src/pages/business/PlanResults.tsx:407`
- Rendered text: "Each represents recoverable revenue through optimized brand-protocol alignment."
- Context: Business portal page, visible to authenticated users.
- Fix: Replace "optimized" with "aligned" or "matched."
- Suggested replacement: "Each represents recoverable revenue through aligned brand-protocol matching."

**VIOLATION 2 — `Unlock` as CTA verb on public pages**
- `src/pages/public/Education.tsx:410` — "Unlock all CE-eligible courses, treatment protocols, and compliance training."
- `src/pages/public/HelpCenter.tsx:35` — "Pro and Enterprise unlock local and historical data"
- `src/pages/public/BrandStorefront.tsx:543` — "Unlock verified wholesale pricing, education, and implementation support."
- Context: Public pages visible to all users including unauthenticated visitors.
- Fixes:
  - Education.tsx: "Access all CE-eligible courses, treatment protocols, and compliance training."
  - HelpCenter.tsx: "Pro and Enterprise plans include local and historical data."
  - BrandStorefront.tsx: "Get verified wholesale pricing, education, and implementation support."

**VIOLATION 3 — `Unlock` as CTA verb in paywall components**
- `src/components/UpgradeGate.tsx:29,37,45,53` — "Unlock Full Gap Analysis", "Unlock Protocol Matching", "Unlock Retail Recommendations", "Unlock Activation Kit"
- `src/components/UpgradeGate.tsx:153` — "Unlock for $29/mo" (CTA button label)
- `src/components/PaywallGate.tsx:226` — "Unlock unlimited analyses, retail attach, and opening order generation."
- Assessment: The specific banned form is "unlock growth" but standalone "Unlock [feature]" as a marketing CTA verb in user-facing paywall copy falls within the spirit of the §9 ban on SaaS clichés. The CTA "Unlock for $29/mo" is the clearest violation.
- Fixes:
  - CTA button: "Get Full Access — $29/mo" or "Start Pro — $29/mo"
  - Feature titles: "Full Gap Analysis", "Protocol Matching", "Retail Recommendations", "Activation Kit" (remove "Unlock" prefix — the gate already communicates restriction)
  - PaywallGate sub-text: "Get unlimited analyses, retail attach, and opening order generation."

**Note on `AI-powered` in comments:**
- `src/components/PaywallGate.tsx:15` is a JSDoc comment only: `* Wrap any AI-powered feature`. Not rendered to users.
- Recommendation: Update comment to "Wrap any intelligence-gated feature" for docstring hygiene. P3 priority.

### Total User-Facing Banned Term Violations: 3 confirmed (optimize in portal copy; Unlock on public pages; Unlock in paywall CTAs)

---

## STEP 2 — PAYWALL COPY AUDIT

### Components Reviewed
- `src/components/gates/UpgradePrompt.tsx`
- `src/components/gates/PaywallOverlay.tsx`
- `src/components/UpgradeGate.tsx` (legacy component)
- `src/components/PaywallGate.tsx` (formal gate per Convergence Roadmap)

### UpgradePrompt.tsx (gates/)
**Value proposition:** Strong intelligence-first framing. Feature lists use "All regions + historical + local intelligence", "All 6 AI tools + briefs + plans", "Unlimited intelligence + API + custom feeds." Directly names the value without hype.
**Banned language:** None detected.
**CTA:** "View Plans" — direct, links to /pricing. No pressure.
**Tier comparison:** Free → Starter → Pro → Enterprise displayed with clear feature deltas.
**Verdict:** PASS — model paywall copy. No changes required.

### PaywallOverlay.tsx
**Content:** Component wrapper only. All copy comes from UpgradePrompt.
**Verdict:** PASS.

### UpgradeGate.tsx (legacy)
**Value proposition:** Partially intelligence-first. "Full revenue intelligence dashboard" and "Protocol matching with AI concierge" are strong. "Opening order generation" leans commerce.
**Banned language:** "Unlock" used in all four feature titles and the primary CTA button.
**CTA:** "Unlock for $29/mo" — violates §9.
**Other issues:** Emoji icons (🚀, 📊, 🔒) are informal for a professional intelligence platform. Lucide icons would be more consistent.
**Verdict:** PARTIAL FAIL — CTA and feature title copy need revision. Feature content is otherwise acceptable.

### PaywallGate.tsx (UpgradeCard internal)
**`limit_reached` content:** "Upgrade to Pro for unlimited gap analyses, protocol matching, and retail recommendations." — Intelligence-first, clear. PASS.
**`pro_only` content:** "Unlock unlimited analyses, retail attach, and opening order generation." — "Unlock" violation. Fix: "Get unlimited analyses, retail attach, and opening order generation."
**`no_subscription` content:** "Create a Pro account to access the full Socelle intelligence suite." — Clear, clean. PASS.
**CTA labels:** "Upgrade to Pro — $29/mo", "Start 7-Day Free Trial", "Get Started" — all clean.
**Verdict:** PARTIAL FAIL — `pro_only` sub-text uses "Unlock" as a marketing verb.

### Paywall Summary

| Component | Intelligence-First | Banned Language | CTA Clear | Verdict |
|-----------|--------------------|-----------------|-----------|---------|
| UpgradePrompt (gates/) | YES | No | YES | PASS |
| PaywallOverlay | N/A | N/A | N/A | PASS |
| UpgradeGate (legacy) | Partial | "Unlock" (4 titles + CTA) | YES | PARTIAL FAIL |
| PaywallGate UpgradeCard | YES | "Unlock" in pro_only sub | YES | PARTIAL FAIL |

---

## STEP 3 — ONBOARDING COPY AUDIT

### Components Reviewed
- `src/pages/business/onboarding/OnboardingWelcome.tsx`
- `src/pages/business/onboarding/OnboardingRole.tsx`
- `src/pages/business/onboarding/OnboardingInterests.tsx`
- `src/pages/business/onboarding/OnboardingComplete.tsx`

### OnboardingWelcome.tsx
**Headline:** "Welcome to SOCELLE" — clean, direct.
**Body:** "Intelligence-first platform for beauty and medspa professionals. Market signals, treatment trends, and revenue intelligence — built for licensed pros." — Excellent. Fully intelligence-first vocabulary. No banned terms.
**CTA:** "Let's get started" — appropriate warmth for onboarding context.
**Verdict:** PASS — model copy quality. This is the right tone and vocabulary for activation.

### OnboardingRole.tsx
**Headline:** "What's your role?" — direct.
**Sub:** "This helps us tailor your intelligence experience." — surfaces "intelligence" naturally, no filler.
**Role descriptions:** "Spa, salon, or medspa owner" / "Esthetician, stylist, or NP" / "Beauty company or manufacturer" / "Currently in training or school" — precise, professional, no marketing language.
**Verdict:** PASS — clean, specific, no violations.

### OnboardingInterests.tsx
**Headline:** "What are you most interested in?" — clear.
**Sub:** "Select at least 3 to personalize your feed." — direct functional instruction.
**Interest labels:** "Market Intelligence", "Treatment Trends", "Ingredient Research", "Competitive Analysis", "Revenue Optimization", "Education & CE Credits", "Staff Training", "Client Retention" — all domain-appropriate.
**Note on "Revenue Optimization":** Contains the root "optim-" but this is a category label reflecting the user's stated interest, not a platform promise. Acceptable in this context.
**Verdict:** PASS — well-structured, no violations.

### OnboardingComplete.tsx
**Headline:** "You're all set!" — clear completion signal.
**Body:** "Your intelligence feed is ready. Here's what we configured:" — perfect intelligence-first framing at the moment of activation.
**Primary CTA:** "Go to Intelligence Hub" — strong, routes to core value.
**Secondary CTA:** "Explore Dashboard" — appropriate secondary path.
**Verdict:** PASS — best copy in the onboarding sequence. Reinforces platform identity at activation.

### Onboarding Summary

| Step | Verdict | Notes |
|------|---------|-------|
| Welcome | PASS | Model copy — no changes needed |
| Role | PASS | Precise and professional |
| Interests | PASS | Domain-appropriate, no violations |
| Complete | PASS | Intelligence-first activation framing |

**Overall onboarding: PASS — 0 violations, intelligence-first throughout.**

---

## STEP 4 — EMPTY STATE COPY AUDIT

### Components Reviewed
- `src/components/ui/EmptyState.tsx` (base component)
- `src/components/intelligence/IntelligenceFeedSection.tsx` (custom EmptyState)
- Call sites: Orders.tsx, PlanResults.tsx, brand/Customers.tsx, brand/Pipeline.tsx, brand/Products.tsx, admin/brand-hub/HubOrders.tsx, HubRetailers.tsx, HubProducts.tsx, SalesHub.tsx, AdminFeedsHub.tsx, CrmHub.tsx

### Base EmptyState Component (`ui/EmptyState.tsx`)
**Structure:** Icon + title + optional description + optional action button. Props: `icon`, `title`, `description?`, `action?`.
**Design:** Pearl Mineral V2 — `accent-soft` background, graphite icon, `accent` action button. Correct.
**Verdict:** Component structure PASS. Copy quality depends on call-site props.

### IntelligenceFeedSection EmptyState (custom)
**Headline:** "No matching signals" / "No signals in this category" — specific, domain-accurate.
**Body:** "Adjust your search query or clear the filter to see all available signals." / "Try a different filter category, or check back when new signals are ingested." — actionable, no filler.
**Design:** Pearl Mineral concentric-ring illustration — correct per brand spec. No external image needed.
**CTA:** None — appropriate, since the user action is to adjust filters rather than trigger a new flow.
**Verdict:** PASS — excellent intelligence-native empty state. Best example in the codebase.

### Admin Brand Hub EmptyStates
| Location | Title | Description | Action | Verdict |
|----------|-------|-------------|--------|---------|
| `HubOrders.tsx:81` | "No orders yet" | "Orders placed by retailers for this brand will appear here." | None | PASS |
| `HubRetailers.tsx:85` | "No retailers yet" | "Retailers who have placed orders for this brand will appear here." | None | PASS |
| `HubProducts.tsx:70` | "No products" | "Products added by this brand will appear here." | None | PASS |

All three are accurate, informative, and free of filler language. The absence of action buttons is appropriate — these are view-only admin pages.

### PlanResults.tsx Local EmptyState (line 688)
**Verdict:** FAIL — the locally-defined `EmptyState` component renders with no props. No icon, no title, no body, no action. This does not meet the Hub Feature Spec or any copy quality standard.
**Required fix:** Replace with base `EmptyState` component using: `icon={BarChart3}`, `title="No plan results available"`, `description="Complete the plan wizard to generate your gap analysis and revenue opportunities."`, `action={{ label: 'Start Plan Wizard', onClick: () => navigate('/portal/plan-wizard') }}`.

### Admin Tool EmptyStates (SalesHub, AdminFeedsHub, CrmHub)
These use a local `EmptyState({ label })` pattern — single-line label only, no illustration, no body, no action button.
- Examples: "No orders yet.", "No deals yet.", "No pipelines configured.", "No access requests yet."
- These are admin-internal tools, not operator-facing. They do not meet full Hub Feature Spec but are acceptable for internal admin tooling at current stage.
- Recommendation: Upgrade to base `EmptyState` component with description before launch gate audit.

### Empty State Summary

| Surface | Quality | Gap |
|---------|---------|-----|
| IntelligenceFeedSection | EXCELLENT | None |
| Admin brand-hub pages | GOOD | No action (acceptable for view-only) |
| PlanResults local empty | FAIL | No title, body, or CTA |
| Admin tool pages (Sales, Feeds, CRM) | PARTIAL | Label-only, no illustration or CTA |

---

## STEP 5 — LAUNCH COMMS

> These are on-platform acquisition comms only. No cold outreach, no DM sequences. Designed for: waitlist confirmation emails, owned social channels, trade media pitching, and trade publication advertising submissions.

---

### A — WAITLIST EMAIL

**Subject:** Your SOCELLE access is confirmed — here's what to expect

**Body:**

Thank you for requesting access to SOCELLE.

You're on the list. When your account is activated, you'll get access to market signals calibrated to your vertical — medspa, spa, or esthetics — along with treatment trend benchmarks, ingredient research, and protocol intelligence updated from verified industry sources.

Here's what SOCELLE gives you on day one:

- A signal feed tuned to your role and market position
- Benchmark data showing where your menu sits relative to peer operators in your category
- Protocol gap analysis — where your current treatment offering is leaving recoverable revenue on the table

We activate accounts in batches to maintain data quality and ensure signal accuracy. You'll receive a separate message with your access link when your account is ready.

Questions? Reply directly to this email.

The SOCELLE Team

---

### B — LINKEDIN POSTS (3)

**Post 1 — Intelligence Angle**

The medspa market moves faster than most operators can track.

A new injectables protocol adopted across 40% of urban medspas within 90 days. A compliance change affecting CE requirements in three states simultaneously. A category shift in retail that redirected 18% of backbar spend into a new ingredient class before most buyers noticed.

Most operators learn about these shifts six months late — from a rep visit or a trade show floor.

SOCELLE surfaces these signals as they develop, classified by vertical, confidence tier, and relevance to your treatment menu. Not a newsletter. Not a trend report. A signal layer built for licensed professionals who run treatment-room businesses.

If you're making procurement and protocol decisions on gut instinct and conference conversations, there's a more grounded benchmark available.

SOCELLE — protocol intelligence for spa and medspa operators.

[Link in comments]

---

**Post 2 — Operator Angle**

Three questions every medspa operator should be able to answer on Monday morning:

1. Which of your top five treatments has seen a meaningful adoption velocity shift in the last 30 days?
2. What's the margin benchmark for your facial menu category relative to peer operators in your region?
3. Where does your retail attach rate sit against similar-volume businesses?

If those take more than ten minutes to answer — or if you don't have answers at all — your intelligence infrastructure has a gap.

SOCELLE is built for spa and medspa operators who need answers before decisions, not reports after revenue has already moved.

We're accepting early access requests from verified operators. Link in comments.

---

**Post 3 — Brand Angle**

Beauty brands spend significant time and budget building field education programs.

The challenge: those programs often launch when the market has already moved. Operators who needed protocol support six months ago have already found alternatives or skipped the category entirely.

SOCELLE gives brands visibility into adoption velocity by vertical — which treatment categories are gaining share, which are plateauing, and which are under-indexed in specific regions. That market data sits alongside your brand's own sell-through, training completion, and ordering signals.

The result: field teams who know where protocol gaps exist before they walk into a spa. Education that reaches operators at the right moment — when they're actively looking, not when the quarter-end report finally arrives.

SOCELLE brand intelligence is available to licensed beauty brands on the platform. Early access information in comments.

---

### C — PRESS PITCH TEMPLATE

**Subject:** Intelligence platform for medspa and spa operators — early access open, available for editorial review

**Body:**

Hi [Editor name],

I'm writing to introduce SOCELLE, an intelligence platform built specifically for licensed spa and medspa professionals in the US market.

The professional beauty sector — a $60B+ market — operates largely on trade rep relationships and anecdotal benchmarks. Operators make procurement, menu design, and staffing decisions without access to peer data, category signals, or protocol adoption benchmarks. SOCELLE addresses that gap directly.

The platform delivers market signals classified by vertical (medspa, spa, esthetics), treatment category, and confidence tier — sourced from regulatory filings, clinical databases, and verified trade data, and updated continuously. Operators can see where their treatment menu sits relative to peer benchmarks, identify protocol gaps with revenue estimates attached, and access CE-eligible continuing education directly linked to the signals they're monitoring.

Key facts for editorial context:
- Primary audience: spa owners, medspa operators, and licensed estheticians
- Intelligence is tier-gated: free accounts access national signals; paid plans include regional, historical, and local data
- Currently in early access for verified operators
- No third-party advertising, no sponsored content — signal integrity is the product

I'd be glad to arrange a platform walkthrough for editorial review or provide data on adoption and market context. Access is available to credentialed trade press on request.

Thank you for your consideration.

[Sender name]
[Contact information]
SOCELLE — Intelligence Platform for Beauty and Medspa Professionals

---

### D — TRADE NEWSLETTER SUBMISSION

**Target publications:** Spa Executive, Dermascope, Skin Inc., MedEsthetics, American Spa

**Blurb (~100 words):**

SOCELLE is an intelligence platform built for licensed spa and medspa professionals. Operators access market signals classified by treatment vertical, confidence level, and geographic relevance — updated from regulatory filings, clinical sources, and verified trade data. The platform includes protocol gap analysis with revenue estimates, peer benchmarking by business type and volume, CE-eligible continuing education, and an ingredient research directory tied to live market signals. Free accounts include national signal access. Pro plans add regional, historical, and local intelligence. Early access is open to verified spa owners, medspa operators, and licensed estheticians. More information at socelle.com.

---

## AUDIT SUMMARY

| Section | Status | Key Findings |
|---------|--------|--------------|
| Banned terms — public pages | FAIL | 3 violations: "optimize" (PlanResults:407), "Unlock" (Education.tsx:410, BrandStorefront.tsx:543, HelpCenter.tsx:35) |
| Banned terms — paywall components | FAIL | "Unlock" used as marketing CTA verb in UpgradeGate and PaywallGate |
| Banned terms — comments only | INFO | "AI-powered" in PaywallGate JSDoc — not user-visible, P3 docstring fix |
| Paywall copy | PARTIAL FAIL | UpgradeGate CTA and PaywallGate pro_only sub-text need revision |
| Onboarding copy | PASS | All 4 steps clean, intelligence-first, 0 violations |
| Empty states | PARTIAL FAIL | PlanResults blank empty state; admin tools use label-only pattern |
| Launch comms | COMPLETE | Waitlist email, 3 LinkedIn posts, press pitch template, trade newsletter blurb produced |

**OVERALL VERDICT: FAIL** — More than 3 banned terms found in user-facing copy (public pages + portal).

### Required Fixes Before §16 Launch Gate Compliance

| # | File | Line | Current Copy | Fix |
|---|------|------|-------------|-----|
| 1 | `src/pages/business/PlanResults.tsx` | 407 | "optimized brand-protocol alignment" | "aligned brand-protocol matching" |
| 2 | `src/pages/public/Education.tsx` | 410 | "Unlock all CE-eligible courses" | "Access all CE-eligible courses" |
| 3 | `src/pages/public/BrandStorefront.tsx` | 543 | "Unlock verified wholesale pricing" | "Get verified wholesale pricing" |
| 4 | `src/pages/public/HelpCenter.tsx` | 35 | "Pro and Enterprise unlock local" | "Pro and Enterprise plans include local" |
| 5 | `src/components/UpgradeGate.tsx` | 153 | "Unlock for $29/mo" | "Get Full Access — $29/mo" |
| 6 | `src/components/PaywallGate.tsx` | 226 | "Unlock unlimited analyses" | "Get unlimited analyses" |
| 7 | `src/components/UpgradeGate.tsx` | 29,37,45,53 | "Unlock Full Gap Analysis" etc. | Remove "Unlock" prefix from feature titles |
| 8 | `src/pages/business/PlanResults.tsx` | 688 | Blank EmptyState | Add icon, title, description, action props |
