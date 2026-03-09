// ── ConfidenceProvenance — V2-INTEL-01 (Module 6/10) ──────────────────
// Panel showing how confidence scores are calculated for a signal.
// Source count, freshness, cross-validation status.
// Takes a single signal as prop. Pearl Mineral V2 tokens only.

import {
  ShieldCheck,
  Clock,
  Rss,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface ConfidenceProvenanceProps {
  signal: IntelligenceSignal | null;
  loading?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getConfidenceLevel(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 0.8) return { label: 'HIGH', color: 'text-[#5F8A72]', bgColor: 'bg-[#5F8A72]/10' };
  if (score >= 0.5) return { label: 'MODERATE', color: 'text-[#A97A4C]', bgColor: 'bg-[#A97A4C]/10' };
  return { label: 'LOW', color: 'text-[#8E6464]', bgColor: 'bg-[#8E6464]/10' };
}

function getFreshnessStatus(updatedAt: string): { label: string; fresh: boolean } {
  const age = Date.now() - new Date(updatedAt).getTime();
  const hours = age / (1000 * 60 * 60);
  if (hours < 1) return { label: 'Updated < 1 hour ago', fresh: true };
  if (hours < 24) return { label: `Updated ${Math.floor(hours)}h ago`, fresh: true };
  if (hours < 72) return { label: `Updated ${Math.floor(hours / 24)}d ago`, fresh: true };
  return { label: `Updated ${Math.floor(hours / 24)}d ago`, fresh: false };
}

// ── Component ────────────────────────────────────────────────────────

export function ConfidenceProvenance({ signal, loading = false }: ConfidenceProvenanceProps) {
  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-44 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (!signal) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
        <h3 className="font-sans font-semibold text-[#141418] text-base mb-4">
          Confidence & Provenance
        </h3>
        <div className="text-center py-8">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-sans text-gray-500">Select a signal to view provenance details</p>
        </div>
      </div>
    );
  }

  const confidenceScore = signal.confidence_score ?? 0;
  const confidencePct = Math.round(confidenceScore * 100);
  const level = getConfidenceLevel(confidenceScore);
  const freshness = getFreshnessStatus(signal.updated_at);

  const sourceCount = [signal.source, signal.source_name, signal.source_feed_id].filter(Boolean).length;
  const hasMultipleSources = sourceCount > 1;

  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 p-6">
      <h3 className="font-sans font-semibold text-[#141418] text-base mb-1">
        Confidence & Provenance
      </h3>
      <p className="text-xs font-sans text-gray-400 mb-5 truncate">{signal.title}</p>

      {/* Confidence Score */}
      <div className={`rounded-lg ${level.bgColor} p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${level.color}`} />
            <span className={`text-sm font-sans font-semibold ${level.color}`}>
              {level.label} CONFIDENCE
            </span>
          </div>
          <span className={`text-2xl font-sans font-bold ${level.color}`}>
            {confidencePct}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-white/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              confidenceScore >= 0.8
                ? 'bg-[#5F8A72]'
                : confidenceScore >= 0.5
                  ? 'bg-[#A97A4C]'
                  : 'bg-[#8E6464]'
            }`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-3">
        {/* Freshness */}
        <div className="flex items-center justify-between py-2 border-b border-[#6E879B]/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6E879B]" />
            <span className="text-sm font-sans text-[#141418]">Freshness</span>
          </div>
          <div className="flex items-center gap-1.5">
            {freshness.fresh ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5F8A72]" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-[#A97A4C]" />
            )}
            <span className="text-xs font-sans text-gray-500">{freshness.label}</span>
          </div>
        </div>

        {/* Source count */}
        <div className="flex items-center justify-between py-2 border-b border-[#6E879B]/5">
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-[#6E879B]" />
            <span className="text-sm font-sans text-[#141418]">Sources</span>
          </div>
          <span className="text-xs font-sans text-gray-500">
            {sourceCount} source{sourceCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Cross-validation */}
        <div className="flex items-center justify-between py-2 border-b border-[#6E879B]/5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#6E879B]" />
            <span className="text-sm font-sans text-[#141418]">Cross-validated</span>
          </div>
          {hasMultipleSources ? (
            <span className="text-xs font-sans font-semibold text-[#5F8A72]">Yes</span>
          ) : (
            <span className="text-xs font-sans text-gray-400">Single source</span>
          )}
        </div>

        {/* Source name */}
        {signal.source_name && (
          <div className="flex items-center justify-between py-2 border-b border-[#6E879B]/5">
            <span className="text-sm font-sans text-[#141418]">Primary Source</span>
            <span className="text-xs font-sans text-gray-500">{signal.source_name}</span>
          </div>
        )}

        {/* Source URL */}
        {signal.source_url && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-sans text-[#141418]">Source Link</span>
            <a
              href={signal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-sans text-[#6E879B] hover:text-[#5A7185] transition-colors"
            >
              View source
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
