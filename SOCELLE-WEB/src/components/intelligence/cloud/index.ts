// ── Intelligence Cloud Modules — V2-INTEL-01 ──────────────────────────
// Barrel export for all 10 Intelligence Cloud standalone components.
// These are the core Intelligence Hub modules per V1 SOT §G.

// Module 1: KPI Strip — 6 aggregate KPI cards
export { KPIStrip } from './KPIStrip';
export type { KPIStripProps } from './KPIStrip';

// Module 2: Signal Table — sortable/filterable/searchable with CSV export + pagination
export { SignalTable } from './SignalTable';
export type { SignalTableProps } from './SignalTable';

// Module 3: Trend Stacks — CSS-only stacked bar chart by category
export { TrendStacks } from './TrendStacks';
export type { TrendStacksProps } from './TrendStacks';

// Module 4: What Changed Timeline — vertical timeline with timeframe filter
export { WhatChangedTimeline } from './WhatChangedTimeline';
export type { WhatChangedTimelineProps } from './WhatChangedTimeline';

// Module 5: Opportunity Signals — high-confidence upward signals with revenue estimates
export { OpportunitySignals } from './OpportunitySignals';
export type { OpportunitySignalsProps } from './OpportunitySignals';

// Module 6: Confidence & Provenance — provenance detail panel for a single signal
export { ConfidenceProvenance } from './ConfidenceProvenance';
export type { ConfidenceProvenanceProps } from './ConfidenceProvenance';

// Module 7: Category Intelligence — category drill-down with TanStack Query + CSV export
export { CategoryIntelligence } from './CategoryIntelligence';
export type { CategoryIntelligenceProps } from './CategoryIntelligence';

// Module 8: Competitive Benchmarking — brand comparison matrix (DEMO-badged)
export { CompetitiveBenchmarking } from './CompetitiveBenchmarking';
export type { CompetitiveBenchmarkingProps } from './CompetitiveBenchmarking';

// Module 9: Brand Health Monitor — single brand signal health (DEMO-badged)
export { BrandHealthMonitor } from './BrandHealthMonitor';
export type { BrandHealthMonitorProps } from './BrandHealthMonitor';

// Module 10: Local Market View — geographic signal view (DEMO-badged)
export { LocalMarketView } from './LocalMarketView';
export type { LocalMarketViewProps } from './LocalMarketView';
