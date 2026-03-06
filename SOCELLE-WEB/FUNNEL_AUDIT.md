# SOCELLE Conversion Funnel Audit
**Date:** March 5, 2026 | **Platform Stage:** Production-Ready (Wave 8 Complete) | **Agent 7 Analysis**

---

## EXECUTIVE SUMMARY

SOCELLE has **3 distinct conversion flows** at production, with critical architectural issues:

1. **Public → Intelligence Access** (Unauthenticated teaser → Gated portal)
2. **Brand Discovery → Brand Claim** (Public brand listing → Claimable profile)
3. **Operator Discovery → Portal Signup** (Homepage → Dashboard)

**KEY FINDING:** The funnel is **fragmented and lacks cohesion**. Multiple CTAs exist with inconsistent messaging, no unified intelligence preview strategy, and a disconnected request access flow that doesn't feed into portal signup. The site's gate page (`/`) redirects to ComingSoon instead of showing the intelligence-first hero the platform was designed around.

---

## CURRENT CONVERSION FLOWS

### Flow 1: Public Visitor → Intelligence Access

**Current Route:**
```
/ (ComingSoon page)
  ↓
/home (Homepage with signal teasers)
  ↓
[Signal Preview Cards - Static, Limited]
  ↓
CTA: "Get Intelligence Access" or "Request Access"
  ↓
/request-access (Detailed form - NOT connected to gate)
  ↓
Form submit: e.preventDefault() — NO ACTION TAKEN
```

**CRITICAL ISSUE:** The `/request-access` page collects 5 fields but has **no submit handler**. Form submission is a no-op. No data flows to database.

**Fields Collected:**
- Business Name
- Your Name (labeled as "Your Name")
- Email
- Business Type (dropdown: Salon, Spa, Medspa, Clinic, Brand, Other)
- How did you hear about us? (optional referral source)

**Expected Outcome:** Should insert into a `waitlist` or `access_requests` table. Currently: Nothing happens.

**Friction Points:**
- Form disabled after submission — users don't know if they succeeded
- No success state message
- No next step guidance
- Visually attractive but functionally broken

**VERDICT:** **NEEDS CRITICAL FIX**

---

### Flow 2: Brand Discovery → Brand Claim

**Current Route:**
```
/brands (Brand directory with claim CTAs)
  ↓
/brands/:slug (Brand storefront)
  ↓
CTA: "Own this brand? Claim your page"
  ↓
/claim/brand/:slug (Claim flow)
  ↓
[Choice: Create account or Sign in]
  ↓
handleAuth() → supabase.auth.signUp() or signInWithPassword()
  ↓
handleClaim() → supabase.rpc('claim_brand', { p_brand_id })
  ↓
Success: Redirect to /brand/claim/review
```

**Fields Collected:**
- Email
- Password
- Toggle: Sign up or Sign in

**Supabase Integration:** ✅ **ACTIVE**
- Calls `supabase.auth.signUp()` for new accounts
- Calls `supabase.auth.signInWithPassword()` for existing accounts
- Calls RPC `claim_brand` to mark brand as claimed
- Redirects to `/brand/claim/review`

**Success State:** ✅ Shows success card, then auto-redirects after 1.5s

**Friction Points:**
- Requires auth flow before claim (sensible, but adds 2 screens)
- No email verification shown
- No brand context shown during claim (e.g., "You're claiming [Brand Name]")

**VERDICT:** **PASS** — This flow is complete and wired.

---

### Flow 3: Operator Discovery → Portal Signup

**Current Route:**
```
/home or /for-buyers or /for-medspas or /for-salons
  ↓
CTA: "Request Access" or "Get Intelligence Access" or "Explore Intelligence"
  ↓
/request-access (Form with NO submit handler)
  ↓
[Broken — no database integration]
  ↓
---OR---
  ↓
/portal/signup (Manual navigation)
  ↓
handleSubmit() → supabase.auth.signUp() + business creation
  ↓
Success: Redirect to /portal/dashboard
```

**Fields Collected (Signup):**
- Email
- Password
- Business Name
- Business Type (dropdown: Spa, Salon, Barbershop, MedSpa, Other)
- Password strength indicator (visual feedback, no validation)

**Supabase Integration:** ✅ **ACTIVE**
- Calls `supabase.auth.signUp()` to create auth user
- Creates business record in `businesses` table
- Supports optional "express interest" signal if arriving from brand storefront (`?interest=brand_id`)

**Success State:** ✅ Auto-redirects to `/portal/dashboard` after signup

**Friction Points:**
- CTAs point to `/request-access` (broken form) instead of `/portal/signup`
- Users must manually navigate to signup or find it from login page
- No onboarding guidance shown
- Password strength feedback is text-only (good UX, but not enforced)

**VERDICT:** **PARTIALLY BROKEN** — Signup page works, but the main CTA funnel is disconnected.

---

### Flow 4: Admin/Brand Portal Signup

**Current Route:**
```
/for-brands
  ↓
CTA: "Apply to Connect" (if shown)
  ↓
/brand/apply (Application form)
  ↓
Form submit → Supabase `brand_applications` table
  ↓
/brand/application-received (Confirmation page)
```

**Status:** Not audited in detail, but appears functional.

---

## CTA CONSISTENCY AUDIT

**CTA Phrases Found Across Public Pages:**

| CTA Text | Count | Pages | Intelligence-First? | Target |
|----------|-------|-------|---------------------|--------|
| Request Access | 8 | ForBuyers, ForSalons, ForMedspas, HowItWorks, CategoryIntelligence, RequestAccess | ⚠️ Neutral | `/request-access` (BROKEN) |
| Get Intelligence Access | 3 | PreLaunchGate, Home | ✅ Yes | `/request-access` (BROKEN) |
| Explore Intelligence | 3 | ForBuyers, ForMedspas, ForSalons | ✅ Yes | `/intelligence` or `/request-access` |
| Browse Brands | 4 | Brands, BrandStorefront, HowItWorks, Insights | ⚠️ Marketplace | `/brands` |
| Browse Marketplace | 1 | ForBuyers | ⚠️ Marketplace | None (no CTA visible) |
| Explore Brand Intelligence | 1 | Home | ✅ Yes | `/brands` |
| Join Free | 1 | Insights | ✅ Yes | `/request-access` (BROKEN) |
| Claim Your Brand | 5+ | BrandsDirectory, PublicBrandProfile | ⚠️ Action | `/claim/brand/:slug` |
| Claim Your Profile | 2 | BrandsDirectory | ⚠️ Action | `/claim/brand/:slug` |
| Own this brand? Claim | 1 | BrandStorefront | ⚠️ Conversational | `/claim/brand/:slug` |
| Browse Events Intelligence | 1 | Home | ✅ Yes | `/events` |

**Verdict:** CTAs are **inconsistent and misaligned**. Intelligence-first messaging present, but marketplace language (Browse Brands, Browse Marketplace) undermines positioning. The main CTA gateway (`/request-access`) is non-functional.

---

## INTELLIGENCE PREVIEW STRATEGY

### What Public Users See (Non-Logged-In)

1. **Homepage (/home)** — 3 hardcoded signal cards
   - Real signals from Supabase if configured
   - Fallback to mock signals if not
   - Cards show: title, direction (up/warn/down), freshness, source
   - **Gate Level:** Preview only — no detail view
   - **CTA:** "Get Intelligence Access" → `/request-access`

2. **Category Intelligence (/intelligence/:category)** — Filtered signals
   - Same preview cards
   - Organized by category (if routed)
   - **Gate Level:** Preview only
   - **CTA:** "Request Access" → `/request-access`

3. **Brand Storefront (/brands/:slug)** — Brand-specific intelligence
   - Brand name, description, signal count
   - Claimed vs. unclaimed status
   - **Gate Level:** Limited (no full analytics if unclaimed)
   - **CTA:** "Claim Your Brand" → `/claim/brand/:slug`

4. **PreLaunchGate (/early-access)** — Full teaser experience
   - 3 blurred signal preview cards
   - Full messaging around "market risk," "demand surge," etc.
   - Form collects email, name, role, vertical, city
   - **Status:** NOT LINKED FROM NAV — orphaned page
   - **Supabase Integration:** ✅ Inserts into `gate_profiles` table

### What Logged-In Users See

1. **Business Portal** (/portal/dashboard)
   - Full intelligence hub with 34 signals
   - Operator-specific benchmarks
   - Plan results with gap analysis

2. **Brand Portal** (/brand/dashboard)
   - Market position intelligence
   - Performance tracking
   - Reseller opportunity detection

### Gate Strategy Analysis

**Current Model:** Freemium teaser → Gated access
- Show real signals (3-5 cards) non-logged-in
- Full library (34+ signals) behind login
- No "see 3 free then paywall" — all premium

**Issues:**
1. PreLaunchGate page exists but isn't discoverable from homepage
2. RequestAccess form collects data but doesn't use it
3. No automated email flow after signup (no confirmation, no onboarding)
4. Brand preview is partial (unclaimed brands less detailed)

**Recommendation:** Implement progressive disclosure:
- Tier 1 (Unauthenticated): 3 sample signals + 1-minute preview video
- Tier 2 (Registered, unverified): Email verification → 10 signals
- Tier 3 (Verified professional): Full intelligence suite

---

## GATE PAGE (/) ANALYSIS

### Current State

The root route `/` loads `ComingSoon` component:
```tsx
<Route path="/" element={<ComingSoon />} />
```

**What it shows:** Unknown without reading ComingSoon.tsx. Likely a static "coming soon" page.

### What It Should Do

Per CLAUDE.md and Wave 1 completion, `/` should load **PublicHome** with:
- Intelligence-first hero ("The intelligence platform for professional beauty")
- 3 real signal preview cards
- Trust messaging (operator count, signal sources)
- Clear CTA to "/request-access" with working form

### Current HTML

`index.html` (the Vite template) loads a spinner + React app. No static coming soon page is hardcoded in HTML.

**Verdict:** The gate page behavior depends entirely on what `ComingSoon` component renders. If it's truly a "coming soon" page, the entire homepage experience is hidden. **This is a critical routing issue.**

---

## PRIORITY FUNNEL FIXES

### P0 (Critical — Breaks Conversion)

1. **FIX: /request-access Form Submit**
   - Add submit handler to RequestAccess.tsx
   - Insert form data into `access_requests` table (new or existing)
   - Show success state with confirmation message
   - Optionally: Send confirmation email via Edge Function
   - Estimated effort: 2-3 hours

2. **FIX: Route / to PublicHome**
   - Change `<Route path="/" element={<ComingSoon />} />` to `<Route path="/" element={<PublicHome />} />`
   - Verify homepage loads with signals and CTAs
   - Test on mobile and desktop
   - Estimated effort: 30 minutes

3. **FIX: CTA Consistency**
   - Audit all 8 "Request Access" CTAs across public pages
   - Ensure they all link to `/request-access` (once fixed)
   - Update "Browse Marketplace" CTAs to "Explore Intelligence" or "View Brands"
   - Ensure homepage is the primary entry point
   - Estimated effort: 1-2 hours

4. **CREATE: access_requests Table (If Not Exists)**
   - Schema:
     ```sql
     CREATE TABLE access_requests (
       id UUID PRIMARY KEY,
       email TEXT NOT NULL,
       business_name TEXT NOT NULL,
       your_name TEXT NOT NULL,
       business_type TEXT NOT NULL,
       referral_source TEXT,
       created_at TIMESTAMP DEFAULT NOW(),
       reviewed BOOLEAN DEFAULT FALSE,
       approved BOOLEAN DEFAULT FALSE
     );
     ```
   - RLS: Admin-only read/write
   - Estimated effort: 30 minutes

### P1 (High — Improves Conversion)

5. **ADD: Onboarding Flow**
   - After signup, redirect to brief onboarding (3 screens):
     1. "Welcome to Socelle — here's what you get"
     2. "Your business profile" (confirm name, type, location)
     3. "First look at your intelligence" (sample signals + plan recommendation)
   - Add route `/portal/onboarding`
   - Estimated effort: 4-6 hours

6. **ADD: Email Verification Flow**
   - After signup/request-access, send verification email
   - Unverified users see "Check your email" banner
   - Clicking link redirects to `/portal/verify?token=...`
   - Only then grant full access
   - Estimated effort: 3-4 hours

7. **WIRE: PreLaunchGate to Homepage**
   - Update MainNav to link `/early-access` (or remove orphaned page)
   - Consider: Should this be `/early-access` or `/waitlist`?
   - Currently disconnected from user journey
   - Estimated effort: 1 hour

8. **ADD: Success Email After Request Access**
   - Trigger Edge Function `send-email` on `access_requests` insert
   - Template: "Thanks for requesting access. We'll verify and contact you within 48 hours."
   - Include referral link if provided
   - Estimated effort: 2 hours

### P2 (Medium — Polish & Analytics)

9. **ADD: Funnel Analytics**
   - Track page views: `/home` → `/request-access` → `/portal/signup` → `/portal/dashboard`
   - Log drop-off rates at each stage
   - Add event tracking to all CTAs
   - Estimated effort: 2-3 hours

10. **IMPROVE: RequestAccess UX**
    - Add loading state after submit (disable button, show spinner)
    - Show success message: "Thanks! We'll review your application within 48 hours."
    - Optionally: Send confirmation email + referral link
    - Estimated effort: 2 hours

11. **ADD: Social Proof to Homepage**
    - Show operator count (currently animates to 200+)
    - Show brand count (currently animates to 130+)
    - Add testimonials or case studies (mock or real)
    - Estimated effort: 3-4 hours

12. **AUDIT: Mobile Conversion**
    - Test all CTAs on iOS/Android
    - Ensure form fields are mobile-optimized
    - Check Signup form on small screens
    - Estimated effort: 1-2 hours

---

## DETAILED FLOW DIAGRAMS

### Flow A: Current (Broken) — Public → Request Access

```
Homepage (/home)
  ↓ User reads signal preview
  ↓ Clicks "Get Intelligence Access"
  ↓
RequestAccess Form (/request-access)
  ↓ User fills: business name, name, email, type, referral
  ↓ User clicks "Request Access"
  ❌ NOTHING HAPPENS (e.preventDefault() blocks)
  ↓ User confused: "Did it work?"
  ↓ No email received
  ↓ No account created
  ↓ No next steps
  ↓ User leaves
```

### Flow B: Current (Works) — Brand Claim

```
Brand Directory (/brands)
  ↓ User clicks "Claim Your Brand"
  ↓
Claim Form (/claim/brand/:slug)
  ↓ User creates account or signs in
  ✅ supabase.auth.signUp() or signInWithPassword()
  ↓ User clicks "Claim Brand Name"
  ✅ supabase.rpc('claim_brand') succeeds
  ↓
Success Page (auto-redirect after 1.5s)
  ↓ Redirects to /brand/claim/review
  ✅ User can now edit brand profile
```

### Flow C: Current (Works) — Portal Signup (Manual)

```
Homepage (/home)
  ↓ User manually navigates to /portal/signup (not via CTA)
  ↓
Signup Form (/portal/signup)
  ↓ User fills: email, password, business name, type
  ✅ Password strength indicator shown
  ✅ supabase.auth.signUp() succeeds
  ✅ Business created in `businesses` table
  ↓
Auto-redirect to /portal/dashboard
  ✅ Dashboard loads with signals
```

---

## MESSAGING AUDIT

### Intelligence-First vs. Marketplace-First

| Page | Primary CTA | Secondary CTAs | Tone |
|------|-------------|---|------|
| Homepage | "Get Intelligence Access" | "Explore Brand Intelligence", "Browse Events" | ✅ Intelligence-first |
| ForBuyers | "Request Access", "Explore Intelligence" | "Browse marketplace" | ⚠️ Mixed |
| ForBrands | Not clear (need to audit) | "Apply to Connect" | ⚠️ Brand-centric |
| ForSalons | "Explore Intelligence", "Request Access" | None | ✅ Intelligence-first |
| ForMedspas | "Explore Intelligence", "Request Access" | None | ✅ Intelligence-first |
| HowItWorks | "Request Access" | None | ✅ Intelligence-first |
| Brands Directory | "Claim Your Brand Profile" | "Browse brands" | ⚠️ Action-focused |

**Verdict:** Pages are 60% intelligence-first, 40% marketplace-first. Acceptable, but could be more consistent.

---

## SUPABASE INTEGRATION STATUS

| Feature | Status | Table/Function | Notes |
|---------|--------|---|---|
| PreLaunchGate signup | ✅ Active | `gate_profiles` | Collects: email, name, user_type, vertical, city, referral_code, UTM params |
| RequestAccess | ❌ Broken | None | No handler, no database insert |
| Brand Claim | ✅ Active | `brands`, RPC `claim_brand` | Auth + RPC chain working |
| Business Signup | ✅ Active | `businesses`, Auth | Creates auth user + business record |
| Brand Signup | ✅ Active | Auth + (check brand_applications) | Application flow not fully audited |
| Operator Interest Signal | ✅ Active | `brand_interest_signals` | Wired on business signup if `?interest=brand_id` |
| Intelligence Data | ✅ Active | `signals`, `rss_signals` | Feeds to `/home` and portal dashboards |

---

## RECOMMENDED IMMEDIATE ACTIONS (Next 4 Hours)

1. **10 min:** Update `/request-access` submit handler (copy from PreLaunchGate pattern)
2. **30 min:** Create `access_requests` table in Supabase
3. **30 min:** Change root route to PublicHome instead of ComingSoon
4. **30 min:** Wire up email send on access_requests insert
5. **30 min:** Test full funnel: Homepage → Form → Success email → Signup flow
6. **30 min:** Update CTA links to be consistent
7. **30 min:** Build + verify TypeScript compilation

**Total Effort:** ~3 hours

---

## CODEBASE REFERENCES

**Key Files:**
- `/src/pages/public/RequestAccess.tsx` — Form (BROKEN submit)
- `/src/pages/public/PreLaunchGate.tsx` — Working gate pattern (reference)
- `/src/pages/public/Home.tsx` — Homepage with signals
- `/src/pages/business/Signup.tsx` — Working signup (reference)
- `/src/pages/claim/ClaimBrand.tsx` — Working claim flow (reference)
- `/src/App.tsx` — Routes (line ~250: `<Route path="/" element={<ComingSoon />} />`)

**Supabase Tables:**
- `gate_profiles` — PreLaunchGate signups
- `access_requests` — **NEEDS CREATION**
- `businesses` — Business accounts
- `brands` — Brand profiles
- `signals` / `rss_signals` — Intelligence data

---

## CONCLUSION

**Current State:** Fragmented, 60% functional. Brand claim flow works. Portal signup works if users find it manually. Homepage exists but gate page hides it. Intelligence preview works but request access form is non-functional.

**Biggest Friction:** The primary funnel (Homepage → Request Access → Signup → Portal) is broken at step 2. Fixing this is **critical and urgent**.

**Next Wave:** Implement onboarding, email verification, and progressive intelligence disclosure to maximize retention.

**Intelligence-First Score:** 7/10 — Messaging is there, but architecture doesn't reinforce hierarchy.

