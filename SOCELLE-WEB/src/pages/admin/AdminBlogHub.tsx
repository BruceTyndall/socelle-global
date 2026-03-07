import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, ChevronDown, Search, X, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  hero_image_url: string | null;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  category: string | null;
  tags: string[];
  related_signal_ids: string[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['Industry News', 'Ingredient Intel', 'Brand Watch', 'Clinical Research', 'Market Signals', 'Practitioner Insights', 'Regulatory', 'Events'];
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-700' },
  published: { label: 'Published', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500' },
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Data label: LIVE — reads/writes stories table with real updated_at
export default function AdminBlogHub() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editing, setEditing] = useState<Story | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    hero_image_url: '',
    author_name: 'Socelle Editorial',
    status: 'draft' as 'draft' | 'published' | 'archived',
    category: '',
    tags: '' as string,
    seo_title: '',
    seo_description: '',
  });

  async function fetchStories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data && !error) setStories(data);
    setLoading(false);
  }

  useEffect(() => { fetchStories(); }, []);

  const filtered = useMemo(() => {
    let result = stories;
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.slug.includes(q) || (s.category || '').toLowerCase().includes(q));
    }
    return result;
  }, [stories, statusFilter, search]);

  function resetForm() {
    setForm({ title: '', slug: '', excerpt: '', body: '', hero_image_url: '', author_name: 'Socelle Editorial', status: 'draft', category: '', tags: '', seo_title: '', seo_description: '' });
  }

  function startCreate() {
    resetForm();
    setEditing(null);
    setCreating(true);
  }

  function startEdit(story: Story) {
    setForm({
      title: story.title,
      slug: story.slug,
      excerpt: story.excerpt || '',
      body: story.body || '',
      hero_image_url: story.hero_image_url || '',
      author_name: story.author_name,
      status: story.status,
      category: story.category || '',
      tags: story.tags.join(', '),
      seo_title: story.seo_title || '',
      seo_description: story.seo_description || '',
    });
    setEditing(story);
    setCreating(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      body: form.body || null,
      hero_image_url: form.hero_image_url || null,
      author_name: form.author_name,
      status: form.status,
      category: form.category || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      published_at: form.status === 'published' && !editing?.published_at ? new Date().toISOString() : editing?.published_at || null,
    };

    if (editing) {
      await supabase.from('stories').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('stories').insert(payload);
    }
    setSaving(false);
    setCreating(false);
    setEditing(null);
    resetForm();
    fetchStories();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this story permanently?')) return;
    await supabase.from('stories').delete().eq('id', id);
    fetchStories();
  }

  async function toggleStatus(story: Story, newStatus: 'draft' | 'published' | 'archived') {
    const update: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'published' && !story.published_at) update.published_at = new Date().toISOString();
    await supabase.from('stories').update(update).eq('id', story.id);
    fetchStories();
  }

  // Editor view
  if (creating) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => { setCreating(false); setEditing(null); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to stories
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{editing ? 'Edit Story' : 'New Story'}</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900" placeholder="Story title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 font-mono text-sm" placeholder="auto-generated-from-title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' | 'archived' })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
            <input type="text" value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 text-sm" rows={2} placeholder="Brief summary..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 text-sm font-mono" rows={12} placeholder="Story content (markdown supported)..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 text-sm" placeholder="peptides, skincare, clinical" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 text-sm" placeholder="Custom SEO title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <input type="text" value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 text-sm" placeholder="Meta description" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} disabled={saving || !form.title} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : editing ? 'Update Story' : 'Create Story'}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Editorial Hub</h1>
          <p className="text-gray-500 text-sm mt-1">{stories.length} stories · Data label: LIVE</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer">
          <Plus className="w-4 h-4" /> New Story
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stories..." className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'published', 'archived'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Table */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading stories...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No stories found. Create your first one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Title</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Updated</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((story) => (
                <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">{story.title}</div>
                    <div className="text-gray-400 text-xs font-mono">/{story.slug}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{story.category || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[story.status].color}`}>
                      {STATUS_LABELS[story.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(story.updated_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(story)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                      {story.status === 'draft' && (
                        <button onClick={() => toggleStatus(story, 'published')} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 cursor-pointer" title="Publish"><Eye className="w-4 h-4" /></button>
                      )}
                      {story.status === 'published' && (
                        <button onClick={() => toggleStatus(story, 'draft')} className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 cursor-pointer" title="Unpublish"><EyeOff className="w-4 h-4" /></button>
                      )}
                      {story.status !== 'archived' && (
                        <button onClick={() => toggleStatus(story, 'archived')} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-500 cursor-pointer" title="Archive"><Archive className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleDelete(story.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
