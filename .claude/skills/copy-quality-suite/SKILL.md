---
name: copy-quality-suite
description: Full copy compliance suite — runs banned-term-scanner, language-linter, voice-enforcer, tone-voice-auditor, and copy-system-enforcer in sequence. Single sweep for all text quality rules with consolidated output.
---

# copy-quality-suite

Coordinated execution of 5 copy compliance skills in dependency order. Produces a single unified report covering all SOCELLE voice, tone, and copy rules.

## Member Skills (Execution Order)

1. `banned-term-scanner` — 67 banned terms from SOCELLE_CANONICAL_DOCTRINE.md
2. `language-linter` — Weak language, hyperbole, vague qualifiers
3. `voice-enforcer` — Brand voice rules (authoritative, not salesy)
4. `tone-voice-auditor` — Deep audit B2B empowerment voice
5. `copy-system-enforcer` — Heading hierarchy, CTA copy, error messages, empty states

## Inputs

| Input | Source | Required |
|---|---|---|
| SOCELLE-WEB/src/ | Codebase | Yes |
| docs/command/SOCELLE_CANONICAL_DOCTRINE.md | Command doc | Yes |
| Banned terms list (67 terms) | Doctrine §banned-language | Yes |

## Procedure

### Step 1 — Run banned-term-scanner

```bash
grep -rn 'revolutionary\|game-changing\|best-in-class\|cutting-edge\|world-class\|synergy\|disrupt' SOCELLE-WEB/src/ | wc -l
```

Scan all user-facing text files for exact and partial matches of all 67 banned terms. Any hit = FAIL for that surface.

### Step 2 — Run language-linter

```bash
grep -rn 'ensure\|robust\|seamless\|leverage\|utilize\|optimize\|streamline' SOCELLE-WEB/src/components/ SOCELLE-WEB/src/pages/ | wc -l
```

Flag weak language patterns:
- Vague qualifiers ("ensure", "robust", "seamless")
- Corporate buzzwords ("leverage", "utilize", "synergize")
- Hyperbolic claims without data backing
- Passive voice in CTAs

### Step 3 — Run voice-enforcer

```bash
grep -rn 'Buy now\|Limited time\|Act fast\|Don.t miss' SOCELLE-WEB/src/ | wc -l
```

Verify brand voice compliance:
- Authoritative, not salesy
- Intelligence-first framing (data leads, not promotion)
- No urgency pressure tactics
- No discount-led messaging

### Step 4 — Run tone-voice-auditor

Deep audit of B2B empowerment voice patterns across all customer-facing surfaces. Check:
- Consistent tone across portal pages, public pages, emails
- Professional beauty industry terminology used correctly
- Intelligence positioning maintained (not marketplace language)
- No patronizing or oversimplified language

### Step 5 — Run copy-system-enforcer

```bash
grep -rn 'HeadingLevel\|<h1\|<h2\|<h3' SOCELLE-WEB/src/pages/ | head -20
```

Verify copy system rules:
- Heading hierarchy (H1 > H2 > H3, no skips)
- CTA copy follows approved patterns
- Error messages are user-friendly and actionable
- Empty states provide guidance, not dead ends
- Loading states have meaningful text

### Step 6 — Consolidate Results

```json
{
  "suite": "copy-quality-suite",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "members_run": ["banned-term-scanner", "language-linter", "voice-enforcer", "tone-voice-auditor", "copy-system-enforcer"],
  "banned_hits": 0,
  "weak_language_hits": 0,
  "voice_violations": 0,
  "tone_score": "PASS",
  "copy_system_score": "PASS",
  "overall": "PASS",
  "findings": []
}
```

Save to: `docs/qa/copy-quality-suite-YYYY-MM-DD.json`

## Outputs

| Output | Format | Location |
|---|---|---|
| Consolidated copy audit report | JSON | `docs/qa/copy-quality-suite-YYYY-MM-DD.json` |
| Per-member findings | Array in consolidated JSON | Same file |
| Banned term hit list (if any) | Array with file:line references | Same file |

## Verification

**Command:**
```bash
grep -rn 'revolutionary\|game-changing\|best-in-class' SOCELLE-WEB/src/ | wc -l
```
**Pass criteria:** Count = 0 AND `docs/qa/copy-quality-suite-*.json` exists with `"overall": "PASS"`.

## Stop Conditions

- STOP if `SOCELLE_CANONICAL_DOCTRINE.md` is not found — cannot validate without banned terms list.
- STOP if banned-term-scanner finds > 50 hits — triage required before full audit.
- STOP if no user-facing text files found in scan scope.

## Failure Modes

| Mode | Symptom | Resolution |
|---|---|---|
| Missing doctrine doc | Banned terms list unavailable | Restore from `/docs/command/` |
| New marketing copy merged | Fresh violations from unreviewed content | Run suite in CI pre-merge |
| Third-party component text | Violations in imported packages | Exclude node_modules, flag for manual review |

## Fade Protocol

**Quarterly re-certification required.** Brand voice evolves. Re-run after any doctrine update, brand refresh, or major content addition. If banned terms list is updated, re-certify immediately.
