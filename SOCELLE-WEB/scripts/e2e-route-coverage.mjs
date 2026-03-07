#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const appSource = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf8');
const routeTableSource = fs.readFileSync(path.join(projectRoot, 'e2e', 'routeTable.ts'), 'utf8');

const appRoutePattern = /<Route\s+path="([^"]+)"/g;
const tableRoutePattern = /\{\s*path:\s*'([^']+)'/g;

const appRoutes = [...new Set([...appSource.matchAll(appRoutePattern)].map((m) => m[1]))];
const tableRoutes = [...new Set([...routeTableSource.matchAll(tableRoutePattern)].map((m) => m[1]))];

const appAbsoluteRoutes = appRoutes.filter((route) => route.startsWith('/'));
const appRelativeRoutes = appRoutes.filter((route) => !route.startsWith('/') && route !== '*');
const nestedBases = ['/portal', '/brand', '/admin', '/marketing'];
const derivedNestedRoutes = appRelativeRoutes.flatMap((route) =>
  nestedBases.map((base) => `${base}/${route}`.replace(/\/+/g, '/'))
);
const appRouteCandidates = [...new Set([...appAbsoluteRoutes, ...derivedNestedRoutes])];
const smokeRoutes = tableRoutes.filter((route) => route.startsWith('/'));

function routePatternToRegex(routePattern) {
  const withTokens = routePattern
    .replace(/\*/g, '__WILDCARD__')
    .replace(/:[^/]+/g, '__PARAM__');

  const escaped = withTokens
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/__PARAM__/g, '[^/]+')
    .replace(/__WILDCARD__/g, '.*');
  return new RegExp(`^${escaped}$`);
}

const appRouteRegexes = appRouteCandidates.map((routePattern) => ({
  routePattern,
  regex: routePatternToRegex(routePattern),
}));

const invalidSmokeRoutes = smokeRoutes
  .filter((smokeRoute) => !appRouteRegexes.some(({ regex }) => regex.test(smokeRoute)))
  .sort((a, b) => a.localeCompare(b));

const unresolvedAppRoutes = appRouteCandidates
  .filter((appRoute) => !appRouteRegexes.some(({ regex }) => regex.test(appRoute)))
  .sort((a, b) => a.localeCompare(b));

console.log(`E2E smoke route entries: ${smokeRoutes.length}`);
console.log(`App route patterns (absolute + derived nested): ${appRouteCandidates.length}`);

if (invalidSmokeRoutes.length) {
  console.error('\nSmoke routes not matched by any App.tsx route pattern:');
  for (const route of invalidSmokeRoutes) {
    console.error(`  - ${route}`);
  }
}

if (unresolvedAppRoutes.length) {
  console.error('\nApp route patterns with no self-match (invalid pattern parsing):');
  for (const route of unresolvedAppRoutes) {
    console.error(`  - ${route}`);
  }
}

if (invalidSmokeRoutes.length || unresolvedAppRoutes.length) {
  process.exit(1);
}

console.log('E2E route table check passed (all smoke routes map to live route patterns).');
