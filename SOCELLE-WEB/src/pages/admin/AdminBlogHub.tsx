// ── AdminBlogHub — WO-OVERHAUL-04 ──────────────────────────────────
// Blog manager. CRUD on blog_posts table.
// Data label: LIVE — reads/writes blog_posts with real updated_at
// Replaces previous stories-based implementation.

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
  BookOpen,
  Star,
  StarOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  body: unknown[];
  category: string | null;
  tags: string[];
  author_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
}

type PostStatus = BlogPost['status'];

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

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

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

// ── Component ──────────────────────────────────────────────────────

export default function AdminBlogHub() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_image: '',
    body: '[]',
    category: '',
    tags: '',
    author_name: 'Socelle Editorial',
    author_avatar: '',
    status: 'draft' as PostStatus,
    featured: false,
    seo_title: '',
    seo_description: '',
    og_image: '',
  });

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
      setPosts([]);
    } else {
      setPosts((data as BlogPost[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  // ── CRUD ───────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      cover_image: '',
      body: '[]',
      category: '',
      tags: '',
      author_name: 'Socelle Editorial',
      author_avatar: '',
      status: 'draft',
      featured: false,
      seo_title: '',
      seo_description: '',
      og_image: '',
    });
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      cover_image: post.cover_image || '',
      body: JSON.stringify(post.body, null, 2),
      category: post.category || '',
      tags: (post.tags || []).join(', '),
      author_name: post.author_name || 'Socelle Editorial',
      author_avatar: post.author_avatar || '',
      status: post.status,
      featured: post.featured,
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      og_image: post.og_image || '',
    });
    setEditing(post);
    setCreating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    let parsedBody: unknown[];
    try {
      parsedBody = JSON.parse(form.body);
    } catch {
      setError('Invalid JSON in body field');
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      cover_image: form.cover_image || null,
      body: parsedBody,
      category: form.category || null,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      author_name: form.author_name || null,
      author_avatar: form.author_avatar || null,
      status: form.status,
      featured: form.featured,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      og_image: form.og_image || null,
      published_at:
        form.status === 'published' && !editing?.published_at
          ? new Date().toISOString()
          : editing?.published_at || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error: err } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', editing.id);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMsg('Post updated');
        setEditing(null);
      }
    } else {
      const { error: err } = await supabase.from('blog_posts').insert(payload);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMsg('Post created');
        setCreating(false);
      }
    }
    setSaving(false);
    resetForm();
    fetchPosts();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    const { error: err } = await supabase.from('blog_posts').delete().eq('id', id);
    if (err) setError(err.message);
    else fetchPosts();
  };

  const toggleFeatured = async (post: BlogPost) => {
    const { error: err } = await supabase
      .from('blog_posts')
      .update({ featured: !post.featured })
      .eq('id', post.id);
    if (err) setError(err.message);
    else fetchPosts();
  };

  const toggleStatus = async (post: BlogPost, newStatus: PostStatus) => {
    const update: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'published' && !post.published_at) update.published_at = new Date().toISOString();
    const { error: err } = await supabase.from('blog_posts').update(update).eq('id', post.id);
    if (err) setError(err.message);
    else fetchPosts();
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
              {editing ? 'Edit Blog Post' : 'New Blog Post'}
            </h1>
            <p className="text-sm text-gray-500">
              {editing ? `Editing: ${editing.slug}` : 'Create a new blog post'}
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
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Post</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="text"
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Brief summary..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body (JSON blocks)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={10}
              placeholder='[{"type":"paragraph","content":"Your content here..."}]'
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="peptides, skincare, clinical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Custom SEO title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <input
                type="text"
                value={form.seo_description}
                onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Meta description"
              />
            </div>
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

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
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
            <BookOpen className="w-6 h-6" />
            Blog Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {posts.length} posts &mdash; Data label: LIVE (blog_posts table)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
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
            New Post
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
            placeholder="Search posts..."
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
          <span className="ml-2 text-gray-500 text-sm">Loading posts...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No posts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Published</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-gray-400 text-xs font-mono">/{post.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{post.category || '\u2014'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[post.status]}`}>
                        {post.status === 'published' && <Eye className="w-3 h-3 mr-1" />}
                        {post.status === 'draft' && <EyeOff className="w-3 h-3 mr-1" />}
                        {post.status === 'archived' && <Archive className="w-3 h-3 mr-1" />}
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(post)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={post.featured ? 'Remove featured' : 'Mark featured'}
                      >
                        {post.featured ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {post.published_at ? formatDate(post.published_at) : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(post)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        {post.status === 'draft' && (
                          <button
                            onClick={() => toggleStatus(post, 'published')}
                            className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                            title="Publish"
                          >
                            <Eye className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {post.status === 'published' && (
                          <button
                            onClick={() => toggleStatus(post, 'draft')}
                            className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Unpublish"
                          >
                            <EyeOff className="w-4 h-4 text-yellow-600" />
                          </button>
                        )}
                        {post.status !== 'archived' && (
                          <button
                            onClick={() => toggleStatus(post, 'archived')}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
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
