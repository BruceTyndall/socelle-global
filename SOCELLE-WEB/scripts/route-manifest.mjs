#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const appFile = path.join(projectRoot, 'src', 'App.tsx');
const manifestFile = path.join(projectRoot, 'docs', 'qa', 'route_manifest.generated.json');
const shouldWrite = process.argv.includes('--write');

function readRoutesFromApp() {
  const source = fs.readFileSync(appFile, 'utf8');
  const pattern = /<Route\s+path="([^"]+)"/g;
  const routes = [...source.matchAll(pattern)].map((match) => match[1]);
  return [...new Set(routes)].sort((a, b) => a.localeCompare(b));
}

function groupRoute(pathname) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/brand')) return 'brand';
  if (pathname.startsWith('/portal')) return 'portal';
  if (pathname.startsWith('/spa')) return 'legacy';
  if (pathname.startsWith('/marketing')) return 'marketing';
  return 'public';
}

function buildManifest(routes) {
  const groups = {
    public: 0,
    portal: 0,
    brand: 0,
    admin: 0,
    legacy: 0,
    marketing: 0,
  };

  for (const route of routes) {
    groups[groupRoute(route)] += 1;
  }

  return {
    source: 'src/App.tsx',
    total: routes.length,
    groups,
    routes,
  };
}

function diffRoutes(previous, next) {
  const prevSet = new Set(previous);
  const nextSet = new Set(next);

  const added = [...nextSet].filter((item) => !prevSet.has(item)).sort((a, b) => a.localeCompare(b));
  const removed = [...prevSet].filter((item) => !nextSet.has(item)).sort((a, b) => a.localeCompare(b));

  return { added, removed };
}

const routes = readRoutesFromApp();
const manifest = buildManifest(routes);

if (shouldWrite) {
  fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Route manifest written: ${path.relative(projectRoot, manifestFile)} (${manifest.total} routes)`);
  process.exit(0);
}

if (!fs.existsSync(manifestFile)) {
  console.error(`Route manifest missing: ${path.relative(projectRoot, manifestFile)}`);
  console.error('Run: npm run routes:manifest');
  process.exit(1);
}

const current = JSON.stringify(manifest.routes);
const recorded = JSON.stringify(JSON.parse(fs.readFileSync(manifestFile, 'utf8')).routes ?? []);

if (current === recorded) {
  console.log(`Route manifest check passed (${manifest.total} routes).`);
  process.exit(0);
}

const savedManifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const { added, removed } = diffRoutes(savedManifest.routes ?? [], manifest.routes);

console.error('Route manifest drift detected.');
if (added.length) {
  console.error('\nAdded routes:');
  for (const route of added) {
    console.error(`  + ${route}`);
  }
}
if (removed.length) {
  console.error('\nRemoved routes:');
  for (const route of removed) {
    console.error(`  - ${route}`);
  }
}
console.error('\nRun: npm run routes:manifest');
process.exit(1);
