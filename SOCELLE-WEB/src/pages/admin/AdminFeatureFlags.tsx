// ── AdminFeatureFlags — V2-HUBS-05: Feature Flags ─────────────────────────
// Data source: DEMO — feature flags stored in local state
// Authority: build_tracker.md WO V2-HUBS-05

import { useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Flag,
  RefreshCw,
  Info,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastChanged: string;
  changedBy: string;
  category: 'system' | 'feature' | 'debug';
}

// ── DEMO data ─────────────────────────────────────────────────────────────

function generateDemoFlags(): FeatureFlag[] {
  const now = Date.now();
  return [
    {
      id: 'flag-1',
      name: 'PAYMENT_BYPASS',
      description: 'Bypasses Stripe payment verification. Must be false in production before launch.',
      enabled: true,
      lastChanged: new Date(now - 2 * 3600000).toISOString(),
      changedBy: 'platform@socelle.com',
      category: 'system',
    },
    {
      id: 'flag-2',
      name: 'DEMO_MODE',
      description: 'Shows DEMO badges on surfaces without live data connections.',
      enabled: true,
      lastChanged: new Date(now - 24 * 3600000).toISOString(),
      changedBy: 'admin@socelle.com',
      category: 'system',
    },
    {
      id: 'flag-3',
      name: 'MAINTENANCE_MODE',
      description: 'Redirects all non-admin traffic to a maintenance page.',
      enabled: false,
      lastChanged: new Date(now - 72 * 3600000).toISOString(),
      changedBy: 'platform@socelle.com',
      category: 'system',
    },
    {
      id: 'flag-4',
      name: 'NEW_INTELLIGENCE_UI',
      description: 'Enables the redesigned Intelligence Hub interface with enhanced signal views.',
      enabled: false,
      lastChanged: new Date(now - 48 * 3600000).toISOString(),
      changedBy: 'admin@socelle.com',
      category: 'feature',
    },
    {
      id: 'flag-5',
      name: 'SCORM_ENABLED',
      description: 'Enables SCORM package upload and playback in the Education Hub.',
      enabled: false,
      lastChanged: new Date(now - 120 * 3600000).toISOString(),
      changedBy: 'admin@socelle.com',
      category: 'feature',
    },
    {
      id: 'flag-6',
      name: 'AI_CREDIT_TRACKING',
      description: 'Tracks and deducts credits for AI tool usage across the platform.',
      enabled: true,
      lastChanged: new Date(now - 6 * 3600000).toISOString(),
      changedBy: 'platform@socelle.com',
      category: 'feature',
    },
    {
      id: 'flag-7',
      name: 'DEBUG_LOGGING',
      description: 'Enables verbose debug logging in the browser console.',
      enabled: false,
      lastChanged: new Date(now - 168 * 3600000).toISOString(),
      changedBy: 'admin@socelle.com',
      category: 'debug',
    },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function categoryBadgeClasses(category: string): string {
  switch (category) {
    case 'system':
      return 'bg-[#8E6464]/10 text-[#8E6464]';
    case 'feature':
      return 'bg-[#6E879B]/10 text-[#6E879B]';
    case 'debug':
      return 'bg-[#A97A4C]/10 text-[#A97A4C]';
    default:
      return 'bg-[#6E879B]/10 text-[#6E879B]';
  }
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(generateDemoFlags);

  const handleToggle = (id: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              enabled: !f.enabled,
              lastChanged: new Date().toISOString(),
              changedBy: 'admin@socelle.com',
            }
          : f
      )
    );
  };

  const enabledCount = flags.filter((f) => f.enabled).length;
  const disabledCount = flags.length - enabledCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-graphite font-sans">Feature Flags</h1>
            <p className="text-graphite/60 font-sans mt-1 text-sm">
              {enabledCount} enabled, {disabledCount} disabled
            </p>
          </div>
          <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
            DEMO
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFlags(generateDemoFlags())}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* DEMO banner */}
      <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 rounded-lg text-center font-sans">
        DEMO -- Feature flags are stored in local state only. A feature_flags table or environment-based system will be wired in a future phase.
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Total Flags</p>
          <p className="text-3xl font-semibold text-graphite font-sans">{flags.length}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Enabled</p>
          <p className="text-3xl font-semibold text-[#5F8A72] font-sans">{enabledCount}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Disabled</p>
          <p className="text-3xl font-semibold text-graphite/60 font-sans">{disabledCount}</p>
        </div>
      </div>

      {/* Flags list */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="bg-white border border-accent-soft rounded-xl p-5 flex items-start gap-4 hover:border-accent/30 transition-colors"
          >
            {/* Toggle */}
            <button
              onClick={() => handleToggle(flag.id)}
              className="mt-0.5 shrink-0 focus:outline-none"
              title={flag.enabled ? 'Disable flag' : 'Enable flag'}
            >
              {flag.enabled ? (
                <ToggleRight className="w-8 h-8 text-[#5F8A72]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-graphite/30" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-graphite font-mono">{flag.name}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${categoryBadgeClasses(flag.category)}`}
                >
                  {flag.category}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    flag.enabled ? 'bg-[#5F8A72]/10 text-[#5F8A72]' : 'bg-graphite/5 text-graphite/40'
                  }`}
                >
                  {flag.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-xs text-graphite/60 font-sans mt-1">{flag.description}</p>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-graphite/40 font-sans">
                <span>Changed {timeAgo(flag.lastChanged)}</span>
                <span>by {flag.changedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 bg-accent-soft/50 rounded-xl p-4">
        <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <div className="text-xs text-graphite/60 font-sans">
          <p className="font-medium text-graphite/80 mb-1">About Feature Flags</p>
          <p>
            Feature flags control platform behavior at runtime. System flags (PAYMENT_BYPASS,
            MAINTENANCE_MODE) affect core operations. Feature flags gate new functionality.
            In production, PAYMENT_BYPASS must be set to false before launch.
          </p>
        </div>
      </div>
    </div>
  );
}
