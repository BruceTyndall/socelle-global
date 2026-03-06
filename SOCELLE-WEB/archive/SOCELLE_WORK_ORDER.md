# SOCELLE PLATFORM MODEL UPDATE — MULTI-AGENT WORK ORDER

> **Document type:** Executable work order for Claude Code / Cowork / multi-agent sessions  
> **Source of truth:** `socelle_platform_model_update.docx` (Surgical Platform Model Update, March 2026)  
> **Status:** Ready for execution  
> **Estimated total effort:** 40–60 hours across all agents (original); 75–110 hours with Addendum II  
> **Parallelizable:** Yes — Agents 1–6 and 9–13, 15–20 can run concurrently after reading the source doc  

---

## HOW TO USE THIS WORK ORDER

Each agent section below is a **self-contained session prompt**. Copy the entire agent block into a new Claude Code, Cowork, or Claude chat session. Each agent:

1. Has a defined scope (what it owns)
2. Has explicit inputs (what it reads)
3. Has explicit outputs (what it produces)
4. Has acceptance criteria (how you know it's done)
5. Has boundary rules (what it must NOT touch)

**Execution order:**
- **Wave 1 (parallel):** Agents 1, 2, 3, 4, 5, 6 — these can all run simultaneously
- **Wave 2 (sequential):** Agent 7 — runs after Agents 1–6 complete, integrates all outputs
- **Wave 3 (final):** Agent 8 — QA pass after Agent 7 completes

Addendum II adds Agents 9–21 (Missing Layers + Pre-Launch Capture Gate); Agents 9–13 and 15–20 run in parallel in Wave 1; Agent 14 after Wave 1; Agent 21 after addendum outputs.

---

## SHARED CONTEXT (PASTE INTO EVERY AGENT SESSION)

```
SHARED CONTEXT — READ BEFORE STARTING

You are executing one agent within the SOCELLE Surgical Platform Model Update.
This is NOT a new strategy. This is a targeted correction pass on existing docs.

THE PLATFORM MODEL (memorize this):
SOCELLE is a living beauty intelligence portal that:
- Attracts spa directors, medspa owners, service providers, and brands
  through education, news, data, public brand intelligence, events, and live signals
- Retains them through freshness, personalization, and recurring value
- Monetizes through 6 revenue streams:
  0. Premium affiliate commerce (day 1)
  1. Embedded poll sponsorship ($1K–$5K)
  2. Brand intelligence reports ($500–$5K)
  3. Sponsored quizzes/studies ($5K–$25K)
  4. Brand claim subscriptions ($199–$999/mo SaaS MRR)
  5. Premium operator subscriptions ($49–$149/mo SaaS MRR)
- Is 90% automated via lawful public data scraping, news ingestion,
  event extraction, image ingestion where permitted, and profile enrichment
- Shares the Beauty Intelligence Data Architecture pipeline with Viaive

RULES FOR ALL AGENTS:
- Do NOT create a new master strategy document
- Do NOT duplicate content that already exists unless replacing a specific section
- Do NOT reduce SOCELLE to a marketplace
- Do NOT lose the intelligence-first thesis
- PRESERVE existing content that is marked "Keep as-is"
- Be specific enough that outputs can be applied directly to the doc stack
- Reference the source document section codes (A through K) when citing decisions
```

---

**Full agent specs (Agents 1–21):** The complete work order with every agent’s Mission, Inputs, Scope, Outputs, Acceptance Criteria, Boundary Rules, SQL, tables, and Addendum II (Agents 9–21) was pasted in the chat that created this file. For a single-file source of truth, paste that full content below this line (replacing the placeholders). Until then, run each agent from the original document or from `socelle_platform_model_update.docx` Section J + Addendum II. Execution order and file manifest: see sections below.

---

## 2. AGENT 1 — Platform Model Update

*[Paste full content for AGENT 1.]*

---

## 3. AGENT 2 — Public Brand Profile

*[Paste full content for AGENT 2.]*

---

## 4. AGENT 3 — Brand Claim Monetization

*[Paste full content for AGENT 3.]*

---

## 5. AGENT 4 — Industry Events

*[Paste full content for AGENT 4.]*

---

## 6. AGENT 5 — Premium Affiliate

*[Paste full content for AGENT 5.]*

---

## 7. AGENT 6 — Automation Architecture

*[Paste full content for AGENT 6.]*

---

## 8. AGENT 7 — Coordination Doc Update

*[Paste full content for AGENT 7.]*

---

## 9. AGENT 8 — QA

*[Paste full content for AGENT 8.]*

---

## Addendum II: AGENT 9 through AGENT 21

### AGENT 9 — Content Rights

*[Paste full content for AGENT 9.]*

### AGENT 10 — Brand Governance

*[Paste full content for AGENT 10.]*

### AGENT 11 — Segmentation

*[Paste full content for AGENT 11.]*

### AGENT 12 — News Governance

*[Paste full content for AGENT 12.]*

### AGENT 13 — Automation Ops

*[Paste full content for AGENT 13.]*

### AGENT 14 — Portal Experience

*[Paste full content for AGENT 14.]*

### AGENT 15 — Pre-Launch Strategy

*[Paste full content for AGENT 15.]*

### AGENT 16 — Gate UX

*[Paste full content for AGENT 16.]*

### AGENT 17 — Gate Schema

*[Paste full content for AGENT 17.]*

### AGENT 18 — Nurture

*[Paste full content for AGENT 18.]*

### AGENT 19 — Gate Copy

*[Paste full content for AGENT 19.]*

### AGENT 20 — Analytics

*[Paste full content for AGENT 20.]*

### AGENT 21 — QA/Compliance

*[Paste full content for AGENT 21.]*

---

## Execution trackers

*[Paste full content for execution trackers.]*

---

## File manifest

*[Paste full content for file manifest.]*

---

## Unified execution summary

*[Paste full content for unified execution summary.]*

---

## Complete agent registry

*[Paste full content for complete agent registry.]*

---

## Database table manifest

*[Paste full content for database table manifest.]*

---

## HOW TO USE THIS FILE

*[Paste full content for HOW TO USE THIS FILE.]*
