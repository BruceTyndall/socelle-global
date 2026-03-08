---
name: design-prototype-generator
description: "Creates UI prototypes from feature specs, generating React component code with Pearl Mineral V2 styling, responsive layouts, and interaction patterns. Use this skill whenever someone asks to prototype a new feature, create a UI mockup in code, build a proof-of-concept interface, or generate a clickable prototype. Also triggers on: 'prototype', 'UI mockup', 'proof of concept', 'clickable mock', 'rapid prototype', 'wireframe to code', 'feature prototype', 'interactive mock'. Prototypes are functional React code, not static images — they can evolve directly into production components."
---

# Design Prototype Generator

Creates functional React prototypes from feature specifications. Unlike static mockups, these prototypes are working code that can be promoted directly to production components — saving the rebuild step. Every prototype ships with Pearl Mineral V2 compliance baked in so design review time drops significantly.

## Why Code Prototypes > Static Mockups

Static mockups require a designer-to-developer handoff that introduces drift. Code prototypes eliminate that gap — what you see IS the code. For SOCELLE's small team, this is a force multiplier.

## Step 1: Parse Feature Spec

Extract from the request:
- **Feature name**: What is this prototype for?
- **User flow**: What sequence of interactions?
- **Data shape**: What data does it display/collect?
- **Portal context**: Public, `/portal/*`, `/brand/*`, `/admin/*`?
- **Entitlement**: Free preview, Pro-gated, Enterprise-only?

## Step 2: Generate Prototype Component

```tsx
// Prototype template — Pearl Mineral V2 compliant
import React, { useState } from 'react';

interface [Feature]PrototypeProps {
  isLive?: boolean;  // DEMO badge if false
}

export const [Feature]Prototype: React.FC<[Feature]PrototypeProps> = ({ isLive = false }) => {
  return (
    <div className="min-h-screen bg-[#F6F3EF] p-6">
      {/* DEMO badge */}
      {!isLive && (
        <div className="mb-4 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm inline-block">
          PREVIEW — Demo Data
        </div>
      )}
      
      {/* Glass card container */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-sm">
        <h2 className="text-[#141418] text-xl font-semibold mb-4">[Feature Title]</h2>
        {/* Feature content */}
      </div>
    </div>
  );
};
```

### Design Lock Checklist
Every prototype must include:
- [ ] `bg-[#F6F3EF]` page background (Mineral Background)
- [ ] `text-[#141418]` primary text (Graphite)
- [ ] `text-[#6E879B]` accent/link color
- [ ] `backdrop-blur-md bg-white/70` glass cards
- [ ] `rounded-2xl` card borders
- [ ] `rounded-xl` button borders
- [ ] Responsive: `sm:`, `md:`, `lg:` breakpoints
- [ ] Inter font stack (no serif)
- [ ] `isLive` flag with DEMO badge
- [ ] Loading skeleton state
- [ ] Empty state with actionable message

## Step 3: Add Interaction Patterns

```tsx
// Common SOCELLE interaction patterns

// 1. Data table with sorting
const [sortField, setSortField] = useState('date');

// 2. Filter panel
const [filters, setFilters] = useState({ category: 'all', timeRange: '7d' });

// 3. Intelligence signal card
const SignalCard = ({ signal }) => (
  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${signal.isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-sm text-[#6E879B]">{signal.category}</span>
    </div>
    <h3 className="text-[#141418] font-medium mt-2">{signal.title}</h3>
    <p className="text-sm text-gray-600 mt-1">{signal.summary}</p>
  </div>
);
```

## Step 4: Validate Prototype

```bash
echo "=== PROTOTYPE VALIDATION ==="
cd SOCELLE-WEB
FILE="$1"

# Design lock compliance
echo "Design lock check:"
grep -c "F6F3EF\|141418\|6E879B\|backdrop-blur\|rounded-2xl" "$FILE" 2>/dev/null

# Responsive breakpoints
echo "Responsive:"
grep -c "sm:\|md:\|lg:" "$FILE" 2>/dev/null

# DEMO/LIVE handling
echo "DEMO badge:"
grep -c "isLive\|DEMO\|PREVIEW" "$FILE" 2>/dev/null

# TypeScript compliance
echo "Typecheck:"
npx tsc --noEmit "$FILE" 2>&1 | tail -3
```

## Output

Write prototype to `src/components/prototypes/[Feature]Prototype.tsx`
Write QA to `docs/qa/prototype.json`:
```json
{
  "skill": "design-prototype-generator",
  "feature_name": "",
  "component_path": "",
  "design_lock_pass": true,
  "responsive_breakpoints": 3,
  "demo_badge_present": true,
  "typecheck_pass": true,
  "interaction_patterns": [],
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when Pearl Mineral V2 design locks change, new component patterns emerge, or Tailwind config updates.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "design-prototype-generator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/design-prototype-generator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
