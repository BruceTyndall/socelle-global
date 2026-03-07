// ── AdminPagesHub — WO-OVERHAUL-04 ─────────────────────────────────
// CMS page editor. CRUD on cms_pages table.
// Data label: LIVE — reads/writes cms_pages with real updated_at

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Search,
  X,
  Save,
  ArrowLeft,
  FileText,
  Globe,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  template: string;
  blocks: unknown[];
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

type PageStatus = CmsPage['status'];

const TEMPLATES = ['default', 'landing', 'article', 'minimal', 'full-width'] as const;

// ── Helpers ────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_COLORS: Record<PageStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

// ── Component ──────────────────────────────────────────────────────

export default function AdminPagesHub() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    og_image: '',
    template: 'default',
    status: 'draft' as PageStatus,
    blocks: '[]',
  });

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('cms_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
      setPages([]);
    } else {
      setPages((data as CmsPage[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, search, statusFilter]);

  // ── CRUD ───────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      meta_title: '',
      meta_description: '',
      og_image: '',
      template: 'default',
      status: 'draft',
      blocks: '[]',
    });
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (page: CmsPage) => {
    setForm({
      title: page.title,
      slug: page.slug,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      og_image: page.og_image || '',
      template: page.template,
      status: page.status,
      blocks: JSON.stringify(page.blocks, null, 2),
    });
    setEditing(page);
    setCreating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    let parsedBlocks: unknown[];
    try {
      parsedBlocks = JSON.parse(form.blocks);
    } catch {
      setError('Invalid JSON in blocks field');
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_image: form.og_image || null,
      template: form.template,
      status: form.status,
      blocks: parsedBlocks,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error: err } = await supabase
        .from('cms_pages')
        .update(payload)
        .eq('id', editing.id);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMsg('Page updated');
        setEditing(null);
      }
    } else {
      const { error: err } = await supabase.from('cms_pages').insert(payload);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMsg('Page created');
        setCreating(false);
      }
    }
    setSaving(false);
    resetForm();
    fetchPages();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this page? This cannot be undone.')) return;
    const { error: err } = await supabase.from('cms_pages').delete().eq('id', id);
    if (err) setError(err.message);
    else fetchPages();
  };

  const handleCancel = () => {
    setEditing(null);
    setCreating(false);
    resetForm();
  };

  // ── Editor view ────────────────────────────────────────────────

  if (editing || creating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {editing ? 'Edit Page' : 'New Page'}
            </h1>
            <p className="text-sm text-gray-500">
              {editing ? `Editing: ${editing.slug}` : 'Create a new CMS page'}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Page title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="/page-slug"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PageStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <input
              type="text"
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SEO title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="SEO description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
            <input
              type="text"
              value={form.og_image}
              onChange={(e) => setForm({ ...form, og_image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blocks (JSON)</label>
            <textarea
              value={form.blocks}
              onChange={(e) => setForm({ ...form, blocks: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
              placeholder='[{"type":"heading","content":"Hello"}]'
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editing ? 'Update Page' : 'Create Page'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            CMS Pages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage site pages &mdash; {pages.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPages}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
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
            placeholder="Search pages..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading pages...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No pages found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Template</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{page.title}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{page.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{page.template}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[page.status]}`}>
                        {page.status === 'published' && <Eye className="w-3 h-3 mr-1" />}
                        {page.status === 'draft' && <EyeOff className="w-3 h-3 mr-1" />}
                        {page.status === 'archived' && <Archive className="w-3 h-3 mr-1" />}
                        {page.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(page.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(page)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Globe className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
