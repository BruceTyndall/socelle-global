---
name: education-content-optimizer
description: "Refines existing education modules with improved assessments, quizzes, certificates, and learning analytics. Use this skill whenever someone asks to improve training content, add quizzes, create certificates, optimize learning paths, analyze completion rates, or enhance education module engagement. Also triggers on: 'improve training', 'add quiz', 'certificate', 'learning analytics', 'completion rate', 'education optimization', 'refine module', 'assessment improvement', 'learning engagement'."
---

# Education Content Optimizer

Refines existing education content for better engagement and learning outcomes. While `education-module-creator` builds new modules from scratch, this skill improves what already exists — adding interactive assessments, designing certificates, optimizing learning paths based on completion data, and increasing time-to-competency.

## Step 1: Audit Existing Education Content

```bash
echo "=== EDUCATION CONTENT AUDIT ==="
cd SOCELLE-WEB

# Existing education pages
echo "Education routes:"
grep -rn "education\|protocol\|training\|course\|learning" src/pages/ 2>/dev/null | grep -v node_modules | head -15

# Assessment/quiz components
echo "Quiz/assessment components:"
grep -rn "quiz\|assessment\|question\|answer\|score\|grade\|test" src/ 2>/dev/null | grep -v node_modules | head -10

# Certificate/completion tracking
echo "Completion tracking:"
grep -rn "certificate\|completion\|progress\|completed\|badge" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10

# Content engagement data
echo "Engagement tracking on education:"
grep -rn "track.*education\|education.*event\|module.*view\|lesson.*complete" src/ 2>/dev/null | grep -v node_modules | head -5
```

## Step 2: Enhancement Framework

### Quiz Design Best Practices
- **Spacing**: Place assessment after every major concept (not just at the end)
- **Question types**: Mix multiple-choice, scenario-based, and matching
- **Feedback**: Immediate explanation for both correct and incorrect answers
- **Retry**: Allow unlimited retries with randomized question order
- **Pass threshold**: 80% for certificates, 60% for progress

### Certificate Design
```markdown
## Certificate Template

[SOCELLE Logo]

CERTIFICATE OF COMPLETION

This certifies that
[Professional Name]

has successfully completed
[Module Title]

Category: [Protocol/Brand/Intelligence]
Date: [Completion Date]
Score: [Assessment Score]%

[Digital Verification QR Code]
Certificate ID: [UUID]
```

### Learning Path Optimization
- Track time-per-section to identify content that's too dense or too thin
- Identify drop-off points where learners abandon modules
- A/B test section ordering (theory-first vs practice-first)
- Recommend next modules based on completed content and role

## Step 3: Generate Optimized Content

For each module being optimized:
1. Review current section structure and timing
2. Insert assessment checkpoints at key learning moments
3. Add interactive elements (scenario cards, knowledge checks)
4. Design completion certificate
5. Map to learning path with prerequisites and follow-ups

## Output

Write to `docs/qa/education_optimizer.json`:
```json
{
  "skill": "education-content-optimizer",
  "modules_audited": 0,
  "quizzes_added": 0,
  "certificates_designed": 0,
  "learning_paths_mapped": 0,
  "drop_off_points_identified": 0,
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: completion rate data reveals new patterns, new content types are added, or learning science best practices evolve.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "education-content-optimizer*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/education-content-optimizer-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
