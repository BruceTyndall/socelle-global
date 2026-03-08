// ── CmsMediaLibrary — WO-CMS-03 ─────────────────────────────────────
// Full media asset management: upload (drag-drop, multi-file), browse
// (grid/list, filter, sort, search), preview (lightbox, video, audio,
// PDF), metadata editor, actions (delete, copy URL, download, CSV export).
// Data label: LIVE — reads/writes cms_assets + Supabase Storage.

import { useState, useRef, useMemo, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  ArrowLeft,
  Image,
  Upload,
  AlertCircle,
  RefreshCw,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  File,
  LayoutGrid,
  List,
  Download,
  Copy,
  Check,
  ChevronDown,
  Play,
  Eye,
  FileSpreadsheet,
  Archive,
} from 'lucide-react';
import { useCmsAssets, getAssetPublicUrl, type CmsAsset, type CmsUsageRights } from '../../../lib/cms';

// ── Constants ───────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS =
  '.jpg,.jpeg,.png,.webp,.gif,.svg,.mp4,.webm,.mp3,.wav,.m4a,.pdf,.docx,.xlsx,.csv,.txt,.zip';

const ACCEPTED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'audio/mp4',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
];

type MediaTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'document' | 'scorm';
type SortField = 'created_at' | 'filename' | 'size_bytes' | 'mime_type';
type ViewMode = 'grid' | 'list';

const TYPE_FILTERS: { label: string; value: MediaTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Documents', value: 'document' },
  { label: 'SCORM', value: 'scorm' },
];

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: 'Upload date', value: 'created_at' },
  { label: 'Filename', value: 'filename' },
  { label: 'File size', value: 'size_bytes' },
  { label: 'Type', value: 'mime_type' },
];

const USAGE_RIGHTS_OPTIONS: { label: string; value: CmsUsageRights }[] = [
  { label: 'Owner', value: 'owner' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Brand Supplied', value: 'brand_supplied' },
  { label: 'Licensed', value: 'licensed' },
];

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMediaCategory(mime: string): MediaTypeFilter {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'scorm';
  return 'document';
}

function mimeIcon(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.startsWith('video/')) return FileVideo;
  if (mime.startsWith('audio/')) return FileAudio;
  if (mime === 'application/pdf') return FileText;
  if (
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mime === 'text/csv'
  )
    return FileSpreadsheet;
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return Archive;
  return File;
}

function matchesTypeFilter(mime: string, filter: MediaTypeFilter): boolean {
  if (filter === 'all') return true;
  return getMediaCategory(mime) === filter;
}

function sortAssets(assets: CmsAsset[], field: SortField, asc: boolean): CmsAsset[] {
  return [...assets].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'created_at':
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'filename':
        cmp = a.filename.localeCompare(b.filename);
        break;
      case 'size_bytes':
        cmp = (a.size_bytes ?? 0) - (b.size_bytes ?? 0);
        break;
      case 'mime_type':
        cmp = a.mime_type.localeCompare(b.mime_type);
        break;
    }
    return asc ? cmp : -cmp;
  });
}

function exportAssetsCsv(assets: CmsAsset[]) {
  const headers = [
    'ID',
    'Filename',
    'MIME Type',
    'Size (bytes)',
    'Alt Text',
    'Caption',
    'Tags',
    'Usage Rights',
    'Storage Path',
    'Uploaded',
  ];
  const rows = assets.map((a) => [
    a.id,
    a.filename,
    a.mime_type,
    String(a.size_bytes ?? ''),
    a.alt_text ?? '',
    a.caption ?? '',
    (a.tags ?? []).join('; '),
    a.usage_rights ?? '',
    a.storage_path,
    a.created_at,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cms-media-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Upload progress tracker ─────────────────────────────────────────

interface UploadItem {
  id: string;
  file: File;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

// ── Component ───────────────────────────────────────────────────────

export default function CmsMediaLibrary() {
  const { assets, isLoading, error, uploadAsset, updateAsset, deleteAsset } = useCmsAssets();

  const fileRef = useRef<HTMLInputElement>(null);

  // Browse state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Upload state
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Preview/edit state
  const [previewAsset, setPreviewAsset] = useState<CmsAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<CmsAsset | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editUsageRights, setEditUsageRights] = useState<CmsUsageRights | ''>('');

  // Misc
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Filtered + sorted assets ──────────────────────────────────────
  const filtered = useMemo(() => {
    const result = assets.filter((a) => {
      if (!matchesTypeFilter(a.mime_type, typeFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchFilename = a.filename.toLowerCase().includes(q);
        const matchAlt = (a.alt_text ?? '').toLowerCase().includes(q);
        const matchTags = (a.tags ?? []).some((t) => t.toLowerCase().includes(q));
        if (!matchFilename && !matchAlt && !matchTags) return false;
      }
      return true;
    });
    return sortAssets(result, sortField, sortAsc);
  }, [assets, typeFilter, search, sortField, sortAsc]);

  // ── Upload handlers ───────────────────────────────────────────────
  const processFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(
        (f) => ACCEPTED_MIMES.includes(f.type) || f.name.endsWith('.zip'),
      );
      if (validFiles.length === 0) return;

      const items: UploadItem[] = validFiles.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploadQueue((prev) => [...prev, ...items]);

      for (const item of items) {
        setUploadQueue((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, status: 'uploading', progress: 30 } : u)),
        );

        try {
          await uploadAsset.mutateAsync({
            file: item.file,
          });
          setUploadQueue((prev) =>
            prev.map((u) => (u.id === item.id ? { ...u, status: 'done', progress: 100 } : u)),
          );
        } catch (err) {
          setUploadQueue((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: 'error',
                    progress: 0,
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : u,
            ),
          );
        }
      }

      // Clear completed after 3s
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((u) => u.status !== 'done'));
      }, 3000);
    },
    [uploadAsset],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      processFiles(files);
      if (fileRef.current) fileRef.current.value = '';
    },
    [processFiles],
  );

  // ── Edit handlers ─────────────────────────────────────────────────
  function openEdit(asset: CmsAsset) {
    setEditingAsset(asset);
    setEditAltText(asset.alt_text ?? '');
    setEditCaption(asset.caption ?? '');
    setEditTags((asset.tags ?? []).join(', '));
    setEditUsageRights(asset.usage_rights ?? '');
    setMutationError(null);
  }

  async function handleEditSave() {
    if (!editingAsset) return;
    setMutationError(null);
    try {
      const parsedTags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await updateAsset.mutateAsync({
        id: editingAsset.id,
        altText: editAltText || undefined,
        caption: editCaption || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        usageRights: (editUsageRights as CmsUsageRights) || undefined,
      });
      setEditingAsset(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  // ── Delete handler ────────────────────────────────────────────────
  async function handleDelete(asset: CmsAsset) {
    setMutationError(null);
    try {
      await deleteAsset.mutateAsync(asset);
      setDeleteConfirm(null);
      if (previewAsset?.id === asset.id) setPreviewAsset(null);
      if (editingAsset?.id === asset.id) setEditingAsset(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Copy URL ──────────────────────────────────────────────────────
  function copyUrl(asset: CmsAsset) {
    const url = getAssetPublicUrl(asset.storage_path);
    navigator.clipboard.writeText(url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Download ──────────────────────────────────────────────────────
  function downloadAsset(asset: CmsAsset) {
    const url = getAssetPublicUrl(asset.storage_path);
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.filename;
    link.target = '_blank';
    link.click();
  }

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/cms" className="text-[#6E879B] hover:text-[#5A7185]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-[#141418]">Media Library</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E8EDF1] overflow-hidden">
              <div className="aspect-square bg-[#E8EDF1] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#E8EDF1] rounded animate-pulse w-3/4" />
                <div className="h-2 bg-[#E8EDF1] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/cms" className="text-[#6E879B] hover:text-[#5A7185]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-[#141418]">Media Library</h1>
        </div>
        <div className="bg-[#8E6464]/10 rounded-lg p-6 text-center">
          <AlertCircle className="w-10 h-10 text-[#8E6464] mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">Failed to load media</p>
          <p className="text-sm text-[#6E879B] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Preview renderer ──────────────────────────────────────────────
  function renderPreview(asset: CmsAsset) {
    const url = getAssetPublicUrl(asset.storage_path);
    const cat = getMediaCategory(asset.mime_type);

    if (cat === 'image') {
      return (
        <img
          src={url}
          alt={asset.alt_text ?? asset.filename}
          className="max-w-full max-h-[60vh] rounded-lg object-contain mx-auto"
        />
      );
    }
    if (cat === 'video') {
      return (
        <video controls className="max-w-full max-h-[60vh] rounded-lg mx-auto">
          <source src={url} type={asset.mime_type} />
          Your browser does not support the video tag.
        </video>
      );
    }
    if (cat === 'audio') {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <FileAudio className="w-16 h-16 text-[#6E879B]/40" />
          <audio controls className="w-full max-w-md">
            <source src={url} type={asset.mime_type} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    if (asset.mime_type === 'application/pdf') {
      return (
        <iframe
          src={url}
          title={asset.filename}
          className="w-full h-[60vh] rounded-lg border border-[#E8EDF1]"
        />
      );
    }
    // Generic file
    const Icon = mimeIcon(asset.mime_type);
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Icon className="w-16 h-16 text-[#6E879B]/40" />
        <div className="text-center">
          <p className="text-[#141418] font-medium">{asset.filename}</p>
          <p className="text-sm text-[#6E879B] mt-1">
            {asset.mime_type} -- {formatBytes(asset.size_bytes)}
          </p>
          <p className="text-sm text-[#6E879B]">Uploaded {formatDate(asset.created_at)}</p>
        </div>
        <button
          onClick={() => downloadAsset(asset)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" /> Download
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/cms" className="text-[#6E879B] hover:text-[#5A7185]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-[#141418]">Media Library</h1>
          <span className="text-sm text-[#6E879B]">({assets.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAssetsCsv(filtered)}
            className="flex items-center gap-2 px-3 py-2 border border-[#E8EDF1] text-[#6E879B] rounded-lg hover:bg-[#E8EDF1] transition-colors text-sm"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      {/* ── Mutation error ──────────────────────────────────────── */}
      {mutationError && (
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mutationError}</span>
          <button onClick={() => setMutationError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Upload zone (drag-and-drop) ────────────────────────── */}
      {showUploadZone && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-[#6E879B] bg-[#6E879B]/5'
              : 'border-[#E8EDF1] bg-white hover:border-[#6E879B]/50'
          }`}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload
            className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-[#6E879B]' : 'text-[#6E879B]/40'}`}
          />
          <p className="text-[#141418] font-medium mb-1">
            {dragOver ? 'Drop files here' : 'Drag and drop files, or click to browse'}
          </p>
          <p className="text-sm text-[#6E879B]">
            Images, video, audio, documents, SCORM packages
          </p>
          <p className="text-xs text-[#6E879B] mt-1">
            JPG, PNG, WebP, GIF, SVG, MP4, WebM, MP3, WAV, M4A, PDF, DOCX, XLSX, CSV, TXT, ZIP
          </p>
        </div>
      )}

      {/* ── Upload progress ────────────────────────────────────── */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#141418]">
              Uploading ({uploadQueue.filter((u) => u.status === 'done').length}/
              {uploadQueue.length})
            </h3>
            <button
              onClick={() => setUploadQueue([])}
              className="text-[#6E879B] hover:text-[#5A7185]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {uploadQueue.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#141418] truncate">{item.file.name}</p>
                <div className="w-full bg-[#E8EDF1] rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'error'
                        ? 'bg-[#8E6464]'
                        : item.status === 'done'
                          ? 'bg-[#5F8A72]'
                          : 'bg-[#6E879B]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-[#6E879B] whitespace-nowrap">
                {item.status === 'uploading' && 'Uploading...'}
                {item.status === 'pending' && 'Queued'}
                {item.status === 'done' && (
                  <span className="text-[#5F8A72]">Done</span>
                )}
                {item.status === 'error' && (
                  <span className="text-[#8E6464]">{item.error ?? 'Failed'}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters + view toggle ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E879B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E8EDF1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
            placeholder="Search by filename, tags, alt text..."
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MediaTypeFilter)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          {TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#6E879B] hover:bg-[#E8EDF1] transition-colors"
          title={sortAsc ? 'Ascending' : 'Descending'}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${sortAsc ? 'rotate-180' : ''}`}
          />
        </button>

        <div className="flex items-center border border-[#E8EDF1] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 text-sm ${
              viewMode === 'grid'
                ? 'bg-[#6E879B] text-white'
                : 'text-[#6E879B] hover:bg-[#E8EDF1]'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 text-sm ${
              viewMode === 'list'
                ? 'bg-[#6E879B] text-white'
                : 'text-[#6E879B] hover:bg-[#E8EDF1]'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <Image className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">
            {search || typeFilter !== 'all'
              ? 'No media matches your filters'
              : 'Your media library is empty'}
          </p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload images, videos, audio, documents, and SCORM packages to get started.'}
          </p>
          {!search && typeFilter === 'all' && (
            <button
              onClick={() => setShowUploadZone(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Upload Media
            </button>
          )}
        </div>
      )}

      {/* ── Grid view ─────────────────────────────────────────── */}
      {filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => {
            const Icon = mimeIcon(asset.mime_type);
            const isImage = asset.mime_type.startsWith('image/');
            const isVideo = asset.mime_type.startsWith('video/');
            return (
              <div
                key={asset.id}
                className="bg-white rounded-lg border border-[#E8EDF1] overflow-hidden hover:border-[#6E879B] transition-colors group"
              >
                <div className="aspect-square bg-[#F6F3EF] flex items-center justify-center relative overflow-hidden">
                  {isImage ? (
                    <img
                      src={getAssetPublicUrl(asset.storage_path)}
                      alt={asset.alt_text ?? asset.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="w-10 h-10 text-[#6E879B]/40" />
                      {isVideo && (
                        <Play className="w-5 h-5 text-[#6E879B]/60" />
                      )}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#141418]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="p-2 bg-white rounded-full text-[#6E879B] hover:text-[#5A7185]"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(asset)}
                      className="p-2 bg-white rounded-full text-[#6E879B] hover:text-[#5A7185]"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyUrl(asset)}
                      className="p-2 bg-white rounded-full text-[#6E879B] hover:text-[#5A7185]"
                      title="Copy URL"
                    >
                      {copiedId === asset.id ? (
                        <Check className="w-4 h-4 text-[#5F8A72]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {deleteConfirm === asset.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(asset)}
                          className="px-2 py-1 bg-[#8E6464] text-white rounded text-xs"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-white text-[#6E879B] rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(asset.id)}
                        className="p-2 bg-white rounded-full text-[#8E6464] hover:text-[#8E6464]"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-[#141418] truncate font-medium">{asset.filename}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#6E879B]">
                      {formatBytes(asset.size_bytes)}
                    </span>
                    <span className="text-[10px] text-[#6E879B]">
                      {formatDate(asset.created_at)}
                    </span>
                  </div>
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {asset.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] bg-[#E8EDF1] text-[#6E879B] px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                      {asset.tags.length > 3 && (
                        <span className="text-[9px] text-[#6E879B]">
                          +{asset.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List view ─────────────────────────────────────────── */}
      {filtered.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EDF1] text-left text-[#6E879B]">
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Size</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Tags</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Rights</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Uploaded</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => {
                const Icon = mimeIcon(asset.mime_type);
                return (
                  <tr
                    key={asset.id}
                    className="border-b border-[#E8EDF1] last:border-0 hover:bg-[#F6F3EF]/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F6F3EF] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {asset.mime_type.startsWith('image/') ? (
                            <img
                              src={getAssetPublicUrl(asset.storage_path)}
                              alt={asset.alt_text ?? asset.filename}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Icon className="w-5 h-5 text-[#6E879B]/60" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#141418] font-medium truncate max-w-[200px]">
                            {asset.filename}
                          </p>
                          {asset.alt_text && (
                            <p className="text-xs text-[#6E879B] truncate max-w-[200px]">
                              {asset.alt_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6E879B] hidden md:table-cell">
                      {getMediaCategory(asset.mime_type)}
                    </td>
                    <td className="px-4 py-3 text-[#6E879B] hidden md:table-cell">
                      {formatBytes(asset.size_bytes)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(asset.tags ?? []).slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-[#E8EDF1] text-[#6E879B] px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6E879B] text-xs hidden lg:table-cell">
                      {asset.usage_rights ?? '--'}
                    </td>
                    <td className="px-4 py-3 text-[#6E879B] hidden sm:table-cell">
                      {formatDate(asset.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(asset)}
                          className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyUrl(asset)}
                          className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                          title="Copy URL"
                        >
                          {copiedId === asset.id ? (
                            <Check className="w-4 h-4 text-[#5F8A72]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => downloadAsset(asset)}
                          className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {deleteConfirm === asset.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(asset)}
                              className="px-2 py-1 bg-[#8E6464] text-white rounded text-xs"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 border border-[#E8EDF1] text-[#6E879B] rounded text-xs"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(asset.id)}
                            className="p-1.5 text-[#8E6464] hover:bg-[#8E6464]/10 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Preview lightbox/modal ────────────────────────────── */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141418]/70 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#E8EDF1]">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#141418] truncate">
                  {previewAsset.filename}
                </h2>
                <p className="text-xs text-[#6E879B]">
                  {previewAsset.mime_type} -- {formatBytes(previewAsset.size_bytes)} --{' '}
                  {formatDate(previewAsset.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => copyUrl(previewAsset)}
                  className="p-2 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded-lg"
                  title="Copy URL"
                >
                  {copiedId === previewAsset.id ? (
                    <Check className="w-4 h-4 text-[#5F8A72]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => downloadAsset(previewAsset)}
                  className="p-2 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded-lg"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    openEdit(previewAsset);
                    setPreviewAsset(null);
                  }}
                  className="p-2 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded-lg"
                  title="Edit metadata"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="p-2 text-[#6E879B] hover:text-[#5A7185]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">{renderPreview(previewAsset)}</div>
            {/* Metadata strip */}
            <div className="px-6 pb-4 border-t border-[#E8EDF1] pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[#6E879B] text-xs">Alt text</p>
                <p className="text-[#141418]">{previewAsset.alt_text || '--'}</p>
              </div>
              <div>
                <p className="text-[#6E879B] text-xs">Caption</p>
                <p className="text-[#141418]">{previewAsset.caption || '--'}</p>
              </div>
              <div>
                <p className="text-[#6E879B] text-xs">Tags</p>
                <p className="text-[#141418]">
                  {previewAsset.tags && previewAsset.tags.length > 0
                    ? previewAsset.tags.join(', ')
                    : '--'}
                </p>
              </div>
              <div>
                <p className="text-[#6E879B] text-xs">Usage rights</p>
                <p className="text-[#141418]">{previewAsset.usage_rights || '--'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit metadata modal ───────────────────────────────── */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141418]/70 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#E8EDF1]">
              <h2 className="text-lg font-semibold text-[#141418]">Edit Metadata</h2>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-[#6E879B] hover:text-[#5A7185]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* File info (read-only) */}
              <div className="bg-[#F6F3EF] rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6E879B]">Filename</span>
                  <span className="text-[#141418] font-medium">{editingAsset.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E879B]">Size</span>
                  <span className="text-[#141418]">{formatBytes(editingAsset.size_bytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E879B]">Type</span>
                  <span className="text-[#141418]">{editingAsset.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E879B]">Uploaded</span>
                  <span className="text-[#141418]">{formatDate(editingAsset.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E879B]">Storage path</span>
                  <span className="text-[#141418] text-xs truncate max-w-[200px]">
                    {editingAsset.storage_path}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6E879B]">Public URL</span>
                  <button
                    onClick={() => copyUrl(editingAsset)}
                    className="text-[#6E879B] hover:text-[#5A7185] text-xs flex items-center gap-1"
                  >
                    {copiedId === editingAsset.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#5F8A72]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Alt text */}
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">
                  Alt Text{editingAsset.mime_type.startsWith('image/') && (
                    <span className="text-[#8E6464] ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                  placeholder="Descriptive alt text for accessibility"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">Caption</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                  placeholder="Optional caption"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">
                  Tags <span className="text-xs text-[#6E879B] font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                  placeholder="hero, skincare, product"
                />
              </div>

              {/* Usage rights */}
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">
                  Usage Rights
                </label>
                <select
                  value={editUsageRights}
                  onChange={(e) => setEditUsageRights(e.target.value as CmsUsageRights | '')}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                >
                  <option value="">Select usage rights</option>
                  {USAGE_RIGHTS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {mutationError && (
                <div className="flex items-center gap-2 text-[#8E6464] text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mutationError}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button
                onClick={() => setEditingAsset(null)}
                className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={updateAsset.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {updateAsset.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
