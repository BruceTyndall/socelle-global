// ── CmsPagesList — WO-CMS-03 ────────────────────────────────────────
// Full CRUD for cms_pages table. List with space + status filters.
// Data label: LIVE — reads/writes cms_pages via useCmsPages hooks.

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
  FileText,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useCmsPages,
  useCmsSpaces,
  useCmsTemplates,
  type CmsPage,
  type CmsPageInsert,
  type CmsStatus,
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

const STATUS_COLORS: Record<CmsStatus, string> = {
  draft: 'bg-[#A97A4C]/10 text-[#A97A4C]',
  published: 'bg-[#5F8A72]/10 text-[#5F8A72]',
  archived: 'bg-[#141418]/10 text-[#141418]/60',
};

// ── Component ───────────────────────────────────────────────────────

export default function CmsPagesList() {
  const { pages, isLoading, error, createPage, updatePage, deletePage } = useCmsPages();
  const { spaces } = useCmsSpaces();
  const { templates } = useCmsTemplates();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CmsStatus | ''>('');
  const [spaceFilter, setSpaceFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSpaceId, setFormSpaceId] = useState('');
  const [formTemplateId, setFormTemplateId] = useState('');
  const [formStatus, setFormStatus] = useState<CmsStatus>('draft');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');

  const filtered = useMemo(() => {
    return pages.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (spaceFilter && p.space_id !== spaceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [pages, statusFilter, spaceFilter, search]);

  function resetForm() {
    setFormTitle('');
    setFormSlug('');
    setFormSpaceId('');
    setFormTemplateId('');
    setFormStatus('draft');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setEditingPage(null);
    setShowForm(false);
    setMutationError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(page: CmsPage) {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormSpaceId(page.space_id);
    setFormTemplateId(page.template_id ?? '');
    setFormStatus(page.status);
    setFormSeoTitle(page.seo_title ?? '');
    setFormSeoDescription(page.seo_description ?? '');
    setShowForm(true);
    setMutationError(null);
  }

  async function handleSubmit() {
    setMutationError(null);
    try {
      if (editingPage) {
        await updatePage.mutateAsync({
          id: editingPage.id,
          title: formTitle,
          slug: formSlug,
          space_id: formSpaceId || editingPage.space_id,
          template_id: formTemplateId || null,
          status: formStatus,
          seo_title: formSeoTitle || null,
          seo_description: formSeoDescription || null,
        });
      } else {
        if (!formSpaceId) {
          setMutationError('Space is required.');
          return;
        }
        const input: CmsPageInsert = {
          title: formTitle,
          slug: formSlug || slugify(formTitle),
          space_id: formSpaceId,
          template_id: formTemplateId || null,
          status: formStatus,
          published_at: null,
          author_id: null,
          seo_title: formSeoTitle || null,
          seo_description: formSeoDescription || null,
          seo_og_image: null,
          seo_canonical: null,
          seo_schema_type: null,
          metadata: null,
        };
        await createPage.mutateAsync(input);
      }
      resetForm();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  async function handleDelete(id: string) {
    setMutationError(null);
    try {
      await deletePage.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Pages</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading pages...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Pages</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load pages: {error}</span>
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
          <h1 className="text-2xl font-semibold text-[#141418]">CMS Pages</h1>
          <span className="text-sm text-[#6E879B]">({pages.length})</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Page
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

      {/* ── Create/Edit form ────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#141418]">
              {editingPage ? 'Edit Page' : 'New Page'}
            </h2>
            <button onClick={resetForm} className="text-[#6E879B] hover:text-[#5A7185]"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  if (!editingPage) setFormSlug(slugify(e.target.value));
                }}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Page title"
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
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Space *</label>
              <select
                value={formSpaceId}
                onChange={(e) => setFormSpaceId(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              >
                <option value="">Select a space</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Template</label>
              <select
                value={formTemplateId}
                onChange={(e) => setFormTemplateId(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              >
                <option value="">None</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as CmsStatus)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">SEO Title</label>
              <input
                type="text"
                value={formSeoTitle}
                onChange={(e) => setFormSeoTitle(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Optional SEO title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">SEO Description</label>
              <textarea
                value={formSeoDescription}
                onChange={(e) => setFormSeoDescription(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                rows={2}
                placeholder="Optional SEO description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!formTitle || createPage.isPending || updatePage.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {editingPage ? 'Update' : 'Create'}
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
            placeholder="Search pages..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CmsStatus | '')}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={spaceFilter}
          onChange={(e) => setSpaceFilter(e.target.value)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          <option value="">All spaces</option>
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <FileText className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">No pages found</p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search || statusFilter || spaceFilter ? 'Try adjusting your filters.' : 'Create your first CMS page to get started.'}
          </p>
          {!search && !statusFilter && !spaceFilter && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create Page
            </button>
          )}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EDF1] bg-[#F6F3EF]">
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Title</th>
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-[#141418]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr key={page.id} className="border-b border-[#E8EDF1] last:border-0 hover:bg-[#F6F3EF]/50">
                  <td className="px-4 py-3 text-[#141418] font-medium">{page.title}</td>
                  <td className="px-4 py-3 text-[#6E879B]">/{page.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[page.status]}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6E879B]">{formatDate(page.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(page)}
                        className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const newStatus = page.status === 'published' ? 'draft' : 'published';
                          updatePage.mutate({ id: page.id, status: newStatus });
                        }}
                        className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                        title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {page.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {deleteConfirm === page.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="px-2 py-1 bg-[#8E6464] text-white rounded text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-[#6E879B] text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(page.id)}
                          className="p-1.5 text-[#8E6464] hover:text-[#8E6464] hover:bg-[#8E6464]/10 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
