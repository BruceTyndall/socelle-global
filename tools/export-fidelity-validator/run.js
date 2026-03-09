#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'SOCELLE-WEB', 'docs', 'qa', 'export_fidelity_manifest.json');
const studioEditorPath = path.join(repoRoot, 'SOCELLE-WEB', 'src', 'pages', 'business', 'studio', 'StudioEditor.tsx');
const qaDir = path.join(repoRoot, 'SOCELLE-WEB', 'docs', 'qa');

const requiredFormats = ['PNG', 'JPG', 'PDF', 'PPTX', 'SCORM', 'SVG', 'GIF'];
const requiredBaselineFormats = ['PNG', 'PDF', 'PPTX'];

function check(name, pass, evidence) {
  return { name, pass, evidence };
}

const checks = [];

let manifest = null;
if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    checks.push(check('manifest_exists', true, manifestPath));
  } catch (error) {
    checks.push(check('manifest_parse', false, String(error)));
  }
} else {
  checks.push(check('manifest_exists', false, manifestPath));
}

if (manifest) {
  const formats = Array.isArray(manifest.formats) ? manifest.formats : [];
  const missingFormats = requiredFormats.filter((f) => !formats.includes(f));
  checks.push(
    check(
      'required_formats',
      missingFormats.length === 0,
      missingFormats.length === 0 ? `all formats present (${formats.join(', ')})` : `missing: ${missingFormats.join(', ')}`
    )
  );

  const templates = Array.isArray(manifest.templates) ? manifest.templates : [];
  checks.push(check('template_count', templates.length >= 5, `count=${templates.length}`));

  for (const t of templates) {
    const baselines = t && typeof t === 'object' ? t.baselines : null;
    const missing = requiredBaselineFormats.filter((fmt) => !baselines || !baselines[fmt]);
    checks.push(
      check(
        `baseline_${t.id || 'unknown'}`,
        missing.length === 0,
        missing.length === 0 ? 'PNG/PDF/PPTX baseline entries present' : `missing: ${missing.join(', ')}`
      )
    );
  }
}

if (fs.existsSync(studioEditorPath)) {
  const src = fs.readFileSync(studioEditorPath, 'utf8');
  const hasPresetConfig = src.includes('const OUTPUT_PRESETS: OutputPreset[]') && src.includes('safeMargin');
  checks.push(check('studio_output_presets_defined', hasPresetConfig, studioEditorPath));
} else {
  checks.push(check('studio_editor_exists', false, studioEditorPath));
}

const status = checks.every((c) => c.pass) ? 'PASS' : 'FAIL';
const timestamp = new Date().toISOString();
const report = {
  skill: 'export-fidelity-validator',
  timestamp,
  status,
  checks,
};

if (!fs.existsSync(qaDir)) {
  fs.mkdirSync(qaDir, { recursive: true });
}

const safeTs = timestamp.replace(/[:.]/g, '-');
const reportPath = path.join(qaDir, `export-fidelity-validator-${safeTs}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(`export-fidelity-validator: ${status}`);
console.log(reportPath);
if (status !== 'PASS') {
  process.exitCode = 1;
}
