import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  LinkIcon,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { useAffiliateData } from '../../../lib/affiliates/useAffiliateData';

// ── V2-HUBS-13: Affiliate Engine — Affiliate Links Manager ──────────────
// DEMO badge on all data. FTC compliance badge on every link.
// Filter by product category.

export default function AffiliateLinks() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { links, isLive, loading, error, reload } = useAffiliateData(categoryFilter || undefined);

  const filteredLinks = searchTerm
    ? links.filter((l) => l.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : links;

  const categories = Array.from(new Set(links.map((l) => l.product_category))).sort();

  const copyToClipboard = useCallback((id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // ── Loading state (skeleton shimmer) ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-10 w-48 bg-graphite/5 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-3">
              <div className="h-5 w-48 bg-graphite/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-graphite/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-signal-down/20 p-10 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-signal-down mx-auto" />
          <h2 className="text-lg font-sans font-semibold text-graphite">Failed to load affiliate links</h2>
          <p className="text-sm text-graphite/60 font-sans max-w-md mx-auto">{error}</p>
          <button
            onClick={() => reload()}
            className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/portal/affiliates"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Affiliate Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-sans font-semibold text-graphite">Affiliate Links</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        </div>
        <p className="text-graphite/60 font-sans mt-1">
          Generate and manage affiliate links for products. All links include FTC-compliant commission disclosure.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full h-10 pl-10 pr-4 border border-graphite/15 rounded-full text-sm font-sans text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 pl-10 pr-8 border border-graphite/15 rounded-full text-sm font-sans text-graphite bg-white appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-graphite/8 px-6 py-16 text-center space-y-3">
          <LinkIcon className="w-10 h-10 text-graphite/20 mx-auto" />
          <h3 className="text-base font-sans font-semibold text-graphite">No affiliate links found</h3>
          <p className="text-sm text-graphite/50 font-sans max-w-sm mx-auto">
            {searchTerm || categoryFilter
              ? 'Try adjusting your search or filter.'
              : 'Browse products to generate commission links and start earning.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans font-semibold text-graphite">{link.product_name}</p>
                  <p className="text-xs text-graphite/40 font-sans mt-0.5">{link.product_category}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-up/10 text-signal-up font-sans shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Commission-linked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Original URL */}
                <div>
                  <span className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Original URL</span>
                  <p className="text-xs text-graphite/60 font-mono truncate mt-0.5">{link.original_url}</p>
                </div>
                {/* Affiliate URL */}
                <div>
                  <span className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Affiliate URL</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-accent font-mono truncate flex-1">{link.affiliate_url}</p>
                    <button
                      onClick={() => copyToClipboard(link.id, link.affiliate_url)}
                      className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 border border-graphite/15 rounded-full text-xs font-sans text-graphite hover:bg-accent-soft transition-colors"
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="w-3 h-3 text-signal-up" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-graphite/5">
                <div>
                  <span className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Clicks</span>
                  <p className="text-sm font-sans font-semibold text-graphite">{link.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Conversions</span>
                  <p className="text-sm font-sans font-semibold text-graphite">{link.conversions.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Commission</span>
                  <p className="text-sm font-sans font-semibold text-signal-up">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(link.commission_earned)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Conv. Rate</span>
                  <p className="text-sm font-sans font-semibold text-graphite">
                    {link.clicks > 0 ? `${((link.conversions / link.clicks) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
