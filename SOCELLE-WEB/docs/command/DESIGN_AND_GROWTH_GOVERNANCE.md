# DESIGN & GROWTH GOVERNANCE — PEARL MINERAL V2

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Anchor commit:** d1442d3  
**Authority:** `/.claude/CLAUDE.md` §2, §4, §16; `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` (banned terms, IA, commerce boundaries); `docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md`; `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §4–§7; `docs/command/MODULE_BOUNDARIES.md` §192–§247; `docs/command/SOCELLE_MONOREPO_MAP.md` §1–§3.

---

## 1. Locked vs. tunable

### 1.1 Locked (must not drift)

- **Design tokens and visual system**
  - Pearl Mineral V2 token set (graphite, mn‑bg, accent, signal‑up/down/warn, etc.) as defined in:
    - `SOCELLE-WEB/tailwind.config.js` (after P1‑3 cleanup).  
    - `SOCELLE_FIGMA_DESIGN_BRIEF.md` and `SOCELLE_CANONICAL_DOCTRINE.md`.
  - **Locked:**  
    - Core color palette and semantic mapping (intelligence signals, warnings, success).  
    - Typography stack (no `font-serif` on public surfaces).  
    - Border radius, shadow, and spacing scale.
  - **Enforced by:** `design-lock-enforcer`, `token-drift-scanner`, `design-audit-suite`.

- **Banned patterns and vocabulary**
  - Banned SaaS phrases, medical adjacency, “AI‑powered” framing, and “Shop Now”/hard‑commerce CTAs per `SOCELLE_CANONICAL_DOCTRINE.md`.  
  - **Locked:** No re‑introduction of banned terms on any user‑facing surface.  
  - **Enforced by:** `banned-term-scanner`, `tone-voice-auditor`, `voice-enforcer`.

- **Entitlement and commerce boundaries**
  - Role + tier mapping, hub unlocks, and free preview rules in `SOCELLE_ENTITLEMENTS_PACKAGING.md` §2–§4.  
  - **Locked:**  
    - Intelligence first, commerce second.  
    - No bypass around entitlement hooks (`useEntitlement`, RLS, credit system).

### 1.2 Tunable (where UX evolution is expected)

- **Information architecture (IA)**
  - Navigation groupings, landing pages per persona, route naming, and surface groupings.  
  - **Tunable within:**  
    - `GLOBAL_SITE_MAP.md` and `SOCELLE_MONOREPO_MAP.md` boundaries.  
    - Anti‑shell rule (each hub must have full create/list/detail/edit/metrics/export/states).

- **Onboarding and paywall flows**
  - Exact sequence and copy of the onboarding funnel, upgrade prompts, and paywall steps (while respecting entitlement rules).  
  - **Tunable:** layout, copy, entry points, but not:
    - Underlying entitlement logic.  
    - Banned patterns (high‑pressure, bait‑and‑switch).

- **Intelligence feed UX**
  - Filter layouts, sentiment banners, action arcs, snapshots vs deep views — as long as:
    - Data provenance and LIVE/DEMO labeling remain correct.  
    - No fake‑live surfaces are introduced.

- **Conversion and retention loops**
  - Which events and journeys are elevated (e.g. Education loops, CRM Intelligence, Signal→Deal/Sales, Signal→Campaign), and how they are surfaced in the UI.

---

## 2. UX upgrades must include instrumentation

Any strategic UX change (especially those meant to drive growth) **must** include instrumentation and measurement. For each such WO:

- **Event taxonomy**
  - Define events and properties in a shared spec (e.g. `docs/command/EVENT_TAXONOMY.md` if/when introduced), including:
    - `event_name`, `context` (route/hub), `properties` (e.g. `vertical`, `tier`, `signal_id`, `campaign_id`).  
  - Hook them via a single analytics layer (e.g. `src/lib/analyticsService.ts`).

- **Journey funnels**
  - For each upgraded journey, define:
    - **Entry events** (page views, CTA clicks).  
    - **Core actions** (e.g. “Viewed full brief”, “Created campaign from signal”, “Saved protocol”).  
    - **Conversion events** (e.g. “Completed CE course”, “Closed signal‑influenced deal”).  
  - Represent at least one funnel per core hub in a spec (or dashboard).

- **Engagement metrics**
  - Minimum metrics per strategic UX change:
    - Activation: % of users who complete the intended path at least once.  
    - Engagement: median frequency (e.g. weekly signal brief views, campaign runs).  
    - Retention: whether users who touch the feature come back within N days.

Instrumentation work should be baked into existing or new WOs (e.g. INTEL‑WO extensions, MKT‑WO updates, CRM‑WO improvements), not tracked separately as “nice‑to‑have”.

---

## 3. Design and growth guardrails for split work

When executing SPLIT‑* WOs (INTEL/CRM/EDU/COMMERCE/ADMIN/SALES/MKT), hub packaging **must not**:

1. **Reduce product power**
   - No removal of advanced Intelligence, CRM, Sales, or Marketing features purely for “easier split”.  
   - If a feature is temporarily disabled, it must be tracked as a WO with explicit rationale and timeline for restoration.

2. **Break UX coherence**
   - Persona‑ and hub‑level journeys (per `JOURNEY_STANDARDS.md`) must still feel like part of one product, not seven unrelated apps.  
   - Shared components and layouts (BusinessLayout, BrandLayout, AdminLayout, Studio surfaces) remain the primary structure.

3. **Violate design locks**
   - All split work goes through `design-lock-enforcer` and `token-drift-scanner`.  
   - No per‑hub visual forks that drift from Pearl Mineral V2 without an explicit design WO and Figma alignment.

4. **Bypass entitlements and metrics**
   - All new or moved surfaces must:
     - Use existing entitlement hooks.  
     - Emit analytics events into the shared event taxonomy.  
     - Preserve LIVE/DEMO and provenance rules.

---

## 4. “Now is the time…” — explicit statement

Per this governance doc and `/.claude/CLAUDE.md` §16:

> **Now is the time for strategic design changes to drive growth — within governance.**

Concretely:

- **Allowed / encouraged now:**
  - Upgrading Intelligence feed UX (Today View, sentiment banners, in‑card actions, vertical KPIs).  
  - Tightening and clarifying journeys for Education, CRM, Sales, and Marketing where they increase engagement and conversion.  
  - Rebalancing navigation, CTAs, and surface prominence to highlight high‑value loops (e.g. Signal→Deal, Signal→Campaign, CE credits).

- **Not allowed:**
  - Rewriting Pearl Mineral V2 tokens or typography from scratch.  
  - Introducing new commerce‑first or hype‑driven UX that conflicts with `SOCELLE_CANONICAL_DOCTRINE.md`.  
  - Splitting hubs into separate apps in a way that reduces shared intelligence, shared entitlements, or shared analytics.

All design and growth‑oriented WOs should reference this document and the relevant skills:

- `design-lock-enforcer`, `token-drift-scanner`, `design-audit-suite`.  
- `seo-audit`, `performance-profiler`, `retention-mechanic-tester`.  
- `marketing-alignment-checker`, `tone-voice-auditor`, `voice-enforcer`.

