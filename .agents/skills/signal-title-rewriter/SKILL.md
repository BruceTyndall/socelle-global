# SKILL: signal-title-rewriter
**WO:** MERCH-SKILL-01
**Agent:** Intelligence Merchandiser (Agent #17)
**Suite:** data-integrity-suite (member #7)
**Authority:** `docs/command/AGENT_SCOPE_REGISTRY.md` §17, `/.Codex/AGENTS.md`

---

## PURPOSE

Identifies signal titles that violate FEED-MERCH-08 (Title Compliance) and rewrites them to conform. Produces a structured list of before/after rewrites with SQL UPDATE statements ready for review and execution.

This is the **only skill in Agent #17's toolkit that produces write-ready SQL**. All output must be reviewed by the owner before execution. The skill itself only proposes rewrites — it never executes them autonomously.

---

## TRIGGER

Run this skill when:
- `intelligence-merchandiser` audit returns FEED-MERCH-08 violations
- New signals are ingested from a feed source known to produce clickbait or vague titles
- A spot check of recent signal titles reveals non-compliant patterns
- Pre-launch sweep of all signal titles is required

---

## THE RULE: FEED-MERCH-08

> **Signal titles must be declarative, specific, and ≤120 characters.**

**Banned patterns:**
| Pattern | Example (BAD) | Reason |
|---------|--------------|--------|
| Vague opener | "New Study Shows..." | No specificity — what study, what finding? |
| Expert attribution without claim | "Experts Say Beauty Is Changing" | Meaningless without the claim |
| Report-as-subject | "Report Finds Medspa Trends Rising" | Lead with the finding, not the source |
| Clickbait question | "Are Your Patients Getting the Best?" | Questions instead of declarations |
| Brand-as-sole-subject | "Allergan Announces" | What did they announce? |
| Title-cased non-specifics | "The Future of Aesthetics" | Too broad — no actionable intelligence |
| Length > 120 chars | Any title over 120 characters | Gets truncated in UI |
| All caps | "MEDSPA INDUSTRY BOOMING" | Aggressive — use sentence case |

**Compliant title structure:**
```
[Specific finding or change] — [Context / scope]
```

Examples:
- BAD: "New FDA Warning Could Affect Medspa Practices"
- GOOD: "FDA Issues Warning on Compounded Semaglutide — Affects Weight Loss Programs in Medspas"

- BAD: "Report Finds Botox Usage Up"
- GOOD: "Botulinum Toxin Demand Rose 18% in Q1 2026, Driven by Millennial Preventative Care"

---

## EXECUTION

### Step 1 — Pull Non-Compliant Titles

```sql
SELECT
  id,
  title,
  LENGTH(title) AS title_len,
  vertical,
  topic,
  impact_score,
  created_at,
  -- Flag reason
  CASE
    WHEN LENGTH(title) > 120 THEN 'TOO_LONG'
    WHEN title ILIKE 'new study%' THEN 'VAGUE_OPENER'
    WHEN title ILIKE 'report find%' THEN 'REPORT_AS_SUBJECT'
    WHEN title ILIKE 'experts say%' THEN 'EXPERT_ATTRIBUTION'
    WHEN title ILIKE 'study shows%' THEN 'VAGUE_OPENER'
    WHEN title ILIKE 'research shows%' THEN 'VAGUE_OPENER'
    WHEN title ILIKE 'researchers say%' THEN 'VAGUE_OPENER'
    WHEN title ILIKE '%announces%' AND LENGTH(title) < 50 THEN 'BRAND_AS_SUBJECT'
    WHEN title ~ '^[A-Z][A-Z ]{4,}' THEN 'ALL_CAPS'
    ELSE 'MANUAL_REVIEW'
  END AS flag_reason
FROM market_signals
WHERE status = 'active'
  AND (
    LENGTH(title) > 120
    OR title ILIKE 'new study%'
    OR title ILIKE 'report find%'
    OR title ILIKE 'experts say%'
    OR title ILIKE 'study shows%'
    OR title ILIKE 'research shows%'
    OR title ILIKE 'researchers say%'
    OR (title ILIKE '%announces%' AND LENGTH(title) < 50)
    OR title ~ '^[A-Z][A-Z ]{4,}'
  )
ORDER BY created_at DESC;
```

### Step 2 — Manual Title Review

For each flagged signal:
1. Read the original title
2. Read the `source_url` to understand the underlying article (if available)
3. Apply the rewrite rules below
4. Produce a proposed replacement title

### Step 3 — Generate UPDATE Statements

For each rewrite, output a SQL UPDATE ready for owner review:

```sql
-- Signal: <id> | Original: "<original title>"
-- Violation: <flag_reason>
-- Proposed: "<new title>"
UPDATE market_signals
SET title = '<new title>'
WHERE id = '<signal_id>';
```

**Do NOT execute these statements.** Present them in the output JSON for owner approval.

---

## REWRITE RULES

Apply in order. First matching rule wins.

### Rule R1: TOO_LONG
Trim to ≤120 chars while preserving the key finding. Cut trailing context first (location, publication name), then qualifying clauses. Never cut the finding itself.

### Rule R2: VAGUE_OPENER (New Study / Research Shows / Study Shows)
Replace with the specific finding. Remove the attribution frame — the source is in `source_name`.

Before: "New Study Shows Medspa Patients Prefer Combination Treatments"
After: "Medspa Patients Increasingly Choose Combination Treatment Protocols Over Single-Modality"

### Rule R3: REPORT_AS_SUBJECT (Report Finds / Survey Says)
Lead with the finding. Drop the report framing.

Before: "Report Finds Botox Usage Up Among Men in 2026"
After: "Male Botulinum Toxin Usage Increased 22% YoY — Driven by Preventative Care Demand"

### Rule R4: EXPERT_ATTRIBUTION (Experts Say)
Identify the specific claim and lead with it.

Before: "Experts Say Beauty Industry Is Shifting"
After: "Aesthetic Industry Revenue Mix Shifting Toward Non-Invasive Procedures, per Q1 Market Data"

### Rule R5: BRAND_AS_SUBJECT (Brand Announces)
Include what was announced.

Before: "Allergan Announces New Product"
After: "Allergan Launches Juvederm Volux XC for Jawline Definition — US Approval Granted"

### Rule R6: ALL_CAPS
Convert to sentence case. Capitalize only proper nouns and the first word.

### Rule R7: MANUAL_REVIEW
Flag for owner attention. Do not propose a rewrite without reading the source article.

---

## OUTPUT FORMAT

```json
{
  "skill": "signal-title-rewriter",
  "wo_id": "MERCH-SKILL-01",
  "timestamp": "<ISO-8601>",
  "total_signals_audited": 0,
  "violations_found": 0,
  "rewrites": [
    {
      "id": "<signal_id>",
      "original_title": "",
      "original_length": 0,
      "flag_reason": "VAGUE_OPENER|TOO_LONG|REPORT_AS_SUBJECT|EXPERT_ATTRIBUTION|BRAND_AS_SUBJECT|ALL_CAPS|MANUAL_REVIEW",
      "proposed_title": "",
      "proposed_length": 0,
      "rewrite_rule": "R1|R2|R3|R4|R5|R6|R7",
      "sql_update": "UPDATE market_signals SET title = '...' WHERE id = '...';"
    }
  ],
  "manual_review_required": [],
  "overall": "PASS|WARN|FAIL"
}
```

**Overall:**
- `PASS` = 0 violations found
- `WARN` = violations found, all have proposed rewrites (no MANUAL_REVIEW flags)
- `FAIL` = violations found with MANUAL_REVIEW flags that could not be auto-resolved

---

## GOVERNANCE

- **Propose-only.** This skill generates rewrite proposals and SQL UPDATE statements. It does NOT execute any SQL.
- **Owner approval required** before executing any UPDATE against `market_signals`.
- **Title changes are logged** — after owner-approved execution, run `intelligence-merchandiser` audit to confirm FEED-MERCH-08 now passes.
- **Part of:** `intelligence-merchandiser` full audit (Step 8 of 12).
- **Forbidden:** Rewriting titles to alter factual content. Rewrites must preserve the original finding — only improve framing and specificity.
