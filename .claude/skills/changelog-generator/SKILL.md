---
name: changelog-generator
description: "Generates structured changelogs, release notes, and version documentation from git history, build tracker, and code diffs for SOCELLE. Use this skill whenever someone asks to write release notes, generate a changelog, document what changed between versions, create an update announcement, or summarize recent development activity. Also triggers on: 'changelog', 'release notes', 'what changed', 'version update', 'recent changes', 'development summary', 'sprint summary', 'what did we ship'."
---

# Changelog Generator

Generates structured changelogs from git history and build tracker data. Clear release documentation serves three audiences: users (what's new), developers (what changed), and stakeholders (progress tracking). This skill automates the compilation and formatting.

## Step 1: Gather Change Data

```bash
echo "=== CHANGE DATA ==="
cd SOCELLE-WEB

# Recent git commits
echo "Recent commits:"
git log --oneline --since="2 weeks ago" 2>/dev/null | head -30

# Files changed
echo "Files changed (last 2 weeks):"
git diff --stat HEAD~50 HEAD 2>/dev/null | tail -5

# Build tracker updates
echo "Build tracker changes:"
git log --oneline -- docs/build_tracker.md 2>/dev/null | head -10
```

## Step 2: Categorize Changes

Group changes by type:
- **New Features**: New pages, components, or capabilities
- **Improvements**: Enhanced existing features
- **Bug Fixes**: Error corrections
- **Infrastructure**: Build, deploy, config changes
- **Documentation**: Doc updates, governance changes
- **Data**: Migration changes, schema updates

## Step 3: Format Changelog

```markdown
# Changelog — [Date Range]

## New Features
- [Feature]: [Description] ([WO ID])

## Improvements
- [Component]: [What improved] ([WO ID])

## Bug Fixes
- [Fix]: [What was broken → what was fixed] ([WO ID])

## Infrastructure
- [Change]: [Description]

## Data / Schema
- [Migration]: [Description]
```

## Output

Write changelog to `docs/CHANGELOG.md` and QA record to `docs/qa/changelog.json`.

## Verification (Deterministic)
- **Command:** `git log --oneline -5 2>/dev/null  # expect recent commits to parse`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/changelog-generator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance


## Fade Protocol
- **Retest trigger:** Run quarterly or after any major refactor, migration, or dependency upgrade
- **Deprecation trigger:** Skill references files/patterns that no longer exist in codebase for 2+ consecutive quarters
- **Replacement path:** If deprecated, merge functionality into the relevant suite or rebuild via `skill-creator`
- **Last recertified:** 2026-03-08
