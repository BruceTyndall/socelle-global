import { useState } from 'react';
import { Plus, Globe, AlertCircle, Loader2, X } from 'lucide-react';
import { useLandingPages } from '../../lib/useLandingPages';
import type { LandingPage } from '../../lib/useLandingPages';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-15: Landing Page List (/marketing/landing-pages) ─────
// Data source: landing_pages table via useLandingPages()
// isLive flag drives DEMO badge.

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-graphite/10 text-graphite/60',
  published: 'bg-signal-up/10 text-signal-up',
  archived: 'bg-graphite/5 text-graphite/30',
};

export default function LandingPageList() {
  const { pages, isLive, loading, error, createPage, refetch } = useLandingPages();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !slug.trim()) return;
    setCreating(true);
    await createPage({
      title: title.trim(),
      slug: slug.trim(),
      campaign_id: null,
      body: { blocks: [] },
      status: 'draft',
    });
    setCreating(false);
    setShowCreate(false);
    setTitle('');
    setSlug('');
  };

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Landing Pages</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">Campaign landing pages with conversion tracking</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
        </div>

        {/* Create Panel */}
        {showCreate && (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-graphite font-sans">Create Landing Page</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg text-graphite/30 hover:text-graphite transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }}
                  placeholder="Page title"
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="page-slug"
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="h-9 px-4 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !slug.trim() || creating}
                className="h-9 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors disabled:opacity-40"
              >
                {creating ? 'Creating...' : 'Create Page'}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : error ? (
          <ErrorState
            title="Landing pages unavailable"
            message={error}
            onRetry={() => void refetch()}
          />
        ) : pages.length === 0 ? (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-12 text-center">
            <Globe className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
            <p className="text-sm text-graphite/50 font-sans">No landing pages yet. Create one to pair with a campaign.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 mt-4 h-10 px-4 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          </div>
        ) : (
          <div className="bg-mn-card border border-graphite/8 rounded-xl overflow-hidden">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Views</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {pages.map((page: LandingPage) => (
                  <tr key={page.id} className="hover:bg-mn-surface/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-graphite">{page.title}</p>
                      <p className="text-xs text-graphite/30 font-mono">/{page.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize font-sans ${STATUS_COLORS[page.status] || ''}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-graphite/60">{page.views.toLocaleString()}</td>
                    <td className="px-5 py-3 text-graphite/60">{page.conversions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
