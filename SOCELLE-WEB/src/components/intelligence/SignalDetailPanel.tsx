import { useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, ExternalLink, Shield } from 'lucide-react';
import type { IntelligenceSignal } from '../../lib/intelligence/types';
import { CrossHubActionDispatcher } from '../CrossHubActionDispatcher';

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

export function SignalDetailPanel({ signal, onClose }: SignalDetailPanelProps) {
  // INTEL-WO-06: ESC key closes panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const directionConfig = {
    up: { icon: TrendingUp, cls: 'text-[#5F8A72]', bg: 'bg-[#5F8A72]/10', label: 'Trending Up' },
    down: { icon: TrendingDown, cls: 'text-[#8E6464]', bg: 'bg-[#8E6464]/10', label: 'Trending Down' },
    stable: { icon: Minus, cls: 'text-gray-500', bg: 'bg-gray-100', label: 'Stable' },
  };
  const config = directionConfig[signal.direction];
  const DirIcon = config.icon;
  const confidence = getConfidenceLabel(signal.confidence_score);

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
        <div className="sticky top-0 bg-[#F6F3EF] border-b border-[#6E879B]/20 px-6 py-4 flex items-center justify-between">
          <h2 className="font-sans font-semibold text-[#141418] text-lg truncate pr-4">Signal Detail</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E8EDF1] transition-colors"
          >
            <X className="w-5 h-5 text-[#141418]" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
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

          {/* Title + Description */}
          <div>
            <h3 className="font-sans font-semibold text-[#141418] text-base mb-2">{signal.title}</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">{signal.description}</p>
          </div>

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
                <a
                  href={signal.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View source
                </a>
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
