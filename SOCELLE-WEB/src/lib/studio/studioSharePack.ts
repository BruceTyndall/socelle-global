type SharePackFile = {
  name: string;
  content: string;
};

export interface StudioSharePackInput {
  title: string;
  slug: string;
  presetId: string;
  copyBlocks: string[];
  ctaUrl: string | null;
  signalSummary: string;
  generatedBy: string | null;
}

const ZIP_DATE_BASE = new Date('1980-01-01T00:00:00Z');
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function toDosDateTime(date: Date): { dosDate: number; dosTime: number } {
  const safeDate = date < ZIP_DATE_BASE ? ZIP_DATE_BASE : date;
  const year = Math.max(1980, safeDate.getFullYear());
  const month = safeDate.getMonth() + 1;
  const day = safeDate.getDate();
  const hours = safeDate.getHours();
  const minutes = safeDate.getMinutes();
  const seconds = Math.floor(safeDate.getSeconds() / 2);

  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  return { dosDate, dosTime };
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function createStoredZip(files: SharePackFile[]): Blob {
  const encoder = new TextEncoder();
  const now = new Date();
  const { dosDate, dosTime } = toDosDateTime(now);

  const parts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const checksum = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, dosTime);
    writeUint16(localView, 12, dosDate);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, dataBytes.length);
    writeUint32(localView, 22, dataBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, dosTime);
    writeUint16(centralView, 14, dosDate);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, dataBytes.length);
    writeUint32(centralView, 24, dataBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);

    parts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralDirectorySize = centralParts.reduce((total, part) => total + part.length, 0);
  const endHeader = new Uint8Array(22);
  const endView = new DataView(endHeader.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectorySize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  return new Blob([...parts, ...centralParts, endHeader] as any[], {
    type: 'application/zip',
  });
}

function normalizeSlug(input: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'studio-share-pack';
}

function appendUtmParams(url: string, slug: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', 'socelle_studio');
    parsed.searchParams.set('utm_medium', 'share_pack');
    parsed.searchParams.set('utm_campaign', slug);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function generateStudioSharePack(input: StudioSharePackInput): { filename: string; blob: Blob } {
  const now = new Date();
  const slug = normalizeSlug(input.slug || input.title || 'studio-share-pack');
  const generatedAt = now.toISOString();
  const utmLink = input.ctaUrl ? appendUtmParams(input.ctaUrl, slug) : null;
  const qrTarget = utmLink ?? `https://socelle.com/home?campaign=${encodeURIComponent(slug)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=720x720&data=${encodeURIComponent(qrTarget)}`;

  const manifest = {
    version: '1.0.0',
    generated_at: generatedAt,
    title: input.title,
    slug,
    preset_id: input.presetId,
    generated_by: input.generatedBy,
    signal_summary: input.signalSummary,
    assets: [
      'captions.txt',
      'share_manifest.json',
      'utm_link.txt',
      'qr_code.url',
    ],
    distribution_channels: [
      'instagram_post',
      'instagram_story',
      'tiktok_cover',
      'email_header',
      'flyer',
      'menu_insert',
      'staff_sop',
      'slide_16x9',
    ],
  };

  const captions = input.copyBlocks.join('\n\n').trim() || 'No copy blocks available.';
  const files: SharePackFile[] = [
    {
      name: 'share_manifest.json',
      content: JSON.stringify(manifest, null, 2),
    },
    {
      name: 'captions.txt',
      content: captions,
    },
    {
      name: 'utm_link.txt',
      content: utmLink ?? 'No CTA URL found in this document.',
    },
    {
      name: 'qr_code.url',
      content: qrUrl,
    },
  ];

  const blob = createStoredZip(files);
  return {
    filename: `${slug}-share-pack.zip`,
    blob,
  };
}

export function downloadStudioSharePack(filename: string, blob: Blob): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
}
