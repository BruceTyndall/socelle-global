#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const baselineFile = path.join(projectRoot, 'docs', 'qa', 'fake_live_baseline.json');
const targets = [
  path.join(projectRoot, 'src', 'pages', 'public'),
  path.join(projectRoot, 'src', 'lib'),
];

const writeBaseline = process.argv.includes('--write-baseline');
const violationPattern = /\b(coming soon|mock|stub)\b/i;
const allowedInlinePattern = /\b(demo|preview)\b/i;

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(resolved));
      continue;
    }

    if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(resolved);
    }
  }

  return files;
}

function collectViolations() {
  const violations = [];

  for (const target of targets) {
    if (!fs.existsSync(target)) continue;

    for (const file of walkFiles(target)) {
      const relPath = path.relative(projectRoot, file);
      const lines = fs.readFileSync(file, 'utf8').split('\n');

      lines.forEach((line, index) => {
        if (!violationPattern.test(line)) return;
        if (allowedInlinePattern.test(line)) return;

        const normalized = line.trim().replace(/\s+/g, ' ');
        const id = `${relPath}:${index + 1}:${normalized}`;

        violations.push({
          id,
          file: relPath,
          line: index + 1,
          snippet: normalized,
        });
      });
    }
  }

  return violations.sort((a, b) => a.id.localeCompare(b.id));
}

const violations = collectViolations();

if (writeBaseline) {
  fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
  fs.writeFileSync(
    baselineFile,
    `${JSON.stringify({
      scope: ['src/pages/public', 'src/lib'],
      total: violations.length,
      entries: violations,
    }, null, 2)}\n`,
    'utf8',
  );
  console.log(`Fake-live baseline written: ${path.relative(projectRoot, baselineFile)} (${violations.length} entries)`);
  process.exit(0);
}

if (!fs.existsSync(baselineFile)) {
  console.error(`Baseline missing: ${path.relative(projectRoot, baselineFile)}`);
  console.error('Run: npm run fakelive:baseline');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const baselineIds = new Set((baseline.entries ?? []).map((entry) => entry.id));

const regressions = violations.filter((entry) => !baselineIds.has(entry.id));

if (!regressions.length) {
  console.log(`Fake-live guard passed (${violations.length} tracked entries, 0 regressions).`);
  process.exit(0);
}

console.error('Fake-live regression detected in public/lib surfaces:');
for (const entry of regressions) {
  console.error(`- ${entry.file}:${entry.line} :: ${entry.snippet}`);
}
console.error('\nIf intentional, update baseline: npm run fakelive:baseline');
process.exit(1);
