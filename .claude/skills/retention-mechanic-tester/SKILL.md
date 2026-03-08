---
name: retention-mechanic-tester
description: "Audits and simulates retention mechanics in SOCELLE including daily intelligence alerts, habit loops, notification triggers, re-engagement flows, and churn prevention. Use this skill whenever someone asks about retention strategy, engagement loops, notification audit, re-engagement, churn prevention, daily active user mechanics, habit formation, or stickiness features. Also triggers on: 'retention', 'engagement loop', 'daily active', 'churn', 'stickiness', 'habit loop', 're-engagement', 'notification strategy', 'alert frequency', 'user activation'."
---

# Retention Mechanic Tester

Audits and simulates retention loops to ensure SOCELLE builds habits, not just features. A platform with great intelligence but no engagement mechanics is a tool people forget about. This skill checks that every touch-point — alerts, dashboards, notifications — creates reasons to come back.

## SOCELLE Retention Levers

| Lever | Mechanism | Frequency |
|-------|-----------|-----------|
| Intelligence alerts | New market signals push notifications | Daily |
| Dashboard freshness | KPI strip updates with real data | Continuous |
| Trend stacks | Weekly trend digests | Weekly |
| Credit balance | "You have X credits remaining" | On-login |
| Benchmark updates | Category benchmarks refresh | Monthly |
| Brand health changes | Alert when monitored brands change | Event-driven |

## Step 1: Audit Existing Retention Mechanics

```bash
echo "=== RETENTION MECHANICS AUDIT ==="
cd SOCELLE-WEB

# Notification/alert system
echo "Alert/notification components:"
grep -rn "notification\|alert\|toast\|push.*message\|inbox" src/ 2>/dev/null | grep -v node_modules | wc -l

# Email trigger functions
echo "Transactional email triggers:"
ls supabase/functions/ 2>/dev/null | grep -i "email\|notify\|alert\|digest" 

# Scheduled/cron jobs
echo "Scheduled tasks:"
grep -rn "cron\|schedule\|interval\|setInterval\|recurring" supabase/ 2>/dev/null | head -10

# Re-engagement flows
echo "Re-engagement components:"
grep -rn "welcome.*back\|last.*visit\|inactive\|re.engage\|win.*back" src/ 2>/dev/null | grep -v node_modules | head -5

# Login streak / usage tracking
echo "Usage tracking:"
grep -rn "last.*login\|login.*count\|session.*count\|streak\|consecutive" src/ supabase/ 2>/dev/null | grep -v node_modules | head -5
```

## Step 2: Map the Habit Loop

For each retention lever, verify the complete loop exists:

```
Trigger → Action → Reward → Investment
```

- **Trigger**: What prompts the user to return? (notification, email, scheduled alert)
- **Action**: What do they do when they arrive? (view dashboard, check signal, run tool)
- **Reward**: What value do they get? (new insight, competitive edge, saved time)
- **Investment**: What keeps them committed? (customized alerts, saved preferences, credit balance)

## Step 3: Identify Gaps

Check for missing or broken loops:

| Check | Pass Criteria |
|-------|---------------|
| Daily trigger exists | At least one mechanism sends daily engagement prompts |
| First-value < 5 min | New user sees real intelligence within 5 minutes of signup |
| Dashboard shows fresh data | KPI strip has real `updated_at` data, not stale |
| Credit reminder on login | User sees remaining credits on dashboard |
| Inactivity re-engagement | Email or in-app message after X days of no login |
| Progressive disclosure | New features revealed over time, not all at once |

## Step 4: Simulate Retention Impact

Model the impact of mechanics on DAU:

```markdown
## Retention Simulation

### Scenario: Daily Intelligence Alert
- **Current DAU**: X (estimate from analytics or assumption)
- **Alert open rate**: 20% (industry average for B2B notifications)
- **Return-to-platform rate**: 50% of openers
- **Projected DAU lift**: X * 0.2 * 0.5 = Y additional daily users
- **30-day retention impact**: +Z% if alert is relevant and fresh
```

## Output

Write to `docs/qa/retention_mechanics.json`:
```json
{
  "skill": "retention-mechanic-tester",
  "levers_audited": 0,
  "complete_loops": 0,
  "broken_loops": 0,
  "missing_triggers": [],
  "first_value_minutes": 0,
  "daily_engagement_mechanism": true,
  "inactivity_reengagement": true,
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

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
