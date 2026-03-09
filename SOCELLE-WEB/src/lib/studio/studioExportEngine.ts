/**
 * studioExportEngine — STUDIO-UI-05
 * Export engine for Studio documents: PNG, PDF, SVG, SCORM.
 *
 * All exports are browser-side only (no server required).
 * - PNG/JPG: Canvas 2D API renderer of block content
 * - PDF: window.print() with print-specific CSS injection
 * - SVG: Structured SVG from block positions
 * - SCORM 2004: ZIP with imsmanifest.xml + HTML page
 */

/* ── Types ─────────────────────────────────────────────────────── */

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg' | 'scorm';

export interface CanvasExportBlock {
  id: string;
  type: string;
  x: number;   // canvas px
  y: number;   // canvas px
  w: number;   // canvas px
  h: number;   // canvas px
  content: Record<string, unknown>;
  /** Background color for the block (CSS string) */
  bg?: string;
  /** Text color */
  color?: string;
}

export interface ExportOptions {
  title: string;
  format: ExportFormat;
  presetWidth: number;
  presetHeight: number;
  safeMargin: number;
  blocks: CanvasExportBlock[];
  /** For SCORM: course description */
  description?: string;
  /** For SCORM: unique identifier */
  courseId?: string;
}

/* ── Main entry point ──────────────────────────────────────────── */

export async function exportStudioDocument(opts: ExportOptions): Promise<void> {
  switch (opts.format) {
    case 'png':
      return exportToRaster(opts, 'image/png', 'png');
    case 'jpg':
      return exportToRaster(opts, 'image/jpeg', 'jpg');
    case 'pdf':
      return exportToPdf(opts);
    case 'svg':
      return exportToSvg(opts);
    case 'scorm':
      return exportToScorm(opts);
  }
}

/* ── PNG / JPG ─────────────────────────────────────────────────── */

async function exportToRaster(
  opts: ExportOptions,
  mimeType: 'image/png' | 'image/jpeg',
  ext: string,
): Promise<void> {
  const { presetWidth, presetHeight, blocks, title } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = presetWidth;
  canvas.height = presetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background
  ctx.fillStyle = '#F6F3EF';
  ctx.fillRect(0, 0, presetWidth, presetHeight);

  // Render each block
  for (const block of blocks) {
    renderBlockToCanvas(ctx, block);
  }

  const dataUrl = canvas.toDataURL(mimeType, 0.92);
  triggerDownload(dataUrl, `${slugify(title)}.${ext}`);
}

function renderBlockToCanvas(ctx: CanvasRenderingContext2D, block: CanvasExportBlock) {
  const { x, y, w, h, type, content, bg, color } = block;

  // Background
  if (bg) {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
  }

  const textColor = color ?? '#141418';

  switch (type) {
    case 'heading': {
      const text = String(content.text ?? '');
      const level = Number(content.level ?? 2);
      const fontSize = level === 1 ? 48 : level === 2 ? 36 : 28;
      ctx.font = `600 ${fontSize}px "General Sans", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(text, x + 16, y + fontSize + 8, w - 32);
      break;
    }
    case 'text': {
      const text = String(content.body ?? content.text ?? '');
      ctx.font = `400 18px "General Sans", sans-serif`;
      ctx.fillStyle = textColor;
      wrapText(ctx, text, x + 16, y + 26, w - 32, 26);
      break;
    }
    case 'kpi': {
      const label = String(content.label ?? '');
      const value = String(content.value ?? '');
      const direction = String(content.direction ?? 'neutral');
      const signalColor = direction === 'up' ? '#5F8A72' : direction === 'down' ? '#8E6464' : '#A97A4C';
      ctx.font = `600 36px "General Sans", sans-serif`;
      ctx.fillStyle = signalColor;
      ctx.fillText(value, x + 16, y + 50, w - 32);
      ctx.font = `400 14px "General Sans", sans-serif`;
      ctx.fillStyle = '#141418';
      ctx.globalAlpha = 0.5;
      ctx.fillText(label, x + 16, y + 72, w - 32);
      ctx.globalAlpha = 1;
      break;
    }
    case 'shape-rect': {
      const fillColor = String(content.fill ?? '#6E879B');
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, Number(content.radius ?? 0));
      ctx.fill();
      break;
    }
    case 'shape-circle': {
      const fillColor = String(content.fill ?? '#6E879B');
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      // Generic block: draw border rect
      ctx.strokeStyle = '#E8EDF1';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      if (type !== 'image') {
        ctx.font = `400 13px "General Sans", sans-serif`;
        ctx.fillStyle = '#141418';
        ctx.globalAlpha = 0.3;
        ctx.fillText(type.toUpperCase(), x + 8, y + 18, w - 16);
        ctx.globalAlpha = 1;
      }
    }
  }
}

/** Wrap text within a max-width on canvas */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  let lineY = y;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, lineY, maxWidth);
      line = word + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, lineY, maxWidth);
}

/* ── PDF ───────────────────────────────────────────────────────── */

function exportToPdf(opts: ExportOptions): Promise<void> {
  return new Promise((resolve) => {
    const prevTitle = document.title;
    document.title = opts.title;

    // Inject print-specific stylesheet
    const style = document.createElement('style');
    style.id = 'studio-print-style';
    style.textContent = `
      @media print {
        body > *:not(#studio-print-frame) { display: none !important; }
        #studio-print-frame {
          display: block !important;
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          z-index: 99999;
          background: white;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    // Cleanup after print dialog
    setTimeout(() => {
      document.title = prevTitle;
      document.head.removeChild(style);
      resolve();
    }, 500);
  });
}

/* ── SVG ───────────────────────────────────────────────────────── */

function exportToSvg(opts: ExportOptions): Promise<void> {
  const { presetWidth, presetHeight, blocks, title } = opts;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${presetWidth}" height="${presetHeight}" viewBox="0 0 ${presetWidth} ${presetHeight}">`;
  svgContent += `<rect width="${presetWidth}" height="${presetHeight}" fill="#F6F3EF"/>`;

  for (const block of blocks) {
    const { x, y, w, h, type, content } = block;
    switch (type) {
      case 'shape-rect':
        svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${String(content.fill ?? '#6E879B')}" rx="${Number(content.radius ?? 0)}"/>`;
        break;
      case 'shape-circle':
        svgContent += `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${String(content.fill ?? '#6E879B')}"/>`;
        break;
      case 'heading': {
        const level = Number(content.level ?? 2);
        const fontSize = level === 1 ? 48 : level === 2 ? 36 : 28;
        svgContent += `<text x="${x + 16}" y="${y + fontSize}" font-size="${fontSize}" font-weight="600" fill="#141418" font-family="sans-serif">${escapeXml(String(content.text ?? ''))}</text>`;
        break;
      }
      case 'text':
        svgContent += `<text x="${x + 16}" y="${y + 26}" font-size="18" fill="#141418" font-family="sans-serif">${escapeXml(String(content.body ?? ''))}</text>`;
        break;
      default:
        svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#E8EDF1" stroke-width="1"/>`;
    }
  }

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(title)}.svg`);
  URL.revokeObjectURL(url);
  return Promise.resolve();
}

/* ── SCORM 2004 ────────────────────────────────────────────────── */

async function exportToScorm(opts: ExportOptions): Promise<void> {
  const {
    title,
    description = '',
    courseId = `socelle-${Date.now()}`,
    blocks,
  } = opts;

  // Build HTML content page
  const htmlContent = buildScormHtmlPage(title, blocks);

  // Build SCORM manifest
  const manifest = buildScormManifest(title, description, courseId);

  // Package as ZIP
  const zipBlob = await buildScormZip({ manifest, htmlContent, title });
  const url = URL.createObjectURL(zipBlob);
  triggerDownload(url, `${slugify(title)}-scorm.zip`);
  URL.revokeObjectURL(url);
}

function buildScormHtmlPage(title: string, blocks: CanvasExportBlock[]): string {
  const blocksHtml = blocks
    .map((block) => {
      const { type, content } = block;
      switch (type) {
        case 'heading': {
          const level = Number(content.level ?? 2);
          const tag = `h${Math.min(level + 1, 6)}`;
          return `<${tag}>${esc(String(content.text ?? ''))}</${tag}>`;
        }
        case 'text':
          return `<p>${esc(String(content.body ?? ''))}</p>`;
        case 'kpi':
          return `<div class="kpi"><span class="kpi-value">${esc(String(content.value ?? ''))}</span><span class="kpi-label">${esc(String(content.label ?? ''))}</span></div>`;
        case 'image':
          return `<figure><img src="${esc(String(content.src ?? ''))}" alt="${esc(String(content.alt ?? ''))}" />${content.caption ? `<figcaption>${esc(String(content.caption))}</figcaption>` : ''}</figure>`;
        case 'quiz': {
          const questions = Array.isArray(content.questions) ? content.questions : [];
          const qHtml = questions
            .map((q: unknown) => {
              const qObj = q as Record<string, unknown>;
              return `<div class="question"><p>${esc(String(qObj.question ?? ''))}</p></div>`;
            })
            .join('');
          return `<section class="quiz">${qHtml}</section>`;
        }
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <script src="SCORM_API_wrapper.js"></script>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #141418; background: #F6F3EF; }
    h1, h2, h3 { color: #141418; }
    p { line-height: 1.7; color: #141418; opacity: 0.75; }
    .kpi { display: flex; flex-direction: column; background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid rgba(20,20,24,0.08); }
    .kpi-value { font-size: 2rem; font-weight: 700; color: #5F8A72; }
    .kpi-label { font-size: 0.875rem; color: #141418; opacity: 0.5; margin-top: 4px; }
    .quiz { background: white; border-radius: 12px; padding: 24px; margin: 16px 0; border: 1px solid rgba(20,20,24,0.08); }
    .question p { font-weight: 500; }
    figure img { max-width: 100%; border-radius: 8px; }
    figcaption { font-size: 0.8rem; opacity: 0.5; margin-top: 8px; }
    #completion { display: none; text-align: center; margin: 32px 0; padding: 24px; background: #5F8A72; color: white; border-radius: 12px; }
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  ${blocksHtml}
  <div id="completion">
    <h2>Module Complete</h2>
    <p>You have completed this training module.</p>
  </div>
  <button onclick="completeModule()" style="margin-top:32px;padding:12px 24px;background:#6E879B;color:white;border:none;border-radius:8px;cursor:pointer;font-size:1rem;">Mark Complete</button>
  <script>
    var API = null;
    var API_1484_11 = null;

    function findAPI(win) {
      var attempts = 0;
      while (win.API == null && win.API_1484_11 == null && win.parent != null && win.parent != win) {
        attempts++;
        if (attempts > 7) break;
        win = win.parent;
      }
      return win.API_1484_11 || win.API;
    }

    function initSCORM() {
      var api = findAPI(window);
      if (api) {
        API = api;
        api.Initialize("");
        api.SetValue("cmi.completion_status", "incomplete");
        api.SetValue("cmi.success_status", "unknown");
      }
    }

    function completeModule() {
      if (API) {
        API.SetValue("cmi.completion_status", "completed");
        API.SetValue("cmi.success_status", "passed");
        API.SetValue("cmi.score.raw", "100");
        API.SetValue("cmi.score.min", "0");
        API.SetValue("cmi.score.max", "100");
        API.Commit("");
        API.Terminate("");
      }
      document.getElementById("completion").style.display = "block";
      window.scrollTo(0, document.body.scrollHeight);
    }

    window.onload = initSCORM;
    window.onunload = function() {
      if (API) API.Terminate("");
    };
  </script>
</body>
</html>`;
}

function buildScormManifest(title: string, description: string, courseId: string): string {
  const timestamp = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escXmlAttr(courseId)}"
          version="1.3"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                              http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
                              http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
                              http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
    <adlcp:location>metadata.xml</adlcp:location>
  </metadata>
  <organizations default="ORG-${escXmlAttr(courseId)}">
    <organization identifier="ORG-${escXmlAttr(courseId)}">
      <title>${escXml(title)}</title>
      <item identifier="ITEM-01" identifierref="RES-01">
        <title>${escXml(title)}</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true"/>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-01"
              type="webcontent"
              adlcp:scormType="sco"
              href="index.html">
      <file href="index.html"/>
      <file href="SCORM_API_wrapper.js"/>
      <dependency identifierref="RES-COMMON"/>
    </resource>
    <resource identifier="RES-COMMON" type="webcontent">
      <file href="imsmanifest.xml"/>
    </resource>
  </resources>
</manifest>`;
}

// Minimal SCORM API wrapper stub (included in the ZIP)
const SCORM_API_WRAPPER_JS = `
// Minimal SCORM 2004 API wrapper stub
// The LMS provides the real API_1484_11 object
if (typeof API_1484_11 === 'undefined') {
  window.API_1484_11 = {
    _data: {},
    Initialize: function() { return "true"; },
    Terminate: function() { return "true"; },
    GetValue: function(k) { return this._data[k] || ""; },
    SetValue: function(k,v) { this._data[k] = v; return "true"; },
    Commit: function() { return "true"; },
    GetLastError: function() { return "0"; },
    GetErrorString: function() { return ""; },
    GetDiagnostic: function() { return ""; }
  };
}
`;

async function buildScormZip(opts: {
  manifest: string;
  htmlContent: string;
  title: string;
}): Promise<Blob> {
  const { manifest, htmlContent } = opts;
  const enc = new TextEncoder();

  const files: Array<{ name: string; data: Uint8Array }> = [
    { name: 'imsmanifest.xml', data: enc.encode(manifest) },
    { name: 'index.html', data: enc.encode(htmlContent) },
    { name: 'SCORM_API_wrapper.js', data: enc.encode(SCORM_API_WRAPPER_JS) },
  ];

  return buildZipBlob(files);
}

/* ── Minimal ZIP builder ───────────────────────────────────────── */
// (subset of studioSharePack approach — self-contained)

function buildZipBlob(files: Array<{ name: string; data: Uint8Array }>): Promise<Blob> {
  const centralDir: Uint8Array[] = [];
  const fileData: Uint8Array[] = [];
  let offset = 0;

  const now = new Date();
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);

  for (const file of files) {
    const name = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    // Local file header
    const localHeader = new DataView(new ArrayBuffer(30 + name.length));
    localHeader.setUint32(0, 0x04034b50, true);  // Signature
    localHeader.setUint16(4, 20, true);            // Version needed
    localHeader.setUint16(6, 0, true);             // Flags
    localHeader.setUint16(8, 0, true);             // Compression: stored
    localHeader.setUint16(10, dosTime, true);
    localHeader.setUint16(12, dosDate, true);
    localHeader.setUint32(14, crc, true);
    localHeader.setUint32(18, size, true);
    localHeader.setUint32(22, size, true);
    localHeader.setUint16(26, name.length, true);
    localHeader.setUint16(28, 0, true);            // Extra field length
    new Uint8Array(localHeader.buffer, 30).set(name);
    const localHeaderArr = new Uint8Array(localHeader.buffer);

    fileData.push(localHeaderArr);
    fileData.push(file.data);

    // Central directory entry
    const cdEntry = new DataView(new ArrayBuffer(46 + name.length));
    cdEntry.setUint32(0, 0x02014b50, true);  // Central dir signature
    cdEntry.setUint16(4, 20, true);           // Version made by
    cdEntry.setUint16(6, 20, true);           // Version needed
    cdEntry.setUint16(8, 0, true);
    cdEntry.setUint16(10, 0, true);
    cdEntry.setUint16(12, dosTime, true);
    cdEntry.setUint16(14, dosDate, true);
    cdEntry.setUint32(16, crc, true);
    cdEntry.setUint32(20, size, true);
    cdEntry.setUint32(24, size, true);
    cdEntry.setUint16(28, name.length, true);
    cdEntry.setUint16(30, 0, true);
    cdEntry.setUint16(32, 0, true);
    cdEntry.setUint16(34, 0, true);
    cdEntry.setUint16(36, 0, true);
    cdEntry.setUint32(38, 0, true);
    cdEntry.setUint32(42, offset, true);
    new Uint8Array(cdEntry.buffer, 46).set(name);

    centralDir.push(new Uint8Array(cdEntry.buffer));
    offset += localHeaderArr.length + size;
  }

  const cdOffset = offset;
  const cdSize = centralDir.reduce((s, e) => s + e.length, 0);

  // End of central directory
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, cdOffset, true);
  eocd.setUint16(20, 0, true);

  const allParts = [...fileData, ...centralDir, new Uint8Array(eocd.buffer)];
  return Promise.resolve(new Blob(allParts, { type: 'application/zip' }));
}

function crc32(data: Uint8Array): number {
  const table = makeCRC32Table();
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crc32Table: Uint32Array | null = null;
function makeCRC32Table(): Uint32Array {
  if (_crc32Table) return _crc32Table;
  _crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    _crc32Table[i] = c;
  }
  return _crc32Table;
}

/* ── Utilities ─────────────────────────────────────────────────── */

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'document';
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escXmlAttr(s: string): string {
  return s.replace(/[^a-zA-Z0-9-_]/g, '-');
}

function escXml(s: string): string {
  return escapeXml(s);
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
