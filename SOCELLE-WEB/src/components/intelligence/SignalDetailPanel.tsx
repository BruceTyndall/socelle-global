import { useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, Minus, ExternalLink, Shield } from 'lucide-react';
import type { IntelligenceSignal } from '../../lib/intelligence/types';
import { trackSignalClicked, trackSignalDetailViewed } from '../../lib/analytics/funnelEvents';
import { sanitizeArticleHtml } from '../../lib/intelligence/sanitizeArticleHtml';
import { normalizeMediaUrl, normalizeMediaUrls } from '../../lib/intelligence/normalizeMediaUrl';
import { CrossHubActionDispatcher } from '../CrossHubActionDispatcher';
import { SignalEngagementButtons } from './SignalEngagementButtons';

interface SignalDetailPanelProps {
  signal: IntelligenceSignal;
  onClose: () => void;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getConfidenceLabel(score: number | undefined): { label: string; color: string } {
  if (score === undefined) return { label: 'UNKNOWN', color: 'text-gray-400' };
  if (score >= 0.8) return { label: 'HIGH', color: 'text-[#5F8A72]' };
  if (score >= 0.5) return { label: 'MODERATE', color: 'text-[#A97A4C]' };
  return { label: 'LOW', color: 'text-[#8E6464]' };
}

// ── Content segment badge colors (INTEL-PREMIUM-01) ─────────────────
const SEGMENT_COLORS: Record<string, string> = {
  breaking: 'bg-red-100 text-red-700',
  research: 'bg-blue-100 text-blue-700',
  trend_report: 'bg-teal-100 text-teal-700',
  regulatory_update: 'bg-amber-100 text-amber-700',
  product_launch: 'bg-purple-100 text-purple-700',
  deep_dive: 'bg-indigo-100 text-indigo-700',
  social_pulse: 'bg-pink-100 text-pink-700',
  opinion: 'bg-orange-100 text-orange-700',
  how_to: 'bg-cyan-100 text-cyan-700',
  event_coverage: 'bg-emerald-100 text-emerald-700',
  market_data: 'bg-slate-100 text-slate-700',
};

function humanizeSegment(segment: string): string {
  return segment.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SignalDetailPanel({ signal, onClose }: SignalDetailPanelProps) {
  const trackedDetailViewRef = useRef<string | null>(null);

  // INTEL-WO-06: ESC key closes panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (trackedDetailViewRef.current === signal.id) return;
    trackSignalDetailViewed(signal, { surface: 'portal_signal_panel' });
    trackedDetailViewRef.current = signal.id;
  }, [signal]);

  const directionConfig = {
    up: { icon: TrendingUp, cls: 'text-[#5F8A72]', bg: 'bg-[#5F8A72]/10', label: 'Trending Up' },
    down: { icon: TrendingDown, cls: 'text-[#8E6464]', bg: 'bg-[#8E6464]/10', label: 'Trending Down' },
    stable: { icon: Minus, cls: 'text-gray-500', bg: 'bg-gray-100', label: 'Stable' },
  };
  const config = directionConfig[signal.direction];
  const DirIcon = config.icon;
  const confidence = getConfidenceLabel(signal.confidence_score);
  const safeArticleHtml = sanitizeArticleHtml(signal.article_html);
  const galleryImageUrls = normalizeMediaUrls(signal.image_urls);
  const heroImageUrl = normalizeMediaUrl(signal.hero_image_url)
    ?? galleryImageUrls[0]
    ?? normalizeMediaUrl(signal.image_url);
  const additionalGalleryImages = galleryImageUrls
    .filter((url) => url !== heroImageUrl)
    .slice(0, 4);

  // PR3 Content Inference
  const hasFullContent = Boolean(signal.article_body || safeArticleHtml);
  const contentStatus = hasFullContent ? 'full' : (signal.description ? 'excerpt_only' : 'external_only');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#F6F3EF] z-50 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#F6F3EF] border-b border-[#6E879B]/20 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-sans font-semibold text-[#141418] text-lg truncate pr-4">Signal Detail</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E8EDF1] transition-colors"
          >
            <X className="w-5 h-5 text-[#141418]" />
          </button>
        </div>

        {/* Hero image banner (INTEL-PREMIUM-01) */}
        {heroImageUrl && (
          <div className="w-full h-56 overflow-hidden">
            <img
              src={heroImageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="px-6 py-6 space-y-6">
          {/* Author + published date + reading time (INTEL-PREMIUM-01) */}
          {(signal.author || signal.published_at || (signal.reading_time_minutes != null && signal.reading_time_minutes > 0)) && (
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              {signal.author && <span>By {signal.author}</span>}
              {signal.published_at && (
                <span>{new Date(signal.published_at).toLocaleDateString()}</span>
              )}
              {signal.reading_time_minutes != null && signal.reading_time_minutes > 0 && (
                <span>{signal.reading_time_minutes} min read</span>
              )}
            </div>
          )}

          {/* Content segment badge + geo source (INTEL-PREMIUM-01) */}
          {(signal.content_segment || signal.geo_source) && (
            <div className="flex items-center gap-2 flex-wrap">
              {signal.content_segment && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-sans font-medium ${SEGMENT_COLORS[signal.content_segment] ?? 'bg-gray-100 text-gray-600'}`}>
                  {humanizeSegment(signal.content_segment)}
                </span>
              )}
              {signal.geo_source && (
                <span className="px-2.5 py-1 rounded-full bg-graphite/[0.06] text-graphite/50 text-xs font-sans">
                  {signal.geo_source}
                </span>
              )}
            </div>
          )}

          <SignalEngagementButtons signal={signal} surface="portal_signal_panel" compact />

          {/* Direction + Magnitude */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
              <DirIcon className={`w-5 h-5 ${config.cls}`} />
            </div>
            <div>
              <span className={`text-xl font-sans font-bold ${config.cls}`}>
                {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}{signal.magnitude}%
              </span>
              <p className="text-xs font-sans text-gray-500">{config.label}</p>
            </div>
          </div>

          {/* Title + Full article body (INTEL-PREMIUM-01) */}
          <div>
            <h3 className="font-sans font-semibold text-[#141418] text-base mb-3">{signal.title}</h3>
            
            {contentStatus === 'full' ? (
              <div className="text-sm text-[#141418]/80 leading-relaxed space-y-3">
                 {safeArticleHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: safeArticleHtml }} />
                 ) : (
                    signal.article_body?.split('\n').map((para, i) => (
                      para.trim() ? <p key={i}>{para}</p> : null
                    ))
                 )}
              </div>
            ) : contentStatus === 'excerpt_only' ? (
              <div className="bg-white rounded-xl border border-[#6E879B]/10 p-5 mt-2">
                 <p className="text-xs font-sans font-semibold text-[#6E879B] uppercase tracking-wider mb-2">Excerpt</p>
                 <p className="text-sm font-sans text-gray-600 leading-relaxed">{signal.description}</p>
                 {signal.source_url && (
                   <a
                     href={signal.source_url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#141418] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A33] transition-colors"
                     onClick={() => trackSignalClicked(signal, { surface: 'portal_signal_panel', target: 'source' })}
                   >
                     Read Full Article <ExternalLink className="w-4 h-4 ml-1" />
                   </a>
                 )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#6E879B]/10 p-5 mt-2 flex flex-col items-center justify-center text-center">
                 <p className="text-sm text-gray-500 font-sans mb-3">Full content is only available on the external publisher.</p>
                 {signal.source_url && (
                   <a
                     href={signal.source_url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#141418] text-white rounded-lg text-sm font-semibold shadow-sm hover:translate-y-[-1px] hover:shadow-md transition-all w-full sm:w-auto"
                     onClick={() => trackSignalClicked(signal, { surface: 'portal_signal_panel', target: 'source' })}
                   >
                     Open Original <ExternalLink className="w-4 h-4 ml-1" />
                   </a>
                 )}
              </div>
            )}
          </div>

          {/* Image gallery (INTEL-PREMIUM-01) */}
          {additionalGalleryImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {additionalGalleryImages.map((url, i) => (
                <div key={i} className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Topic tags (INTEL-PREMIUM-01) */}
          {signal.topic_tags && signal.topic_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {signal.topic_tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-graphite/[0.05] text-graphite/50 text-xs font-sans">
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Quality score visualization (INTEL-PREMIUM-01) */}
          {signal.quality_score != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Quality</span>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${signal.quality_score}%`,
                    backgroundColor: signal.quality_score > 70 ? '#5F8A72' : signal.quality_score > 40 ? '#A97A4C' : '#8E6464',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400">{signal.quality_score}</span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#6E879B]/10 p-4">
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</p>
              <p className="text-sm font-sans font-medium text-[#141418]">
                {signal.category || 'Uncategorized'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#6E879B]/10 p-4">
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">Signal Type</p>
              <p className="text-sm font-sans font-medium text-[#141418]">
                {signal.signal_type.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#6E879B]/10 p-4">
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">Confidence</p>
              <p className={`text-sm font-sans font-semibold ${confidence.color}`}>
                {confidence.label}
              </p>
              {signal.confidence_score !== undefined && (
                <p className="text-[10px] font-sans text-gray-400 mt-0.5">
                  Score: {(signal.confidence_score * 100).toFixed(0)}%
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-[#6E879B]/10 p-4">
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">Updated</p>
              <p className="text-sm font-sans font-medium text-[#141418]">
                {formatTimeAgo(signal.updated_at)}
              </p>
            </div>
          </div>

          {/* Source / Provenance */}
          <div className="bg-white rounded-xl border border-[#6E879B]/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#6E879B]" />
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">Provenance</p>
            </div>
            <div className="space-y-2">
              {signal.source_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-gray-500">Source</span>
                  <span className="text-xs font-sans font-medium text-[#141418]">{signal.source_name}</span>
                </div>
              )}
              {signal.source && !signal.source_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-gray-500">Source</span>
                  <span className="text-xs font-sans font-medium text-[#141418]">{signal.source}</span>
                </div>
              )}
              {signal.region && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-gray-500">Region</span>
                  <span className="text-xs font-sans font-medium text-[#141418]">{signal.region}</span>
                </div>
              )}
              {signal.source_url && (
                <div className="pt-2">
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-[#E8EDF1] text-[#141418] rounded-lg text-xs font-semibold hover:bg-[#D1D9E0] transition-colors"
                    onClick={() => trackSignalClicked(signal, { surface: 'portal_signal_panel', target: 'source' })}
                  >
                    Open original <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Related Brands */}
          {signal.related_brands && signal.related_brands.length > 0 && (
            <div>
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-2">Related Brands</p>
              <div className="flex flex-wrap gap-1.5">
                {signal.related_brands.map((brand) => (
                  <span
                    key={brand}
                    className="text-xs font-sans text-[#141418] bg-[#E8EDF1] px-2.5 py-1 rounded-full"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {signal.related_products && signal.related_products.length > 0 && (
            <div>
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-2">Related Products</p>
              <div className="flex flex-wrap gap-1.5">
                {signal.related_products.map((product) => (
                  <span
                    key={product}
                    className="text-xs font-sans text-[#141418] bg-gray-100 px-2.5 py-1 rounded-full"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Hub Actions — wired via CrossHubActionDispatcher (INTEL-WO-07) */}
          <div className="border-t border-[#6E879B]/20 pt-6">
            <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-3">Actions</p>
            <CrossHubActionDispatcher
              signal={{
                id: signal.id,
                title: signal.title,
                category: signal.category ?? signal.signal_type,
                delta: signal.magnitude,
                confidence: signal.confidence_score ?? 0,
                source: signal.source_name ?? signal.source ?? 'market_signals',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
