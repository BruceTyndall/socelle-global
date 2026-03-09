#!/usr/bin/env node
/**
 * FOUND-WO-11: Generated Inventory Report
 * Scans the SOCELLE-WEB repo and outputs a markdown inventory report.
 * Run: node scripts/generate-inventory.mjs
 * Output: docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ── Pure Node.js helpers (no shell commands — safe with spaces in paths) ──

function walkDir(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, filter));
    } else if (!filter || filter(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function countFilesByExt(dir, ext) {
  return walkDir(path.join(projectRoot, dir), (name) => name.endsWith(ext)).length;
}

function countDirEntries(dir) {
  const full = path.join(projectRoot, dir);
  if (!fs.existsSync(full)) return 0;
  return fs.readdirSync(full).length;
}

function grepCount(pattern, filePath) {
  const full = path.join(projectRoot, filePath);
  if (!fs.existsSync(full)) return 0;
  const content = fs.readFileSync(full, 'utf8');
  const regex = new RegExp(pattern, 'g');
  return (content.match(regex) || []).length;
}

function grepFilesRecursive(pattern, dir) {
  const full = path.join(projectRoot, dir);
  const files = walkDir(full, (name) => /\.(tsx?|jsx?)$/.test(name));
  const regex = new RegExp(pattern, 'i');
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (regex.test(content)) count++;
  }
  return count;
}

// ── Collect metrics ──
const metrics = {
  timestamp: new Date().toISOString(),
  webPages: countFilesByExt('src/pages', '.tsx'),
  webComponents: countFilesByExt('src/components', '.tsx'),
  webRoutes: grepCount('path=', 'src/App.tsx'),
  moduleRoutes: grepCount('ModuleRoute', 'src/App.tsx'),
  hooks: walkDir(path.join(projectRoot, 'src'), (name) =>
    /^use.*\.tsx?$/.test(name)
  ).length,
  edgeFunctions: countDirEntries('supabase/functions'),
  migrations: countDirEntries('supabase/migrations'),
  unitTestFiles: walkDir(path.join(projectRoot, 'src'), (name) =>
    /\.test\.tsx?$/.test(name)
  ).length,
  e2eSpecFiles: walkDir(path.join(projectRoot, 'e2e'), (name) =>
    /\.spec\.ts$/.test(name)
  ).length,
  fontSerifInSrc: grepFilesRecursive('font-serif', 'src/'),
  proTokensInSrc: grepFilesRecursive('\\bpro-', 'src/'),
  sentryInSrc: grepFilesRecursive('@sentry', 'src/'),
};

// Shell detection — count pages with DB queries
const pageFiles = walkDir(path.join(projectRoot, 'src/pages'), (name) =>
  name.endsWith('.tsx')
);
let pagesWithQuery = 0;
for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/useQuery|supabase\.from/.test(content)) pagesWithQuery++;
}
metrics.livePages = pagesWithQuery;
metrics.shellPages = metrics.webPages - pagesWithQuery;
metrics.shellRate =
  metrics.webPages > 0
    ? ((metrics.shellPages / metrics.webPages) * 100).toFixed(1)
    : '0.0';

// Banned terms scan on public pages
const bannedTerms = [
  'unlock growth', 'all-in-one', 'seamless', 'powerful platform',
  'next-generation', 'leverage', 'streamline', 'optimize', 'end-to-end',
  'synergy', 'scalable solutions', 'game-changer', 'revolutionary',
  'cutting-edge', 'robust', 'disruptive', 'transformative', 'innovative',
  'best-in-class', 'empower', 'facilitate', 'real-time analytics',
  'actionable insights',
];
const publicFiles = walkDir(
  path.join(projectRoot, 'src/pages/public'),
  (name) => /\.(tsx?|jsx?)$/.test(name)
);
let bannedCount = 0;
for (const file of publicFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const term of bannedTerms) {
    const regex = new RegExp(term, 'gi');
    const matches = content.match(regex);
    if (matches) bannedCount += matches.length;
  }
}
metrics.bannedTermsPublic = bannedCount;

// Skills count
const skillsRoot = path.resolve(projectRoot, '..', '.claude', 'skills');
metrics.skills = fs.existsSync(skillsRoot)
  ? walkDir(skillsRoot, (name) => name === 'SKILL.md').length
  : 0;

// ── Generate markdown report ──
const report = `# SOCELLE GLOBAL — INVENTORY REPORT

**Generated:** ${metrics.timestamp}
**Generator:** \`scripts/generate-inventory.mjs\`
**Rule:** Regenerate before each build (\`npm run inventory\`)

---

## Codebase Metrics

| Metric | Count |
|--------|-------|
| Web pages | ${metrics.webPages} |
| Web components | ${metrics.webComponents} |
| Web routes | ${metrics.webRoutes} |
| ModuleRoute wrappers | ${metrics.moduleRoutes} |
| Hooks | ${metrics.hooks} |
| Edge functions | ${metrics.edgeFunctions} |
| Migrations | ${metrics.migrations} |
| Unit test files | ${metrics.unitTestFiles} |
| E2E spec files | ${metrics.e2eSpecFiles} |
| Installed skills | ${metrics.skills} |

## Quality Gates

| Gate | Count | Status |
|------|-------|--------|
| font-serif in src/ | ${metrics.fontSerifInSrc} | ${metrics.fontSerifInSrc === 0 ? 'PASS' : 'FAIL'} |
| pro-* tokens in src/ | ${metrics.proTokensInSrc} | ${metrics.proTokensInSrc === 0 ? 'PASS' : 'DEBT'} |
| @sentry in src/ | ${metrics.sentryInSrc} | ${metrics.sentryInSrc === 0 ? 'PASS' : 'DEBT'} |
| Banned terms (public pages) | ${metrics.bannedTermsPublic} | ${metrics.bannedTermsPublic === 0 ? 'PASS' : 'FAIL'} |

## Shell Detection

| Metric | Count |
|--------|-------|
| LIVE pages (has DB query) | ${metrics.livePages} |
| SHELL pages (no DB query) | ${metrics.shellPages} |
| Shell rate | ${metrics.shellRate}% |

---

*Generated by \`scripts/generate-inventory.mjs\` — do not edit manually.*
`;

// Write report
const outputDir = path.join(projectRoot, 'docs', 'inventory');
fs.mkdirSync(outputDir, { recursive: true });
const outputFile = path.join(outputDir, 'SOCELLE_GLOBAL_INVENTORY_REPORT.md');
fs.writeFileSync(outputFile, report, 'utf8');

// Also write JSON for machine consumption
const jsonFile = path.join(projectRoot, 'docs', 'qa', 'inventory_report.json');
const previousJsonFile = path.join(projectRoot, 'docs', 'qa', 'inventory_report.previous.json');
fs.mkdirSync(path.dirname(jsonFile), { recursive: true });
if (fs.existsSync(jsonFile)) {
  fs.copyFileSync(jsonFile, previousJsonFile);
}
fs.writeFileSync(jsonFile, JSON.stringify(metrics, null, 2) + '\n', 'utf8');

console.log('Inventory report written: docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md');
console.log('Inventory JSON written: docs/qa/inventory_report.json');
if (fs.existsSync(previousJsonFile)) {
  console.log('Previous inventory JSON written: docs/qa/inventory_report.previous.json');
}
console.log(
  `\nSummary: ${metrics.webPages} pages | ${metrics.shellPages} shells (${metrics.shellRate}%) | ${metrics.bannedTermsPublic} banned terms`
);
process.exit(0);
