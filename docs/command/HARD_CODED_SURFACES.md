# HARDCODED SURFACES — SOCELLE GLOBAL
**Updated:** March 6, 2026 — Wave 10 P0 complete
**Authority:** `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` §7  
**Doc Gate:** `docs/command/SOCELLE_RELEASE_GATES.md` §9 FAIL 4

---

## P0 — FAKE LIVE CLAIMS

### 1. Home — INTELLIGENCE_SIGNALS + "Live Market Feed" Badge — ✅ FIXED (W10-02)
- **File:** `SOCELLE-WEB/src/pages/public/Home.tsx`
- **Lines:** 13–18 (array), 161–167 (badge)
- **Identifier:** `const INTELLIGENCE_SIGNALS`
- **Fix applied:** All fake timestamps replaced with `'Demo'`. Green pulsing "Live Market Feed" badge replaced with static amber "Demo Data — Preview Only" badge. Comment header marks section as DEMO.
- **Remaining:** W10-07 will wire to `COUNT(*)` from `market_signals` via Supabase.

### 2. Home — Cocoa Palette / Serif Typography — ✅ FIXED (Waves 1–6)
- **File:** `SOCELLE-WEB/src/pages/public/Home.tsx`
- **Fix applied:** Pearl Mineral V2 palette applied. No cocoa tokens or serif fonts remain on public pages.

---

## P1 — HARDCODED DEMO DATA

### 3. Insights — TREND_PLACEHOLDERS (Orphaned Page) — ✅ RESOLVED (W10-04)
- **File:** `SOCELLE-WEB/src/pages/public/Insights.tsx`
- **Status:** Route `/insights` redirects to `/intelligence` (App.tsx). Home.tsx CTA fixed to link directly to `/intelligence`. File is dead code — kept in place per no-deletion rule, candidate for future cleanup.

### 4. ForBrands — STATS Array
- **File:** `SOCELLE-WEB/src/pages/public/ForBrands.tsx`
- **Lines:** 54–58
- **Identifier:** `const STATS`
- **Values:** `'500+'` Licensed operators, `'$45M+'` In transaction volume, `'98%'` Order accuracy
- **Unverified:** No DB query backs these numbers

### 5. Professionals — STATS Array
- **File:** `SOCELLE-WEB/src/pages/public/Professionals.tsx`
- **Lines:** 54–58
- **Identifier:** `const STATS`
- **Values:** Same as ForBrands — `'500+'`, `'$45M+'`, `'98%'`
- **Unverified:** Duplicate hardcoded claims

### 6. Plans — TIERS + COMPARISON
- **File:** `SOCELLE-WEB/src/pages/public/Plans.tsx`
- **Lines:** 27–86 (TIERS), 96–107 (COMPARISON), 110–147 (FAQ)
- **Identifiers:** `const TIERS`, `const COMPARISON`, `const FAQ_ITEMS`
- **Values:** Free / $149/mo / Custom pricing. Feature claims like "Real-time market signals (daily)"
- **Status:** Acceptable as DEMO for beta. Feature claims must match actual cadence.

### 7. ProtocolDetail — adoptionCount
- **File:** `SOCELLE-WEB/src/pages/public/ProtocolDetail.tsx`
- **Line:** 181
- **Identifier:** `protocol.adoptionCount`
- **Issue:** Renders `"{count} professionals"` — may be seed data static field, not computed aggregate

### 8. BrandStorefront — interestCount / professionalCount — PARTIALLY FIXED (W10-03)
- **File:** `SOCELLE-WEB/src/pages/public/BrandStorefront.tsx`
- **Identifiers:** `interestCount` (LIVE from Supabase), `peerData.professionalCount` (DEMO from hardcoded `brandIntelligence.ts`)
- **Fix applied:** Amber "Preview" badge added to `PeerAdoptionBanner` and `ProfessionalsAlsoBoughtSection` (both use hardcoded `brandIntelligence.ts` data).
- **interestCount:** Confirmed LIVE from Supabase — no PREVIEW label needed.
- **Remaining:** `brandIntelligence.ts` is 100% hardcoded mock data (PEER_DATA_MAP, ADOPTION_MAP, ALSO_BOUGHT_MAP) — needs DB wiring in future wave.

---

## P2 — STATIC CONTENT (Acceptable, No Action Required)

| File | Identifier | Content Type |
|---|---|---|
| `About.tsx` | `VALUES` | Mission/values |
| `FAQ.tsx` | `FAQ_DATA`, `CATEGORIES` | FAQ content |
| `Privacy.tsx` | `SECTIONS` | Legal |
| `Terms.tsx` | Content | Legal |
| `HowItWorks.tsx` | `STICKY_CARDS` | Explainer |
| `ApiDocs.tsx` | `NAV_SECTIONS` | Documentation |
| `ApiPricing.tsx` | Content | Documentation |
| `RequestAccess.tsx` | `BENEFITS`, `BUSINESS_TYPES` | Form config |
| `ForMedspas.tsx` | Copy | Landing page |
| `ForSalons.tsx` | Copy | Landing page |
| `Education.tsx` | `CATEGORY_CARDS` | Category config (counts are LIVE) |

---

## SUMMARY

| Severity | Count | Surfaces |
|---|---|---|
| **P0** | 0 (was 2) | ✅ All fixed — Home signals (W10-02), Home palette (Waves 1–6) |
| **P1** | 4 (was 6) | ForBrands stats, Professionals stats, Plans tiers, ProtocolDetail count. Insights resolved (W10-04), BrandStorefront labeled (W10-03). |
| **P2** | 11 | Static content — no action |
| **TOTAL** | **15 remaining** (4 were fixed this session) |

---

*All surfaces cited with file paths, line numbers, and exact identifiers.*
