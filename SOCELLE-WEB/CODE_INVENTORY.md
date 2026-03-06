# CODE INVENTORY — SOCELLE Platform

**Generated:** February 26, 2026

---

## Summary Statistics

### Web Codebase (SOCELLE WEB)
- **Total Source Files:** 357
- **Total Lines of Code:** 50,610
- **File Type Breakdown:**
  - TypeScript/TSX: 190 files (190 source files)
  - SQL Migrations: 65 files
  - Markdown Docs: 75 files
  - Configuration: 9 JSON, 1 YAML, 1 TOML, 2 other config files
  - Other: 14 files (shell, HTML, CSS, SVG, etc.)

### Mobile Codebase (SOCELLE Mobile)
- **Total Source Files:** 368
- **Total Lines of Code (excl. .dart_tool):** 22,376 Dart + 34,882 TypeScript Functions
- **File Type Breakdown:**
  - Dart: 102 files (22,376 LOC)
  - TypeScript Functions: 43 files (34,882 LOC)
  - iOS Native: 21 files (Swift, Objective-C, plist, xcconfig, storyboard)
  - Configuration: 18 JSON, 2 YAML, 5 XML, 2 lock files
  - Documentation & Metadata: 21 files

---

## Web Codebase (SOCELLE WEB)

### Root Configuration Files
| File | Size | Modified |
|------|------|----------|
| `.env` | 252 B | Feb 21 20:00 |
| `.env.example` | 1.4K | Feb 26 07:54 |
| `.gitignore` | 77 B | Feb 23 01:16 |
| `package.json` | 1.4K | Feb 24 00:20 |
| `tsconfig.json` | 119 B | Feb 17 02:21 |
| `tsconfig.app.json` | 552 B | Feb 17 02:21 |
| `tsconfig.node.json` | 479 B | Feb 17 02:21 |
| `vite.config.ts` | 1.3K | Feb 22 04:23 |
| `vitest.config.ts` | 385 B | Feb 22 04:24 |
| `eslint.config.js` | 739 B | Feb 17 02:21 |
| `tailwind.config.js` | 4.7K | Feb 23 05:25 |
| `postcss.config.js` | 81 B | Feb 17 02:21 |
| `playwright.config.ts` | 737 B | Feb 17 05:29 |
| `index.html` | 1.9K | Feb 23 05:25 |
| `netlify.toml` | 1.6K | Feb 26 07:54 |

### Supabase Configuration & Migrations
**Location:** `./supabase/`

**Migrations (65 files, organized chronologically):**

#### Core Schema Migrations
| Migration | Size | Purpose |
|-----------|------|---------|
| `20260121181900_create_naturopathica_schema.sql` | 12K | Initial Naturopathica product schema |
| `20260121190932_add_medspa_reference_tables.sql` | 4.7K | Med-spa service reference data |
| `20260121192403_add_retail_pricing_data_v2.sql` | 9.5K | Retail product pricing tables |
| `20260121192519_add_backbar_pricing_data.sql` | 8.3K | Backbar inventory pricing |
| `20260121192745_add_marketing_calendar_v2.sql` | 7.9K | Marketing event calendar |
| `20260121193704_add_protocol_details_and_tracking_schema_v2.sql` | 12K | Protocol tracking and versioning |
| `20260121200027_add_protocol_completion_tracking.sql` | 6.1K | Protocol completion status tracking |
| `20260121201050_create_intelligence_engine_schema.sql` | 8.1K | AI intelligence engine data structures |
| `20260121202258_create_business_rules_schema.sql` | 7.9K | Business rule configurations |
| `20260121202352_create_retail_attach_schema_v2.sql` | 5.9K | Retail attachment engine |
| `20260121203337_create_implementation_enablement_schema.sql` | 16K | Implementation plan and tracking |
| `20260121204245_create_spa_leads_and_plan_outputs_schema.sql` | 9.4K | Spa lead capture and planning |
| `20260121205649_create_ai_concierge_schema.sql` | 7.7K | AI concierge feature tables |
| `20260121234227_create_spa_menu_summaries_view.sql` | 3.4K | Spa menu summary materialized view |
| `20260121234850_create_user_profiles_and_submissions_schema.sql` | 8.7K | User profiles and brand submissions |

#### Multi-Tenant & Authentication
| Migration | Size | Purpose |
|-----------|------|---------|
| `20260124004055_extend_user_role_enum.sql` | 1.2K | Extended role definitions |
| `20260124004115_create_brands_and_businesses_tables.sql` | 5.9K | Brand and business entity tables |
| `20260124004300_add_brand_id_to_content_tables_v4.sql` | 5.1K | Multi-tenant brand scoping |
| `20260124004432_update_rls_for_multi_tenant_brand_scoping_v2.sql` | 13K | Row-level security policies for tenants |

#### Brand Portal & Visibility
| Migration | Size | Purpose |
|-----------|------|---------|
| `20260124012030_create_plans_and_menu_uploads_tables.sql` | 3.5K | Brand plan and menu upload |
| `20260124012121_create_business_plan_outputs_table.sql` | 2.1K | Business plan output tracking |
| `20260216200332_fix_brands_public_visibility.sql` | 1.5K | Brand public visibility |
| `20260216203359_fix_brands_rls_use_status_column.sql` | 1.5K | Brand status-based RLS |
| `20260216204527_add_anon_access_to_brand_content.sql` | 4.8K | Anonymous brand discovery access |
| `20260216232855_add_brand_cms_fields.sql` | 2.0K | Brand CMS content fields |
| `20260216233322_create_brand_assets_table.sql` | 4.8K | Brand asset management |
| `20260216233757_create_brand_page_modules_table.sql` | 3.1K | Brand page module system |
| `20260216234444_create_brand_training_modules_table.sql` | 3.3K | Brand training content |
| `20260216234447_create_brand_commercial_assets_table.sql` | 3.1K | Commercial asset library |

#### Commerce & Revenue
| Migration | Size | Purpose |
|-----------|------|---------|
| `20260216235428_create_orders_and_order_items_tables.sql` | 4.9K | Order management system |
| `20260217012417_add_auto_profile_creation_trigger.sql` | 1.8K | Auto-create user profiles on signup |
| `20260221000001_create_brand_shop_settings_table.sql` | 3.4K | Brand shop configuration |
| `20260221000002_seed_benchmarks_and_revenue_defaults.sql` | 6.4K | Revenue benchmark seeding |
| `20260221000003_add_performance_indexes.sql` | 3.2K | Database performance indexes |
| `20260223000001_create_subscriptions_table.sql` | 3.4K | Subscription management |

#### Advanced Features (Feb 22-26)
| Migration | Size | Purpose |
|-----------|------|---------|
| `20260222000001_analytics_powerhouse.sql` | 19K | Advanced analytics tables & views |
| `20260222000002_pgvector.sql` | 6.8K | Vector search via pgvector extension |
| `20260223000002_brand_portal_commerce_access.sql` | 7.5K | Brand portal commerce access control |
| `20260224000001_modify_user_profiles_add_tiers.sql` | 1.9K | User tier/subscription levels |
| `20260224000002_modify_plans_add_missing_fields.sql` | 6.0K | Plan field enhancements |
| `20260224000003_modify_businesses_add_profile_fields.sql` | 7.2K | Business profile fields |
| `20260224000004_create_product_pricing_table.sql` | 8.6K | Dynamic product pricing |
| `20260224000005_modify_orders_add_payment_fields.sql` | 5.9K | Payment processing fields |
| `20260224000006_modify_brand_messages_add_threading.sql` | 5.8K | Message threading |
| `20260224000007_modify_products_add_sort_order.sql` | 2.4K | Product sorting/sequencing |
| `20260224000008_seed_studio_monthly_plan.sql` | 864 B | Studio monthly plan seed data |

#### Brand Signals & Messaging (Feb 25-26)
| Migration | Size | Purpose |
|-----------|------|---------|
| `20260225000035_modify_brands_add_verification_seeding.sql` | 1.9K | Brand verification status |
| `20260225000047_modify_businesses_add_verification_seeding.sql` | 2.5K | Business verification status |
| `20260225000108_create_brand_interest_signals.sql` | 1.4K | Brand interest tracking |
| `20260225000116_create_business_interest_signals.sql` | 1.4K | Business interest signals |
| `20260225000127_create_brand_seed_content.sql` | 1.7K | Brand seed content |
| `20260225000134_create_business_seed_content.sql` | 1.5K | Business seed content |
| `20260225000148_create_conversations.sql` | 2.3K | Conversation threads |
| `20260225000159_create_messages.sql` | 1.8K | Message tables |
| `20260225000207_create_message_read_status.sql` | 1.3K | Message read tracking |
| `20260225000300_rls_policies_phase1_new_tables.sql` | 13K | Phase 1 RLS security policies |
| `20260225000400_orders_rls_brand_admin_access.sql` | 473 B | Brand admin order access |
| `20260225000500_brands_insert_policy_for_applications.sql` | 457 B | Brand application submission |
| `20260226000001_brand_admin_orders_update_access.sql` | 1.1K | Brand admin order updates |

### Edge Functions
**Location:** `./supabase/functions/`

| Function | Size | Purpose |
|----------|------|---------|
| `ai-concierge/index.ts` | 7.3K | AI concierge service |
| `create-checkout/index.ts` | 7.0K | Stripe checkout creation |
| `generate-embeddings/index.ts` | 7.9K | Vector embeddings generation |
| `send-email/index.ts` | 9.6K | Email service integration |
| `stripe-webhook/index.ts` | 7.1K | Stripe webhook handler |

### Source Code (src/)
**Main Application: 217 files, ~40,000+ LOC**

#### Core Application Files
| File | Size | Purpose |
|------|------|---------|
| `App.tsx` | 19K | Main app component with routing |
| `main.tsx` | 3.4K | React entry point |
| `index.css` | 7.3K | Global styles |
| `vite-env.d.ts` | 38 B | Vite environment types |

#### Authentication & Core Services (lib/)
| Component | Size | Purpose |
|-----------|------|---------|
| `auth.tsx` | 12K | Authentication logic & hooks |
| `supabase.ts` | 959 B | Supabase client initialization |
| `errors.ts` | 4.4K | Error handling utilities |
| `logger.ts` | 2.8K | Logging service |
| `types.ts` | 7.6K | Application type definitions |
| `platformConfig.ts` | 5.5K | Platform configuration |

#### Database & ORM
| Module | Size | Purpose |
|--------|------|---------|
| `database.types.ts` | 26K | Auto-generated Supabase types |

#### Business Logic Services (lib/)
| Service | Size | Purpose |
|---------|------|---------|
| `ingestionService.ts` | 31K | Multi-step protocol ingestion |
| `aiConciergeEngine.ts` | 19K | AI recommendation engine |
| `gapAnalysisEngine.ts` | 21K | Gap analysis & recommendations |
| `mappingEngine.ts` | 17K | Service mapping logic |
| `serviceMappingEngine.ts` | 14K | Service-to-plan mapping |
| `planOrchestrator.ts` | 8.9K | Plan orchestration logic |
| `planOutputGenerator.ts` | 14K | Plan output generation |
| `phasedRolloutPlanner.ts` | 9.6K | Phased rollout planning |
| `implementationReadinessEngine.ts` | 13K | Implementation readiness scoring |
| `retailAttachEngine.ts` | 11K | Retail attachment scoring |
| `brandDifferentiationEngine.ts` | 4.4K | Brand differentiation logic |
| `openingOrderEngine.ts` | 11K | Opening order optimization |
| `menuOrchestrator.ts` | 12K | Menu orchestration logic |

#### Data & Analytics
| Module | Size | Purpose |
|--------|------|---------|
| `analyticsService.ts` | 9.3K | Analytics event tracking |
| `reportGenerator.ts` | 9.1K | Report generation |
| `dataIntegrityRules.ts` | 7.5K | Data validation rules |
| `schemaHealth.ts` | 5.3K | Schema health checks |
| `searchService.ts` | 7.4K | Unified search across entities |

#### Document Processing
| Module | Size | Purpose |
|--------|------|---------|
| `pdfExtractionService.ts` | 14K | PDF extraction & parsing |
| `documentExtraction.ts` | 3.3K | Generic document extraction |
| `csvExport.ts` | 1.3K | CSV export utilities |

#### Integration Services
| Service | Size | Purpose |
|---------|------|---------|
| `emailService.ts` | 2.0K | Email integration |

#### Testing & Setup
| File | Size | Purpose |
|------|------|---------|
| `mappingEngine.test.ts` | 5.7K | Mapping engine tests |
| `searchService.test.ts` | 5.1K | Search service tests |
| `useCart.ts` | 2.2K | Shopping cart hook |
| `useSubscription.ts` | 4.4K | Subscription management hook |

#### UI Components (components/)
**46 components, ~300+ LOC total**

##### Layout Components
| Component | Size |
|-----------|------|
| `MainNav.tsx` | 4.6K |
| `Navigation.tsx` | 3.0K |
| `ErrorBoundary.tsx` | 2.3K |
| `RouteErrorBoundary.tsx` | 2.0K |
| `Toast.tsx` | 3.1K |

##### Feature Components
| Component | Size | Purpose |
|-----------|------|---------|
| `AIConcierge.tsx` | 18K | AI concierge interface |
| `AIConciergeLogsView.tsx` | 14K | Concierge logs viewer |
| `BrandCard.tsx` | 3.9K | Brand display card |
| `BrandPageRenderer.tsx` | 23K | Dynamic brand page rendering |
| `BrandShop.tsx` | 8.6K | Brand shop interface |
| `BusinessNav.tsx` | 7.9K | Business portal navigation |
| `BusinessRulesView.tsx` | 16K | Business rule configuration |
| `CartDrawer.tsx` | 6.6K | Shopping cart sidebar |
| `ConfigCheck.tsx` | 1.6K | Configuration validator |
| `CostsView.tsx` | 11K | Cost analysis view |
| `ImplementationPlannerView.tsx` | 24K | Implementation planning interface |
| `IngestionView.tsx` | 22K | Data ingestion interface |
| `MappingView.tsx` | 8.7K | Service mapping interface |
| `MarketingCalendarView.tsx` | 9.7K | Marketing calendar display |
| `MixingRulesView.tsx` | 11K | Mixing rule configuration |
| `OnboardingChecklist.tsx` | 5.3K | Onboarding progress checklist |
| `Phase2IngestionPanel.tsx` | 13K | Phase 2 ingestion panel |
| `PlanOutputView.tsx` | 24K | Plan output display |
| `ProProductsView.tsx` | 9.7K | Pro product listing |
| `ProductCard.tsx` | 4.4K | Product display card |
| `ProtectedRoute.tsx` | 3.9K | Route protection wrapper |
| `ProtocolCompletionEditor.tsx` | 25K | Protocol completion editor |
| `ProtocolsView.tsx` | 24K | Protocols management view |
| `ReportsView.tsx` | 8.5K | Reports dashboard |
| `RetailProductsView.tsx` | 9.8K | Retail product listing |
| `SalesPipelineView.tsx` | 18K | Sales pipeline visualization |
| `SchemaHealthView.tsx` | 16K | Schema health monitoring |
| `SearchBar.tsx` | 5.5K | Global search input |
| `SearchFilters.tsx` | 12K | Advanced search filters |
| `ServiceIntelligenceView.tsx` | 25K | Service intelligence dashboard |
| `Skeleton.tsx` | 2.4K | Loading skeleton UI |
| `SpaMenusView.tsx` | 9.4K | Spa menu management |
| `SpaOnboardingWizard.tsx` | 21K | Spa onboarding flow |
| `UpgradeGate.tsx` | 5.1K | Subscription upgrade gate |
| `DevOnlyMasterLinks.tsx` | 2.7K | Developer utility links |
| `ErrorState.tsx` | 850 B | Error state display |

##### Analytics Components (components/analytics/)
| Component | Size | Purpose |
|-----------|------|---------|
| `AdminDashboard.tsx` | 5.2K | Admin analytics dashboard |
| `BrandDashboard.tsx` | 5.6K | Brand analytics |
| `BusinessDashboard.tsx` | 6.5K | Business analytics |
| `MetricCard.tsx` | 1.9K | Metric card display |
| `SparklineChart.tsx` | 4.5K | Sparkline chart component |

##### UI System (components/ui/)
**11 reusable UI components**
| Component | Size |
|-----------|------|
| `Avatar.tsx` | 915 B |
| `Badge.tsx` | 1.3K |
| `Button.tsx` | 1.9K |
| `Card.tsx` | 1.1K |
| `EmptyState.tsx` | 1.1K |
| `Input.tsx` | 1.9K |
| `Modal.tsx` | 2.1K |
| `Skeleton.tsx` | 1.4K |
| `StatCard.tsx` | 2.1K |
| `Table.tsx` | 1.6K |
| `Tabs.tsx` | 2.0K |
| `index.ts` | 524 B |

#### Layouts (layouts/)
| Layout | Size | Purpose |
|--------|------|---------|
| `AdminLayout.tsx` | 8.1K | Admin dashboard layout |
| `BrandLayout.tsx` | 7.6K | Brand portal layout |
| `BusinessLayout.tsx` | 5.4K | Business portal layout |
| `SpaLayout.tsx` | 5.6K | Spa portal layout |

#### Pages (pages/)
**68 page components organized by role**

##### Admin Pages (pages/admin/)
| Page | Size | Purpose |
|------|------|---------|
| `AdminApprovalQueue.tsx` | 21K | Brand application approval queue |
| `AdminBrandList.tsx` | 13K | Brand listing & management |
| `AdminDashboard.tsx` | 8.6K | Admin dashboard |
| `AdminInbox.tsx` | 11K | Admin message inbox |
| `AdminLogin.tsx` | 6.6K | Admin login page |
| `AdminOrderDetail.tsx` | 18K | Order detail & tracking |
| `AdminOrders.tsx` | 16K | Orders management |
| `AdminSeeding.tsx` | 23K | Data seeding utility |
| `AdminSignals.tsx` | 18K | Interest signal analytics |
| `AuthDebug.tsx` | 11K | Authentication debugging |
| `BrandAdminEditor.tsx` | 144K | Brand CMS editor (largest component) |
| `BrandHub.tsx` | 5.0K | Brand hub overview |
| `BrandsAdminList.tsx` | 13K | Brand administration list |
| `BrandsManagement.tsx` | 20K | Brand management interface |
| `BulkProtocolImport.tsx` | 17K | Bulk protocol import |
| `DebugPanel.tsx` | 18K | Developer debug panel |
| `SubmissionDetail.tsx` | 21K | Brand submission details |

##### Admin Brand Hub (pages/admin/brand-hub/)
| Page | Size |
|------|------|
| `HubAnalytics.tsx` | 4.4K |
| `HubEducation.tsx` | 2.9K |
| `HubOrders.tsx` | 2.9K |
| `HubProducts.tsx` | 4.3K |
| `HubProtocols.tsx` | 2.8K |
| `HubRetailers.tsx` | 2.6K |
| `HubSettings.tsx` | 3.1K |

##### Brand Pages (pages/brand/)
| Page | Size | Purpose |
|------|------|---------|
| `ApplicationReceived.tsx` | 4.4K | Application confirmation page |
| `Apply.tsx` | 17K | Brand application form |
| `Automations.tsx` | 1.9K | Automation settings |
| `Campaigns.tsx` | 1.8K | Campaign management |
| `Customers.tsx` | 11K | Customer management |
| `Dashboard.tsx` | 15K | Brand dashboard |
| `Leads.tsx` | 7.5K | Lead management |
| `Login.tsx` | 5.1K | Brand login |
| `Messages.tsx` | 16K | Brand messaging |
| `Onboarding.tsx` | 15K | Brand onboarding flow |
| `OrderDetail.tsx` | 20K | Order details |
| `Orders.tsx` | 9.6K | Orders listing |
| `Performance.tsx` | 14K | Performance metrics |
| `Plans.tsx` | 12K | Plan management |
| `Products.tsx` | 33K | Product catalog management |
| `Promotions.tsx` | 1.8K | Promotion management |
| `Storefront.tsx` | 14K | Brand storefront |

##### Business Pages (pages/business/)
| Page | Size | Purpose |
|------|------|---------|
| `Account.tsx` | 17K | Account settings |
| `BrandDetail.tsx` | 27K | Brand detail view |
| `Dashboard.tsx` | 12K | Business dashboard |
| `Login.tsx` | 5.5K | Business login |
| `MarketingCalendar.tsx` | 357 B | Marketing calendar view |
| `Messages.tsx` | 19K | Business messaging |
| `OrderDetail.tsx` | 9.7K | Order detail view |
| `Orders.tsx` | 6.3K | Orders listing |
| `PlanComparison.tsx` | 14K | Plan comparison interface |
| `PlanResults.tsx` | 25K | Plan results display |
| `PlanWizard.tsx` | 24K | Plan creation wizard |
| `PlansList.tsx` | 14K | Plans listing |
| `PortalHome.tsx` | 8.9K | Portal home page |
| `Signup.tsx` | 8.5K | Business signup form |

##### Public Pages (pages/public/)
| Page | Size | Purpose |
|------|------|---------|
| `About.tsx` | 16K | About page |
| `BrandStorefront.tsx` | 48K | Public brand storefront |
| `Brands.tsx` | 17K | Brand discovery/listing |
| `ForgotPassword.tsx` | 4.6K | Password recovery |
| `Home.tsx` | 25K | Landing page |
| `Pricing.tsx` | 18K | Pricing page |
| `Privacy.tsx` | 3.2K | Privacy policy |
| `ResetPassword.tsx` | 5.3K | Password reset |
| `Terms.tsx` | 4.0K | Terms of service |

##### Spa Pages (pages/spa/)
| Page | Size | Purpose |
|------|------|---------|
| `Dashboard.tsx` | 8.5K | Spa dashboard |
| `Home.tsx` | 4.8K | Spa home page |
| `Login.tsx` | 4.1K | Spa login |
| `PlanDetail.tsx` | 18K | Plan detail view |
| `PlanWizard.tsx` | 13K | Plan creation wizard |
| `Plans.tsx` | 6.6K | Plans listing |
| `ProductLibrary.tsx` | 9.4K | Product library |
| `ServiceLibrary.tsx` | 9.1K | Service library |
| `Signup.tsx` | 5.1K | Spa signup |
| `SpaConcierge.tsx` | 550 B | Spa AI concierge |

### Scripts
**Location:** `./scripts/`

| Script | Size | Purpose |
|--------|------|---------|
| `extractProtocolsFromPDFs.ts` | 22K | Extract protocols from PDF files |
| `ingestAllProtocols.ts` | 6.1K | Ingest all protocols into database |
| `seedRetailAttachRules.ts` | 4.9K | Seed retail attachment rules |
| `seedTestUsers.ts` | 4.6K | Seed test user accounts |
| `create_test_users.sql` | 4.7K | SQL: Create test users |
| `setup_test_users.sql` | 3.1K | SQL: Setup test user data |
| `grant_bruce_admin.sql` | 1.1K | SQL: Grant admin privileges |
| `TEST_USERS_README.md` | 1.9K | Test user documentation |
| `TEST_USERS_SETUP.md` | 7.1K | Test setup guide |

### E2E Tests
**Location:** `./e2e/`

| Test | Size | Purpose |
|------|------|---------|
| `routeTable.ts` | 7.3K | Route configuration for tests |
| `ai-flow.spec.ts` | 1.7K | AI flow Playwright tests |
| `auth.spec.ts` | 2.9K | Authentication tests |
| `routes.spec.ts` | 2.7K | Route navigation tests |

### Documentation
**Location:** `./docs/`

#### Core Documentation (Root)
| Document | Size | Last Modified |
|-----------|------|---------------|
| `SOCELLE_MASTER_PROMPT_FINAL.md` | 78K | Feb 25 03:42 |
| `build_tracker.md` | 31K | Feb 26 22:52 |

#### Platform Documentation (docs/platform/)
**18 comprehensive platform spec documents (~300K+ total)**
| Document | Size | Purpose |
|-----------|------|---------|
| `ACTORS_AND_PERMISSIONS.md` | 14K | User roles and permissions |
| `BENCHMARKING_SPEC.md` | 13K | Benchmarking system specification |
| `CONVERSION_AND_RETENTION.md` | 14K | Conversion & retention mechanics |
| `CORE_USER_JOURNEYS.md` | 82K | Detailed user journey maps |
| `IA_AND_SCREEN_MAP.md` | 18K | Information architecture |
| `IMPLEMENTATION_BACKLOG.md` | 31K | Implementation task backlog |
| `LEAKAGE_ENGINE_SPEC.md` | 16K | Revenue leakage detection |
| `PLATFORM_LOGIC_AND_DATA.md` | 72K | Core platform logic & data model |
| `PREMORTEM_RISKS.md` | 21K | Pre-mortem risk analysis |
| `PRICING_SIMULATOR_SPEC.md` | 12K | Pricing simulation engine |
| `RETAIL_ATTACH_ENGINE_SPEC.md` | 19K | Retail attachment scoring |
| `REVENUE_DASHBOARD_REQUIREMENTS.md` | 16K | Revenue dashboard spec |
| `REVENUE_KPI_SPEC.md` | 51K | Revenue KPI definitions |
| `REVENUE_LAYER_BACKLOG.md` | 27K | Revenue feature backlog |
| `REVENUE_LAYER_SYSTEM_FIT.md` | 18K | Revenue system integration |
| `SCREEN_REQUIREMENTS.md` | 81K | Detailed screen specifications |

#### Audit & Build Documentation (docs/audit/ & docs/codex/)
| Document | Size | Purpose |
|-----------|------|---------|
| `SYSTEM_OVERVIEW.md` | 17K | System architecture overview |
| `BUILD_SEQUENCE.md` | 14K | Build sequence documentation |
| `MVP_FREEZE.md` | 5.3K | MVP feature freeze list |
| `SIMPLIFICATION_PLAN.md` | 9.8K | System simplification strategy |
| `SYSTEM_STATUS.md` | 8.1K | Current system status |

#### Daily Standup
| Document | Size | Purpose |
|-----------|------|---------|
| `daily_standup.md` | 525 B | Daily standup notes |

### Root-Level Documentation
**60+ comprehensive guides and audit reports**

| Document | Size | Purpose |
|-----------|------|---------|
| `ARCHITECTURE_SUMMARY.md` | 7.5K | Architecture overview |
| `AUDIT_SUMMARY.md` | 3.3K | Audit findings summary |
| `COMPREHENSIVE_TECHNICAL_SUMMARY.md` | 32K | Complete technical documentation |
| `FUNCTIONAL_ARCHITECTURE_AUDIT.md` | 37K | Functional architecture audit |
| `INTELLIGENCE_ENGINE_GUIDE.md` | 23K | Intelligence engine documentation |
| `PLATFORM_AUDIT_COMPLETE.md` | 16K | Platform audit report |
| `PROJECT_SNAPSHOT.md` | 1.1M | Complete project snapshot |
| `REPO_SNAPSHOT_FOR_REVIEW.md` | 32K | Repository review snapshot |
| `TWO_PORTAL_ARCHITECTURE.md` | 17K | Dual portal architecture |
| `UX_AUDIT_REPORT.md` | 14K | UX audit findings |

**Feature Completion Guides (45+ documents):**
- `ADMIN_ACCESS_FIX_COMPLETE.md` (3.9K)
- `ADMIN_BRAND_CMS_COMPLETE.md` (8.7K)
- `ADMIN_PORTAL_ENHANCEMENT_COMPLETE.md` (18K)
- `AI_CONCIERGE_DOCUMENTATION.md` (11K)
- `ANON_BRAND_DISCOVERY_RLS_COMPLETE.md` (11K)
- `AUTH_DEBUG_UPGRADE_COMPLETE.md` (9.1K)
- `AUTH_FIX_COMPLETE.md` (6.1K)
- `AUTH_HOSTED_ENVIRONMENT_COMPLETE.md` (5.8K)
- `AUTH_ROLE_GATING_FIXES_COMPLETE.md` (12K)
- `BRAND_DISCOVERY_FIX_COMPLETE.md` (8.4K)
- `BRAND_VISIBILITY_FIX_SUMMARY.md` (8.0K)
- `BRAND_VISIBILITY_RLS_FIX.md` (9.9K)
- `BUSINESS_PORTAL_FIXES_COMPLETE.md` (7.0K)
- `LAUNCH_READY_UPGRADE_COMPLETE.md` (15K)
- `MULTI_TENANT_EVOLUTION_SUMMARY.md` (8.2K)
- `NAVIGATION_FIX_SUMMARY.md` (6.3K)
- `PHASE_2_IMPLEMENTATION.md` (12K)
- `P0_COMPLETE_QA_GUIDE.md` (15K)
- `P0_IMPLEMENTATION_STATUS.md` (15K)
- `UX_FIX_SUMMARY.md` (9.9K)
- *...and 25+ additional completion guides*

### Other Root Files
| File | Size | Purpose |
|------|------|---------|
| `README.md` | 28 B | Minimal readme |
| `build_snapshot.sh` | 2.6K | Build snapshot script |
| `CLAUDE_CODE_HANDOFF.md` | 18K | Claude Code handoff notes |

### GitHub Workflows
**Location:** `./.github/workflows/`

| Workflow | Size | Purpose |
|----------|------|---------|
| `ci.yml` | 3.1K | CI/CD pipeline |

### Configuration Directories

#### Netlify Configuration (`.netlify/`)
- Netlify build configuration and deployment settings

#### Claude Development Configuration (`.claude/`)
- Launch configuration and custom development settings

---

## Mobile Codebase (SOCELLE Mobile)

### Root Configuration
| File | Size | Purpose |
|------|------|---------|
| `.firebaserc` | 57 B | Firebase project configuration |
| `.gitignore` | 147 B | Git ignore rules |
| `.prettierrc.json` | 91 B | Prettier formatting config |
| `firebase.json` | 428 B | Firebase hosting config |
| `firestore.rules` | 3.9K | Firestore security rules |
| `firestore.indexes.json` | 2.8K | Firestore index definitions |
| `package.json` | 887 B | Monorepo root dependencies |
| `tsconfig.json` | 195 B | Base TypeScript config |
| `tsconfig.base.json` | 515 B | Shared TypeScript base |
| `vitest.config.ts` | 399 B | Vitest test configuration |
| `README.md` | 587 B | Monorepo README |
| `eslint.config.js` | 569 B | ESLint configuration |

### Dart Mobile App (apps/mobile/)
**102 Dart files, 22,376 LOC**

#### Core Configuration
| File | Size | Purpose |
|------|------|---------|
| `pubspec.yaml` | 1.2K | Dart dependencies |
| `pubspec.lock` | 27K | Dependency lock file |
| `analysis_options.yaml` | 1.4K | Dart analysis settings |
| `.firebaserc` | 57 B | Firebase config |
| `.gitignore` | 82 B | Git ignore |
| `.metadata` | 964 B | Flutter metadata |
| `firebase.json` | 907 B | Firebase config |

#### Main App Entry & Shell
| File | Size | Purpose |
|------|------|---------|
| `lib/main.dart` | 8.3K | App entry point & initialization |
| `lib/features/shell/app_shell.dart` | 4.5K | Shell container |
| `lib/firebase_options.dart` | 2.3K | Firebase initialization |

#### Core Theme & Constants (lib/core/)
| Module | Size | Purpose |
|--------|------|---------|
| `core/constants.dart` | 3.3K | App-wide constants |
| `core/feature_flags.dart` | 1.1K | Feature flag configuration |
| `core/theme/slotforce_colors.dart` | 6.9K | Slotforce color palette |
| `core/theme/slotforce_theme.dart` | 11K | Slotforce theme definition |
| `core/theme/socelle_colors.dart` | 5.4K | Socelle color palette |
| `core/theme/socelle_theme.dart` | 5.5K | Socelle theme definition |

#### Core Widgets (lib/core/widgets/)
| Widget | Size | Purpose |
|--------|------|---------|
| `celebration_overlay.dart` | 3.8K | Celebration animation overlay |
| `main_navigation_drawer.dart` | 5.4K | Main navigation drawer |
| `sf_badge.dart` | 1.6K | Badge component |
| `sf_button.dart` | 8.8K | Button component |
| `sf_card.dart` | 2.7K | Card component |
| `sf_chip.dart` | 2.8K | Chip component |
| `sf_empty_state.dart` | 2.4K | Empty state component |
| `sf_progress_bar.dart` | 1.6K | Progress bar component |
| `sf_stat_card.dart` | 2.6K | Stat card component |
| `sf_widgets.dart` | 411 B | Widgets export file |

#### Feature: Dashboard (lib/features/dashboard/)
**Primary user interface, 103K+ total**

| Component | Size | Purpose |
|-----------|------|---------|
| `dashboard_page.dart` | 103K | Main dashboard page |
| `widgets/benchmark_card.dart` | 3.6K | Benchmark display card |
| `widgets/empty_state.dart` | 2.4K | Dashboard empty state |
| `widgets/gap_card.dart` | 13K | Gap analysis card |
| `widgets/insight_card.dart` | 2.5K | Insight display card |
| `widgets/leakage_hero.dart` | 8.0K | Leakage visualization hero |
| `widgets/recovered_badge.dart` | 2.8K | Recovery indicator badge |
| `widgets/streak_badge.dart` | 1.2K | Streak display badge |
| `widgets/week_day_bar.dart` | 5.3K | Weekly performance bar |

#### Features: Gap Management
| Feature | Size | Purpose |
|---------|------|---------|
| `lib/features/gap_action/gap_action_sheet.dart` | 12K | Gap action bottom sheet |
| `lib/features/gap_action/fill_slot_flow.dart` | 4.3K | Fill slot workflow |
| `lib/features/gap_action/mark_intentional_sheet.dart` | 7.1K | Mark intentional action |
| `lib/features/gaps/recovery_confirmation.dart` | 7.3K | Recovery confirmation |

#### Feature: Messaging (lib/features/messaging/)
| Component | Size | Purpose |
|-----------|------|---------|
| `messages_page.dart` | 47K | Messages interface |

#### Feature: Onboarding (lib/features/onboarding/)
**Comprehensive onboarding flow, 27K+ total**

| Component | Size | Purpose |
|-----------|------|---------|
| `onboarding_flow.dart` | 27K | Main onboarding flow |
| `onboarding_page.dart` | 321 B | Onboarding page wrapper |
| `widgets/booking_value_step.dart` | 4.3K | Booking value input step |
| `widgets/intro_scene_step.dart` | 6.4K | Intro scene step |
| `widgets/leakage_reveal.dart` | 6.8K | Leakage reveal step |
| `widgets/provider_profile_step.dart` | 6.8K | Provider profile step |
| `widgets/slot_duration_step.dart` | 4.1K | Slot duration step |
| `widgets/working_hours_step.dart` | 7.5K | Working hours step |

#### Feature: Paywall (lib/features/paywall/)
| Component | Size | Purpose |
|-----------|------|---------|
| `paywall_page.dart` | 18K | Subscription paywall |
| `paywall_trigger_resolver.dart` | 3.6K | Paywall trigger logic |
| `widgets/trial_badge.dart` | 1.1K | Trial status badge |

#### Feature: Revenue (lib/features/revenue/)
| Component | Size | Purpose |
|-----------|------|---------|
| `revenue_page.dart` | 18K | Revenue analytics page |

#### Feature: Schedule (lib/features/schedule/)
| Component | Size |
|-----------|------|
| `schedule_page.dart` | 14K |

#### Feature: Settings (lib/features/settings/)
**Settings and account management, 60K+ total**

| Component | Size | Purpose |
|-----------|------|---------|
| `settings_page.dart` | 24K | Main settings page |
| `cancel_intercept_page.dart` | 11K | Subscription cancellation flow |
| `exit_survey_sheet.dart` | 5.2K | Exit survey sheet |
| `notification_frequency_widget.dart` | 4.5K | Notification frequency settings |
| `widgets/booking_value_editor.dart` | 3.2K | Booking value editor |
| `widgets/calendar_connection_card.dart` | 3.3K | Calendar connection settings |
| `widgets/slot_duration_editor.dart` | 3.8K | Slot duration editor |
| `widgets/working_hours_editor.dart` | 4.5K | Working hours editor |

#### Feature: Share (lib/features/share/)
| Component | Size |
|-----------|------|
| `revenue_snapshot.dart` | 4.9K |

#### Feature: Shop (lib/features/shop/)
| Component | Size | Purpose |
|-----------|------|---------|
| `shop_page.dart` | 35K | Shop/marketplace page |

#### Feature: Studio (lib/features/studio/)
**Studio management interface, 56K+**

| Component | Size |
|-----------|------|
| `studio_page.dart` | 56K |

#### Feature: Support (lib/features/support/)
| Component | Size |
|-----------|------|
| `support_page.dart` | 9.2K |

#### Feature: Weekly Summary (lib/features/weekly_summary/)
| Component | Size |
|-----------|------|
| `weekly_summary_page.dart` | 11K |

#### Models (lib/models/)
**Data models and domain objects, 15K+ total**

| Model | Size | Purpose |
|-------|------|---------|
| `ai_suggestion.dart` | 1.6K | AI suggestion data |
| `daily_ritual.dart` | 1.9K | Daily ritual tracking |
| `gap_action.dart` | 885 B | Gap action model |
| `notification_state.dart` | 3.5K | Notification state |
| `paywall_trigger.dart` | 1.5K | Paywall trigger state |
| `revenue_summary.dart` | 1.6K | Revenue summary data |
| `streak.dart` | 8.9K | Streak tracking model |
| `subscription_state.dart` | 1.7K | Subscription state |
| `sync_models.dart` | 4.6K | Sync data models |
| `user_settings.dart` | 4.9K | User settings model |

#### Messaging Models (lib/models/messaging/)
| Model | Size |
|-------|------|
| `conversation.dart` | 3.6K |
| `message.dart` | 3.8K |

#### Shop Models (lib/models/shop/)
| Model | Size |
|-------|------|
| `product.dart` | 3.7K |
| `product_pricing.dart` | 2.2K |

#### Providers (lib/providers/)
**Riverpod state management, 25K+ total**

| Provider | Size | Purpose |
|----------|------|---------|
| `daily_ritual_provider.dart` | 1.6K | Daily ritual state |
| `google_connection_provider.dart` | 1.6K | Google calendar connection |
| `messaging_provider.dart` | 882 B | Messaging state |
| `navigation_provider.dart` | 122 B | Navigation state |
| `paywall_trigger_provider.dart` | 5.5K | Paywall trigger state |
| `revenue_providers.dart` | 3.6K | Revenue analytics state |
| `shop_provider.dart` | 803 B | Shop state |
| `streak_provider.dart` | 1.3K | Streak state |
| `subscription_provider.dart` | 2.2K | Subscription state |
| `sync_provider.dart` | 4.4K | Sync orchestration |
| `user_settings_provider.dart` | 1.8K | User settings state |

#### Repositories (lib/repositories/)
**Data access layers, 25K+ total**

##### Messaging Repository (lib/repositories/messaging/)
| Repository | Size | Purpose |
|-----------|------|---------|
| `conversation_repository.dart` | 1.3K | Conversation interface |
| `mock_conversation_repository.dart` | 9.4K | Mock implementation |
| `supabase_conversation_repository.dart` | 2.5K | Supabase implementation |

##### Shop Repository (lib/repositories/shop/)
| Repository | Size | Purpose |
|-----------|------|---------|
| `product_repository.dart` | 1.1K | Product interface |
| `mock_product_repository.dart` | 6.5K | Mock implementation |
| `supabase_product_repository.dart` | 2.2K | Supabase implementation |

#### Services (lib/services/)
**Business logic and integrations, 65K+ total**

| Service | Size | Purpose |
|---------|------|---------|
| `ai_provider.dart` | 5.9K | AI provider integration |
| `analytics_service.dart` | 8.4K | Analytics event tracking |
| `apple_calendar_service.dart` | 5.5K | Apple calendar integration |
| `google_oauth_service.dart` | 1.9K | Google OAuth integration |
| `identity_bridge.dart` | 2.7K | Identity bridging |
| `notification_service.dart` | 4.8K | Local notifications |
| `settings_storage.dart` | 9.4K | Local settings persistence |
| `slotforce_api.dart` | 3.4K | Slotforce API client |
| `socelle_api.dart` | 3.4K | Socelle API client |
| `supabase_client.dart` | 4.0K | Supabase initialization |
| `ab_test_service.dart` | 3.8K | A/B testing service |

#### Testing (lib/test/ & test/)
| Test | Size | Purpose |
|------|------|---------|
| `lib/test/setup.ts` | 818 B | Test setup |
| `test/widget_test.dart` | 387 B | Widget tests |

#### Web Configuration (web/)
| File | Size |
|------|------|
| `index.html` | 1.6K |
| `manifest.json` | 928 B |

#### iOS Native Configuration (ios/)
**Comprehensive iOS build configuration**

##### Project Configuration
| File | Size | Purpose |
|------|------|---------|
| `Podfile` | 1.4K | CocoaPods dependencies |
| `Podfile.lock` | 13K | CocoaPods lock file |
| `Runner.xcodeproj/project.pbxproj` | 32K | Xcode project configuration |

##### Flutter Configuration (ios/Flutter/)
| File | Size |
|------|------|
| `Debug.xcconfig` | 107 B |
| `Release.xcconfig` | 109 B |
| `Generated.xcconfig` | 944 B |
| `AppFrameworkInfo.plist` | 720 B |
| `Flutter.podspec` | 790 B |
| `flutter_export_environment.sh` | 983 B |

##### Runner App (ios/Runner/)
| Component | Size | Purpose |
|-----------|------|---------|
| `AppDelegate.swift` | 539 B | App delegate |
| `SceneDelegate.swift` | 76 B | Scene delegate |
| `Info.plist` | 2.9K | App configuration |
| `Runner.entitlements` | 301 B | App entitlements |
| `Runner-Bridging-Header.h` | 38 B | Bridging header |
| `GeneratedPluginRegistrant.h` | 378 B | Plugin registry header |
| `GeneratedPluginRegistrant.m` | 3.6K | Plugin registry implementation |
| `Base.lproj/Main.storyboard` | 1.6K | Main storyboard |
| `Base.lproj/LaunchScreen.storyboard` | 2.4K | Launch screen |

##### Workspace Configuration
| File | Size |
|------|------|
| `Runner.xcworkspace/contents.xcworkspacedata` | 224 B |
| `Runner.xcodeproj/project.xcworkspace/contents.xcworkspacedata` | 135 B |
| `Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme` | 3.8K |

##### Asset Configuration
| File | Size | Purpose |
|------|------|---------|
| `Assets.xcassets/AppIcon.appiconset/Contents.json` | 2.5K | App icon configuration |
| `Assets.xcassets/LaunchImage.imageset/Contents.json` | 391 B | Launch image |
| `Assets.xcassets/LaunchImage.imageset/README.md` | 336 B | Asset documentation |

#### Build Artifacts & Documentation
| File | Size | Purpose |
|------|------|---------|
| `BUILD_REPORT.md` | 9.5K | Build report |
| `ONBOARDING_IMPLEMENTATION.md` | 4.5K | Onboarding implementation |
| `WORKLOG.md` | 3.0K | Work log |
| `README.md` | 646 B | App README |

### Firebase Functions (packages/functions/)
**TypeScript cloud functions, 34,882 LOC**

#### Configuration
| File | Size |
|------|------|
| `package.json` | 589 B |
| `tsconfig.json` | 221 B |

#### Core Functions (packages/functions/src/)
**Main cloud function implementations, 30K+ LOC**

| Function | Size | Purpose |
|----------|------|---------|
| `index.ts` | 30K | Main cloud functions entrypoint |
| `events.ts` | 3.1K | Event definitions |
| `notificationEligibility.ts` | 12K | Notification eligibility logic |
| `cancelRouting.ts` | 4.2K | Subscription cancellation routing |
| `reengagementEmails.ts` | 8.8K | Re-engagement email campaign |
| `reengagementNotifications.ts` | 6.3K | Re-engagement notifications |
| `retentionMetrics.ts` | 11K | Retention metric calculations |
| `resurrectionEmails.ts` | 9.1K | User resurrection emails |
| `scheduledEmails.ts` | 8.7K | Scheduled email dispatch |
| `weeklyNotifications.ts` | 11K | Weekly notification logic |

#### Email Service (packages/functions/src/email/)
| Module | Size | Purpose |
|--------|------|---------|
| `email.ts` | 7.4K | Email orchestration |
| `sendgrid_client.ts` | 1.8K | SendGrid API client |
| `templates.ts` | 9.5K | Email templates |
| `intervention_router.ts` | 8.4K | Intervention email routing |

#### Notification Service (packages/functions/src/notifications/)
| Module | Size | Purpose |
|--------|------|---------|
| `decision_engine.ts` | 9.7K | Notification decision logic |
| `fcm_sender.ts` | 4.2K | Firebase Cloud Messaging sender |
| `framing.ts` | 6.4K | Notification framing strategy |
| `milestone_detector.ts` | 5.0K | Milestone detection |
| `scheduled_checker.ts` | 4.4K | Scheduled notification checker |
| `weekly_lifecycle.ts` | 9.8K | Weekly lifecycle notifications |

#### Sync Services (packages/functions/src/sync/)
| Module | Size | Purpose |
|--------|------|---------|
| `orchestrator.ts` | 2.6K | Sync orchestration |
| `persistence.ts` | 13K | Sync data persistence |
| `adapters.ts` | 2.4K | Third-party API adapters |

#### Google Integration (packages/functions/src/google/)
| Module | Size | Purpose |
|--------|------|---------|
| `googleApi.ts` | 4.5K | Google Calendar API |
| `tokenCrypto.ts` | 1.5K | Token encryption |
| `tokenStore.ts` | 2.0K | Token storage |

#### Reports (packages/functions/src/reports/)
| Module | Size |
|--------|------|
| `weekly_report_generator.ts` | 7.0K |

#### Utilities (packages/functions/src/lib/)
| Module | Size |
|--------|------|
| `firebase.ts` | 489 B |

#### Tests (packages/functions/src/__tests__/ & test/)
| Test | Size | Purpose |
|------|------|---------|
| `__tests__/emailClassification.test.ts` | 6.4K | Email classification tests |
| `__tests__/idempotency.test.ts` | 6.5K | Idempotency tests |
| `__tests__/notificationEligibility.test.ts` | 19K | Notification eligibility tests |
| `__tests__/retentionMetrics.test.ts` | 12K | Retention metrics tests |
| `__tests__/retention_sim.ts` | 15K | Retention simulation tests |
| `test/callableContracts.test.ts` | 12K | Callable function contracts |
| `test/firestoreRules.policy.test.ts` | 895 B | Firestore rules tests |
| `test/healthcheck.test.ts` | 158 B | Health check tests |
| `test/syncOrchestrator.test.ts` | 3.0K | Sync orchestrator tests |

### Shared Packages

#### Gap Engine (packages/gap_engine/)
**Gap analysis business logic, 9.8K LOC**

| File | Size | Purpose |
|------|------|---------|
| `package.json` | 282 B | Package configuration |
| `tsconfig.json` | 168 B | TypeScript config |
| `src/index.ts` | 9.8K | Gap engine implementation |
| `test/gapEngine.test.ts` | 7.3K | Gap engine tests |

#### Shared Package (packages/shared/)
**Shared types and utilities, 7.8K LOC**

| File | Size | Purpose |
|------|------|---------|
| `package.json` | 366 B | Package configuration |
| `tsconfig.json` | 168 B | TypeScript config |
| `src/index.ts` | 7.8K | Shared exports |
| `src/notification_schemas.ts` | 1.8K | Notification schemas |
| `test/schema.test.ts` | 4.2K | Schema validation tests |

### Monorepo Documentation
| Document | Size | Purpose |
|-----------|------|---------|
| `docs/USER_JOURNEY_MAP.md` | 37K | User journey documentation |
| `docs/master_prompt.md` | 18K | Master prompt documentation |
| `docs/build_tracker.md` | 13K | Build progress tracking |

#### Audit Documentation (docs/audit/)
| Document | Size | Purpose |
|-----------|------|---------|
| `FRONTEND_TECH_FINDINGS.md` | 20K | Frontend technology audit |
| `PERSONAS_AND_JTBD.md` | 12K | User personas & jobs-to-be-done |
| `SYSTEM_OVERVIEW.md` | 15K | System architecture overview |
| `UX_AUDIT_BY_ROLE.md` | 21K | UX audit by user role |

#### Slotforce Documentation (docs/slotforce/)
| Document | Size | Purpose |
|-----------|------|---------|
| `00_SYSTEM_OVERVIEW.md` | 14K | Slotforce system overview |
| `01_DESIGN_SYSTEM.md` | 12K | Design system documentation |
| `02_IA_AND_FLOWS.md` | 15K | IA and user flows |
| `03_BUGS_AND_LOGIC_FIXES.md` | 15K | Known bugs and fixes |
| `05_API_AND_DATA_CONTRACTS.md` | 18K | API contracts |
| `06_TESTING_AND_OBSERVABILITY.md` | 18K | Testing strategy |
| `07_PR_PLAN.md` | 9.2K | PR implementation plan |

### Other Root Files
| File | Size | Purpose |
|------|------|---------|
| `README.md` | 587 B | Monorepo README |

---

## Skipped Files & Exclusions

### Excluded File Patterns
The following file types and directories were excluded from this inventory:

**Directories:**
- `node_modules/` - Third-party npm dependencies
- `Pods/` - iOS CocoaPods dependencies
- `.dart_tool/` - Flutter build artifacts
- `.next/` - Next.js build output
- `build/` - Build directories
- `dist/` - Distribution/compiled output
- `.git/` - Git repository files
- `.artifacts/` - Build artifacts
- `.firebase/` - Firebase cache
- `.bolt/` - Bolt cache
- `.netlify/` - Netlify cache
- `playwright-report/` - Test reports
- `test-results/` - Test result artifacts

**File Types:**
- `*.png` - Image files
- `*.jpg`, `*.jpeg`, `*.gif` - Image files
- `*.ico` - Icon files
- `package-lock.json` - NPM lock file
- `.DS_Store` - macOS system files

### Binary/Large Files Not Listed in Detail
- `.dart_tool/flutter_build/**/*.dill` - Compiled Dart (30-60MB each)
- `.dart_tool/flutter_build/**/*.js` - Compiled JavaScript (4MB)
- `node_modules/` - 273 directories, hundreds of subdependencies

---

## Key Codebase Insights

### Web Codebase Architecture
- **Frontend Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Build Tool:** Vite
- **Testing:** Playwright (e2e), Vitest (unit)
- **State Management:** React Context + Custom Hooks
- **Backend:** Supabase (PostgreSQL)
- **Deployment:** Netlify

### Mobile Codebase Architecture
- **Mobile Framework:** Flutter with Dart
- **State Management:** Riverpod
- **Backend Services:** Firebase, Supabase
- **API Integration:** Custom HTTP clients
- **Cloud Functions:** Firebase Cloud Functions (TypeScript)
- **iOS Native:** Swift/Objective-C integration via Podfile
- **Shared Packages:** Monorepo with gap-engine and shared utilities

### Database Architecture
- **Primary DB:** Supabase (PostgreSQL)
- **Extensions:** pgvector for embeddings
- **Security:** Row-level security (RLS) policies
- **Multi-tenant:** Brand-scoped data isolation
- **Commerce:** Order, subscription, and product pricing tables
- **Analytics:** Advanced metrics and benchmarking tables

### Key Features Implemented
1. **Multi-tenant Platform** - Admin, Brand, Business, and Spa portals
2. **AI Concierge** - Intelligence engine with gap analysis
3. **Commerce System** - Products, orders, subscriptions, pricing
4. **Brand Portal CMS** - Dynamic brand page builder
5. **Analytics** - Revenue KPIs, gap metrics, performance tracking
6. **Mobile App** - Full-featured studio management (Dart/Flutter)
7. **Cloud Functions** - Email campaigns, notifications, sync orchestration
8. **Authentication** - Role-based access control with RLS

---

**Total Platform Files:** 725 source files (357 Web + 368 Mobile)
**Total Platform LOC:** ~110,000+ lines of code
**Documentation:** 100+ comprehensive guides and specifications

