// ── CmsSpacesConfig — WO-CMS-03 ─────────────────────────────────────
// Space management. CRUD for cms_spaces with settings JSONB editor.
// Data label: LIVE — reads/writes cms_spaces via useCmsSpaces hooks.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  ArrowLeft,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  FileText,
  BookOpen,
} from 'lucide-react';
import type { Json } from '../../../lib/database.types';
import {
  useCmsSpaces,
  useCmsPages,
  useCmsPosts,
  type CmsSpace,
  type CmsSpaceInsert,
} from '../../../lib/cms';

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Component ───────────────────────────────────────────────────────

export default function CmsSpacesConfig() {
  const { spaces, isLoading, error, createSpace, updateSpace, deleteSpace } = useCmsSpaces();
  const { pages } = useCmsPages();
  const { posts } = useCmsPosts();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<CmsSpace | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSettings, setFormSettings] = useState('{}');

  // ── Content counts per space ──────────────────────────────────────
  const spaceCounts = useMemo(() => {
    const counts: Record<string, { pages: number; posts: number }> = {};
    for (const space of spaces) {
      counts[space.id] = { pages: 0, posts: 0 };
    }
    for (const page of pages) {
      if (counts[page.space_id]) {
        counts[page.space_id].pages++;
      }
    }
    for (const post of posts) {
      if (counts[post.space_id]) {
        counts[post.space_id].posts++;
      }
    }
    return counts;
  }, [spaces, pages, posts]);

  const filtered = useMemo(() => {
    if (!search) return spaces;
    const q = search.toLowerCase();
    return spaces.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    );
  }, [spaces, search]);

  function resetForm() {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormSettings('{}');
    setEditingSpace(null);
    setShowForm(false);
    setMutationError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(space: CmsSpace) {
    setEditingSpace(space);
    setFormName(space.name);
    setFormSlug(space.slug);
    setFormDescription(space.description ?? '');
    setFormSettings(
      space.settings
        ? typeof space.settings === 'string'
          ? space.settings
          : JSON.stringify(space.settings, null, 2)
        : '{}'
    );
    setShowForm(true);
    setMutationError(null);
  }

  async function handleSubmit() {
    setMutationError(null);
    if (!formName.trim()) {
      setMutationError('Name is required.');
      return;
    }

    let parsedSettings: unknown;
    try {
      parsedSettings = JSON.parse(formSettings);
    } catch {
      setMutationError('Settings must be valid JSON.');
      return;
    }

    try {
      if (editingSpace) {
        await updateSpace.mutateAsync({
          id: editingSpace.id,
          name: formName,
          slug: formSlug,
          description: formDescription || null,
          settings: parsedSettings as Json,
        });
      } else {
        const input: CmsSpaceInsert = {
          name: formName,
          slug: formSlug || slugify(formName),
          description: formDescription || null,
          settings: parsedSettings as Json,
        };
        await createSpace.mutateAsync(input);
      }
      resetForm();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  async function handleDelete(id: string) {
    setMutationError(null);
    const counts = spaceCounts[id];
    if (counts && (counts.pages > 0 || counts.posts > 0)) {
      setMutationError(
        `Cannot delete space with ${counts.pages} page(s) and ${counts.posts} post(s). Move or remove content first.`
      );
      setDeleteConfirm(null);
      return;
    }
    try {
      await deleteSpace.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Spaces</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading spaces...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Spaces</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load spaces: {error}</span>
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
          <h1 className="text-2xl font-semibold text-[#141418]">CMS Spaces</h1>
          <span className="text-sm text-[#6E879B]">({spaces.length})</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Space
        </button>
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

      {/* ── Create/Edit form ────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#141418]">
              {editingSpace ? 'Edit Space' : 'New Space'}
            </h2>
            <button onClick={resetForm} className="text-[#6E879B] hover:text-[#5A7185]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingSpace) setFormSlug(slugify(e.target.value));
                }}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Space name (e.g., Blog, Help Center)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Slug</label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="auto-generated"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                rows={2}
                placeholder="What this space is used for"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">Settings (JSON)</label>
              <textarea
                value={formSettings}
                onChange={(e) => setFormSettings(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B] font-mono"
                rows={6}
                placeholder='{ "theme": "default", "features": [] }'
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formName || createSpace.isPending || updateSpace.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {editingSpace ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* ── Search ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E879B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E8EDF1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
            placeholder="Search spaces..."
          />
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <FolderOpen className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">No spaces found</p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search ? 'Try adjusting your search.' : 'Create your first CMS space to organize content.'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create Space
            </button>
          )}
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((space) => {
            const counts = spaceCounts[space.id] ?? { pages: 0, posts: 0 };
            return (
              <div
                key={space.id}
                className="bg-white rounded-lg border border-[#E8EDF1] p-4 hover:border-[#6E879B] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-[#141418]">{space.name}</h3>
                    <span className="text-xs text-[#6E879B]">/{space.slug}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(space)}
                      className="p-1 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirm === space.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(space.id)}
                          className="px-2 py-0.5 bg-[#8E6464] text-white rounded text-xs"
                        >
                          Del
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-[#6E879B] text-xs px-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(space.id)}
                        className="p-1 text-[#8E6464] hover:bg-[#8E6464]/10 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {space.description && (
                  <p className="text-xs text-[#6E879B] mb-3">{space.description}</p>
                )}

                {/* ── Content counts ──────────────────────────────── */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#141418]">
                    <FileText className="w-3.5 h-3.5 text-[#6E879B]" />
                    <span>{counts.pages} page{counts.pages !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#141418]">
                    <BookOpen className="w-3.5 h-3.5 text-[#5F8A72]" />
                    <span>{counts.posts} post{counts.posts !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* ── Settings preview ────────────────────────────── */}
                {space.settings && typeof space.settings === 'object' && Object.keys(space.settings as object).length > 0 && (
                  <div className="bg-[#F6F3EF] rounded p-2 mb-2">
                    <p className="text-[10px] text-[#141418]/60 font-medium mb-1">Settings</p>
                    <pre className="text-[10px] text-[#141418]/70 font-mono max-h-16 overflow-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(space.settings, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[#6E879B]">
                    Created {formatDate(space.created_at)}
                  </span>
                  <span className="text-[10px] text-[#6E879B]">
                    Updated {formatDate(space.updated_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
