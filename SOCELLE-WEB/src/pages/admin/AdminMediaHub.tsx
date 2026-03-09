// ── AdminMediaHub — WO-OVERHAUL-04 ─────────────────────────────────
// Media library. CRUD on media_library table. Upload to Supabase Storage.
// Data label: LIVE — reads/writes media_library with real updated_at

import { useState, useMemo } from 'react';
import {
  Upload,
  Trash2,
  Search,
  X,
  Image as ImageIcon,
  Film,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Grid,
  List,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  public_url: string | null;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  tags: string[];
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMediaIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.startsWith('video/')) return Film;
  return FileText;
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// ── Component ──────────────────────────────────────────────────────

export default function AdminMediaHub() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────

  const { data: items = [], isLoading: loading, refetch: fetchMedia } = useQuery({
    queryKey: ['admin-media-library'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw new Error(err.message);
      return (data as MediaItem[]) || [];
    },
  });

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.original_filename.toLowerCase().includes(search.toLowerCase()) ||
        (item.alt_text || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'image' && item.mime_type.startsWith('image/')) ||
        (typeFilter === 'video' && item.mime_type.startsWith('video/')) ||
        (typeFilter === 'other' && !item.mime_type.startsWith('image/') && !item.mime_type.startsWith('video/'));
      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  // ── Upload ─────────────────────────────────────────────────────

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    let uploadCount = 0;

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() || '';
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storagePath = `uploads/${safeName}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(storagePath, file, { contentType: file.type });

      if (uploadErr) {
        setError(`Upload failed for ${file.name}: ${uploadErr.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

      // Insert into media_library
      const { error: insertErr } = await supabase.from('media_library').insert({
        filename: safeName,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
        public_url: urlData?.publicUrl || null,
        folder: 'uploads',
        tags: [],
      });

      if (insertErr) {
        setError(`Record insert failed for ${file.name}: ${insertErr.message}`);
      } else {
        uploadCount++;
      }
    }

    if (uploadCount > 0) {
      setSuccessMsg(`${uploadCount} file${uploadCount > 1 ? 's' : ''} uploaded`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });

    // Reset file input
    e.target.value = '';
  };

  // ── Delete ─────────────────────────────────────────────────────

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.original_filename}"? This cannot be undone.`)) return;

    // Delete from storage
    await supabase.storage.from('media').remove([item.storage_path]);

    // Delete from table
    const { error: err } = await supabase.from('media_library').delete().eq('id', item.id);
    if (err) setError(err.message);
    else queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
  };

  // ── Copy URL ───────────────────────────────────────────────────

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccessMsg('URL copied to clipboard');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Media Library
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} files &mdash; {formatBytes(items.reduce((s, i) => s + i.size_bytes, 0))} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchMedia()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
              accept="image/*,video/*,.pdf,.svg"
            />
          </label>
        </div>
      </div>

      {/* Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="other">Other</option>
        </select>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <Grid className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading media...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No media files found</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const Icon = getMediaIcon(item.mime_type);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {isImage(item.mime_type) && item.public_url ? (
                    <img
                      src={item.public_url}
                      alt={item.alt_text || item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-900 truncate" title={item.original_filename}>
                    {item.original_filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatBytes(item.size_bytes)} &middot; {formatDate(item.created_at)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.public_url && (
                      <>
                        <button
                          onClick={() => copyUrl(item.public_url!)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={item.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                          title="Open"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 ml-auto"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">File</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Size</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Uploaded</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const Icon = getMediaIcon(item.mime_type);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                            {isImage(item.mime_type) && item.public_url ? (
                              <img
                                src={item.public_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.original_filename}</p>
                            <p className="text-xs text-gray-400 font-mono truncate">{item.storage_path}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.mime_type}</td>
                      <td className="px-4 py-3 text-gray-500">{formatBytes(item.size_bytes)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.public_url && (
                            <>
                              <button
                                onClick={() => copyUrl(item.public_url!)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4 text-gray-500" />
                              </button>
                              <a
                                href={item.public_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Open"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-500" />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
