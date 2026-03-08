// ── CmsPostsList — WO-CMS-03 ────────────────────────────────────────
// Full CRUD for cms_posts table. Blog/brief/article content management.
// Data label: LIVE — reads/writes cms_posts via useCmsPosts hooks.

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
  BookOpen,
  Star,
  StarOff,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useCmsPosts,
  useCmsSpaces,
  type CmsPost,
  type CmsPostInsert,
  type CmsStatus,
} from '../../../lib/cms';

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_COLORS: Record<CmsStatus, string> = {
  draft: 'bg-[#A97A4C]/10 text-[#A97A4C]',
  published: 'bg-[#5F8A72]/10 text-[#5F8A72]',
  archived: 'bg-[#141418]/10 text-[#141418]/60',
};

const CATEGORIES = [
  'Industry News',
  'Ingredient Intel',
  'Brand Watch',
  'Clinical Research',
  'Market Signals',
  'Practitioner Insights',
  'Regulatory',
  'Events',
  'Education',
  'Product Reviews',
];

// ── Component ───────────────────────────────────────────────────────

export default function CmsPostsList() {
  const { posts, isLoading, error, createPost, updatePost, deletePost } = useCmsPosts();
  const { spaces } = useCmsSpaces();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CmsStatus | ''>('');
  const [spaceFilter, setSpaceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CmsPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSpaceId, setFormSpaceId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formStatus, setFormStatus] = useState<CmsStatus>('draft');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTags, setFormTags] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');

  const categories = useMemo(() => {
    const fromPosts = posts.map((p) => p.category).filter(Boolean) as string[];
    return [...new Set([...CATEGORIES, ...fromPosts])].sort();
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (spaceFilter && p.space_id !== spaceFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [posts, statusFilter, spaceFilter, categoryFilter, search]);

  function resetForm() {
    setFormTitle('');
    setFormSlug('');
    setFormSpaceId('');
    setFormCategory('');
    setFormExcerpt('');
    setFormBody('');
    setFormStatus('draft');
    setFormFeatured(false);
    setFormTags('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setEditingPost(null);
    setShowForm(false);
    setMutationError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(post: CmsPost) {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormSpaceId(post.space_id);
    setFormCategory(post.category ?? '');
    setFormExcerpt(post.excerpt ?? '');
    setFormBody(post.body ?? '');
    setFormStatus(post.status);
    setFormFeatured(post.featured ?? false);
    setFormTags(post.tags?.join(', ') ?? '');
    setFormSeoTitle(post.seo_title ?? '');
    setFormSeoDescription(post.seo_description ?? '');
    setShowForm(true);
    setMutationError(null);
  }

  async function handleSubmit() {
    setMutationError(null);
    try {
      const tags = formTags.split(',').map((t) => t.trim()).filter(Boolean);
      if (editingPost) {
        await updatePost.mutateAsync({
          id: editingPost.id,
          title: formTitle,
          slug: formSlug,
          space_id: formSpaceId || editingPost.space_id,
          category: formCategory || null,
          excerpt: formExcerpt || null,
          body: formBody || null,
          status: formStatus,
          featured: formFeatured,
          tags: tags.length > 0 ? tags : null,
          seo_title: formSeoTitle || null,
          seo_description: formSeoDescription || null,
        });
      } else {
        if (!formSpaceId) {
          setMutationError('Space is required.');
          return;
        }
        const input: CmsPostInsert = {
          title: formTitle,
          slug: formSlug || slugify(formTitle),
          space_id: formSpaceId,
          category: formCategory || null,
          excerpt: formExcerpt || null,
          body: formBody || null,
          hero_image: null,
          author_id: null,
          tags: tags.length > 0 ? tags : null,
          status: formStatus,
          published_at: null,
          reading_time: null,
          featured: formFeatured,
          seo_title: formSeoTitle || null,
          seo_description: formSeoDescription || null,
          seo_og_image: null,
          seo_canonical: null,
          source_type: null,
          metadata: null,
        };
        await createPost.mutateAsync(input);
      }
      resetForm();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  async function handleDelete(id: string) {
    setMutationError(null);
    try {
      await deletePost.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Posts</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading posts...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Posts</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load posts: {error}</span>
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
          <h1 className="text-2xl font-semibold text-[#141418]">CMS Posts</h1>
          <span className="text-sm text-[#6E879B]">({posts.length})</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Post
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
              {editingPost ? 'Edit Post' : 'New Post'}
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
                  if (!editingPost) setFormSlug(slugify(e.target.value));
                }}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Slug</label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
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
              <label className="block text-sm font-medium text-[#141418] mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
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
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-sm text-[#141418] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-[#E8EDF1] text-[#6E879B] focus:ring-[#6E879B]"
                />
                Featured post
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="e.g., skincare, trends, medspa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">SEO Title</label>
              <input
                type="text"
                value={formSeoTitle}
                onChange={(e) => setFormSeoTitle(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">Excerpt</label>
              <textarea
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                rows={2}
                placeholder="Short summary..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">Body</label>
              <textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B] font-mono"
                rows={8}
                placeholder="Post content (Markdown supported)..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">SEO Description</label>
              <textarea
                value={formSeoDescription}
                onChange={(e) => setFormSeoDescription(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!formTitle || createPost.isPending || updatePost.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {editingPost ? 'Update' : 'Create'}
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
            placeholder="Search posts..."
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
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">No posts found</p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search || statusFilter || spaceFilter || categoryFilter ? 'Try adjusting your filters.' : 'Create your first CMS post to get started.'}
          </p>
          {!search && !statusFilter && !spaceFilter && !categoryFilter && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create Post
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
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Category</th>
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Featured</th>
                <th className="text-left px-4 py-3 font-medium text-[#141418]">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-[#141418]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-[#E8EDF1] last:border-0 hover:bg-[#F6F3EF]/50">
                  <td className="px-4 py-3 text-[#141418] font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-[#6E879B]">{post.category ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updatePost.mutate({ id: post.id, featured: !post.featured })}
                      className="p-1 text-[#6E879B] hover:text-[#A97A4C]"
                      title={post.featured ? 'Remove featured' : 'Mark featured'}
                    >
                      {post.featured ? <Star className="w-4 h-4 fill-[#A97A4C] text-[#A97A4C]" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#6E879B]">{formatDate(post.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(post)} className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const newStatus = post.status === 'published' ? 'draft' : 'published';
                          updatePost.mutate({ id: post.id, status: newStatus });
                        }}
                        className="p-1.5 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded"
                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {deleteConfirm === post.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(post.id)} className="px-2 py-1 bg-[#8E6464] text-white rounded text-xs">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[#6E879B] text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(post.id)} className="p-1.5 text-[#8E6464] hover:bg-[#8E6464]/10 rounded" title="Delete">
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
