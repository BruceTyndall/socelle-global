import { useState } from 'react';
import { Megaphone, AlertCircle, Mail, Users, FileText, Globe, Loader2 } from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import { useAudienceSegments } from '../../lib/useAudienceSegments';
import { useContentTemplates } from '../../lib/useContentTemplates';
import { useLandingPages } from '../../lib/useLandingPages';
import type { MarketingCampaign } from '../../lib/useCampaigns';
import type { AudienceSegment } from '../../lib/useAudienceSegments';
import type { ContentTemplate } from '../../lib/useContentTemplates';
import type { LandingPage } from '../../lib/useLandingPages';

// ── WO-OVERHAUL-15: Admin Marketing Hub (/admin/marketing) ───────────
// Aggregated view: all campaigns, system templates, unsubscribe management.
// Data sources: campaigns, audience_segments, content_templates, landing_pages
// isLive flag drives DEMO badge. ZERO cold email — all campaigns opt-in only.

const TABS = ['Campaigns', 'Segments', 'Templates', 'Landing Pages'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-graphite/10 text-graphite/60',
  scheduled: 'bg-accent/10 text-accent',
  active: 'bg-signal-up/10 text-signal-up',
  paused: 'bg-signal-warn/10 text-signal-warn',
  completed: 'bg-graphite/10 text-graphite/40',
  archived: 'bg-graphite/5 text-graphite/30',
  published: 'bg-signal-up/10 text-signal-up',
};

export default function AdminMarketingHub() {
  const [activeTab, setActiveTab] = useState<Tab>('Campaigns');
  const { campaigns, isLive: campaignsLive, loading: campaignsLoading } = useCampaigns();
  const { segments, isLive: segmentsLive, loading: segmentsLoading } = useAudienceSegments();
  const { templates, isLive: templatesLive, loading: templatesLoading } = useContentTemplates();
  const { pages, isLive: pagesLive, loading: pagesLoading } = useLandingPages();

  const isLive = campaignsLive || segmentsLive || templatesLive || pagesLive;
  const loading = campaignsLoading || segmentsLoading || templatesLoading || pagesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Marketing Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Marketing platform administration — all campaigns are opt-in only, zero cold outreach
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campaigns', value: campaigns.length, icon: Mail },
          { label: 'Segments', value: segments.length, icon: Users },
          { label: 'Templates', value: templates.length, icon: FileText },
          { label: 'Landing Pages', value: pages.length, icon: Globe },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-accent-soft rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-graphite/60/60 font-sans">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-graphite/30" />
            </div>
            <p className="text-2xl font-semibold text-graphite font-sans">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-accent-soft">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-sans font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-graphite text-graphite'
                  : 'border-transparent text-graphite/60 hover:text-graphite'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-graphite/40 animate-spin" />
        </div>
      ) : (
        <>
          {/* Campaigns Tab */}
          {activeTab === 'Campaigns' && (
            campaigns.length === 0 ? (
              <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
                <Megaphone className="w-10 h-10 text-accent-soft mx-auto mb-3" />
                <p className="text-sm text-graphite/60 font-sans">No campaigns yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {campaigns.map((c: MarketingCampaign) => (
                      <tr key={c.id} className="hover:bg-accent-soft/50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-graphite">{c.name}</td>
                        <td className="px-4 py-2.5 text-graphite/60 capitalize">{c.type.replace('_', ' ')}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[c.status] || ''}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-graphite/60 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Segments Tab */}
          {activeTab === 'Segments' && (
            segments.length === 0 ? (
              <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
                <Users className="w-10 h-10 text-accent-soft mx-auto mb-3" />
                <p className="text-sm text-graphite/60 font-sans">No audience segments yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Est. Size</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Filters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {segments.map((s: AudienceSegment) => (
                      <tr key={s.id} className="hover:bg-accent-soft/50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-graphite">{s.name}</td>
                        <td className="px-4 py-2.5 text-graphite/60">{s.estimated_size.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-graphite/60 text-xs">{s.filters?.length || 0} rules</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Templates Tab */}
          {activeTab === 'Templates' && (
            templates.length === 0 ? (
              <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
                <FileText className="w-10 h-10 text-accent-soft mx-auto mb-3" />
                <p className="text-sm text-graphite/60 font-sans">No content templates yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">System</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {templates.map((t: ContentTemplate) => (
                      <tr key={t.id} className="hover:bg-accent-soft/50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-graphite">{t.name}</td>
                        <td className="px-4 py-2.5 text-graphite/60 capitalize">{t.type.replace('_', ' ')}</td>
                        <td className="px-4 py-2.5 text-graphite/60 text-xs">{t.is_system ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Landing Pages Tab */}
          {activeTab === 'Landing Pages' && (
            pages.length === 0 ? (
              <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
                <Globe className="w-10 h-10 text-accent-soft mx-auto mb-3" />
                <p className="text-sm text-graphite/60 font-sans">No landing pages yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Title</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Views</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-graphite/60/60">Conversions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {pages.map((p: LandingPage) => (
                      <tr key={p.id} className="hover:bg-accent-soft/50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-graphite">{p.title}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[p.status] || ''}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-graphite/60">{p.views.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-graphite/60">{p.conversions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* Opt-in Notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-xs text-green-800 font-sans font-medium">
          All marketing campaigns on Socelle are opt-in only. Zero cold email, zero cold outreach. Subscribers must explicitly consent before receiving any communications.
        </p>
      </div>
    </div>
  );
}
