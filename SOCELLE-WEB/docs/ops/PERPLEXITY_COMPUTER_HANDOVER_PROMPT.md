# PERPLEXITY COMPUTER — HANDOVER PROMPT (COPY-PASTE THIS)

Use this prompt to hand off to Perplexity Computer. Paste it into Perplexity and attach or point to the repo/handover packet as needed.

---

## PROMPT START (copy below this line)

You are taking over **all planning and all code edits** for SOCELLE. Your first phase is to validate and challenge the product plan: read the handover packet, use external research where helpful, and answer the four required questions. After that, you own planning (WO sequencing, scope, plan updates) and all code edits (implementing WOs, updating build_tracker, creating verify_*.json, following CLAUDE.md and the authority chain). The human owner approves direction and gates; you execute.

**Context**

- SOCELLE is a B2B intelligence platform for professional beauty (medspa, salon, brand): live market signals, cross-hub actions (CRM, Sales, Marketing, Education, Commerce), Authoring Studio/CMS, PWA/Tauri/Flutter.
- Priority is **product power**: data + advanced features + modern UX. We are **not** taking the easiest split. Execution truth = `build_tracker.md` + `docs/qa/verify_*.json`; one WO per session unless owner approves parallelism.

**Your tasks**

1. **Read the handover packet**  
   Open and read: **SOCELLE-WEB/docs/ops/PERPLEXITY_HANDOVER_PACKET.md** (or the equivalent path in the repo you have). It contains:
   - Repo summary and what “done” means (proof: tsc, build, verify_*.json, validators)
   - App-by-app state: what’s good enough, not competitive yet, broken/partial/risky, and DEMO/shell on main path for all 10 platforms
   - App-by-app upgraded WO plan (external comparables, table stakes, moat, POWER WOs with scope, acceptance criteria, validators, proof pack)
   - Top 3 UX growth upgrades per platform (activation/retention)
   - Top 10 competitive risks if we ship without upgrades
   - Top 10 must-have advanced features for 2026 credibility
   - Links to Tier 0/1 and key audit docs

2. **Use external research where it helps**  
   For any platform or WO, you may search for comparables (e.g. Valona, 6sense, Zenoti, Gong, Contentful, HubSpot) to validate or challenge table stakes, moat, and UX patterns cited in the packet.

3. **Answer these four questions in writing** (required):

   - **Q1.** Are we choosing the best tech + feature set for a category-leading platform, or just a convenient implementation? (Evaluate POWER WOs vs “easiest split”; intelligence-first vs feature parity with legacy tools.)
   
   - **Q2.** What are the biggest missing moat features per platform? (For each: Intelligence, CRM, Sales, Marketing, Education, Commerce, Admin, Studio/CMS, Public Site, Mobile — what would make us defensible vs Valona, Zenoti, Gong, HubSpot, etc.?)
   
   - **Q3.** Which upgrades will produce the biggest lift in activation, retention, and paid conversion? (Rank or prioritize: INTEL-POWER-01..05, CRM-POWER-01/02, SALES-POWER-01, MKT-POWER-01, EDU-POWER-01, COMMERCE-POWER-01, ADMIN-POWER-01, CMS-POWER-01, SITE-POWER-01, MOBILE-POWER-01, plus the UX growth items in the packet.)
   
   - **Q4.** What should we change now before coding to avoid rework later? (Scope cuts, sequence changes, missing validators, or doc/contract changes.)

4. **Challenge assumptions**  
   If you think the plan is biased toward “easiest split,” is missing a critical moat feature, or has the wrong priority order, say so and suggest a change. Be specific (cite WO IDs and platforms).

**Deliverable (Phase 1 — validation)**

- A single response (or document) that: (a) confirms you read the handover packet, (b) answers Q1–Q4 clearly, and (c) lists any recommended changes to the plan (WOs to add/drop/reorder, validators to add, or docs to update).

**Phase 2 — you take over:** After delivering Phase 1, you will take over **all planning and all code edits**. You will: update plans and build_tracker as needed; implement WOs (one per session unless the owner approves parallelism); create docs/qa/verify_*.json for each WO; run required validators; and follow CLAUDE.md, CONSOLIDATED_BUILD_PLAN, and APP_BY_APP_IDEA_MINING_UPGRADES. Do not start coding until Phase 1 (validation + Q1–Q4) is complete and the owner has acknowledged. After that, you are the primary executor for planning and code.

---

## PROMPT END (copy above this line)

---

**After pasting:** If Perplexity has repo access, point it to the repo root and tell it the handover packet path is `SOCELLE-WEB/docs/ops/PERPLEXITY_HANDOVER_PACKET.md`. If you are pasting the packet contents into the chat, say “The handover packet contents are provided below (or in the attached file).”
