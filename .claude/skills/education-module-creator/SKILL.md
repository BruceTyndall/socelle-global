---
name: education-module-creator
description: "Designs professional education modules, training courses, and certification content from SOCELLE protocol data and intelligence. Use this skill whenever someone asks to create training content, build a course, design education modules, write protocol training, create certification materials, or develop learning paths for beauty professionals. Also triggers on: 'training module', 'course design', 'education content', 'protocol training', 'certification', 'learning path', 'SCORM', 'professional development', 'continuing education', 'brand training'. Education is a key retention lever — professionals return for ongoing learning."
---

# Education Module Creator

Designs structured education content from SOCELLE's protocol data and intelligence layer. Professional beauty education is a retention flywheel — professionals who learn through SOCELLE stay engaged with the platform because the education connects directly to intelligence data they use daily.

## Education Content Types

| Type | Duration | Format | Source Data |
|------|----------|--------|-------------|
| Protocol Training | 15-30 min | Step-by-step with assessment | `canonical_protocols` table |
| Brand Training | 20-45 min | Product knowledge + techniques | `brand_training_modules` table |
| Category Intelligence Course | 30-60 min | Data-driven market education | Intelligence modules |
| Certification Program | 2-4 hours | Multi-module with final exam | Combined protocol + brand + intelligence |

## Step 1: Source Education Data

```bash
echo "=== EDUCATION DATA SOURCES ==="
cd SOCELLE-WEB

# Protocol content
echo "Canonical protocols:"
grep -rn "canonical_protocols\|protocol.*content\|protocol.*steps" supabase/migrations/ src/ 2>/dev/null | grep -v node_modules | head -10

# Brand training modules
echo "Brand training:"
grep -rn "brand_training\|training.*module\|brand.*education" supabase/migrations/ src/ 2>/dev/null | grep -v node_modules | head -10

# Education pages
echo "Education pages:"
ls src/pages/education/ src/pages/protocols/ 2>/dev/null

# Existing learning paths
echo "Learning paths:"
grep -rn "learning.*path\|course.*progress\|module.*complete" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Design Module Structure

Every education module follows this learning architecture:

```markdown
## Module: [Title]

### Learning Objectives
- By the end of this module, learners will be able to...
- [Objective 1 — measurable, specific]
- [Objective 2]
- [Objective 3]

### Prerequisites
- Required tier: [Free/Pro/Enterprise]
- Prior modules: [None / list]
- Role: [Operator/Provider/Brand]

### Content Sections
1. **Introduction** (2 min) — Why this matters + intelligence context
2. **Core Content** (10-20 min) — Step-by-step with protocol data
3. **Application** (5-10 min) — How to apply in practice
4. **Assessment** (5 min) — Quiz or practical exercise
5. **Intelligence Connection** (3 min) — Link back to platform signals

### Assessment Design
- Multiple choice: 5-10 questions testing comprehension
- Scenario-based: 2-3 "what would you do" questions
- Pass threshold: 80%
- Retry allowed: Yes, unlimited
```

## Step 3: Generate Content

For each section, pull from real data:

```bash
echo "=== CONTENT GENERATION ==="
cd SOCELLE-WEB

# Protocol steps for core content
echo "Protocol step structure:"
grep -rn "step\|instruction\|procedure\|technique" src/pages/protocols/ 2>/dev/null | grep -v node_modules | head -10

# Product data for brand training
echo "Product/brand data:"
grep -rn "product.*name\|brand.*info\|ingredient\|formulation" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

### Content Rules
- Every education piece cites intelligence data as evidence
- No medical claims without disclaimers (legal-compliance-checker)
- Content must be role-appropriate (operator vs provider vs brand)
- Protocol content must match `canonical_protocols` table exactly
- All imagery/examples from SOCELLE's approved content

## Step 4: Build Assessment Questions

For each module, generate assessment items:

```markdown
### Question Template
**Q**: [Question text — tests application, not just recall]
**A**: [Correct answer]
**B**: [Plausible distractor]
**C**: [Plausible distractor]
**D**: [Plausible distractor]
**Correct**: A
**Explanation**: [Why A is correct — ties back to intelligence data]
```

## Step 5: Map to Entitlements

| Module Type | Free | Pro | Enterprise |
|-------------|------|-----|------------|
| Basic protocol training | ✓ (preview) | ✓ | ✓ |
| Brand training | ✗ | ✓ | ✓ |
| Intelligence courses | ✗ | ✓ | ✓ |
| Certification programs | ✗ | ✗ | ✓ |

## Output

Write module content to `docs/education/modules/[module-name].md`
Write QA to `docs/qa/education_module.json`:
```json
{
  "skill": "education-module-creator",
  "module_name": "",
  "content_type": "protocol|brand|intelligence|certification",
  "sections": 0,
  "assessment_questions": 0,
  "learning_objectives": 0,
  "required_tier": "free|pro|enterprise",
  "data_sources_cited": 0,
  "medical_disclaimers_present": true,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: new protocols added to `canonical_protocols`, new brand training content uploaded, intelligence modules change, or assessment pass rates indicate content needs revision.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "education-module-creator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/education-module-creator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
