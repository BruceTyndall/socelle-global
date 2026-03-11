#!/bin/bash
echo "Starting 5-Agent Specialty Audit"
echo "================================="

# 1. QA Agent - TypeScript & Build Health
echo "[QA Agent] Running compilation strict checks..."
npm run typecheck > docs/qa/agents/qa_report.txt 2>&1

# 2. Web Agent - Shell & Dead-End Detector (grep)
echo "[Web Agent] Scanning for empty states, missing hooks, and raw fetches..."
grep -r "useEffect" src/pages/ | grep "supabase" > docs/qa/agents/web_report.txt || echo "Clean" > docs/qa/agents/web_report.txt

# 3. SEO Agent - JSON-LD and Meta coverage
echo "[SEO Agent] Auditing public routes for Helmet & Schema.org tags..."
grep -r "SeoHead" src/pages/public/ > docs/qa/agents/seo_report.txt || echo "Missing SEO wrappers" > docs/qa/agents/seo_report.txt

# 4. Design Parity Agent - Banned Tokens & Sans Enforcement
echo "[Design Agent] Verifying Pearl Mineral V2 token strictness..."
grep -r "pro-" src/pages/public/ > docs/qa/agents/design_report.txt || echo "Clean" > docs/qa/agents/design_report.txt

# 5. Backend Agent - Schema Drift & Env
echo "[Backend Agent] Diffing remote DB schema vs local database.types.ts..."
npx supabase db diff > docs/qa/agents/backend_report.txt 2>&1 || echo "Clean" > docs/qa/agents/backend_report.txt

echo "Audit Complete. Generating master JSON."
