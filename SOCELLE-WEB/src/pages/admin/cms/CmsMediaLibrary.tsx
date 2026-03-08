// ── CmsMediaLibrary — WO-CMS-03 ─────────────────────────────────────
// Media asset management. Upload, edit alt_text/caption, delete.
// Data label: LIVE — reads/writes cms_assets + Supabase Storage.

import { useState, useRef, useMemo } from 'react';
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
  File,
} from 'lucide-react';
import { useCmsAssets, getAssetPublicUrl, type CmsAsset } from '../../../lib/cms';

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeIcon(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.startsWith('video/')) return FileVideo;
  return File;
}

// ── Component ───────────────────────────────────────────────────────

export default function CmsMediaLibrary() {
  const { assets, isLoading, error, uploadAsset, updateAsset, deleteAsset } = useCmsAssets();

  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [mimeFilter, setMimeFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CmsAsset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Upload form state ─────────────────────────────────────────────
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');

  // ── Edit form state ───────────────────────────────────────────────
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (mimeFilter && !a.mime_type.startsWith(mimeFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!a.filename.toLowerCase().includes(q) && !(a.alt_text ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [assets, mimeFilter, search]);

  function resetUpload() {
    setUploadFile(null);
    setUploadAltText('');
    setUploadCaption('');
    setShowUpload(false);
    setMutationError(null);
  }

  function openEdit(asset: CmsAsset) {
    setEditingAsset(asset);
    setEditAltText(asset.alt_text ?? '');
    setEditCaption(asset.caption ?? '');
    setMutationError(null);
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setMutationError(null);
    try {
      await uploadAsset.mutateAsync({
        file: uploadFile,
        altText: uploadAltText || undefined,
        caption: uploadCaption || undefined,
      });
      resetUpload();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  async function handleEditSave() {
    if (!editingAsset) return;
    setMutationError(null);
    try {
      await updateAsset.mutateAsync({
        id: editingAsset.id,
        altText: editAltText || undefined,
        caption: editCaption || undefined,
      });
      setEditingAsset(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleDelete(asset: CmsAsset) {
    setMutationError(null);
    try {
      await deleteAsset.mutateAsync(asset);
      setDeleteConfirm(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">Media Library</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading media...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">Media Library</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load media: {error}</span>
        </div>
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
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* ── Mutation error ──────────────────────────────────────── */}
      {mutationError && (
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mutationError}</span>
          <button onClick={() => setMutationError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Upload form ─────────────────────────────────────────── */}
      {showUpload && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#141418]">Upload Media</h2>
            <button onClick={resetUpload} className="text-[#6E879B] hover:text-[#5A7185]"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">File *</label>
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                accept="image/*,video/*,application/pdf"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Alt Text</label>
              <input
                type="text"
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Descriptive alt text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Caption</label>
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Optional caption"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={resetUpload} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">Cancel</button>
            <button
              onClick={handleUpload}
              disabled={!uploadFile || uploadAsset.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> {uploadAsset.isPending ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {/* ── Edit modal ──────────────────────────────────────────── */}
      {editingAsset && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#141418]">Edit: {editingAsset.filename}</h2>
            <button onClick={() => setEditingAsset(null)} className="text-[#6E879B] hover:text-[#5A7185]"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Alt Text</label>
              <input
                type="text"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Caption</label>
              <input
                type="text"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setEditingAsset(null)} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">Cancel</button>
            <button
              onClick={handleEditSave}
              disabled={updateAsset.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E879B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E8EDF1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
            placeholder="Search media..."
          />
        </div>
        <select
          value={mimeFilter}
          onChange={(e) => setMimeFilter(e.target.value)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          <option value="">All types</option>
          <option value="image/">Images</option>
          <option value="video/">Videos</option>
          <option value="application/">Documents</option>
        </select>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <Image className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">No media found</p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search || mimeFilter ? 'Try adjusting your filters.' : 'Upload your first media asset.'}
          </p>
          {!search && !mimeFilter && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Upload Media
            </button>
          )}
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => {
            const Icon = mimeIcon(asset.mime_type);
            const isImage = asset.mime_type.startsWith('image/');
            return (
              <div key={asset.id} className="bg-white rounded-lg border border-[#E8EDF1] overflow-hidden hover:border-[#6E879B] transition-colors group">
                <div className="aspect-square bg-[#F6F3EF] flex items-center justify-center relative overflow-hidden">
                  {isImage ? (
                    <img
                      src={getAssetPublicUrl(asset.storage_path)}
                      alt={asset.alt_text ?? asset.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Icon className="w-10 h-10 text-[#6E879B]/40" />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#141418]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(asset)} className="p-2 bg-white rounded-full text-[#6E879B] hover:text-[#5A7185]" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deleteConfirm === asset.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(asset)} className="px-2 py-1 bg-[#8E6464] text-white rounded text-xs">Del</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-white text-[#6E879B] rounded text-xs">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(asset.id)} className="p-2 bg-white rounded-full text-[#8E6464] hover:text-[#8E6464]" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-[#141418] truncate font-medium">{asset.filename}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#6E879B]">{formatBytes(asset.size_bytes)}</span>
                    <span className="text-[10px] text-[#6E879B]">{formatDate(asset.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
