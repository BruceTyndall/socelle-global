> [!CAUTION]
> **DEPRECATED** — March 5, 2026. Patch items absorbed into `/docs/command/HARD_CODED_SURFACES.md`. Do not treat as authoritative. Filed for historical reference only.

# DRIFT PATCHLIST — SOCELLE GLOBAL (DEPRECATED)
**Generated:** March 5, 2026 — Phase 1 Inventory Output  
**Authority:** NONE — Superseded  
**Doc Gate Reference:** `docs/command/SOCELLE_RELEASE_GATES.md` §9 (FAIL 4)

---

## Overview

Every surface below uses DEMO numbers, mock arrays, or fake live claims. Each item specifies whether it should be **WIRED LIVE** (database-connected) or **LABELED DEMO** (acceptable with clear preview label), and the planned endpoint/table.

---

## PATCHLIST

### PATCH 1 — Home.tsx: Remove Fake Live Feed [P0]

| Item | Value |
|---|---|
| **File** | `SOCELLE-WEB/src/pages/public/Home.tsx` |
| **Lines** | 13–18 (data), 161–167 (badge) |
| **Current** | Hardcoded `INTELLIGENCE_SIGNALS` array + "Live Market Feed" pulsing badge |
| **Action** | **WIRE LIVE** |
| **Planned endpoint** | `supabase.from('market_signals').select('*').order('created_at', { ascending: false }).limit(4)` |
| **Fallback** | Replace "Live Market Feed" with "PREVIEW — Intelligence signals" if no data |
| **Notes** | Remove `animate-ping` green dot. Replace `"2m ago"` strings with `formatFreshness(signal.created_at)` |
| - [ ] | Completed |

---

### PATCH 2 — Home.tsx: Fix Design System Violations [P0]

| Item | Value |
|---|---|
| **File** | `SOCELLE-WEB/src/pages/public/Home.tsx` |
| **Lines** | Throughout (29, 43, 83, 111, etc.) |
| **Current** | Cocoa palette (`#29120f`, `#47201c`, `var(--color-primary-cocoa)`), `font-serif` on h1/h2 |
| **Action** | **FIX** — Replace with Pearl Mineral palette per Doctrine §3 |
| **Planned change** | Replace all `--color-primary-cocoa` → `--ink`, `#29120f` → `--panel-dark`, `#47201c` → `--ink`, `font-serif` → `font-sans` |
| - [ ] | Completed |

---

### PATCH 3 — Insights.tsx: Delete Orphaned Page [P1]

| Item | Value |
|---|---|
| **File** | `SOCELLE-WEB/src/pages/public/Insights.tsx` |
| **Lines** | Entire file (163 lines) |
| **Current** | Hardcoded `TREND_PLACEHOLDERS`, route redirected to `/intelligence` in App.tsx |
| **Action** | **DELETE** — Page is orphaned (route already redirects) |
| **Notes** | Remove import from `App.tsx` line 37. Remove redirect route at line 175 if desired. |
| - [ ] | Completed |

---

### PATCH 4 — ForBrands.tsx + Professionals.tsx: Label STATS as DEMO [P1]

| Item | Value |
|---|---|
| **Files** | `SOCELLE-WEB/src/pages/public/ForBrands.tsx` (L54–58), `Professionals.tsx` (L54–58) |
| **Current** | `{ value: '500+', label: 'Licensed operators' }` — hardcoded, unverified |
| **Action** | **WIRE LIVE** (preferred) or **LABEL DEMO** |
| **Planned endpoint** | `supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'business_user')` |
| **Fallback** | If wiring is deferred, add "Platform preview" caption below stats |
| - [ ] | Completed |

---

### PATCH 5 — Plans.tsx: Connect to Subscription Plans Table [P1]

| Item | Value |
|---|---|
| **File** | `SOCELLE-WEB/src/pages/public/Plans.tsx` |
| **Lines** | 27–86 (TIERS), 96–107 (COMPARISON) |
| **Current** | Hardcoded pricing (Free / $149/mo / Custom) |
| **Action** | **LABEL DEMO** (acceptable) → later **WIRE LIVE** |
| **Planned endpoint** | `supabase.from('subscription_plans').select('*').order('sort_order')` |
| **Notes** | Pricing is a business decision, hardcoded is acceptable during beta. But "Real-time market signals (daily)" claim in feature list must match actual cadence. Add table migration when ready: `CREATE TABLE subscription_plans (id, name, price_monthly, price_annual, features jsonb, sort_order int)` |
| - [ ] | Completed |

---

### PATCH 6 — ProtocolDetail.tsx: Verify adoptionCount Source [P2]

| Item | Value |
|---|---|
| **File** | `SOCELLE-WEB/src/pages/public/ProtocolDetail.tsx` |
| **Line** | 181 |
| **Current** | `{protocol.adoptionCount.toLocaleString()} professionals` |
| **Action** | **VERIFY** → if `adoptionCount` is a seed data static field, wire to `COUNT(*)` from `protocol_adoptions` or label as "estimated" |
| **Planned endpoint** | `supabase.from('protocol_adoptions').select('id', { count: 'exact', head: true }).eq('protocol_id', protocol.id)` |
| - [ ] | Completed |

---

### PATCH 7 — BrandStorefront.tsx: Handle Zero-State [P2]

| Item | Value |
|---|---|
| **File** | `SOCELLE-WEB/src/pages/public/BrandStorefront.tsx` |
| **Lines** | 592, 715 |
| **Current** | `{interestCount} professionals` and `{peerData.professionalCount}` — fetched from Supabase but may show 0 |
| **Action** | **FIX EMPTY STATE** — If count is 0, don't render the social proof line. Show "Be the first to express interest" instead. |
| - [ ] | Completed |

---

### PATCH 8 — Video Coverage Gap [P1]

| Item | Value |
|---|---|
| **Pages affected** | Intelligence, Jobs, Brands, Events, Education, ForBrands, ForMedspas, ForSalons, Professionals, Plans, HowItWorks, About, RequestAccess |
| **Current** | Hero sections have no video — only solid color backgrounds |
| **Action** | **ADD VIDEOS** per ASSET_MANIFEST.md recommendations |
| **Notes** | Per Doctrine §7: "Every viewport-height section that could have a video, has one." Use existing repo videos. Mobile (< 768px) shows poster frame only. |
| - [ ] | Completed |

---

## PRIORITY SUMMARY

| Priority | Patches | Action |
|---|---|---|
| **P0** | PATCH 1, PATCH 2 | Fix before any feature work. Fake live + wrong design system = Doc Gate FAIL. |
| **P1** | PATCH 3, PATCH 4, PATCH 5, PATCH 8 | Fix within first sprint. Demo labeling + orphan cleanup + video coverage. |
| **P2** | PATCH 6, PATCH 7 | Fix within 2 sprints. Verify computed vs static counts + empty states. |

---

*Per `docs/command/SOCELLE_RELEASE_GATES.md` §9: All patches reference exact file paths. Each surface marked DEMO vs LIVE. Planned endpoints provided for WIRE LIVE targets.*
