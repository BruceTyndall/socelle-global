# SOCELLE App Feature + Functionality Guide

This guide explains what each app does, who it serves, and how it connects to the platform operating model.

| App | Build Phase | Audience | Core Functionality | Cross-hub Workflow |
|---|---|---|---|---|
| Intelligence | Build 1 | Business, Brand, Admin | Signal analysis, trend stacks, opportunity engine, AI tools, export | Signal -> CRM/Sales/Marketing actions via dispatcher |
| CRM | Build 2 | Operators, sales teams | Contacts/companies CRUD, tasks, lifecycle tracking, activity timeline | Booking + Commerce events enrich contact timeline |
| Education | Build 2 | Trainers, teams | Course library, quizzes, certificates, training analytics | Signals recommend training; certifications feed profile quality |
| Commerce | Build 2 | Buyers, brand ops | Catalog, inventory, orders, pricing, affiliate-compliant links | Order outcomes feed CRM and marketing optimization |
| Sales | Build 2 | Sales reps, account teams | Pipeline, deals, proposals, revenue analytics | Intelligence signals create deals and qualification actions |
| Marketing | Build 3 | Marketing teams | Campaigns, segments, templates, calendar, performance metrics | CRM segments activate campaigns and suppressions |
| Booking | Build 3 | Front desk, providers | Services/staff setup, calendar, appointment detail, status workflows | Appointments create/update CRM records and follow-ups |
| Brands | Build 3 | Brand teams | Brand profile, portfolio views, channel performance | Market signals + commerce velocity drive brand decisions |
| Professionals | Build 3 | Pro users, operators | Professional profiles, credentials, discovery surfaces | Education completions enrich discoverability and staffing |
| Notifications | Build 3 | All users | Transactional templates, user preferences, channel controls | Alerts from intelligence/booking/payments routed by preference |
| Ingredients | Build 4 | Education, compliance | Ingredient data, interaction context, collection tooling | Sensitivity constraints shape CRM and recommendation safety |
| Jobs | Build 4 | Employers, candidates | Job posting, listing, applications, hiring pipeline | Professional and education data improve candidate matching |
| Events | Build 4 | Operators, brands, educators | Event pages, registration, scheduling, attendance metrics | CRM contacts -> invites; post-event follow-up automation |
| Reseller | Build 4 | Brand/reseller operators | Reseller performance, client/revenue views, white-label settings | Sales + commerce outcomes drive territory actions |
| Authoring Core | Build 2 | Platform capability | Block schema, versioning, publish states, export primitives | Shared document layer used by education/marketing/sales/cms |
| Authoring Studio UI | Build 4 | Creators | Visual canvas editor, templates, brand kit, exports | Uses Authoring Core + live intelligence bindings |
| Admin Hub | Build 2 | Admin operators | Health dashboard, feature flags, audit log, shell/inventory monitors | Governs rollout and observability across all hubs |
| Search Engine | Build 4 | All users | Unified search across hubs, filtered discovery | Trigger workflows directly from search results |
| Feed Pipeline | Build 1 | Intelligence ops | Scheduled ingest, deduplication, retry, DLQ, feed health | Ingested data powers market signals for downstream hubs |
| Payments + Credits | Build 1 | Finance + users | Credit ledger, server-side enforcement, tier sync, overage handling | AI usage -> credit deduction -> entitlement controls |
| Public Site | Build 1 | Prospects + partners | Conversion pages, narratives, onboarding entry paths, SEO | Routes users into app-specific journeys and plans |

## Governance notes

- Intelligence is tier-limited (signal volume), not module-gated.
- Cross-hub actions must use `CrossHubActionDispatcher`.
- Credits and rate limits are enforced server-side in edge functions.
- No shell surfaces: loading, empty, error, and real logic are required for production pages.
