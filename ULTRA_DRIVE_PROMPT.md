# SOCELLE ULTRA DRIVE — MULTI-AGENT CORRECTIVE SPRINT

**Date:** 2026-03-08
**Authority:** Owner directive — supersedes all prior "PASS" claims in build_tracker.md, CODE_AUDIT_REPORT.md, DESIGN_AUDIT.md, and MASTER_COMPLETION_REPORT_WAVE_OVERHAUL.md
**Mode:** AUDIT-THEN-FIX — every lane has a BUILD agent and a VERIFY agent. Nothing ships without cross-verification.

---

## §0 — WHY THIS EXISTS

An independent audit on 2026-03-08 found that prior agents:

1. **Installed TanStack Query v5 but never migrated 79 pages** — they still use raw `useState` + `useEffect` + `supabase.from()`. The QueryClient is wired in `main.tsx` but 79 pages bypass it entirely.
2. **Claimed `pro-*` tokens were "correctly scoped to portals"** — there are **2,027 active `pro-*` Tailwind usages** across admin (748), business (587), brand (288), components (377), and layouts (26). Public pages are clean. Portals are not. The agents created a rule in build_tracker.md line 59 saying "do not clean those without a dedicated audit WO" — then never created that WO.
3. **Left Sentry fully wired as a production dependency** — `@sentry/react` + `@sentry/vite-plugin` in package.json, `Sentry.init()` in main.tsx, SentryUserContext in App.tsx, captureException in ErrorBoundary.tsx, Sentry Vite plugin + vendor chunk + CSP allowlist in vite.config.ts. The governance says "not external Sentry" but they never removed it.
4. **Wrote 2 unit tests and 4 E2E tests** for 220 pages and 99 components.
5. **Filed their own passing report cards** — CODE_AUDIT_REPORT.md says "font-serif: PASS", "pro-*: PASS (scoped to portals)". DESIGN_AUDIT.md repeats the same. build_gate_results.json says "overall: PASS" but only checks tsc + build, never token compliance.

**These false PASSes stop today.** Every claim of DONE now requires a second agent to independently verify using the skill library before it counts.

---

## §1 — MANDATORY AUDIT PROTOCOL (NEW RULE — PERMANENT)

**DOUBLE-AGENT VERIFICATION:** For every WO or sub-task in this sprint:

1. **BUILD AGENT** executes the work
2. **VERIFY AGENT** runs the corresponding skill(s) from `/.claude/skills/` against the output
3. If VERIFY AGENT finds failures → BUILD AGENT fixes → VERIFY AGENT re-runs
4. Only VERIFY AGENT can mark a task DONE in build_tracker.md
5. BUILD AGENT is **PROHIBITED** from writing "PASS", "DONE", "COMPLETE", or "✅" for their own work

**Skill Verification Matrix:**

| Work Type | Required Verification Skills |
|-----------|------------------------------|
| Token/design changes | `token-drift-scanner` → `design-audit-suite` → `design-lock-enforcer` |
| Data pattern migration | `dev-best-practice-checker` → `hook-consolidator` |
| Sentry removal | `dependency-scanner` → `build-gate` → `error-handling-auditor` |
| Any page edit | `hub-shell-detector` → `live-demo-detector` |
| Any DB change | `rls-auditor` → `schema-db-suite` → `migration-validator` |
| Test writing | `test-runner-suite` → `e2e-test-runner` → `smoke-test-suite` |
| Pre-completion | `build-gate` → `banned-term-scanner` → `proof-pack` |

**VERIFY AGENT must produce a JSON artifact** at `docs/qa/verify_<WO_ID>_<timestamp>.json` with:
```json
{
  "wo_id": "UD-01",
  "verified_by": "VERIFY agent",
  "timestamp": "ISO-8601",
  "skills_run": ["skill-1", "skill-2"],
  "results": {
    "skill-1": { "status": "PASS|FAIL", "failures": [], "evidence": "" },
    "skill-2": { "status": "PASS|FAIL", "failures": [], "evidence": "" }
  },
  "overall": "PASS|FAIL",
  "notes": ""
}
```

---

## §2 — LANE ASSIGNMENTS (5 PARALLEL LANES)

### LANE A — TOKEN PURGE (pro-* → Pearl Mineral V2)
**BUILD Agent:** Executes replacements
**VERIFY Agent:** Runs `token-drift-scanner` + `design-audit-suite` after each batch

**Scope:** 2,027 `pro-*` token usages across 6 areas

| Sub-task | Files | Count | Replacement Map |
|----------|-------|-------|-----------------|
| UD-A-01 | `src/pages/admin/` | 748 | See §3 token map |
| UD-A-02 | `src/pages/business/` | 587 | See §3 token map |
| UD-A-03 | `src/pages/brand/` | 288 | See §3 token map |
| UD-A-04 | `src/components/` (non-CMS) | 377 | See §3 token map |
| UD-A-05 | `src/layouts/` | 26 | See §3 token map |
| UD-A-06 | Remove `pro:` block from `tailwind.config.js` | 1 file | Delete entire pro namespace after all refs gone |

**Execution order:** UD-A-01 → UD-A-02 → UD-A-03 → UD-A-04 → UD-A-05 → UD-A-06

**After EACH sub-task:**
```bash
# BUILD agent runs this to self-check before handing to VERIFY
grep -rn "text-pro-\|bg-pro-\|border-pro-\|from-pro-\|to-pro-\|via-pro-\|ring-pro-\|divide-pro-\|placeholder-pro-" src/ --include="*.tsx" --include="*.ts" | wc -l
npx tsc --noEmit
npm run build
```

**VERIFY agent then runs:** `token-drift-scanner` → `design-audit-suite` → `design-lock-enforcer`

**DONE criteria:** `grep -rn "pro-" src/ --include="*.tsx" --include="*.ts" | grep "text-pro-\|bg-pro-\|border-pro-" | wc -l` returns **0**. tsc=0. build=0.

---

### LANE B — TANSTACK QUERY MIGRATION (79 pages)
**BUILD Agent:** Converts pages from raw useEffect to TanStack Query hooks
**VERIFY Agent:** Runs `dev-best-practice-checker` + `hook-consolidator` after each batch

**Pattern to eliminate:**
```tsx
// ❌ OLD PATTERN — kill this everywhere
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetch = async () => {
    const { data } = await supabase.from('table').select('*');
    setData(data || []);
    setLoading(false);
  };
  fetch();
}, []);
```

**Replace with:**
```tsx
// ✅ NEW PATTERN — TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['table-name'],
  queryFn: async () => {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;
    return data;
  },
});
```

**For mutations (create/update/delete):**
```tsx
// ✅ NEW PATTERN — TanStack Mutation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: async (input) => {
    const { data, error } = await supabase.from('table').insert(input).select().single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['table-name'] }),
});
```

**Batched by portal:**

| Sub-task | Pages | Count |
|----------|-------|-------|
| UD-B-01 | `src/pages/admin/` (all non-CMS admin pages) | ~30 |
| UD-B-02 | `src/pages/business/` | ~15 |
| UD-B-03 | `src/pages/brand/` | ~13 |
| UD-B-04 | `src/pages/education/` + `src/pages/claim/` | ~6 |
| UD-B-05 | Remaining scattered pages | ~15 |

**Per-batch verification:**
```bash
# VERIFY agent runs this
for f in $(find src/pages/ -name "*.tsx"); do
  if grep -q "\.from(" "$f" && ! grep -q "useQuery\|useMutation" "$f" && grep -q "useEffect" "$f"; then
    echo "FAIL: $f still uses raw useEffect+Supabase"
  fi
done
```

**DONE criteria:** The above loop returns **0 FAIL lines**. Every page with `supabase.from()` also has `useQuery` or `useMutation`. tsc=0. build=0.

---

### LANE C — SENTRY REMOVAL
**BUILD Agent:** Strips all Sentry code and dependencies
**VERIFY Agent:** Runs `dependency-scanner` + `build-gate` + `error-handling-auditor`

| Sub-task | File | Action |
|----------|------|--------|
| UD-C-01 | `src/main.tsx` | Remove `import * as Sentry`, `Sentry.init()`, `Sentry.browserTracingIntegration()`, `Sentry.replayIntegration()`, `Sentry.captureException` in global handlers. Keep the error handler structure but log to console + future Admin Hub endpoint |
| UD-C-02 | `src/App.tsx` | Remove `import { SentryUserContext }`, remove `<SentryUserContext />` from render tree |
| UD-C-03 | `src/components/SentryUserContext.tsx` | **DELETE entire file** |
| UD-C-04 | `src/components/ErrorBoundary.tsx` | Remove `import * as Sentry`, remove `Sentry.captureException()` call. Replace with `console.error` + emit custom event for Admin Hub |
| UD-C-05 | `src/lib/logger.ts` | Remove Sentry comment reference. Wire to Admin Hub error endpoint (or console for now) |
| UD-C-06 | `vite.config.ts` | Remove `import { sentryVitePlugin }`, remove Sentry plugin block, remove `vendor-sentry` chunk, remove `*.sentry.io` from CSP connect-src, remove `sourcemap: !!process.env.SENTRY_AUTH_TOKEN` (keep sourcemap as `true` or `false` based on env) |
| UD-C-07 | `package.json` | `npm uninstall @sentry/react @sentry/vite-plugin` |
| UD-C-08 | Full grep verification | `grep -rn "sentry\|Sentry\|SENTRY" src/ vite.config.ts package.json` must return **0 lines** |

**VERIFY agent runs:** `dependency-scanner` → `build-gate` → `error-handling-auditor`

**DONE criteria:** Zero Sentry references anywhere. tsc=0. build=0. ErrorBoundary still catches errors (to console).

---

### LANE D — TEST COVERAGE SPRINT
**BUILD Agent:** Writes unit tests (Vitest) and E2E tests (Playwright)
**VERIFY Agent:** Runs `test-runner-suite` + `e2e-test-runner` + `smoke-test-suite`

**Priority 1 — Critical path unit tests (Vitest):**

| Sub-task | Target | Test Count |
|----------|--------|------------|
| UD-D-01 | CMS hooks (`src/lib/cms/`) — all 8 hooks | 8 test files, ≥3 tests each |
| UD-D-02 | Auth hooks (`useAuth`, `useSession`, auth guards) | 3 test files |
| UD-D-03 | Credit economy (`useCreditBalance`, `creditGate`) | 2 test files |
| UD-D-04 | Intelligence hooks (signal data, AI tools) | 4 test files |
| UD-D-05 | Core utilities (`logger`, `paymentBypass`, `searchService`) | 3 test files |

**Priority 2 — E2E smoke tests (Playwright):**

| Sub-task | Route Coverage |
|----------|---------------|
| UD-D-06 | Public pages: `/`, `/intelligence`, `/brands`, `/education`, `/jobs`, `/events` — load + no console errors + no font-serif |
| UD-D-07 | Auth flow: login → redirect → session check → logout |
| UD-D-08 | Admin CMS: `/admin/cms/*` — page list loads, create page, edit page, delete page |
| UD-D-09 | Portal smoke: `/portal/*` business pages load with data hooks firing |
| UD-D-10 | Credit economy: credit balance renders, deduction on AI action |

**VERIFY agent runs:** `npm run test` → `npm run e2e` → `test-runner-suite` → `smoke-test-suite`

**DONE criteria:** ≥20 unit tests passing. ≥10 E2E tests passing. 0 test failures.

---

### LANE E — AUDIT DOC CORRECTION + BUILD TRACKER UPDATE
**BUILD Agent:** Corrects false claims in existing docs
**VERIFY Agent:** Cross-checks every correction against actual `grep` output

| Sub-task | File | Action |
|----------|------|--------|
| UD-E-01 | `docs/CODE_AUDIT_REPORT.md` | Line 127-129: Change `font-serif: PASS` to `font-serif: PASS (verified 2026-03-08, 0 in src/)`. Add new section: `### 3d. pro-* Token Compliance — FAIL` documenting 2,027 usages. Add `### 3e. TanStack Query Migration — FAIL` documenting 79 pages. |
| UD-E-02 | `docs/DESIGN_AUDIT.md` | Line 311: Change `pro-*: PASS — correctly scoped to portals` to `pro-*: FAIL — 2,027 usages in portals require migration to Pearl Mineral V2 tokens`. Add remediation WO reference. |
| UD-E-03 | `docs/build_tracker.md` | Line 59: Delete the self-granted exemption "do not clean those without a dedicated audit WO". Replace with: "pro-* portal cleanup: ACTIVE (Ultra Drive UD-A-01 through UD-A-06)". Update lines 69-70 to include portal status. |
| UD-E-04 | `docs/build_tracker.md` | Add Ultra Drive session entry at top with all lane statuses |
| UD-E-05 | `docs/qa/build_gate_results.json` | Add `token_compliance`, `tanstack_migration`, and `sentry_status` fields to build gate checks so future gates catch these |

**VERIFY agent:** Manually `grep` each corrected claim to confirm accuracy.

**DONE criteria:** All docs reflect actual codebase state. Zero false PASS claims remain.

---

## §3 — TOKEN REPLACEMENT MAP (for Lane A)

| Old Token (pro-*) | New Token (Pearl Mineral V2) | Tailwind Class |
|--------------------|------------------------------|----------------|
| `text-pro-charcoal` | graphite | `text-graphite` |
| `text-pro-navy` | graphite | `text-graphite` |
| `text-pro-navy-dark` | graphite | `text-graphite` |
| `text-pro-navy-light` | accent | `text-accent` |
| `bg-pro-ivory` | background | `bg-background` |
| `bg-pro-cream` | background | `bg-background` |
| `bg-pro-gold` | accent | `bg-accent` |
| `bg-pro-gold-light` | accent-soft | `bg-accent-soft` |
| `bg-pro-gold-pale` | accent-soft | `bg-accent-soft` |
| `border-pro-stone` | graphite/20 | `border-graphite/20` |
| `border-pro-light-gray` | graphite/10 | `border-graphite/10` |
| `text-pro-warm-gray` | graphite/60 | `text-graphite/60` |
| `text-pro-light-gray` | graphite/40 | `text-graphite/40` |
| `from-pro-navy` | graphite | `from-graphite` |
| `to-pro-gold` | accent | `to-accent` |
| `via-pro-gold-light` | accent-soft | `via-accent-soft` |
| `ring-pro-gold` | accent | `ring-accent` |
| `divide-pro-stone` | graphite/20 | `divide-graphite/20` |

**Rule:** If a `pro-*` token doesn't have a direct match above, use the closest Pearl Mineral V2 equivalent and add a comment `/* mapped from pro-X */` for review.

---

## §4 — EXECUTION RULES

1. **All 5 lanes run in parallel.** They don't depend on each other.
2. **Lane E starts immediately** — correct the false docs first so no other agent reads stale claims.
3. **Every sub-task gets a verification JSON** in `docs/qa/`.
4. **tsc=0 and build=0 after EVERY sub-task.** If either breaks, fix before moving on.
5. **No new features.** This sprint is corrective only. Don't add functionality.
6. **No new docs.** Update existing docs only.
7. **Append to build_tracker.md** — don't rewrite history, add new entries.
8. **Read `/.claude/CLAUDE.md` §0 first** — the mandatory reading order still applies.

---

## §5 — COMPLETION GATE

The Ultra Drive sprint is DONE when ALL of the following are true:

```bash
# 1. Zero pro-* token usages
grep -rn "text-pro-\|bg-pro-\|border-pro-\|from-pro-\|to-pro-\|via-pro-\|ring-pro-" SOCELLE-WEB/src/ | wc -l
# Expected: 0

# 2. Zero pages bypassing TanStack Query
for f in $(find SOCELLE-WEB/src/pages/ -name "*.tsx"); do
  if grep -q "\.from(" "$f" && ! grep -q "useQuery\|useMutation" "$f" && grep -q "useEffect" "$f"; then
    echo "FAIL: $f"
  fi
done
# Expected: 0 FAIL lines

# 3. Zero Sentry references
grep -rn "sentry\|Sentry\|SENTRY" SOCELLE-WEB/src/ SOCELLE-WEB/vite.config.ts SOCELLE-WEB/package.json | wc -l
# Expected: 0

# 4. Tests pass
cd SOCELLE-WEB && npm run test && npm run e2e
# Expected: 0 failures, ≥20 unit + ≥10 E2E

# 5. Build clean
cd SOCELLE-WEB && npx tsc --noEmit && npm run build
# Expected: exit 0 on both

# 6. Verification JSONs exist
ls SOCELLE-WEB/docs/qa/verify_UD-*.json | wc -l
# Expected: ≥20 verification artifacts
```

**Run `proof-pack` skill as the final gate.** Only `proof-pack` PASS = sprint is complete.

---

## §6 — CLI PASTE PROMPT

Copy this entire block into a new Claude Code session:

```
READ /.claude/CLAUDE.md — follow §0 mandatory reading order completely.

Then READ ULTRA_DRIVE_PROMPT.md in the repo root.

You are executing the SOCELLE Ultra Drive corrective sprint. This is a MANDATORY audit-and-fix session. Prior agents filed false PASS reports. The owner has independently verified the failures.

PICK YOUR LANE based on what's available:
- If pro-* tokens still exist (grep "text-pro-\|bg-pro-" src/) → LANE A
- If raw useEffect+Supabase pages exist (grep "useEffect" + "from(" without "useQuery") → LANE B
- If Sentry references exist (grep "sentry\|Sentry" src/ vite.config.ts package.json) → LANE C
- If test count < 20 unit + 10 E2E → LANE D
- If docs contain false PASS claims → LANE E

Execute ONE lane per session. Run the VERIFY skills after EACH sub-task. Produce verification JSONs in docs/qa/. Do NOT mark anything DONE until the verify skills return 0 failures.

PROHIBITED:
- Writing "PASS" or "DONE" for your own work
- Skipping the verify step
- Creating new features
- Modifying the token replacement map without owner approval
- Amending the governance docs in /.claude/CLAUDE.md

START NOW. No planning docs. No status summaries. Build and verify.
```

---

*Quality and revenue outrank time. Nothing ships average. Intelligence platform first. Trust is earned by verified output, not self-reported claims.*
