# DOC INVENTORY REPORT — SOCELLE MONOREPO

**Generated:** 2026-03-13 (AUDIT + IDEA MINING + AGENT UPSKILL — commit anchor d1442d3)  
**Scope:** Full monorepo documentation audit. Repo structure agent deliverable.  
**Authority:** `/.claude/CLAUDE.md` §0; `SOCELLE-WEB/docs/build_tracker.md`.  
**Rule:** Do not delete files. Demote with headers or move to archive only per recommendations.

---

## 1. PROVE CURRENT STATE — COMMAND OUTPUTS (PASTED VERBATIM)

### git status --porcelain=v1

```
 M .claude/CLAUDE.md
 M docs/command/SESSION_START.md
 M docs/command/SOURCE_OF_TRUTH_MAP.md
 M docs/ops/AUDIT_SPRINT_SUMMARY.md
 M docs/ops/EXECUTION_STATE_AUDIT.md
?? SOCELLE-WEB/docs/command/DESIGN_AND_GROWTH_GOVERNANCE.md
?? SOCELLE-WEB/docs/command/SPLIT_WO_CLUSTER.md
?? SOCELLE-WEB/docs/ops/DOC_CONFLICT_PATCH_PLAN.md
?? SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md
?? SOCELLE-WEB/docs/ops/SPLIT_AUDIT__LOST_WO_REPORT.md
?? SOCELLE-WEB/docs/ops/SPLIT_AUDIT__TRUTH_VALIDATION.md
?? SOCELLE-WEB/docs/ops/SPLIT_AUDIT__WO_COVERAGE_MATRIX.md
?? SOCELLE-WEB/docs/ops/SPLIT_EXECUTION_CONTRACT.md
?? SOCELLE-WEB/docs/ops/SPLIT_PLAN__PHASED_EXECUTION.md
?? docs/command/PROMPTING_AND_MULTI_AGENT_GUIDE.md
```

### git log -20 --oneline --decorate

```
19e9ec7 (HEAD -> main, origin/main, origin/HEAD) chore(audit): AUDIT-SPRINT-01 — source-of-truth map, doc inventory, execution state, product surface, session start entrypoint
d1442d3 docs(idea-mining): IDEA_MINING_IMPLEMENTATION_MAP.md + 8 screenshot proof pack
c152f52 docs(ops): RUN_LOG_2026-03-13 — dirty worktree triage log appended
e0a2c40 CMS-WO-07 prep: AdminStoryDrafts page + feeds-to-drafts fn + story_drafts migration + config.toml
7974e91 docs(audit): site-wide audit outputs — 9 markdown reports from parallel agent session
...
```

### ls -la (repo root)

```
total 904
drwxr-xr-x@  29 ...  .
drwxr-xr-x@  12 ...  ..
... (29 entries: .agents, .archive, .claude, .git, .github, .gitignore, .npmrc, COMMAND_CENTER, README.md, SOCELLE-MOBILE-main, SOCELLE-WEB, SOCELLE_AI_FOR_BRANDS.html, SOCELLE_AI_FOR_PROs.html, SOCELLE_MASTER_BUILD_WO.md, ULTRA_DRIVE_PROMPT.md, apps, docs, figma-make-source, node_modules, package-lock.json, package.json, packages, supabase, tools, turbo.json, wrangler.toml)
```

### find SOCELLE-WEB/docs -maxdepth 3 -type f | sort

(See run: 170+ files under SOCELLE-WEB/docs: audit/, command/, inventory/, operations/, ops/, qa/, research/; build_tracker.md; ASSET_MANIFEST.md.)

### find .claude -maxdepth 3 -type f | sort

(See run: CLAUDE.md, commands/*.md, launch.json, settings.local.json, 99× .claude/skills/<name>/SKILL.md, worktrees/ agent dirs.)

### GitHub sync proof

- **git remote -v:** origin https://github.com/BruceTyndall/socelle-global.git (fetch/push)
- **git branch --show-current:** main
- **git rev-parse HEAD:** 19e9ec786d7c66ba55d1da7777c8e216292eda5d
- **git fetch --prune:** Exit 0 (no error output)
- **git rev-parse origin/main:** 19e9ec786d7c66ba55d1da7777c8e216292eda5d
- **git diff --name-only origin/main...HEAD:** (empty — no commits ahead of origin/main)

**Conclusion:** Local HEAD equals origin/main. Uncommitted changes: 5 modified, 10 untracked (audit/split/progress docs). To make GitHub authoritative "most recent," commit and push the modified and new files.

---

## 2. DOC CLUSTERS SUMMARY

| Zone | Path | Role | Governance weight |
|------|------|------|-------------------|
| Root governance | `/` | CLAUDE, MASTER_BUILD_WO, ULTRA_DRIVE, README | HIGH |
| docs/command | `docs/command/` | Canonical doctrine, design, agents, SESSION_START, SOURCE_OF_TRUTH_MAP | HIGH |
| docs/ops | `docs/ops/` | Audit sprint summary, execution state, doc inventory (this file) | MED |
| SOCELLE-WEB/docs/build_tracker | `SOCELLE-WEB/docs/build_tracker.md` | Live WO execution log | HIGHEST (execution) |
| SOCELLE-WEB/docs/command | `SOCELLE-WEB/docs/command/` | V3 build plan, CMS, journey standards, SOURCE_OF_TRUTH_MAP (copy) | HIGH |
| SOCELLE-WEB/docs/ops | `SOCELLE-WEB/docs/ops/` | Split audits, execution contract, product power, IDEA_MINING map | MED |
| SOCELLE-WEB/docs/audit | `SOCELLE-WEB/docs/audit/` | Parallel audit outputs — snapshots, not execution authority | LOW |
| SOCELLE-WEB/docs/qa | `SOCELLE-WEB/docs/qa/` | verify_*.json proof artifacts | HIGH (evidence) |
| .claude | `.claude/` | CLAUDE.md, 99 skills, commands | HIGH |

---

## 3. DUPLICATES / OVERLAPS

| Copy A | Copy B / overlap | Recommendation |
|--------|-------------------|-----------------|
| build_tracker.md | MASTER_STATUS.md | build_tracker = execution ledger; MASTER_STATUS = status snapshot. Both Tier 1. Do not merge; patch MASTER_STATUS authority line (see DOC_CONFLICT_PATCH_PLAN). |
| docs/command/SOURCE_OF_TRUTH_MAP.md | SOCELLE-WEB/docs/command/SOURCE_OF_TRUTH_MAP.md | Single canonical: root docs/command. SOCELLE-WEB copy = audit deliverable; align content and demote one with "Canonical: docs/command/". |
| docs/operations/OPERATION_BREAKOUT.md | SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md | Prefer SOCELLE-WEB for web WOs. Add header to root copy: "Canonical for web: SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md". Do not delete. |
| docs/command/SITE_MAP.md | docs/command/GLOBAL_SITE_MAP.md | GLOBAL_SITE_MAP is canonical. Demote SITE_MAP with DEPRECATED header. Do not delete. |
| docs/command/V1* ONE_SOURCE_OF_TRUTH | SOCELLE-WEB/docs/command/V3* ONE_SOURCE_OF_TRUTH | V3 supersedes V1. Root CLAUDE wins over both. Add SUPERSEDED header to V1. Do not delete. |
| SOCELLE-WEB/docs/audit/SOCELLE_MASTER_ACTION_PLAN.md | build_tracker.md | Audit snapshot. Add banner: "Snapshot — items integrated into build_tracker.md." Do not delete. |
| SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md | build_tracker.md | Add banner: "Not execution authority. Use build_tracker.md." Do not delete. |
| docs/command/ASSET_MANIFEST.md | SOCELLE-WEB/docs/ASSET_MANIFEST.md | Canonical: docs/command/. Demote web copy with header. Do not delete. |

---

## 4. DEMOTION PLAN (DO NOT DELETE FILES)

- **V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md:** Add at top: "SUPERSEDED. Authority: /.claude/CLAUDE.md and SOURCE_OF_TRUTH_MAP."
- **SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md:** Add "SNAPSHOT — NOT LIVE. Authoritative: /.claude/CLAUDE.md." Optionally move to docs/archive/.
- **SITE_MAP.md:** Add "DEPRECATED. Use GLOBAL_SITE_MAP.md."
- **OPERATION_BREAKOUT.md (root):** Add "Canonical for web WOs: SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md."
- **API_LOGIC_MAP.md (root):** Add "API-WO-* IDs superseded by build_tracker WO IDs."
- **SOCELLE_WORK_ORDER_BACKLOG.md, SOCELLE_MASTER_ACTION_PLAN.md:** Add "Not execution authority. Use build_tracker.md."
- **SOCELLE-WEB/docs/ASSET_MANIFEST.md:** Add "Canonical: docs/command/ASSET_MANIFEST.md."

All demotions = header/banner only unless owner approves move to archive. No file deletion.

---

## 5. REDUCED DAILY READ SET (TIER 0 + SMALL TIER 1 ONLY)

**Tier 0 + Tier 1 = the only "read every session" set.** Everything else is Tier 2 (WO-scoped read).

1. **docs/command/SESSION_START.md** — canonical entrypoint (read order, standup, proof rules)
2. **/.claude/CLAUDE.md** — full
3. **SOCELLE-WEB/docs/build_tracker.md** — lines 1–50
4. **SOCELLE-WEB/MASTER_STATUS.md** — top section
5. **SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md** — phase order, WO registry, non-negotiables (single plan)
6. **SOCELLE_MASTER_BUILD_WO.md** — section for WO being executed (acceptance criteria detail)
7. **SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md** — CMS WO substeps only when doing CMS WOs
8. **ULTRA_DRIVE_PROMPT.md** — if present at repo root

Everything else is Tier 2: read only when the active WO touches that domain. Demotion plan: no deletes — headers/banners only (see §4).

---

## 6. WO-SCOPED READ RULES (TIER 2)

- **CMS WOs:** CMS_ARCHITECTURE.md, CMS_CONTENT_MODEL.md
- **Hub WOs (CRM, Sales, Edu, etc.):** JOURNEY_STANDARDS.md, AGENT_SCOPE_REGISTRY.md (allowed paths)
- **INTEL/FEED WOs:** INTEL-MERCH-01.md, OPERATION_BREAKOUT.md (SOCELLE-WEB), IDEA_MINING_IMPLEMENTATION_MAP.md
- **Pay/entitlement WOs:** SOCELLE_ENTITLEMENTS_PACKAGING.md
- **Design/copy WOs:** SOCELLE_CANONICAL_DOCTRINE.md, SOCELLE_FIGMA_TO_CODE_HANDOFF.md
- **Routing/SEO/shell:** GLOBAL_SITE_MAP.md
- **API/edge:** API_LOGIC_MAP.md (with superseded banner)

---

*End of DOC_INVENTORY_REPORT. Evidence: command outputs above; no files deleted.*
