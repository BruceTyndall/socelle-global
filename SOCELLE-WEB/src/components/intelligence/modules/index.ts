// ── Intelligence Module Wrappers — V2-INTEL-01 ──────────────────────
// Barrel export for all 14 figma-make-source module wrappers.
// Each module is wired to live Supabase data via useModuleAdapters.

// Data-driven modules
export { KPIStripModule } from './KPIStripModule';
export { SignalTableModule } from './SignalTableModule';
export { NewsTickerModule } from './NewsTickerModule';
export { SpotlightPanelModule } from './SpotlightPanelModule';
export { EvidenceStripModule } from './EvidenceStripModule';
export { BigStatBannerModule } from './BigStatBannerModule';
export { SocialProofModule } from './SocialProofModule';
export { HeroMediaRailModule } from './HeroMediaRailModule';
export { EditorialScrollModule } from './EditorialScrollModule';
export { FeaturedCardGridModule } from './FeaturedCardGridModule';

// Static/form modules
export { CTASectionModule } from './CTASectionModule';
export { EmailCaptureModule } from './EmailCaptureModule';
export { ImageMosaicModule } from './ImageMosaicModule';
export { StickyConversionBarModule } from './StickyConversionBarModule';

// Adapter hook
export { useModuleAdapters } from './useModuleAdapters';
export type { UseModuleAdaptersReturn } from './useModuleAdapters';

// Types
export type {
  ModuleKPI,
  ModuleSignal,
  ModuleNewsItem,
  ModuleSpotlight,
  ModuleEvidenceCell,
  ModuleBigStat,
  ModuleEditorialItem,
  ModuleFeaturedCard,
} from './types';

// Shared utilities
export { ModuleLoading, ModuleEmpty, ModuleError, DemoBadge, LiveBadge } from './ModuleStates';
export { ImageWithFallback } from './ImageWithFallback';
export { formatTimeAgo, getFreshnessColor, getFreshnessDot } from './freshness';
