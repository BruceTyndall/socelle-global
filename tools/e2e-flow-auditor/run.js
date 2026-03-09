#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const REPO_ROOT = process.cwd();
const WEB_ROOT = path.join(REPO_ROOT, 'SOCELLE-WEB');
const QA_ROOT = path.join(REPO_ROOT, 'docs', 'qa');

function fail(message) {
  console.error(`[audit:flow] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(WEB_ROOT)) {
  fail(`SOCELLE-WEB not found at ${WEB_ROOT}`);
}

function formatTimestamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
  ].join('') + '_' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join('');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function readFileSafe(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnv() {
  const files = [
    path.join(REPO_ROOT, '.env'),
    path.join(WEB_ROOT, '.env'),
  ];
  for (const file of files) {
    const parsed = parseEnvFile(file);
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function parseStringArray(arrayLiteral = '') {
  const values = [];
  const re = /'([^']+)'/g;
  let m = re.exec(arrayLiteral);
  while (m) {
    values.push(m[1]);
    m = re.exec(arrayLiteral);
  }
  return values;
}

function parseRouteTable() {
  const file = path.join(WEB_ROOT, 'e2e', 'routeTable.ts');
  const src = readFileSafe(file);
  const blocks = src.match(/\{[\s\S]*?\}/g) || [];
  const rows = [];

  for (const block of blocks) {
    if (!/path:\s*'/.test(block) || !/access:\s*'/.test(block)) continue;
    const pathMatch = block.match(/path:\s*'([^']+)'/);
    const accessMatch = block.match(/access:\s*'([^']+)'/);
    const componentMatch = block.match(/component:\s*'([^']+)'/);
    const rolesMatch = block.match(/requiredRoles:\s*\[([\s\S]*?)\]/);
    const depsMatch = block.match(/dependencies:\s*\[([\s\S]*?)\]/);
    if (!pathMatch || !accessMatch) continue;

    rows.push({
      path: pathMatch[1],
      component: componentMatch ? componentMatch[1] : null,
      access: accessMatch[1],
      requiredRoles: parseStringArray(rolesMatch ? rolesMatch[1] : ''),
      dependencies: parseStringArray(depsMatch ? depsMatch[1] : ''),
      source: 'SOCELLE-WEB/e2e/routeTable.ts',
    });
  }

  return dedupeBy(rows, (r) => r.path);
}

function parseAppRoutePatterns() {
  const file = path.join(WEB_ROOT, 'src', 'App.tsx');
  const src = readFileSafe(file);
  const pattern = /<Route\s+path="([^"]+)"/g;
  const routes = [];
  let m = pattern.exec(src);
  while (m) {
    routes.push(m[1]);
    m = pattern.exec(src);
  }
  return [...new Set(routes)].sort((a, b) => a.localeCompare(b));
}

function sampleFromPattern(routePattern) {
  if (routePattern === '*') return null;
  let route = routePattern.replace(/:token\b/g, 'sample-token');
  route = route.replace(/:slug\b/g, 'sample-slug');
  route = route.replace(/:id\b/g, 'sample-id');
  route = route.replace(/:([^/]+)/g, (_, p1) => `sample-${p1.toLowerCase()}`);
  route = route.replace(/\*$/, '');
  route = route.replace(/\/+/g, '/');
  if (!route) route = '/';
  return route;
}

function inferAccess(route) {
  if (route.startsWith('/admin')) return 'admin';
  if (route.startsWith('/brand')) return 'brand';
  if (route.startsWith('/portal') && !['/portal', '/portal/login', '/portal/signup'].includes(route)) return 'business';
  if (route.startsWith('/spa')) return 'legacy_redirect';
  if (route.startsWith('/marketing')) return 'multi_role';
  return 'public';
}

function inferRequiredRoles(access) {
  if (access === 'admin') return ['admin', 'platform_admin'];
  if (access === 'brand') return ['brand_admin', 'admin', 'platform_admin'];
  if (access === 'business') return ['business_user', 'admin', 'platform_admin'];
  if (access === 'multi_role') return ['business_user', 'brand_admin', 'admin', 'platform_admin'];
  return [];
}

function inferModuleGate(route) {
  if (/^\/(shop|cart|checkout|account\/orders|account\/wishlist)/.test(route)) return 'MODULE_SHOP';
  if (/^\/(sales|portal\/sales|admin\/sales-platform)/.test(route.replace(/^\//, ''))) return 'MODULE_SALES';
  if (/^\/(marketing|portal\/marketing|portal\/marketing-hub)/.test(route.replace(/^\//, ''))) return 'MODULE_MARKETING';
  if (/^\/ingredients/.test(route)) return 'MODULE_INGREDIENTS';
  if (/^\/(courses|education\/courses|education\/ce-credits|my-certificates)/.test(route.replace(/^\//, ''))) return 'MODULE_EDUCATION';
  if (/^\/portal\/(crm|booking|prospects)/.test(route)) return 'MODULE_CRM';
  if (/^\/portal\/reseller/.test(route)) return 'MODULE_RESELLER';
  return null;
}

function buildRouteInventory() {
  const routeTable = parseRouteTable();
  const routeTableByPath = new Map(routeTable.map((r) => [r.path, r]));

  const rawPatterns = parseAppRoutePatterns();
  const absolutePatterns = rawPatterns.filter((r) => r.startsWith('/'));
  const relativePatterns = rawPatterns.filter((r) => !r.startsWith('/') && r !== '*');
  const nestedBases = ['/portal', '/brand', '/admin', '/marketing'];
  const derivedPatterns = relativePatterns.flatMap((r) =>
    nestedBases.map((base) => `${base}/${r}`.replace(/\/+/g, '/')),
  );

  const allPatterns = [...new Set([...absolutePatterns, ...derivedPatterns, ...routeTable.map((r) => r.path)])];

  const inventory = allPatterns
    .map((pattern) => {
      const sampleRoute = sampleFromPattern(pattern);
      if (!sampleRoute) return null;
      const fromTable = routeTableByPath.get(pattern) || routeTableByPath.get(sampleRoute) || null;
      const access = fromTable?.access || inferAccess(sampleRoute);
      const requiredRoles = (fromTable?.requiredRoles && fromTable.requiredRoles.length > 0)
        ? fromTable.requiredRoles
        : inferRequiredRoles(access);
      const dependencies = fromTable?.dependencies || [];
      return {
        route_pattern: pattern,
        route: sampleRoute,
        access,
        required_roles: requiredRoles,
        module_gate: inferModuleGate(sampleRoute),
        dependencies,
        source: fromTable?.source || 'SOCELLE-WEB/src/App.tsx',
      };
    })
    .filter(Boolean);

  return dedupeBy(inventory, (r) => r.route_pattern).sort((a, b) => a.route_pattern.localeCompare(b.route_pattern));
}

function sortRoutes(routes) {
  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

function prioritizeRoutes(candidates, priority, limit) {
  const byRoute = new Map(candidates.map((r) => [r.route, r]));
  const ordered = [];

  for (const route of priority) {
    if (byRoute.has(route)) ordered.push(byRoute.get(route));
  }

  for (const row of sortRoutes(candidates)) {
    if (!ordered.find((x) => x.route === row.route)) {
      ordered.push(row);
    }
  }

  return ordered.slice(0, limit);
}

function buildRouteBuckets(inventory) {
  const publicCandidates = inventory.filter((r) => ['public', 'legacy_redirect'].includes(r.access));
  const businessCandidates = inventory.filter((r) => r.access === 'business' || r.route.startsWith('/portal') || r.route.startsWith('/sales'));
  const brandCandidates = inventory.filter((r) => r.access === 'brand' || r.route.startsWith('/brand'));
  const adminCandidates = inventory.filter((r) => r.access === 'admin' || r.route.startsWith('/admin'));

  const publicPriority = [
    '/', '/home', '/intelligence', '/intelligence/briefs', '/brands', '/education', '/education/courses', '/events',
    '/jobs', '/protocols', '/ingredients', '/shop', '/shop/cart', '/request-access', '/pricing', '/plans',
    '/how-it-works', '/about', '/faq', '/stories', '/blog', '/help', '/portal/login', '/brand/login', '/admin/login',
  ];
  const professionalPriority = [
    '/portal/dashboard', '/portal/intelligence', '/portal/plans', '/portal/orders', '/portal/crm', '/portal/crm/contacts',
    '/portal/booking', '/portal/prospects', '/portal/sales', '/portal/marketing', '/portal/studio', '/portal/credits',
    '/portal/affiliates', '/portal/reseller', '/portal/benchmarks', '/marketing', '/sales',
  ];
  const brandPriority = [
    '/brand/dashboard', '/brand/intelligence', '/brand/products', '/brand/orders', '/brand/campaigns', '/brand/automations',
    '/brand/promotions', '/brand/customers', '/brand/crm/leads', '/brand/crm/pipeline', '/brand/messages',
  ];
  const adminPriority = [
    '/admin/dashboard', '/admin/brands', '/admin/orders', '/admin/market-signals', '/admin/intelligence',
    '/admin/crm', '/admin/sales', '/admin/editorial', '/admin/feeds', '/admin/blog', '/admin/education',
    '/admin/ingredients', '/admin/cms', '/admin/shop', '/admin/subscriptions', '/admin/feature-flags',
    '/admin/shell-detection', '/admin/inventory-report',
  ];

  return {
    public: prioritizeRoutes(publicCandidates, publicPriority, 40),
    professional: prioritizeRoutes(businessCandidates, professionalPriority, 28),
    brand: prioritizeRoutes(brandCandidates, brandPriority, 22),
    admin: prioritizeRoutes(adminCandidates, adminPriority, 24),
  };
}

async function canReach(url) {
  try {
    const response = await fetch(url, { redirect: 'manual' });
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await canReach(url)) return true;
    await wait(1000);
  }
  return false;
}

function startDevServer(logFile, port) {
  const out = fs.createWriteStream(logFile, { flags: 'a' });
  const cmd = spawn('npm', ['--prefix', WEB_ROOT, 'run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  cmd.stdout.pipe(out);
  cmd.stderr.pipe(out);
  return cmd;
}

function stopProcess(proc) {
  if (!proc || proc.killed) return;
  proc.kill('SIGTERM');
}

async function loadPlaywright() {
  const candidates = [
    '@playwright/test',
    path.join(WEB_ROOT, 'node_modules', '@playwright', 'test', 'index.js'),
  ];

  for (const candidate of candidates) {
    try {
      if (candidate.startsWith('@')) {
        return await import(candidate);
      }
      if (fs.existsSync(candidate)) {
        return await import(pathToFileURL(candidate).href);
      }
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    'Playwright dependency missing. Install with: npm --prefix SOCELLE-WEB install',
  );
}

function sanitizeRouteForFile(route) {
  const cleaned = route
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '-')
    .replace(/\//g, '__')
    .replace(/-+/g, '-');
  return cleaned || 'root';
}

function shortText(input, max = 140) {
  const text = String(input || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function classifyGate(route, finalUrl, bodyText) {
  const lowerBody = (bodyText || '').toLowerCase();
  if (!route.includes('/login') && finalUrl.includes('/login')) return 'redirect_to_login';
  if (lowerBody.includes('access restricted') || lowerBody.includes('access denied')) return 'role_restricted';
  if (lowerBody.includes('upgrade') && lowerBody.includes('module')) return 'module_locked';
  if (lowerBody.includes('role missing')) return 'profile_role_missing';
  return null;
}

function classifySeverity(issueType, status) {
  if (issueType === 'exception' || issueType === 'request_failed') return 'P0';
  if (status >= 500) return 'P0';
  if (status >= 400) return 'P1';
  if (issueType === 'dead_end' || issueType === 'permission_trap' || issueType === 'confusing_loop') return 'P1';
  return 'P2';
}

function newBlockedAuthRow(userType, reason, requirements = []) {
  return {
    user_type: userType,
    reason,
    requirements,
  };
}

async function fillLoginForm(page, email, password) {
  try {
    await page.getByLabel(/email/i).first().fill(email);
  } catch {
    await page.locator('input[type="email"], input[name*="email" i]').first().fill(email);
  }

  try {
    await page.getByLabel(/password/i).first().fill(password);
  } catch {
    await page.locator('input[type="password"], input[name*="password" i]').first().fill(password);
  }
}

async function submitLogin(page, buttonRegex) {
  try {
    await page.getByRole('button', { name: buttonRegex }).first().click();
    return;
  } catch {
    // fallback below
  }
  await page.locator('button[type="submit"], input[type="submit"], button').first().click();
}

async function attemptLogin(page, baseUrl, config) {
  const { userType, loginPath, successRegex, submitRegex, emailEnv, passwordEnv } = config;
  const email = process.env[emailEnv];
  const password = process.env[passwordEnv];

  if (!email || !password) {
    return {
      attempted: false,
      success: false,
      blocked: true,
      reason: 'missing_credentials',
      required_env: [emailEnv, passwordEnv],
      user_type: userType,
    };
  }

  try {
    await page.goto(`${baseUrl}${loginPath}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await fillLoginForm(page, email, password);
    await submitLogin(page, submitRegex);
    await page.waitForTimeout(2000);
    const url = page.url();
    if (successRegex.test(url)) {
      return {
        attempted: true,
        success: true,
        blocked: false,
        reason: null,
        required_env: [],
        user_type: userType,
      };
    }
    const bodyText = await page.locator('body').innerText().catch(() => '');
    return {
      attempted: true,
      success: false,
      blocked: true,
      reason: shortText(bodyText || `login did not reach expected URL (${url})`, 200),
      required_env: [],
      user_type: userType,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      blocked: true,
      reason: shortText(error instanceof Error ? error.message : String(error), 200),
      required_env: [],
      user_type: userType,
    };
  }
}

async function collectClickables(page, max = 24) {
  return page.$$eval(
    'a[href], button, [role="button"], input[type="submit"], input[type="button"]',
    (els, limit) =>
      els.slice(0, limit).map((el, index) => {
        const href = el.tagName.toLowerCase() === 'a' ? el.getAttribute('href') : null;
        const text = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('value') || '')
          .replace(/\s+/g, ' ')
          .trim();
        const role = el.getAttribute('role');
        return {
          index,
          tag: el.tagName.toLowerCase(),
          href,
          role,
          text: text.slice(0, 120),
          disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
        };
      }),
    max,
  );
}

function shouldSkipClick(text = '') {
  return /(logout|sign out|delete|remove|destroy|cancel subscription|remove account)/i.test(text);
}

async function clickExercise(page, baseUrl, route, maxClicks = 6) {
  const selector = 'a[href], button, [role="button"], input[type="submit"], input[type="button"]';
  const locator = page.locator(selector);
  const total = await locator.count();
  const attempts = Math.min(total, maxClicks);
  const outcomes = [];

  for (let i = 0; i < attempts; i += 1) {
    const el = locator.nth(i);
    const meta = await el.evaluate((node) => {
      const href = node.tagName.toLowerCase() === 'a' ? node.getAttribute('href') : null;
      const text = (node.textContent || node.getAttribute('aria-label') || node.getAttribute('value') || '')
        .replace(/\s+/g, ' ')
        .trim();
      return {
        tag: node.tagName.toLowerCase(),
        href,
        text: text.slice(0, 140),
      };
    }).catch(() => ({ tag: 'unknown', href: null, text: '' }));

    if (shouldSkipClick(meta.text)) {
      outcomes.push({ index: i, ...meta, outcome: 'skipped_destructive' });
      continue;
    }

    const visible = await el.isVisible().catch(() => false);
    if (!visible) {
      outcomes.push({ index: i, ...meta, outcome: 'not_visible' });
      continue;
    }

    const before = page.url();
    try {
      await el.click({ timeout: 2000 });
      await page.waitForTimeout(700);
      const after = page.url();
      const navigated = before !== after;
      outcomes.push({
        index: i,
        ...meta,
        outcome: navigated ? 'navigated' : 'no_url_change',
        from_url: before,
        to_url: after,
      });

      if (navigated) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(250);
      }
    } catch (error) {
      outcomes.push({
        index: i,
        ...meta,
        outcome: 'click_error',
        error: shortText(error instanceof Error ? error.message : String(error), 180),
      });
    }
  }

  return outcomes;
}

async function run() {
  loadEnv();

  const timestamp = formatTimestamp(new Date());
  const reportFile = path.join(QA_ROOT, `e2e-flow-audit_${timestamp}.json`);
  const artifactRoot = path.join(QA_ROOT, `e2e-flow-audit_${timestamp}`);
  const screensDir = path.join(artifactRoot, 'screens');
  const logsDir = path.join(artifactRoot, 'logs');
  ensureDir(QA_ROOT);
  ensureDir(screensDir);
  ensureDir(logsDir);

  const port = Number(process.env.AUDIT_FLOW_PORT || 4173);
  const baseUrl = process.env.AUDIT_BASE_URL || `http://127.0.0.1:${port}`;
  const devServerLog = path.join(logsDir, 'dev-server.log');
  const runLog = path.join(logsDir, 'run.log');

  const appendRunLog = (line) => {
    fs.appendFileSync(runLog, `${line}\n`, 'utf8');
  };

  appendRunLog(`[start] ${new Date().toISOString()}`);
  appendRunLog(`[config] baseUrl=${baseUrl}`);

  let devServer = null;
  const serverUp = await canReach(baseUrl);
  if (!serverUp) {
    appendRunLog('[server] no running server detected; starting SOCELLE-WEB dev server');
    devServer = startDevServer(devServerLog, port);
    const ready = await waitForServer(baseUrl);
    if (!ready) {
      stopProcess(devServer);
      fail(`Could not reach ${baseUrl}. See ${devServerLog}`);
    }
    appendRunLog('[server] dev server started');
  } else {
    appendRunLog('[server] existing server detected');
  }

  const routeInventory = buildRouteInventory();
  const routeBuckets = buildRouteBuckets(routeInventory);

  const blockedByAuth = [];
  const clickMap = [];
  const errorList = [];
  const deadEnds = [];
  const screenshotsManifest = [];
  const routeRuns = [];
  const confusingLoops = [];

  let browser = null;
  const playwright = await loadPlaywright().catch((error) => {
    stopProcess(devServer);
    fail(error instanceof Error ? error.message : String(error));
  });
  const chromium = playwright.chromium || playwright.default?.chromium;
  if (!chromium) {
    stopProcess(devServer);
    fail('Playwright chromium launcher unavailable');
  }

  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    stopProcess(devServer);
    fail(`Chromium launch failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  async function auditSession(sessionConfig) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const currentRoute = { value: null };

    const sessionLog = path.join(logsDir, `${sessionConfig.name}.log`);
    const appendSessionLog = (entry) => fs.appendFileSync(sessionLog, `${JSON.stringify(entry)}\n`, 'utf8');

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const entry = {
        type: 'console_error',
        session: sessionConfig.name,
        route: currentRoute.value,
        text: shortText(msg.text(), 300),
      };
      errorList.push({ ...entry, severity: classifySeverity('console_error', 0) });
      appendSessionLog(entry);
    });

    page.on('pageerror', (error) => {
      const entry = {
        type: 'exception',
        session: sessionConfig.name,
        route: currentRoute.value,
        text: shortText(error.message, 300),
      };
      errorList.push({ ...entry, severity: classifySeverity('exception', 0) });
      appendSessionLog(entry);
    });

    page.on('requestfailed', (req) => {
      const entry = {
        type: 'request_failed',
        session: sessionConfig.name,
        route: currentRoute.value,
        method: req.method(),
        url: req.url(),
        text: shortText(req.failure()?.errorText || 'request failed', 220),
      };
      errorList.push({ ...entry, severity: classifySeverity('request_failed', 0) });
      appendSessionLog(entry);
    });

    page.on('response', (res) => {
      const status = res.status();
      if (status < 400) return;
      const url = res.url();
      const shouldIgnore =
        url.includes('.woff') ||
        url.includes('.ttf') ||
        url.includes('/favicon') ||
        url.includes('hot-update') ||
        url.includes('/@vite/');
      if (shouldIgnore) return;
      const entry = {
        type: 'http_error',
        session: sessionConfig.name,
        route: currentRoute.value,
        status,
        url,
      };
      errorList.push({ ...entry, severity: classifySeverity('http_error', status) });
      appendSessionLog(entry);
    });

    const loginState = sessionConfig.login
      ? await attemptLogin(page, baseUrl, sessionConfig.login)
      : {
          attempted: false,
          success: false,
          blocked: false,
          reason: null,
          required_env: [],
          user_type: sessionConfig.name,
        };

    if (loginState.blocked) {
      blockedByAuth.push(newBlockedAuthRow(
        sessionConfig.name,
        loginState.reason || 'blocked',
        loginState.required_env || [],
      ));
    }

    let routeIndex = 0;
    for (const routeMeta of sessionConfig.routes) {
      routeIndex += 1;
      const route = routeMeta.route;
      currentRoute.value = route;
      const runStart = Date.now();
      let responseStatus = null;
      let finalUrl = `${baseUrl}${route}`;
      let bodyText = '';
      let clickableElements = [];
      let clickOutcomes = [];
      let screenshotPath = null;
      let navError = null;

      try {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 22000 });
        responseStatus = response ? response.status() : null;
        await page.waitForTimeout(450);
        finalUrl = page.url();
        bodyText = await page.locator('body').innerText().catch(() => '');

        clickableElements = await collectClickables(page, 24);
        clickOutcomes = await clickExercise(page, baseUrl, route, 6);

        const screenshotName = `${sessionConfig.name}_${String(routeIndex).padStart(3, '0')}_${sanitizeRouteForFile(route)}.png`;
        const screenshotFile = path.join(screensDir, screenshotName);
        await page.screenshot({ path: screenshotFile, fullPage: true });
        screenshotPath = path.relative(REPO_ROOT, screenshotFile);
        screenshotsManifest.push({
          id: screenshotName,
          session: sessionConfig.name,
          route,
          file: screenshotPath,
        });
      } catch (error) {
        navError = shortText(error instanceof Error ? error.message : String(error), 220);
      }

      const gateType = classifyGate(route, finalUrl, bodyText);
      const durationMs = Date.now() - runStart;
      const navigations = clickOutcomes.filter((x) => x.outcome === 'navigated').length;
      const formCount = await page.locator('form').count().catch(() => 0);
      const deadEnd =
        !navError &&
        clickableElements.length <= 1 &&
        formCount === 0 &&
        navigations === 0 &&
        !route.includes('/login');

      if (deadEnd) {
        deadEnds.push({
          session: sessionConfig.name,
          route,
          reason: 'No meaningful outbound actions detected',
          evidence: screenshotPath,
        });
      }

      if (gateType === 'redirect_to_login' && loginState.success && !route.includes('/login')) {
        confusingLoops.push({
          session: sessionConfig.name,
          route,
          final_url: finalUrl,
          reason: 'Authenticated session redirected back to login',
        });
      }

      clickMap.push({
        session: sessionConfig.name,
        route,
        clickable_count: clickableElements.length,
        click_outcomes: clickOutcomes,
      });

      routeRuns.push({
        session: sessionConfig.name,
        route,
        route_pattern: routeMeta.route_pattern,
        status: responseStatus,
        final_url: finalUrl,
        gate_type: gateType,
        nav_error: navError,
        clickable_count: clickableElements.length,
        navigations,
        duration_ms: durationMs,
        screenshot: screenshotPath,
      });
    }

    await context.close();
    return loginState;
  }

  const sessionDefinitions = [
    {
      name: 'public',
      routes: routeBuckets.public,
      login: null,
    },
    {
      name: 'professional',
      routes: routeBuckets.professional,
      login: {
        userType: 'professional',
        loginPath: '/portal/login',
        submitRegex: /log in|sign in/i,
        successRegex: /\/portal\/(dashboard|plans|intelligence|orders|crm|booking|marketing|sales|benchmarks|studio|credits|affiliates|reseller|onboarding|$)/i,
        emailEnv: 'E2E_BUSINESS_EMAIL',
        passwordEnv: 'E2E_BUSINESS_PASSWORD',
      },
    },
    {
      name: 'brand',
      routes: routeBuckets.brand,
      login: {
        userType: 'brand',
        loginPath: '/brand/login',
        submitRegex: /access brand portal|log in|sign in/i,
        successRegex: /\/brand\/(dashboard|products|orders|leads|crm|campaigns|intelligence|$)/i,
        emailEnv: 'E2E_BRAND_EMAIL',
        passwordEnv: 'E2E_BRAND_PASSWORD',
      },
    },
    {
      name: 'admin',
      routes: routeBuckets.admin,
      login: {
        userType: 'admin',
        loginPath: '/admin/login',
        submitRegex: /access admin portal|log in|sign in/i,
        successRegex: /\/admin\/(dashboard|brands|inbox|orders|crm|$)/i,
        emailEnv: 'E2E_ADMIN_EMAIL',
        passwordEnv: 'E2E_ADMIN_PASSWORD',
      },
    },
  ];

  const authResults = {};
  for (const sessionDef of sessionDefinitions) {
    appendRunLog(`[session:start] ${sessionDef.name} routes=${sessionDef.routes.length}`);
    const loginResult = await auditSession(sessionDef);
    authResults[sessionDef.name] = loginResult;
    appendRunLog(`[session:done] ${sessionDef.name} success=${loginResult.success} blocked=${loginResult.blocked}`);
  }

  const dedupedErrors = dedupeBy(errorList, (e) =>
    `${e.session}|${e.route}|${e.type}|${e.status || ''}|${e.url || ''}|${e.text || ''}`,
  );

  const topBrokenFlows = routeRuns
    .flatMap((run) => {
      const issues = [];
      if (run.nav_error) {
        issues.push({
          severity: 'P0',
          session: run.session,
          route: run.route,
          issue: 'Navigation error',
          evidence: run.nav_error,
        });
      } else if (typeof run.status === 'number' && run.status >= 500) {
        issues.push({
          severity: 'P0',
          session: run.session,
          route: run.route,
          issue: `HTTP ${run.status}`,
          evidence: run.screenshot,
        });
      } else if (typeof run.status === 'number' && run.status >= 400) {
        issues.push({
          severity: 'P1',
          session: run.session,
          route: run.route,
          issue: `HTTP ${run.status}`,
          evidence: run.screenshot,
        });
      }
      if (run.gate_type === 'redirect_to_login' && run.session !== 'public') {
        issues.push({
          severity: 'P1',
          session: run.session,
          route: run.route,
          issue: 'Permission trap or auth loop',
          evidence: run.final_url,
        });
      }
      const wasDeadEnd = deadEnds.find((d) => d.session === run.session && d.route === run.route);
      if (wasDeadEnd) {
        issues.push({
          severity: 'P2',
          session: run.session,
          route: run.route,
          issue: 'Dead end',
          evidence: wasDeadEnd.evidence,
        });
      }
      return issues;
    })
    .sort((a, b) => {
      const sevRank = { P0: 0, P1: 1, P2: 2 };
      return sevRank[a.severity] - sevRank[b.severity];
    })
    .slice(0, 20);

  const summary = {
    routes_in_inventory: routeInventory.length,
    routes_audited: routeRuns.length,
    sessions: Object.fromEntries(
      Object.entries(authResults).map(([k, v]) => [k, { success: !!v.success, blocked: !!v.blocked }]),
    ),
    errors: dedupedErrors.length,
    dead_ends: deadEnds.length,
    confusing_loops: confusingLoops.length,
    screenshots: screenshotsManifest.length,
  };

  const report = {
    generated_at: new Date().toISOString(),
    repository: 'SOCELLE GLOBAL',
    app: 'SOCELLE-WEB',
    base_url: baseUrl,
    skill: 'e2e-flow-auditor',
    skill_version: '1.0.0',
    runtime: {
      node: process.version,
      server_started_by_auditor: !serverUp,
      working_directory: REPO_ROOT,
    },
    summary,
    auth_results: authResults,
    blocked_by_auth: blockedByAuth,
    route_inventory: routeInventory,
    route_runs: routeRuns,
    click_map: clickMap,
    error_list: dedupedErrors,
    dead_ends: deadEnds,
    confusing_loops: confusingLoops,
    top_broken_flows: topBrokenFlows,
    screenshots_manifest: screenshotsManifest,
    artifacts: {
      root: path.relative(REPO_ROOT, artifactRoot),
      screens: path.relative(REPO_ROOT, screensDir),
      logs: path.relative(REPO_ROOT, logsDir),
    },
  };

  writeJson(reportFile, report);
  appendRunLog(`[report] ${path.relative(REPO_ROOT, reportFile)}`);
  appendRunLog(`[done] ${new Date().toISOString()}`);

  if (browser) await browser.close();
  stopProcess(devServer);

  const requiredKeys = ['route_inventory', 'click_map', 'error_list', 'dead_ends', 'screenshots_manifest'];
  const missingKeys = requiredKeys.filter((k) => !Object.prototype.hasOwnProperty.call(report, k));
  if (missingKeys.length > 0) {
    fail(`Report missing required keys: ${missingKeys.join(', ')}`);
  }

  console.log(`Flow audit complete.`);
  console.log(`JSON: ${path.relative(REPO_ROOT, reportFile)}`);
  console.log(`Artifacts: ${path.relative(REPO_ROOT, artifactRoot)}`);
  console.log(`Routes audited: ${summary.routes_audited} | Errors: ${summary.errors} | Dead ends: ${summary.dead_ends}`);
}

run().catch((error) => {
  fail(error instanceof Error ? error.stack || error.message : String(error));
});
