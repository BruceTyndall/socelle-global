# Token Drift + Banned Term Audit
- Timestamp: 2026-03-09T18:56:52.663Z
- Scope: `SOCELLE-WEB/src/**`
- Token map source: `ULTRA_DRIVE_PROMPT.md` §3
- Totals: 448 design findings (230 legacy tokens, 218 non-Pearl hex), 129 banned term hits

## Design Findings (Grouped By Directory)
### src
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/App.tsx | 322 | `brand-centric` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 324 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 325 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 326 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 327 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 328 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 329 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 330 | `brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 1187 | `brand-centric` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/App.tsx | 1210 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/App.tsx | 1210 | `#2a3038` | `#141418 (graphite)` | hardcoded-hex |
| src/App.tsx | 1210 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 15 | `#EFEBE6` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 16 | `#FFFFFF` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 17 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 18 | `#15191D` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 24 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 95 | `#47201c` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 96 | `#29120f` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 97 | `#ac9b98` | `#6E879B (accent)` | hardcoded-hex |
| src/index.css | 98 | `#8C6B6E` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/index.css | 99 | `#6E5254` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/index.css | 100 | `#D4A44C` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/index.css | 101 | `#F5EDE0` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 102 | `#F5F3F0` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 103 | `#EDEDE5` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 104 | `#D6D1C9` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 105 | `#1A1714` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 106 | `#6B6560` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/index.css | 109 | `#f8f6f2` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 110 | `#f3e9e3` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 111 | `#faf9f5` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 114 | `#ff6568` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/index.css | 115 | `#fff7ed` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 116 | `#ff8b1a` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/index.css | 117 | `#c53c00` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/index.css | 118 | `#fac800` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/index.css | 119 | `#f0fdf4` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 120 | `#05df72` | `#5F8A72 (signal-up)` | hardcoded-hex |
| src/index.css | 121 | `#00a544` | `#5F8A72 (signal-up)` | hardcoded-hex |
| src/index.css | 122 | `#0d542b` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 123 | `#00d3bd` | `#6E879B (accent)` | hardcoded-hex |
| src/index.css | 124 | `#54a2ff` | `#6E879B (accent)` | hardcoded-hex |
| src/index.css | 125 | `#e9d5ff` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 126 | `#c07eff` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 127 | `#d1d5dc` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 128 | `#364153` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/index.css | 129 | `#101828` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 331 | `#000` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 405 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/index.css | 407 | `bg-brand-surface-alt` | `bg-accent-soft` | legacy-token |
| src/index.css | 447 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/index.css | 453 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/index.css | 461 | `bg-brand-surface-alt` | `bg-accent-soft` | legacy-token |
| src/index.css | 461 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/index.css | 466 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/index.css | 611 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/index.css | 626 | `#C5C0B8` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/index.css | 692 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/index.css | 695 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/main.tsx | 70 | `#f1f5f9` | `#F6F3EF (background)` | hardcoded-hex |
| src/main.tsx | 76 | `#dc2626` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/main.tsx | 80 | `#1e293b` | `#141418 (graphite)` | hardcoded-hex |
| src/main.tsx | 84 | `#fecaca` | `#F6F3EF (background)` | hardcoded-hex |
| src/main.tsx | 84 | `#fef2f2` | `#F6F3EF (background)` | hardcoded-hex |
| src/main.tsx | 87 | `#991b1b` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/main.tsx | 93 | `#1e293b` | `#141418 (graphite)` | hardcoded-hex |

### src/components
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/components/BrandPageRenderer.tsx | 51 | `brand-primary` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/BrandPageRenderer.tsx | 52 | `brand-secondary` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/BrandPageRenderer.tsx | 53 | `brand-accent` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/BrandPageRenderer.tsx | 54 | `brand-surface` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/BrandPageRenderer.tsx | 55 | `brand-text` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/BrandShop.tsx | 46 | `#3b82f6` | `#6E879B (accent)` | hardcoded-hex |
| src/components/BrandShop.tsx | 49 | `brand-shop-products` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/PaywallGate.tsx | 48 | `Pro-only` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/PaywallGate.tsx | 158 | `Pro-only` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/StagingBanner.tsx | 36 | `#92400e` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/components/StagingBanner.tsx | 37 | `#fef3c7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/StagingBanner.tsx | 55 | `#fca5a5` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/components/UpgradeGate.tsx | 41 | `brand-specific` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/UpgradeGate.tsx | 57 | `brand-specific` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/UpgradeGate.tsx | 119 | `border-brand-border` | `border-graphite/20` | legacy-token |

### src/components/ai
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/components/ai/ChatPanel.tsx | 113 | `#6B4F52` | `#8E6464 (signal-down)` | hardcoded-hex |

### src/components/intelligence/cloud
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/components/intelligence/cloud/BrandHealthMonitor.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/CategoryIntelligence.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/CompetitiveBenchmarking.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/CompetitiveBenchmarking.tsx | 107 | `brand-signal` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/components/intelligence/cloud/ConfidenceProvenance.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/index.ts | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/KPIStrip.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/LocalMarketView.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/OpportunitySignals.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/SignalTable.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/TrendStacks.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/cloud/WhatChangedTimeline.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |

### src/components/intelligence/modules
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/components/intelligence/modules/BigStatBannerModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 39 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 40 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 40 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 40 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 43 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 48 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 60 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 65 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/BigStatBannerModule.tsx | 68 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/CTASectionModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/CTASectionModule.tsx | 16 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/CTASectionModule.tsx | 19 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/CTASectionModule.tsx | 23 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/CTASectionModule.tsx | 27 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/CTASectionModule.tsx | 28 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/CTASectionModule.tsx | 30 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 21 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 21 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 22 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 23 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 50 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/EditorialScrollModule.tsx | 53 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 66 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 70 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 89 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 89 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 89 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 89 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EmailCaptureModule.tsx | 111 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EvidenceStripModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/EvidenceStripModule.tsx | 19 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/EvidenceStripModule.tsx | 19 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EvidenceStripModule.tsx | 20 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EvidenceStripModule.tsx | 21 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/EvidenceStripModule.tsx | 22 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 28 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 28 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 29 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 30 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 31 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 61 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 63 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 63 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 71 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/FeaturedCardGridModule.tsx | 74 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/freshness.ts | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 50 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 51 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 54 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 81 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 91 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/HeroMediaRailModule.tsx | 96 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ImageMosaicModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/ImageMosaicModule.tsx | 15 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/ImageMosaicModule.tsx | 15 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ImageMosaicModule.tsx | 16 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ImageMosaicModule.tsx | 58 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/ImageWithFallback.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/index.ts | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/KPIStripModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/KPIStripModule.tsx | 57 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 57 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 58 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 59 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 60 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 61 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 62 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/KPIStripModule.tsx | 76 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/ModuleStates.tsx | 13 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 13 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 14 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 31 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 31 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 32 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 48 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/ModuleStates.tsx | 48 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/NewsTickerModule.tsx | 15 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 15 | `#8FAEC4` | `#6E879B (accent)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 15 | `#8FAEC4` | `#6E879B (accent)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 20 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 20 | `#8FAEC4` | `#6E879B (accent)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 20 | `#8FAEC4` | `#6E879B (accent)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 78 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 79 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 81 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 85 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 86 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 98 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 99 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 105 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 107 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 111 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/NewsTickerModule.tsx | 117 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/SignalTableModule.tsx | 28 | `#9ca3af` | `#6E879B (accent)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 77 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 77 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 78 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 79 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 80 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 80 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 81 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 82 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 83 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 84 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 85 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SignalTableModule.tsx | 85 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/SocialProofModule.tsx | 29 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 30 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 38 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 38 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 47 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 47 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 47 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SocialProofModule.tsx | 48 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SpotlightPanelModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/SpotlightPanelModule.tsx | 21 | `#1F2428` | `#141418 (graphite)` | hardcoded-hex |
| src/components/intelligence/modules/SpotlightPanelModule.tsx | 21 | `#FAF9F7` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SpotlightPanelModule.tsx | 22 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SpotlightPanelModule.tsx | 23 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/SpotlightPanelModule.tsx | 51 | `#3F5465` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/components/intelligence/modules/StickyConversionBarModule.tsx | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/StickyConversionBarModule.tsx | 31 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/StickyConversionBarModule.tsx | 42 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/StickyConversionBarModule.tsx | 43 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/StickyConversionBarModule.tsx | 65 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/StickyConversionBarModule.tsx | 65 | `#F7F5F2` | `#F6F3EF (background)` | hardcoded-hex |
| src/components/intelligence/modules/types.ts | 1 | `INTEL-01` | `text-graphite` | legacy-token |
| src/components/intelligence/modules/useModuleAdapters.ts | 1 | `INTEL-01` | `text-graphite` | legacy-token |

### src/components/ui
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/components/ui/Button.tsx | 17 | `bg-brand-surface-alt` | `bg-accent-soft` | legacy-token |
| src/components/ui/Button.tsx | 21 | `bg-brand-surface-alt` | `bg-accent-soft` | legacy-token |
| src/components/ui/DarkPanel.tsx | 12 | `bg-intel-dark` | `bg-background` | legacy-token |
| src/components/ui/DarkPanel.tsx | 12 | `border-intel-border` | `text-graphite` | legacy-token |
| src/components/ui/DarkPanel.tsx | 17 | `intel-dark` | `text-graphite` | legacy-token |
| src/components/ui/EmptyState.tsx | 18 | `bg-brand-surface-alt` | `bg-accent-soft` | legacy-token |
| src/components/ui/GlowBadge.tsx | 11 | `bg-intel-up` | `text-signal-up` | legacy-token |
| src/components/ui/GlowBadge.tsx | 11 | `text-intel-up` | `text-signal-up` | legacy-token |
| src/components/ui/GlowBadge.tsx | 12 | `bg-intel-down` | `text-signal-down` | legacy-token |
| src/components/ui/GlowBadge.tsx | 12 | `text-intel-down` | `text-signal-down` | legacy-token |
| src/components/ui/GlowBadge.tsx | 13 | `bg-intel-text` | `bg-background` | legacy-token |
| src/components/ui/GlowBadge.tsx | 13 | `text-intel-text` | `text-graphite` | legacy-token |
| src/components/ui/GlowBadge.tsx | 14 | `bg-intel-accent` | `text-accent` | legacy-token |
| src/components/ui/GlowBadge.tsx | 14 | `text-intel-accent` | `text-accent` | legacy-token |
| src/components/ui/GlowBadge.tsx | 15 | `bg-edu-primary` | `bg-accent` | legacy-token |
| src/components/ui/GlowBadge.tsx | 15 | `text-edu-primary` | `text-accent` | legacy-token |
| src/components/ui/StatCard.tsx | 32 | `border-brand-border` | `border-graphite/20` | legacy-token |

### src/data
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/data/appFeatureGuide.ts | 156 | `Brand-level` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/data/appFeatureGuide.ts | 161 | `brand-specific` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/data/appFeatureGuide.ts | 298 | `brand-kit` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/lib
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/platformConfig.ts | 3 | `brand-specific` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/platformConfig.ts | 117 | `#059669` | `#5F8A72 (signal-up)` | hardcoded-hex |
| src/lib/platformConfig.ts | 128 | `#3b82f6` | `#6E879B (accent)` | hardcoded-hex |

### src/lib/ai
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/ai/mockAdvisor.ts | 243 | `brand-related` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/lib/analysis
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/analysis/creditGate.ts | 7 | `INTEL-02` | `text-graphite` | legacy-token |
| src/lib/analysis/signalEnrichment.ts | 103 | `brand-filtered` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/lib/brandTiers
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/brandTiers/mockTierData.ts | 178 | `mock-brand-001` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/brandTiers/mockTierData.ts | 191 | `mock-brand-001` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/brandTiers/mockTierData.ts | 262 | `mock-brand-001` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/brandTiers/mockTierData.ts | 323 | `mock-brand-001` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/lib/education
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/education/mockContent.ts | 8 | `edu-tp-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 22 | `edu-tp-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 36 | `edu-tp-003` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 49 | `edu-tp-004` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 63 | `edu-tp-005` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 78 | `edu-is-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 92 | `edu-is-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 105 | `edu-is-003` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 119 | `edu-is-004` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 134 | `edu-bo-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 147 | `edu-bo-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 160 | `edu-bo-003` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 173 | `edu-bo-004` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 189 | `edu-cr-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 203 | `edu-cr-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 217 | `edu-cr-003` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 233 | `edu-dt-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 247 | `edu-dt-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 262 | `edu-rs-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 275 | `edu-rs-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 288 | `edu-rs-003` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 305 | `edu-tp-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 306 | `edu-tp-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 307 | `edu-is-001` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 308 | `edu-cr-002` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 309 | `edu-bo-004` | `text-graphite` | legacy-token |
| src/lib/education/mockContent.ts | 310 | `edu-cr-001` | `text-graphite` | legacy-token |

### src/lib/intelligence
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/intelligence/adminIntelligence.ts | 294 | `brand-certified` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/intelligence/brandPortalIntelligence.ts | 4 | `brand-specific` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/intelligence/brandPortalIntelligence.ts | 299 | `Pro-tier` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 255 | `#8C6B6E` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/lib/intelligence/businessIntelligence.ts | 256 | `#D4A44C` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/lib/intelligence/businessIntelligence.ts | 257 | `#3B82F6` | `#6E879B (accent)` | hardcoded-hex |
| src/lib/intelligence/businessIntelligence.ts | 258 | `#22C55E` | `#5F8A72 (signal-up)` | hardcoded-hex |
| src/lib/intelligence/businessIntelligence.ts | 259 | `#A855F7` | `#6E879B (accent)` | hardcoded-hex |
| src/lib/intelligence/businessIntelligence.ts | 260 | `#94A3B8` | `#6E879B (accent)` | hardcoded-hex |
| src/lib/intelligence/businessIntelligence.ts | 353 | `edu-tp-002` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 354 | `edu-is-003` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 355 | `edu-bo-001` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 356 | `edu-cr-001` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 357 | `edu-tp-004` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 358 | `edu-rs-001` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 359 | `edu-bo-004` | `text-graphite` | legacy-token |
| src/lib/intelligence/businessIntelligence.ts | 360 | `edu-dt-001` | `text-graphite` | legacy-token |
| src/lib/intelligence/mockSignals.ts | 64 | `c-pro-backbar` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/intelligence/mockSignals.ts | 226 | `clinical-brand-expansion` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/intelligence/mockSignals.ts | 383 | `brand-certified` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/lib/protocols
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/lib/protocols/mockProtocols.ts | 409 | `Pro-Heal` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/lib/protocols/mockProtocols.ts | 576 | `edu-003` | `text-graphite` | legacy-token |
| src/lib/protocols/mockProtocols.ts | 594 | `edu-007` | `text-graphite` | legacy-token |

### src/pages/admin
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/pages/admin/AdminApiControls.tsx | 335 | `#7A5555` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/pages/admin/AdminBrandList.tsx | 34 | `admin-brand-list` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/AdminBrandList.tsx | 246 | `#475569` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/pages/admin/AdminBrandList.tsx | 253 | `#475569` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/pages/admin/AdminSeeding.tsx | 265 | `brand-slug` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 150 | `#3B82F6` | `#6E879B (accent)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 151 | `#8B5CF6` | `#6E879B (accent)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 152 | `#10B981` | `#5F8A72 (signal-up)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 153 | `#F9FAFB` | `#F6F3EF (background)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 154 | `#111827` | `#141418 (graphite)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 192 | `brand-editor` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 246 | `brand-page-modules` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 267 | `brand-publish-stats` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 799 | `brand-slug` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 1113 | `brand-builder-modules` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 1689 | `brand-protocols-config` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 1773 | `brand-products-config` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 2335 | `brand-media-assets` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 2398 | `brand-assets` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 2409 | `brand-assets` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 2772 | `brand-assets` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 2775 | `brand-assets` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 3126 | `brand-training-modules` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 3479 | `brand-commercial-assets` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 3807 | `brand-shop-settings` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandAdminEditor.tsx | 4075 | `#1e293b` | `#141418 (graphite)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 4076 | `#475569` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 4077 | `#3b82f6` | `#6E879B (accent)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 4078 | `#f8fafc` | `#F6F3EF (background)` | hardcoded-hex |
| src/pages/admin/BrandAdminEditor.tsx | 4079 | `#0f172a` | `#141418 (graphite)` | hardcoded-hex |
| src/pages/admin/BrandHub.tsx | 46 | `admin-brand-hub` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/BrandHub.tsx | 65 | `#1E3A5F` | `#141418 (graphite)` | hardcoded-hex |

### src/pages/admin/brand-hub
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/pages/admin/brand-hub/HubAnalytics.tsx | 31 | `brand-hub-analytics` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/brand-hub/HubOrders.tsx | 30 | `brand-hub-orders` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/brand-hub/HubProducts.tsx | 23 | `brand-hub-products` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/brand-hub/HubRetailers.tsx | 23 | `brand-hub-retailers` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/admin/brand-hub/HubSettings.tsx | 44 | `brand-hub-settings` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/pages/brand
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/pages/brand/ClaimReview.tsx | 23 | `brand-seed-content` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Customers.tsx | 37 | `brand-customers` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Dashboard.tsx | 168 | `brand-dashboard` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/IntelligenceReport.tsx | 312 | `brand-intelligence-report` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/IntelligenceReport.tsx | 412 | `brand-intelligence-report` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Leads.tsx | 21 | `brand-leads` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Messages.tsx | 164 | `brand-conversations` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Messages.tsx | 254 | `brand-conversations` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Messages.tsx | 269 | `brand-thread` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/OrderDetail.tsx | 97 | `brand-order-detail` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/OrderDetail.tsx | 183 | `brand-order-detail` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/OrderDetail.tsx | 236 | `brand-order-detail` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Orders.tsx | 39 | `brand-orders` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Performance.tsx | 13 | `#1E3A5F` | `#141418 (graphite)` | hardcoded-hex |
| src/pages/brand/Performance.tsx | 211 | `brand-performance` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Pipeline.tsx | 37 | `brand-pipeline` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Pipeline.tsx | 79 | `brand-pipeline` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Plans.tsx | 23 | `brand-plans` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Products.tsx | 553 | `brand-products` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Products.tsx | 617 | `brand-products` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Storefront.tsx | 41 | `brand-storefront` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/brand/Storefront.tsx | 123 | `brand-storefront` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/pages/business
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/pages/business/BenchmarkDashboard.tsx | 31 | `bg-intel-up` | `text-signal-up` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 33 | `bg-intel-down` | `text-signal-down` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 37 | `text-intel-up` | `text-signal-up` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 39 | `text-intel-down` | `text-signal-down` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 88 | `#22C55E` | `#5F8A72 (signal-up)` | hardcoded-hex |
| src/pages/business/BenchmarkDashboard.tsx | 88 | `#EF4444` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/pages/business/BenchmarkDashboard.tsx | 88 | `#F59E0B` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/pages/business/BenchmarkDashboard.tsx | 188 | `bg-intel-dark` | `bg-background` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 198 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 247 | `text-intel-down` | `text-signal-down` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 250 | `text-intel-down` | `text-signal-down` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 271 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 271 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 312 | `text-intel-down` | `text-signal-down` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 312 | `text-intel-down` | `text-signal-down` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 352 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/BenchmarkDashboard.tsx | 352 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/BrandDetail.tsx | 143 | `brand-detail` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/business/BrandDetail.tsx | 351 | `#1E3A5F` | `#141418 (graphite)` | hardcoded-hex |
| src/pages/business/BrandDetail.tsx | 351 | `#2D2D2D` | `#141418 (graphite)` | hardcoded-hex |
| src/pages/business/BrandDetail.tsx | 351 | `#6B6560` | `#8E6464 (signal-down)` | hardcoded-hex |
| src/pages/business/BrandDetail.tsx | 351 | `#C5A572` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/pages/business/BrandDetail.tsx | 351 | `#F5F1EC` | `#F6F3EF (background)` | hardcoded-hex |
| src/pages/business/BrandDetail.tsx | 707 | `bg-intel-up` | `text-signal-up` | legacy-token |
| src/pages/business/BrandDetail.tsx | 707 | `text-intel-up` | `text-signal-up` | legacy-token |
| src/pages/business/CECredits.tsx | 39 | `edu-003` | `text-graphite` | legacy-token |
| src/pages/business/CECredits.tsx | 40 | `edu-007` | `text-graphite` | legacy-token |
| src/pages/business/Dashboard.tsx | 49 | `bg-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/Dashboard.tsx | 49 | `l-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/Dashboard.tsx | 49 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/Dashboard.tsx | 49 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/Dashboard.tsx | 334 | `bg-intel-dark` | `bg-background` | legacy-token |
| src/pages/business/Dashboard.tsx | 335 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/LocationsDashboard.tsx | 210 | `#c9963f` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/pages/business/LocationsDashboard.tsx | 210 | `#D4A44C` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/pages/business/LocationsDashboard.tsx | 212 | `#bfb9b0` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/pages/business/LocationsDashboard.tsx | 212 | `#D6D1C9` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/pages/business/LocationsDashboard.tsx | 213 | `#d4a87a` | `#A97A4C (signal-warn)` | hardcoded-hex |
| src/pages/business/LocationsDashboard.tsx | 213 | `#e8c4a0` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/pages/business/MarketingAnalytics.tsx | 221 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/MarketingAnalytics.tsx | 228 | `bg-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PlanResults.tsx | 353 | `bg-intel-dark` | `bg-background` | legacy-token |
| src/pages/business/PlanResults.tsx | 354 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PlanResults.tsx | 407 | `brand-protocol` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/business/PlanResults.tsx | 428 | `bg-brand-border` | `bg-background` | legacy-token |
| src/pages/business/PlanResults.tsx | 428 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/pages/business/PlanResults.tsx | 474 | `border-brand-border` | `border-graphite/20` | legacy-token |
| src/pages/business/PlanResults.tsx | 474 | `divide-brand-border` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/business/PlanResults.tsx | 476 | `bg-brand-surface-alt` | `bg-accent-soft` | legacy-token |
| src/pages/business/PortalHome.tsx | 214 | `bg-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PortalHome.tsx | 215 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PortalHome.tsx | 248 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PortalHome.tsx | 249 | `text-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PortalHome.tsx | 254 | `bg-intel-accent` | `text-accent` | legacy-token |
| src/pages/business/PortalHome.tsx | 254 | `text-intel-accent` | `text-accent` | legacy-token |

### src/pages/business/studio
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/pages/business/studio/CourseBuilder.tsx | 1093 | `#4A7A5F` | `#5F8A72 (signal-up)` | hardcoded-hex |

### src/pages/public
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/pages/public/Brands.tsx | 146 | `socelle-brand-directory` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/Brands.tsx | 183 | `brand-mentions` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/Brands.tsx | 376 | `brand-search` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/Brands.tsx | 411 | `brand-search` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/BrandStorefront.tsx | 763 | `brand-storefront` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/BrandStorefront.tsx | 966 | `Brand-specific` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/BrandStorefront.tsx | 968 | `brand-signals` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/FAQ.tsx | 84 | `intel-1` | `text-graphite` | legacy-token |
| src/pages/public/FAQ.tsx | 91 | `intel-2` | `text-graphite` | legacy-token |
| src/pages/public/FAQ.tsx | 98 | `intel-3` | `text-graphite` | legacy-token |
| src/pages/public/FAQ.tsx | 105 | `intel-4` | `text-graphite` | legacy-token |
| src/pages/public/HowItWorks.tsx | 58 | `Brand-authored` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/Professionals.tsx | 285 | `pro-search` | `map manually to Pearl Mineral V2 token` | legacy-token |
| src/pages/public/Professionals.tsx | 309 | `pro-search` | `map manually to Pearl Mineral V2 token` | legacy-token |

### src/styles
| File | Line | Offending Token | Suggested V2 Replacement | Type |
|---|---:|---|---|---|
| src/styles/socelle-cleanroom.css | 20 | `#343438` | `#141418 (graphite)` | hardcoded-hex |
| src/styles/socelle-cleanroom.css | 21 | `#6E6E74` | `#5A7185 (accent-hover)` | hardcoded-hex |
| src/styles/socelle-cleanroom.css | 23 | `#EFEBE6` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/styles/socelle-cleanroom.css | 24 | `#DDD8D2` | `#E8EDF1 (accent-soft)` | hardcoded-hex |
| src/styles/socelle-cleanroom.css | 25 | `#FFFFFF` | `#F6F3EF (background)` | hardcoded-hex |
| src/styles/socelle-cleanroom.css | 26 | `#F8F5F1` | `#F6F3EF (background)` | hardcoded-hex |
| src/styles/socelle-cleanroom.css | 202 | `#fff` | `#F6F3EF (background)` | hardcoded-hex |

## Banned Term Findings (Grouped By Directory)
### src
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/App.tsx | 118 | `dashboard` | Control Center / Intelligence Hub |
| src/App.tsx | 188 | `dashboard` | Control Center / Intelligence Hub |
| src/App.tsx | 609 | `dashboard` | Control Center / Intelligence Hub |
| src/App.tsx | 984 | `dashboard` | Control Center / Intelligence Hub |
| src/App.tsx | 985 | `dashboard` | Control Center / Intelligence Hub |
| src/App.tsx | 1017 | `dashboard` | Control Center / Intelligence Hub |
| src/App.tsx | 1069 | `dashboard` | Control Center / Intelligence Hub |

### src/components
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/components/BusinessNav.tsx | 45 | `dashboard` | Control Center / Intelligence Hub |
| src/components/BusinessNav.tsx | 56 | `dashboard` | Control Center / Intelligence Hub |
| src/components/BusinessNav.tsx | 127 | `dashboard` | Control Center / Intelligence Hub |
| src/components/DevOnlyMasterLinks.tsx | 15 | `dashboard` | Control Center / Intelligence Hub |
| src/components/DevOnlyMasterLinks.tsx | 18 | `dashboard` | Control Center / Intelligence Hub |
| src/components/IngestionView.tsx | 426 | `dashboard` | Control Center / Intelligence Hub |
| src/components/MainNav.tsx | 154 | `dashboard` | Control Center / Intelligence Hub |
| src/components/MainNav.tsx | 162 | `dashboard` | Control Center / Intelligence Hub |
| src/components/MainNav.tsx | 275 | `dashboard` | Control Center / Intelligence Hub |
| src/components/MainNav.tsx | 284 | `dashboard` | Control Center / Intelligence Hub |
| src/components/UpgradeGate.tsx | 63 | `dashboard` | Control Center / Intelligence Hub |

### src/components/intelligence/cloud
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/components/intelligence/cloud/BrandHealthMonitor.tsx | 2 | `dashboard` | Control Center / Intelligence Hub |

### src/data
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/data/appFeatureGuide.ts | 315 | `dashboard` | Control Center / Intelligence Hub |
| src/data/appFeatureGuide.ts | 358 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 80 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 136 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 143 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 188 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 205 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 206 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 208 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 212 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 214 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 220 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 243 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 273 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 282 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 284 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 335 | `dashboard` | Control Center / Intelligence Hub |
| src/data/pageIndex.ts | 353 | `dashboard` | Control Center / Intelligence Hub |

### src/layouts
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/layouts/AdminLayout.tsx | 53 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/AdminLayout.tsx | 84 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/AdminLayout.tsx | 190 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/AdminLayout.tsx | 312 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/BrandLayout.tsx | 37 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/BrandLayout.tsx | 112 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/BusinessLayout.tsx | 55 | `dashboard` | Control Center / Intelligence Hub |
| src/layouts/MarketingLayout.tsx | 24 | `dashboard` | Control Center / Intelligence Hub |

### src/lib
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/lib/aiConciergeEngine.ts | 297 | `holistic` | complete / comprehensive |
| src/lib/analyticsService.ts | 29 | `dashboard` | Control Center / Intelligence Hub |
| src/lib/analyticsService.ts | 132 | `dashboard` | Control Center / Intelligence Hub |
| src/lib/analyticsService.ts | 187 | `dashboard` | Control Center / Intelligence Hub |

### src/lib/ai
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/lib/ai/mockAdvisor.ts | 256 | `dashboard` | Control Center / Intelligence Hub |

### src/lib/i18n
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/lib/i18n/regions.ts | 211 | `dashboard` | Control Center / Intelligence Hub |
| src/lib/i18n/types.ts | 53 | `dashboard` | Control Center / Intelligence Hub |

### src/lib/intelligence
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/lib/intelligence/benchmarkTypes.ts | 2 | `dashboard` | Control Center / Intelligence Hub |
| src/lib/intelligence/useBenchmarkData.ts | 1 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/admin
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/admin/AdminDashboard.tsx | 321 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/AdminDashboard.tsx | 325 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/AdminLogin.tsx | 23 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/AdminShellDetection.tsx | 76 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/AdminShellDetection.tsx | 156 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/AdminShellDetection.tsx | 191 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/admin/cms
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/admin/cms/CmsDashboard.tsx | 2 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/cms/CmsDashboard.tsx | 69 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/cms/CmsDashboard.tsx | 82 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/admin/cms/CmsDashboard.tsx | 93 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/brand
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/brand/ClaimReview.tsx | 48 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/ClaimReview.tsx | 76 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/ClaimReview.tsx | 132 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Dashboard.tsx | 168 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Dashboard.tsx | 338 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Login.tsx | 22 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Login.tsx | 26 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Onboarding.tsx | 315 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Onboarding.tsx | 317 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Onboarding.tsx | 318 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Onboarding.tsx | 343 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/brand/Onboarding.tsx | 346 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/business
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/business/Apply.tsx | 162 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Apply.tsx | 163 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Apply.tsx | 344 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ClaimReview.tsx | 48 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ClaimReview.tsx | 78 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ClaimReview.tsx | 134 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/CommissionsDashboard.tsx | 14 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/CrmDashboard.tsx | 17 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/CrmDashboard.tsx | 297 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Dashboard.tsx | 55 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Dashboard.tsx | 59 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Dashboard.tsx | 162 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/LocationsDashboard.tsx | 1 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Login.tsx | 35 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Login.tsx | 39 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Login.tsx | 87 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/MarketingDashboard.tsx | 21 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/PortalHome.tsx | 34 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/PortalHome.tsx | 37 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ResellerDashboard.tsx | 16 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ResellerDashboard.tsx | 56 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ResellerDashboard.tsx | 64 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ResellerRevenue.tsx | 16 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/ResellerRevenue.tsx | 72 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/SalesDashboard.tsx | 15 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/SalesDashboard.tsx | 93 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/Signup.tsx | 65 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/business/affiliates
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/business/affiliates/AffiliateDashboard.tsx | 16 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/affiliates/AffiliateLinks.tsx | 84 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/business/credits
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/business/credits/CreditDashboard.tsx | 16 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/credits/CreditPurchase.tsx | 41 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/business/marketing
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/business/marketing/MarketingDashboard.tsx | 20 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/business/onboarding
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/business/onboarding/OnboardingComplete.tsx | 87 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/business/onboarding/OnboardingComplete.tsx | 91 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/dev
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/dev/MasterIndex.tsx | 266 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/education
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/education/CECreditDashboard.tsx | 3 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/education/StaffTraining.tsx | 3 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/education/StaffTraining.tsx | 119 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/education/author
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/education/author/AuthorDashboard.tsx | 50 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/education/author/CourseBuilder.tsx | 373 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/marketing
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/marketing/MarketingDashboard.tsx | 6 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/marketing/MarketingDashboard.tsx | 47 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/public
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/public/ApiDocs.tsx | 297 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/ApiDocs.tsx | 308 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/ApiPricing.tsx | 38 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/BrandStorefront.tsx | 1090 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/FAQ.tsx | 160 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/ForBrands.tsx | 352 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/Intelligence.tsx | 243 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/public/Plans.tsx | 56 | `dashboard` | Control Center / Intelligence Hub |

### src/pages/sales
| File | Line | Offending Term | Suggested Replacement |
|---|---:|---|---|
| src/pages/sales/CommissionDashboard.tsx | 13 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/sales/SalesDashboard.tsx | 19 | `dashboard` | Control Center / Intelligence Hub |
| src/pages/sales/SalesDashboard.tsx | 168 | `dashboard` | Control Center / Intelligence Hub |
