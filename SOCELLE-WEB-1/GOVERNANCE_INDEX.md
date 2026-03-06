# SOCELLE Governance Framework — Master Index

**Created:** March 5, 2026  
**Authority:** Agent 9 — Regression & Governance Agent  
**Status:** Active (valid until April 5, 2026)

---

## Quick Navigation

### For New Agents Starting Work
1. Read: `.claude/CLAUDE.md` (operating context, critical issues)
2. Read: `GOVERNANCE.md` SECTION 1 (locked design system)
3. Checklist: `NO_REGRESSION_CHECKLIST.md` (15 items to verify before PR)

### For Managers/Leads
1. Read: `PLATFORM_STATUS.md` (current health, P0/P1/P2 issues)
2. Read: `GOVERNANCE.md` SECTION 2 (critical regressions)
3. Assign: `GOVERNANCE.md` SECTION 3 (no-regression enforcement)

### For Code Reviews
1. Use: `NO_REGRESSION_CHECKLIST.md` (15-item verification)
2. Reference: `GOVERNANCE.md` SECTION 4 (platform protection doctrine)
3. Verify: All 15 items checked before approving merge

### For Monthly Governance Review
1. Read: `GOVERNANCE.md` SECTION 6 (monthly review process)
2. Check: All PRs from prior month against checklist
3. Update: `GOVERNANCE.md` with new rules/clarifications

---

## Document Purpose & Scope

### GOVERNANCE.md (AUTHORITY DOCUMENT)
**Purpose:** Define locked design system, enforcement rules, and platform protection doctrine  
**Audience:** All agents, team leads, design authority  
**Key Sections:**
- SECTION 1: Locked design system (colors, typography, glass)
- SECTION 2: Critical regressions (P0/P1/P2 issues)
- SECTION 3: No-regression enforcement checklist
- SECTION 4: Platform protection doctrine
- SECTION 5: Multi-agent coordination rules
- SECTION 6: Intelligence-first thesis enforcement
- SECTION 7: Known issues reference

**Authority Level:** HIGHEST — This overrides all other documents  
**Update Frequency:** Monthly (first Wednesday)  
**When to Reference:** Before starting ANY work

---

### PLATFORM_STATUS.md (STATUS TRACKING)
**Purpose:** Track platform health, identify issues, define Wave 9 scope  
**Audience:** Project managers, development team, stakeholders  
**Key Sections:**
- Executive summary (3-4 sentences)
- P0 critical issues (6 blocking items)
- P1 high priority (6 items, 1 week timeline)
- P2 medium priority (4 items, 1 month timeline)
- Strengths to protect (13 systems)
- Wave 9 scope (6 approved work orders)
- Deployment readiness matrix
- Build verification commands

**Authority Level:** HIGH — Drives priorities and schedules  
**Update Frequency:** Weekly (or as issues are resolved)  
**When to Reference:** Prioritizing work, planning releases

---

### NO_REGRESSION_CHECKLIST.md (PRE-DEPLOYMENT)
**Purpose:** Enforce 15 required verification items before every PR merge  
**Audience:** All developers, code reviewers, QA agents  
**Key Sections:**
- 15 required pre-deployment items (with how-to commands)
- Advanced optional checks (accessibility, performance, security)
- Failure scenarios and remediation
- PR template for agents to copy
- Monthly review process

**Authority Level:** HIGH — Non-negotiable for all PRs  
**Update Frequency:** Monthly (with governance review)  
**When to Reference:** Before creating any PR, during code review

**The 15 Required Items:**
1. TypeScript build succeeds
2. Color tokens use mineral system
3. Primary text color locked
4. No SaaS clichés
5. Font classes correct
6. Glass system integrity
7. Live data disclaimer
8. No placeholder copy
9. Routes mapped
10. Navigation consistency
11. Migrations documented
12. Component scope clear
13. Meta tags present
14. Imports clean
15. Design system extended only

---

### CLAUDE.md (OPERATING CONTEXT)
**Purpose:** Provide updated operating context after audit  
**Audience:** All agents, integrated into Claude Code  
**Key Sections:**
- Critical issues summary (at top for visibility)
- Locked design system specifications
- Build verification rules
- Platform protection doctrine
- Wave status tracker with notes
- Wave 9 approved scope
- Pre-commit protocol

**Authority Level:** AUTHORITY — Integrated into agent instructions  
**Update Frequency:** Post-audit (March 5), then monthly with governance  
**When to Reference:** Every day as operating context

---

## Critical Issues Quick Reference

### P0 (BLOCKING) — Must fix before next deployment

| ID | Issue | Fix Time | Blocker |
|---|---|---|---|
| P0-01 | Primary text color #1E252B→#141418 | 1-2 hrs | Deploy |
| P0-02 | Background color #F6F4F1→#F6F3EF | 0.5 hrs | Deploy |
| P0-03 | Request Access form no submit | 2-3 hrs | Deploy |
| P0-04 | Live data tables missing | Wave 9 | No (Wave 9 scope) |
| P0-05 | No preview data disclaimer | 1 hr | Deploy |
| P0-06 | Benchmark Dashboard orphaned | 0.5 hrs | Deploy |

**Total deployment blocker time:** 6-8 hours (excluding P0-04)

### P1 (HIGH) — Fix within 1 week
6 issues including Jobs/Events platform gaps, font comments, documentation

### P2 (MEDIUM) — Fix within 1 month
4 items including legacy route documentation, admin copy cleanup

---

## Locked Design System At-A-Glance

### Colors (Mineral V2)
```
Primary Text:     #141418 (CRITICAL: currently #1E252B)
Background:       #F6F3EF
Card:             #FFFFFF
Panel Dark:       #1F2428
Footer:           #15191D
Accent:           #6E879B
Signal Up:        #5F8A72
Signal Warn:      #A97A4C
Signal Down:      #8E6464
```

### Typography
- Headings (h1/h2/h3): DM Serif Display
- Body: General Sans / Inter
- Data: JetBrains Mono

### Glass System
- Nav pill: 6px→14px blur, 55%→80% opacity on scroll
- Surfaces: 12px (light) / 14px (strong) blur
- Dark: #1F2428/60%, 12px blur

---

## Authority Chain (Decision Hierarchy)

1. **GOVERNANCE.md** — Locked specs, enforcement rules (HIGHEST)
2. **PLATFORM_STATUS.md** — Current issues, priorities
3. **NO_REGRESSION_CHECKLIST.md** — Verification requirements
4. **CLAUDE.md** — Operating context for agents
5. **Audit artifacts** (SITE_MAP, COPY_AUDIT, DESIGN_AUDIT, etc.) — Supporting evidence

**Rule:** If documents conflict, GOVERNANCE.md wins.

---

## Pre-Commit Protocol

**No PR merges without all 6 agent sign-offs:**

1. Copy Agent ✅ (titles, CTAs, descriptions)
2. Design Agent ✅ (colors, fonts, glass system)
3. Dev Agent ✅ (routes, logic, TypeScript)
4. Data Agent ✅ (migrations, schema)
5. QA Agent ✅ (routes, links, forms)
6. Governance Agent ✅ (15-item checklist)

**Governance Agent Checklist:**
- [ ] All 15 items in NO_REGRESSION_CHECKLIST.md checked
- [ ] No color tokens modified (only extended)
- [ ] No glass system values changed
- [ ] No SaaS clichés in copy
- [ ] Live data pages have disclaimers
- [ ] Routes properly wired
- [ ] TypeScript build passes
- [ ] Meta tags complete

---

## Monthly Governance Review Calendar

**First Wednesday of every month:**
- Review all PRs merged in prior month
- Check compliance with NO_REGRESSION_CHECKLIST.md
- Identify patterns of issues
- Update GOVERNANCE.md with clarifications/new rules
- Generate governance review summary

**Responsible:** Agent 9 (governance agent on rotation)

---

## Wave 9 Scope (Approved)

### W9-1: Fix Critical Regressions (8-12 hours)
Priority fix for P0-01, P0-02, P0-03, P0-05, P0-06

### W9-2: Live Data Infrastructure (40-60 hours)
Backend: 5 tables, 2 edge functions, RSS pipeline

### W9-3: Jobs Platform Phase 1 (30-40 hours)
Frontend: /jobs and /jobs/:slug, Backend: job search

### W9-4: Events Platform Phase 1 (20-30 hours)
Frontend: /events, calendar view, Backend: event registration

### W9-5: SEO Foundation (8-12 hours)
Meta tags, sitemaps, JSON-LD, robots.txt

### W9-6: Conversion Flow Optimization (12-16 hours)
Request Access→Signup connection, lead nurture, metrics

---

## Platform Protection Doctrine (Do Not Modify)

### Systems Under Protection
- Business Portal `/portal/*` (25 routes)
- Brand Portal `/brand/*` (23 routes)
- Admin Portal `/admin/*` (32+ routes)
- Commerce Flow (cart, orders, checkout)
- Auth System (Supabase Auth + ProtectedRoute)
- Supabase Backend (71 migrations, add-only)
- Design Tokens (locked, extend-only)

### Enforcement
- Changes require explicit work order scope
- Bug fixes require only PR review
- No destructive git operations
- All PRs must pass all 6 agent sign-offs

---

## Document Locations

| Document | Location | Authority | Size |
|---|---|---|---|
| GOVERNANCE.md | Repo root | HIGHEST | 18 KB |
| PLATFORM_STATUS.md | Repo root | HIGH | 13 KB |
| NO_REGRESSION_CHECKLIST.md | Repo root | HIGH | 15 KB |
| CLAUDE.md | .claude/ | AUTHORITY | 13 KB |
| This file | Repo root | Medium | (this index) |

---

## Quick Start for New Agents

1. **Day 1:** Read `.claude/CLAUDE.md` (critical issues at top)
2. **Day 1:** Read `GOVERNANCE.md` SECTION 1 (design system lock)
3. **Before PR:** Use `NO_REGRESSION_CHECKLIST.md` (copy template to PR)
4. **Monthly:** Review governance calendar date
5. **Escalation:** Report issues to governance agent (Agent 9)

---

## Questions / Updates

**Governance Agent (current):** Agent 9  
**Next Review Date:** April 5, 2026  
**How to Suggest Changes:** Comment on GOVERNANCE.md or create issue with `[Governance]` prefix

---

**Created:** March 5, 2026  
**Valid Until:** April 5, 2026  
**Authority:** Agent 9 — Regression & Governance Agent

