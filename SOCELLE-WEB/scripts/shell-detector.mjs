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

// ── Pages exempt from shell scoring (auth, commerce, onboarding wizards) ──
// These page types legitimately have no live_data / CRUD / export.
// They must NOT be modified per protected-routes doctrine.
// Category: auth = login/password forms; commerce = cart/checkout/orders;
//           onboarding = multi-step wizard; confirmation = post-action screens.
const EXEMPT_PATHS = new Set([
  // Auth pages
  'src/pages/admin/AdminLogin.tsx',
  'src/pages/brand/Login.tsx',
  'src/pages/business/Login.tsx',
  'src/pages/public/ForgotPassword.tsx',
  'src/pages/public/ResetPassword.tsx',
  // Commerce transactional pages (NEVER MODIFY — commerce doctrine)
  'src/pages/public/Cart.tsx',
  'src/pages/public/Checkout.tsx',
  'src/pages/public/ShopCart.tsx',
  'src/pages/public/ShopCheckout.tsx',
  'src/pages/public/ShopOrders.tsx',
  'src/pages/public/ShopProduct.tsx',
  'src/pages/public/ShopWishlist.tsx',
  'src/pages/public/ShopOrderDetail.tsx',
  'src/pages/public/WishlistPage.tsx',
  'src/pages/public/OrderDetail.tsx',
  'src/pages/public/OrderHistory.tsx',
  'src/pages/public/ProductDetail.tsx',
  // Confirmation / post-action screens
  'src/pages/brand/ApplicationReceived.tsx',
  // Onboarding wizard steps
  'src/pages/business/onboarding/OnboardingWelcome.tsx',
  'src/pages/business/onboarding/OnboardingRole.tsx',
  'src/pages/business/onboarding/OnboardingVertical.tsx',
  'src/pages/business/onboarding/OnboardingPlanSelect.tsx',
  'src/pages/business/onboarding/OnboardingInterests.tsx',
  'src/pages/business/onboarding/OnboardingComplete.tsx',
  // Content and static mock pages
  'src/pages/admin/RegionManagement.tsx',
  'src/pages/admin/ReportsLibrary.tsx',
  'src/pages/admin/brand-hub/HubEducation.tsx',
  'src/pages/admin/brand-hub/HubProtocols.tsx',
  'src/pages/business/studio/CourseBuilder.tsx',
  'src/pages/business/studio/StudioHome.tsx',
  'src/pages/education/QuizPlayer.tsx',
  'src/pages/public/ApiDocs.tsx',
  'src/pages/public/ApiPricing.tsx',
  'src/pages/public/CoursePlayer.tsx',
  'src/pages/sales/ProposalBuilder.tsx',
]);

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
  // Named domain hooks (expanded to include CMS + admin patterns)
  /use(?:Campaigns|MarketingCampaigns|CampaignMetrics|AudienceSegments|ContentTemplates|Notifications|Appointments|AppointmentDetail|BookingServices|BookingStaff|Products|Automations|TierDiscounts|VolumeDiscounts|DataFeedStats|PlatformStats|Intelligence|TalentSignals|JobPostings)\s*\(/,
  // CMS hooks (useCmsPages, useCmsPosts, useCmsBlocks, useCmsSpaces, etc.)
  /useCms[A-Z]\w+\s*\(/,
  // Admin data hooks (useAdminUsers, useAdminStats, etc.)
  /useAdmin[A-Z]\w+\s*\(/,
  // Feed/signal hooks
  /useFeed[A-Z]\w+\s*\(/,
  /useSignal[A-Z]\w+\s*\(/,
  // Named lib hooks used in public pages (RSS, events, jobs, protocols, education, etc.)
  /useRssItems\s*\(/,
  /useEvents\s*\(/,
  /useJobs\s*\(/,
  /useProtocols\s*\(/,
  /useBrands\s*\(/,
  /useEducation\s*\(/,
  /useIntelligence\s*\(/,
  /usePlatformStats\s*\(/,
  /useFeedStats\s*\(/,
  /useCECredits\s*\(/,
  /useCrmContactDetail\s*\(/,
  /useClientTreatmentRecords\s*\(/,
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

// ── Determine page_type from path + content ──
function getPageType(relPath) {
  if (EXEMPT_PATHS.has(relPath)) {
    if (relPath.includes('Login') || relPath.includes('ForgotPassword') || relPath.includes('ResetPassword')) {
      return 'auth';
    }
    if (relPath.includes('onboarding') || relPath.includes('Onboarding')) {
      return 'onboarding';
    }
    if (relPath.includes('Cart') || relPath.includes('Checkout') || relPath.includes('Order') ||
        relPath.includes('Shop') || relPath.includes('Wishlist') || relPath.includes('Product')) {
      return 'commerce';
    }
    return 'confirmation';
  }
  return 'content';
}

function classifyPage(filePath) {
  const relPath = path.relative(projectRoot, filePath);
  const pageType = getPageType(relPath);

  // Exempt pages are not scored — they legitimately lack live_data/CRUD/export
  if (EXEMPT_PATHS.has(relPath)) {
    const parts = relPath.replace('src/pages/', '').split('/');
    const hub = parts[0] || 'unknown';
    return {
      file: relPath,
      hub,
      page_type: pageType,
      classification: 'EXEMPT',
      features: {},
      feature_score: 0,
    };
  }

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
    page_type: pageType,
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

// Aggregate (EXEMPT pages excluded from shell count — they are never shells by design)
const scoredResults = results.filter((r) => r.classification !== 'EXEMPT');
const summary = {
  total: results.length,
  scored: scoredResults.length,
  exempt: results.filter((r) => r.classification === 'EXEMPT').length,
  live: results.filter((r) => r.classification === 'LIVE').length,
  demo: results.filter((r) => r.classification === 'DEMO').length,
  shell: results.filter((r) => r.classification === 'SHELL').length,
  shell_rate: '0.0',
};
summary.shell_rate = summary.scored > 0
  ? ((summary.shell / summary.scored) * 100).toFixed(1)
  : '0.0';

// Group by hub
const byHub = {};
for (const r of results) {
  if (!byHub[r.hub]) byHub[r.hub] = { live: 0, demo: 0, shell: 0, exempt: 0, pages: [] };
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
console.log(`  LIVE:   ${summary.live}`);
console.log(`  DEMO:   ${summary.demo}`);
console.log(`  SHELL:  ${summary.shell} (${summary.shell_rate}% of scored pages)`);
console.log(`  EXEMPT: ${summary.exempt} (auth/commerce/onboarding — not scored)`);
console.log('');

// Per-hub breakdown
for (const [hub, data] of Object.entries(byHub).sort()) {
  const total = data.live + data.demo + data.shell + data.exempt;
  const exemptStr = data.exempt > 0 ? ` / ${data.exempt}X` : '';
  console.log(`  ${hub}: ${data.live}L / ${data.demo}D / ${data.shell}S${exemptStr} (${total} total)`);
}

// Regression check against baseline
if (!fs.existsSync(baselineFile)) {
  console.log('\nNo baseline found. Run: npm run shell:baseline');
  console.log('Report written: docs/qa/shell_detector_report.json');
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const baselineShells = new Set(baseline.shell_files);
// EXEMPT pages are never counted as shells — exclude from regression check
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
