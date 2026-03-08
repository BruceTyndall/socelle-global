// ── CmsDashboard — WO-CMS-03 ────────────────────────────────────────
// CMS overview dashboard with counts, recent activity, and quick links.
// Data label: LIVE — reads from cms_pages, cms_posts, cms_assets tables.

import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Image,
  Layout,
  Layers,
  FolderOpen,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useCmsPages, useCmsPosts, useCmsAssets, useCmsSpaces, useCmsTemplates, useCmsBlocks } from '../../../lib/cms';

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Component ───────────────────────────────────────────────────────

export default function CmsDashboard() {
  const { pages, isLoading: pagesLoading, error: pagesError } = useCmsPages();
  const { posts, isLoading: postsLoading, error: postsError } = useCmsPosts();
  const { assets, isLoading: assetsLoading, error: assetsError } = useCmsAssets();
  const { spaces, isLoading: spacesLoading, error: spacesError } = useCmsSpaces();
  const { templates, isLoading: templatesLoading, error: templatesError } = useCmsTemplates();
  const { blocks, isLoading: blocksLoading, error: blocksError } = useCmsBlocks({ reusableOnly: true });

  const isLoading = pagesLoading || postsLoading || assetsLoading || spacesLoading || templatesLoading || blocksLoading;
  const error = pagesError || postsError || assetsError || spacesError || templatesError || blocksError;

  const publishedPages = pages.filter((p) => p.status === 'published').length;
  const draftPages = pages.filter((p) => p.status === 'draft').length;
  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const draftPosts = posts.filter((p) => p.status === 'draft').length;

  // Recent activity: combine pages + posts, sort by updated_at
  const recentActivity = [
    ...pages.map((p) => ({ type: 'page' as const, title: p.title, status: p.status, updated_at: p.updated_at, slug: p.slug })),
    ...posts.map((p) => ({ type: 'post' as const, title: p.title, status: p.status, updated_at: p.updated_at, slug: p.slug })),
  ]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  const stats = [
    { label: 'Pages', total: pages.length, published: publishedPages, drafts: draftPages, icon: FileText, link: '/admin/cms/pages', color: 'text-[#6E879B]' },
    { label: 'Posts', total: posts.length, published: publishedPosts, drafts: draftPosts, icon: BookOpen, link: '/admin/cms/posts', color: 'text-[#5F8A72]' },
    { label: 'Media', total: assets.length, published: assets.length, drafts: 0, icon: Image, link: '/admin/cms/media', color: 'text-[#A97A4C]' },
    { label: 'Blocks', total: blocks.length, published: blocks.length, drafts: 0, icon: Layers, link: '/admin/cms/blocks', color: 'text-[#8E6464]' },
    { label: 'Templates', total: templates.length, published: templates.length, drafts: 0, icon: Layout, link: '/admin/cms/templates', color: 'text-[#6E879B]' },
    { label: 'Spaces', total: spaces.length, published: spaces.length, drafts: 0, icon: FolderOpen, link: '/admin/cms/spaces', color: 'text-[#5F8A72]' },
  ];

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Dashboard</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading CMS data...</span>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Dashboard</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load CMS data: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Dashboard</h1>

      {/* ── Stats grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="bg-white rounded-lg border border-[#E8EDF1] p-4 hover:border-[#6E879B] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-sm font-medium text-[#141418]">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold text-[#141418]">{s.total}</div>
            {s.drafts > 0 && (
              <div className="text-xs text-[#6E879B] mt-1">
                {s.published} published, {s.drafts} drafts
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* ── Quick links ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5">
          <h2 className="text-lg font-semibold text-[#141418] mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/admin/cms/pages" className="flex items-center gap-2 text-[#6E879B] hover:text-[#5A7185] text-sm">
              <FileText className="w-4 h-4" /> Create new page
            </Link>
            <Link to="/admin/cms/posts" className="flex items-center gap-2 text-[#6E879B] hover:text-[#5A7185] text-sm">
              <BookOpen className="w-4 h-4" /> Write new post
            </Link>
            <Link to="/admin/cms/media" className="flex items-center gap-2 text-[#6E879B] hover:text-[#5A7185] text-sm">
              <Image className="w-4 h-4" /> Upload media
            </Link>
            <Link to="/admin/cms/blocks" className="flex items-center gap-2 text-[#6E879B] hover:text-[#5A7185] text-sm">
              <Layers className="w-4 h-4" /> Create reusable block
            </Link>
          </div>
        </div>

        {/* ── Recent activity ────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5">
          <h2 className="text-lg font-semibold text-[#141418] mb-3">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[#6E879B]">No content yet. Start by creating a page or post.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item, idx) => (
                <div key={`${item.type}-${item.slug}-${idx}`} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.type === 'page' ? (
                      <FileText className="w-3 h-3 text-[#6E879B] flex-shrink-0" />
                    ) : (
                      <BookOpen className="w-3 h-3 text-[#5F8A72] flex-shrink-0" />
                    )}
                    <span className="text-[#141418] truncate">{item.title}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      item.status === 'published' ? 'bg-[#5F8A72]/10 text-[#5F8A72]' :
                      item.status === 'draft' ? 'bg-[#A97A4C]/10 text-[#A97A4C]' :
                      'bg-[#141418]/10 text-[#141418]/60'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[#6E879B] text-xs flex-shrink-0 ml-2">{formatDate(item.updated_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
