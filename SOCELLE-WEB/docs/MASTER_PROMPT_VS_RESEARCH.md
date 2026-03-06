# Master Prompt (Framework) vs 2026 Beauty/SaaS Research — Comparison

This doc compares **docs/SOCELLE_MASTER_PROMPT_FINAL.md** (the framework of what we still need to do) to **Beauty_SaaS_Market_Research___Strategy.md** (market opportunity and differentiators). It shows where the framework is aligned, missing, or under-prioritizing research-backed items.

---

## 1. Framework structure (Master Prompt)

The Master Prompt defines:

- **Section 1:** Wedge (wholesale + education + marketing), competitors, “every feature must strengthen brand–reseller relationship.”
- **Section 2 / 2B:** Cold start = seed both sides; **data sources** = Shopify `/products.json`, brand `/about` and `/press`, Google News RSS, Cosmoprof/IECSC PDFs (trade show badges), Firecrawl (Phase 2), manual FDA/Instagram.
- **Section 7:** Revenue = commission (15%/10%), brand subscriptions (Starter/Growth/Enterprise), Premier; resellers free. Tiered wholesale (active/elite/master).
- **Section 10 (Modules):** 1 Marketplace & Commerce, 2 Education Hub, 3 Marketing Studio (incl. “loyalty program builder”), 4 Business Tools (menus, protocols, inventory, reorder alerts), 5 Brand CRM, 6 Consumer Tools (profiles, booking, retail portal).
- **Section 22 (Phases):** Phase 1 (commerce, seeding, messaging) → Phase 2 (Education, Shopify, seeding, broadcasts) → Phase 3 (Marketing, loyalty, net-30) → Phase 4 (Business Tools) → Phase 5 (Brand CRM + Premier) → Phase 6 (Consumer) → Phase 7 (Scale).

The framework has **no dedicated section** on: AI product behavior, Edge/latency, usage-based monetization, or “agentic” capabilities. Plan Wizard / AI Concierge are not specified in the Master Prompt; they live in the codebase and build_tracker as heritage.

---

## 2. Research pillars vs framework

| Research pillar | What research says | Where it appears in Master Prompt | Gap? |
|-----------------|--------------------|-----------------------------------|------|
| **Procurement / “Frankenstein stack”** | B2B wholesale is fragmented; POS blind to supplier catalogs; manual reconciliation; **custom PDF ingestion** (distributor line sheets → OCR + LLM → shoppable catalog) is a “profound and highly lucrative” differentiator. | Section 2B: brand website, Shopify, press, trade show PDFs. **No** “distributor or wholesale partner PDF catalog” as a data source. No “line sheet → shoppable procurement hub.” | **Yes** — Distributor PDF ingestion is not in the framework. |
| **AI: Agentic, not chat** | AI must be an “Agentic Optimizer”: e.g. **drafting bulk wholesale POs from predictive consumption**, calendar gap minimization, targeted SMS to fill slots; “invisible general manager” not “digital receptionist.” | No section on AI. Modules and phases don’t mention “agentic” actions, PO drafting, or consumption-based automation. | **Yes** — Agentic AI (PO drafting, optional schedule/SMS) is not in the framework. |
| **Schedule optimization** | Critical salon pain: “optimize schedule” / “minimize gaps” logic; algorithmic temporal clustering; tools that don’t do this “cost solo practitioners hundreds of dollars weekly.” | Phase 6: “booking integrations (Boulevard, Vagaro)”; no “schedule optimization” or “gap minimization.” Module 4: “Service menu builder,” “inventory… reorder alerts” — no calendar/schedule. | **Yes** — Schedule optimization is not in the framework (could sit in Phase 4 Business Tools or Phase 6 / mobile). |
| **Gamification / second-visit retention** | Streaks, spin-to-win at checkout, tier-based VIP; “second appointment as loyalty tipping point”; first-time retention ~45%, second→third 70–81%. | Module 3: “loyalty program builder” only. No “gamification,” “streaks,” “second-visit” or “spin-to-win.” | **Partial** — Loyalty is there; explicit gamification and second-visit mechanics are not. |
| **Multi-platform / performance** | Web = command center; mobile = “action layer”; “sub-second response times” for checkout; Zenoti criticized for slow mobile; Edge Functions “execute in milliseconds.” | No latency or performance SLO. No “sub-200ms” or “Edge-first” for critical paths. | **Yes** — Performance/latency target is not in the framework. |
| **Monetization (usage / hybrid)** | Payment processing and subscription tiers; SMS/communication upcharges; platforms monetize usage. | Section 7: commission, brand subs, Premier. No “usage ledger,” “AI credits,” or “hybrid pricing” (base + usage-based add-ons). | **Yes** — Usage ledger and hybrid pricing are not documented in the framework (even if built). |
| **Inventory / wholesale bridge** | Incumbents don’t connect salon POS to B2B supplier catalogs; “no incumbent offers a unified bridge.” | We’re B2B marketplace (brand–reseller), not salon POS. Framework has “inventory tracking, reorder alerts” (Module 4). Aligned if we position “reseller procurement hub” (including distributor PDF) as that bridge. | **Align by adding** distributor PDF + procurement hub to the framework. |

---

## 3. Section-by-section: what to add or change

### Section 1 — Who we are & what we’re building

- **Add (after competitor table):** Short “Alignment with 2026 Beauty/SaaS research”:
  - **Procurement:** Differentiate via a **unified procurement bridge**: e.g. distributor PDF catalog ingestion (line sheets → shoppable hub) so resellers aren’t stuck in a “Frankenstein stack.”
  - **AI:** Where we use AI, aim for **agentic** actions (e.g. draft wholesale POs from consumption, optional calendar/schedule optimization) not just reactive chat.
  - **Performance:** Critical paths (e.g. AI Concierge, checkout) target **sub-200ms** where feasible; Edge-first.
  - **Monetization:** Support **usage-based** where offered (e.g. AI usage ledger, hybrid base + add-ons).

### Section 2B — Public data sources & import technology

- **Add a distinct data source:** **Distributor / wholesale catalog PDFs (line sheets, emailed order forms).**
  - **Data:** SKUs, tiered pricing, volume discounts, chemical/variant info.
  - **Method:** OCR + LLM extraction (extend existing PDF pipeline); store in structured catalog; optional pgvector for similarity search.
  - **Goal:** Shoppable procurement hub from analog supplier data; fix “Frankenstein stack” for resellers who buy from multiple distributors.
  - **Phase:** Phase 1 (MVP) or Phase 2 (automation). Place in SUPPLY SIDE or new “B2B / Reseller procurement” subsection.

### Section 7 — Business model & marketplace rules

- **Add to Revenue Model:**
  - **Usage ledger:** AI usage metered per tenant (e.g. credits deducted before each AI call); enables usage-based add-ons and clear attribution.
  - **Hybrid pricing (where offered):** Base subscription plus usage-based add-ons (e.g. AI credit packs, SMS bundles) in line with 2026 Beauty/SaaS monetization.

### Section 10 — Platform modules

- **Module 1 (Commerce) or new capability:** Call out **Procurement hub** — reseller-facing unified catalog that can be fed by brand products **and** (where applicable) by **distributor PDF ingestion** (line sheets → shoppable products).
- **Module 3 (Marketing Studio):** Add **Gamification & second-visit retention** — streaks, spin-to-win at checkout for retail add-ons, tier-based VIP; research: “second appointment as loyalty tipping point.”
- **Module 4 (Business Tools):** Add **Schedule optimization (salon/mobile wedge)** — gap-minimization logic, temporal clustering, targeted fill campaigns; optional where we serve solo/mid-market practitioners.
- **AI / Agentic:** Add a bullet (in Module 4 or a new “AI & automation” bullet list) for **Agentic AI** — e.g. draft wholesale POs from consumption data; optional calendar/schedule optimization and SMS fill campaigns.

### Section 12 or new “Infrastructure & performance”

- **Add:** **Performance:** Critical paths (e.g. AI Concierge Tier 4, checkout) target **p95 &lt; 200ms** where feasible. **Edge Functions** are the default for these paths.

### Section 22 — Build phases

- **Phase 1 or 2:** Add **Distributor PDF catalog ingestion (OCR+LLM → shoppable catalog)** — at least as a stated goal so the framework reflects the research differentiator.
- **Phase 2 or 4:** Add **Agentic AI actions** — e.g. draft wholesale POs from consumption; (optional) calendar gap minimization and fill campaigns.
- **Phase 3:** Add **Gamification & second-visit retention** (streaks, spin-to-win, VIP tiers) alongside loyalty program builder.
- **Phase 4 or 6:** Add **Schedule optimization** — gap-minimization, temporal clustering, targeted SMS (for salon/mobile wedge).

---

## 4. Summary: framework changes

| # | Location in Master Prompt | Change |
|---|----------------------------|--------|
| 1 | Section 1 (after competitor table) | Add “Alignment with 2026 research”: procurement bridge, agentic AI, sub-200ms, usage/hybrid. |
| 2 | Section 2B | Add “Distributor PDF catalog” as data source → shoppable procurement hub. |
| 3 | Section 7 | Add Usage ledger + Hybrid pricing to Revenue Model. |
| 4 | Section 10 | Add Procurement hub (incl. distributor PDF); Gamification & second-visit (Module 3); Schedule optimization (Module 4); Agentic AI. |
| 5 | Section 12 or new subsection | Add Performance: p95 &lt; 200ms, Edge-first for critical paths. |
| 6 | Section 22 | Add to phases: Distributor PDF ingestion; Agentic AI; Gamification; Schedule optimization. |

Once these are in the Master Prompt, the **framework** of “what we still need to do” will match the research. The build_tracker can then be updated to reflect the same items (features, milestones, decisions log) so implementation stays aligned with the spec.
