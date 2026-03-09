#!/usr/bin/env node
/**
 * FOUND-WO-04: Shell Detector CI Gate
 * Scans all page files, classifies each as LIVE/DEMO/SHELL.
 * Blocks merges if new shells are introduced (regression detection).
 *
 * Run: node scripts/shell-detector.mjs
 * Baseline: node scripts/shell-detector.mjs --write-baseline
 * Output: docs/qa/shell_detector_report.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const reportFile = path.join(projectRoot, 'docs', 'qa', 'shell_detector_report.json');
const baselineFile = path.join(projectRoot, 'docs', 'qa', 'shell_detector_baseline.json');
const writeBaseline = process.argv.includes('--write-baseline');

// ── Patterns that indicate LIVE data fetching ──
const LIVE_PATTERNS = [
  /useQuery\s*[<(]/,
  /useMutation\s*[<(]/,
  /supabase\s*\.\s*from\s*\(/,
  /useInfiniteQuery/,
  /useSuspenseQuery/,
  /queryClient/,
  /\.select\s*\(/,
  /\.insert\s*\(/,
  /\.update\s*\(/,
  /\.delete\s*\(/,
  /\.upsert\s*\(/,
  /\.rpc\s*\(/,
  /use(?:Campaigns|MarketingCampaigns|CampaignMetrics|AudienceSegments|ContentTemplates|Notifications|Appointments|AppointmentDetail|BookingServices|BookingStaff|Products|Automations|TierDiscounts|VolumeDiscounts|DataFeedStats|PlatformStats|Intelligence|TalentSignals|JobPostings)\s*\(/,
];

// ── Patterns that indicate DEMO labeling ──
const DEMO_PATTERNS = [
  /isLive\s*[=:]/,
  /DEMO/,
  /PREVIEW/,
  /['"]demo['"]/i,
  /data-demo/,
];

// ── Patterns that indicate proper states ──
const EMPTY_STATE_PATTERNS = [
  /EmptyState/,
  /empty.state/i,
  /No\s+\w+\s+found/,
  /No\s+\w+\s+(yet|available|scheduled|configured|on this day)/i,
  /Nothing\s+here/i,
  /Get\s+started/i,
];

const ERROR_STATE_PATTERNS = [
  /ErrorState/,
  /error.state/i,
  /isError/,
  /error\s*&&/,
  /\.error\b/,
  /ErrorBoundary/,
  /catch\s*\(/,
];

const LOADING_STATE_PATTERNS = [
  /Skeleton/,
  /isLoading/,
  /isPending/,
  /isFetching/,
  /if\s*\(\s*loading\s*\)/,
  /loading\s*\?/,
  /loading\s*&&/,
  /loading:\s*\w+/,
  /loading.state/i,
  /shimmer/i,
];

// ── CRUD patterns ──
const CRUD_PATTERNS = [
  /\.insert\s*\(/,
  /\.update\s*\(/,
  /\.delete\s*\(/,
  /\.upsert\s*\(/,
  /useMutation/,
  /handleCreate/,
  /handleUpdate/,
  /handleDelete/,
  /handleSave/,
  /onSubmit/,
];

// ── Export patterns ──
const EXPORT_PATTERNS = [
  /exportCSV/i,
  /exportToCsv/i,
  /exportToCSV/i,
  /exportPDF/i,
  /download.*csv/i,
  /download.*pdf/i,
  /blob.*csv/i,
  /text\/csv/,
  /application\/pdf/,
];

function walkPages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPages(resolved));
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(resolved);
    }
  }
  return files;
}

function testPatterns(content, patterns) {
  return patterns.some((p) => p.test(content));
}

function countPatternMatches(content, patterns) {
  return patterns.filter((p) => p.test(content)).length;
}

function classifyPage(filePath) {
  const relPath = path.relative(projectRoot, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  const hasLiveData = testPatterns(content, LIVE_PATTERNS);
  const hasDemoLabel = testPatterns(content, DEMO_PATTERNS);
  const hasEmptyState = testPatterns(content, EMPTY_STATE_PATTERNS);
  const hasErrorState = testPatterns(content, ERROR_STATE_PATTERNS);
  const hasLoadingState = testPatterns(content, LOADING_STATE_PATTERNS);
  const hasCrud = testPatterns(content, CRUD_PATTERNS);
  const hasExport = testPatterns(content, EXPORT_PATTERNS);

  // Compute feature score (0-7)
  const features = {
    live_data: hasLiveData,
    demo_labeled: hasDemoLabel,
    empty_state: hasEmptyState,
    error_state: hasErrorState,
    loading_state: hasLoadingState,
    crud: hasCrud,
    export: hasExport,
  };
  const featureScore = Object.values(features).filter(Boolean).length;

  // Classification logic
  let classification;
  if (hasLiveData) {
    classification = 'LIVE';
  } else if (hasDemoLabel && (hasEmptyState || hasErrorState || hasLoadingState)) {
    classification = 'DEMO';
  } else if (hasDemoLabel) {
    classification = 'DEMO';
  } else {
    classification = 'SHELL';
  }

  // Determine hub from path
  const parts = relPath.replace('src/pages/', '').split('/');
  const hub = parts[0] || 'unknown';

  return {
    file: relPath,
    hub,
    classification,
    features,
    feature_score: featureScore,
  };
}

// ── Main ──
const pagesDir = path.join(projectRoot, 'src', 'pages');
if (!fs.existsSync(pagesDir)) {
  console.error('src/pages/ not found');
  process.exit(1);
}

const pageFiles = walkPages(pagesDir);
const results = pageFiles.map(classifyPage);

// Aggregate
const summary = {
  total: results.length,
  live: results.filter((r) => r.classification === 'LIVE').length,
  demo: results.filter((r) => r.classification === 'DEMO').length,
  shell: results.filter((r) => r.classification === 'SHELL').length,
  shell_rate: '0.0',
};
summary.shell_rate = summary.total > 0
  ? ((summary.shell / summary.total) * 100).toFixed(1)
  : '0.0';

// Group by hub
const byHub = {};
for (const r of results) {
  if (!byHub[r.hub]) byHub[r.hub] = { live: 0, demo: 0, shell: 0, pages: [] };
  byHub[r.hub][r.classification.toLowerCase()]++;
  byHub[r.hub].pages.push({ file: r.file, classification: r.classification, feature_score: r.feature_score });
}

const report = {
  scan_date: new Date().toISOString(),
  summary,
  by_hub: byHub,
  classifications: results,
};

// Write report
fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n', 'utf8');

// ── Baseline mode ──
if (writeBaseline) {
  const baseline = {
    created: new Date().toISOString(),
    shell_count: summary.shell,
    shell_files: results
      .filter((r) => r.classification === 'SHELL')
      .map((r) => r.file)
      .sort(),
  };
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
  console.log(`Shell detector baseline written: ${summary.shell} shells tracked`);
  console.log(`Report: docs/qa/shell_detector_report.json`);
  console.log(`Baseline: docs/qa/shell_detector_baseline.json`);
  process.exit(0);
}

// ── CI gate mode (default) ──
console.log(`Shell Detector Report`);
console.log(`─────────────────────`);
console.log(`Total pages: ${summary.total}`);
console.log(`  LIVE:  ${summary.live}`);
console.log(`  DEMO:  ${summary.demo}`);
console.log(`  SHELL: ${summary.shell} (${summary.shell_rate}%)`);
console.log('');

// Per-hub breakdown
for (const [hub, data] of Object.entries(byHub).sort()) {
  const total = data.live + data.demo + data.shell;
  console.log(`  ${hub}: ${data.live}L / ${data.demo}D / ${data.shell}S (${total} total)`);
}

// Regression check against baseline
if (!fs.existsSync(baselineFile)) {
  console.log('\nNo baseline found. Run: npm run shell:baseline');
  console.log('Report written: docs/qa/shell_detector_report.json');
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const baselineShells = new Set(baseline.shell_files);
const currentShells = results
  .filter((r) => r.classification === 'SHELL')
  .map((r) => r.file);
const newShells = currentShells.filter((f) => !baselineShells.has(f));
const removedShells = [...baselineShells].filter(
  (f) => !currentShells.includes(f)
);

console.log(`\nBaseline: ${baseline.shell_count} shells (${baseline.created})`);
console.log(`Current:  ${summary.shell} shells`);

if (removedShells.length > 0) {
  console.log(`\nShells FIXED (${removedShells.length}):`);
  for (const f of removedShells) console.log(`  - ${f}`);
}

if (newShells.length > 0) {
  console.error(`\nNEW SHELLS DETECTED (${newShells.length}) — MERGE BLOCKED:`);
  for (const f of newShells) console.error(`  + ${f}`);
  console.error('\nFix these pages or update baseline: npm run shell:baseline');
  process.exit(1);
}

console.log('\nNo new shells introduced. Gate passed.');
console.log('Report written: docs/qa/shell_detector_report.json');
process.exit(0);
