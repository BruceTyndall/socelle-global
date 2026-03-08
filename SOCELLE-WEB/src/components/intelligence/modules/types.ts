// ── Module Types — V2-INTEL-01 ───────────────────────────────────────
// Compatible interfaces matching figma-make-source module prop shapes.
// These are the data contracts between adapter hooks and module wrappers.

/** KPIStrip cell — matches figma KPI interface */
export interface ModuleKPI {
  id: string;
  value: number;
  unit: string;
  label: string;
  delta: number;
  confidence: number;
  updatedAt: Date;
}

/** SignalTable row — matches figma Signal interface */
export interface ModuleSignal {
  id: string;
  name: string;
  category: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  confidence: number;
  updatedAt: Date;
  sparkline: number[];
  source: string;
}

/** NewsTicker item — matches figma NewsItem interface */
export interface ModuleNewsItem {
  tag: string;
  headline: string;
  timestamp?: string;
}

/** SpotlightPanel props shape */
export interface ModuleSpotlight {
  image: string;
  eyebrow: string;
  headline: string;
  metric?: { value: string; label: string };
  bullets?: string[];
  cta?: { label: string; href: string };
}

/** EvidenceStrip cell */
export interface ModuleEvidenceCell {
  id: string;
  value: string;
  label: string;
  isLive?: boolean;
  updatedAt?: Date;
}

/** BigStatBanner stat */
export interface ModuleBigStat {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

/** EditorialScroll item */
export interface ModuleEditorialItem {
  image: string;
  label: string;
  value?: string;
}

/** FeaturedCardGrid card */
export interface ModuleFeaturedCard {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  metric?: { value: string; label: string };
  badge?: string;
  href?: string;
}
