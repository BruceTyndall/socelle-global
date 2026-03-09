# SOCELLE DESIGN UPGRADES — 2026-03-09

## Evidence Baseline
- Design token sources: `SOCELLE-WEB/src/index.css`, `SOCELLE-WEB/tailwind.config.js`.
- Flow/runtime evidence: `docs/qa/e2e-flow-audit_20260309_105413.json` + logs/screens.
- Shell/design state evidence: `SOCELLE-WEB/docs/qa/shell_detector_report.json`.
- Structural entropy evidence (counts from source scan):
  - table markups: `92` (`<table className` occurrences)
  - custom modal overlays: `38` (`fixed inset-0` occurrences)
  - mixed button usage (`btn-mineral-*` + ad-hoc button stacks): `40+` references

## A) System-Level Recommendations
| Priority | Where to Change | Exact Improvement | Why It Matters | Effort | Evidence |
|---:|---|---|---|---|---|
| 1 | `src/index.css` + `tailwind.config.js` | Collapse overlapping token layers (`:root` mineral + `.portal-context` cocoa) into a documented dual-theme map with explicit scope utility classes | Reduces visual drift and accidental cross-theme bleed | M | Two concurrent token systems visible in both files |
| 2 | `src/styles/socelle-cleanroom.css` and shared UI primitives | Define a canonical typography ramp for dashboard data views (kpi, table-header, helper, status) and enforce via component props | Makes data-heavy hubs feel premium and consistent | M | Current typography mixes utility classes per page |
| 3 | App-wide spacing scale in design tokens | Introduce fixed density presets (`comfortable`, `compact`) for data surfaces and apply per hub | Enables enterprise-grade information density without ad-hoc padding edits | M | 92 table implementations currently set spacing locally |
| 4 | Motion tokens in `index.css` and module components | Standardize reveal/hover timing by semantic motion roles (data-update, navigation, CTA) | Prevents uneven perceived performance across hubs | S | Multiple bespoke animations in `tailwind.config.js` and page-level classes |
| 5 | System status semantics | Add a shared state language (`loading`, `empty`, `error`, `partial`) with one visual contract | Cuts support tickets and improves learnability | M | `shell_detector_report.json` shows 152/156/47 state gaps |

## B) Component-Level Recommendations
| Priority | Component Family | Where to Change | Exact Improvement | Why It Matters | Effort | Evidence |
|---:|---|---|---|---|---|---|
| 1 | Tables | Create `DataTable` primitive in `src/components/ui/` and migrate high-traffic tables first (`marketing`, `admin/shop`, `crm`) | Unify sticky headers, sorting affordances, row density, loading/empty/error slots, export hooks | Raises perceived product quality immediately; lowers QA matrix | L | `92` table markups across pages/components |
| 2 | Modals | Replace bespoke overlays with shared `src/components/ui/Modal.tsx` API and variant sizes | Standardize focus trap, close behavior, backdrop, keyboard escape, footer actions | Accessibility + consistency + fewer regressions | M | `38` custom `fixed inset-0` implementations |
| 3 | Buttons/CTAs | Introduce one CTA contract (`primary`, `secondary`, `danger`, `ghost`) and convert mixed inline button classes | Clarifies hierarchy and next-step intent across flows | S | Mixed `btn-mineral-*` and ad-hoc class strings in pages |
| 4 | Empty/Error/Loading blocks | Build reusable `StatePanel` component with intent variants and optional CTA | Addresses shell feel and dead-end experiences quickly | S | `shell_detector_report.json` missing-state counts |
| 5 | Cards | Add `DataCard` + `MetricCard` variants with standard heading, sparkline, delta placement | Makes dashboards premium without redesigning page architecture | M | Intelligence/sales/admin cards currently vary by page |
| 6 | Inputs/Filters | Create filter bar primitive (search + facets + saved view) | Reduces repeated filter UX patterns in marketing, CRM, admin lists | M | Repeated custom filter implementations in `src/pages/marketing/*` |
| 7 | Evidence strips/timelines | Standardize timeline/evidence components for intelligence and CRM detail views | Improves narrative clarity and actionability | M | Existing evidence modules are fragmented across components |

## C) Page-Level Recommendations
| Page / Surface | Where to Change | Exact Improvement | Why It Matters | Effort | Evidence |
|---|---|---|---|---|---|
| Public `/intelligence` | `src/pages/public/Intelligence.tsx` + supporting intelligence components | Add “signal -> action” layout: trend stack, evidence strip, and fixed CTA rail to `/request-access` or module upgrade | Converts curiosity into action in first session | M | Runtime failures + route prominence in flow audit |
| Public `/brands` | `src/pages/public/Brands.tsx` | Add resilient fallback cards + partial-data state when feed errors occur | Prevents blank/fragile catalog impression | M | `public.log` repeated `brands` 400 errors |
| Public `/blog` + `/blog/:slug` | `src/pages/public/BlogListPage.tsx`, `BlogPostPage.tsx` | Add loading skeleton + “content unavailable” fallback + related links | Removes dead-end perception on editorial surfaces | S | Story endpoint 404 patterns + `BlogPostPage` shell classification |
| Commerce checkout path | `src/pages/public/Cart.tsx`, `Checkout.tsx`, `ShopCheckout.tsx` | Rework page hierarchy: summary rail, trust badges, explicit retry/payment failure states | Direct revenue impact and reduced abandonment | L | Dead-end detections + commerce shell files |
| Admin CMS hub | `src/pages/admin/cms/*` | Add dashboard information architecture: queue, draft health, publish errors, ownership | Turns shell admin pages into operational control center | M | CMS pages shell-classified |
| Authoring Studio | `src/pages/business/studio/*` | Move to split-pane editor with persistent outline, autosave state indicator, preview pane | Boosts creator confidence and completion rate | L | `StudioHome/StudioEditor/CourseBuilder` shell-classified |
| Pro Dashboard | `src/pages/business/Dashboard.tsx` | Add first-5-minute “setup rail” (connect data, run first insight, create first action) | Improves activation and retention | M | Professional journey blocked and flow continuity gaps |
| Admin platform ops | `src/pages/admin/AdminDashboard.tsx` | Replace generic blocks with incident-focused widgets (error spikes, edge status, feed lag, auth failures) | Faster reliability triage | M | 797 runtime errors in flow report |

## Design Debt Multipliers (Callouts)
| Multiplier | Current Symptom | Cost | Evidence |
|---|---|---|---|
| Duplicate table implementations | same data pattern rebuilt per page | high QA/regression cost | `92` table markups scan |
| Duplicate modal implementations | inconsistent close/focus states | accessibility and behavior drift | `38` custom overlays vs shared `Modal.tsx` |
| Token scope overlap | mineral + cocoa tokens both active with ad-hoc usage | visual inconsistency between hubs | `index.css` + `tailwind.config.js` |
| Mixed CTA language | different button styles for similar actions | weaker conversion clarity | mixed button class usage in page components |
| State handling fragmentation | uneven loading/empty/error UX | support burden + user confusion | shell detector missing-state metrics |

## Do First (High ROI)
1. Ship `StatePanel` and apply to `/intelligence`, `/brands`, `/blog`, `/checkout`, `/courses` (S).
2. Stabilize public data surfaces by pairing UI fallbacks with query-contract fixes (`brands/stories/data_feeds`) (M).
3. Standardize checkout/cart/order hierarchy and failure UX (M/L).
4. Migrate top 3 table-heavy hubs to a shared `DataTable` primitive (`marketing`, `admin/shop`, `crm`) (L).
5. Replace high-traffic custom modals with `ui/Modal` (`admin/shop`, `brand/products`, `brand/campaigns`) (M).
6. Add activation rail on Pro Dashboard and Brand Dashboard (M).
7. Complete CMS dashboard IA and publish flow scaffolding (M).
8. Complete Studio editor persistence + autosave indicator UI (M).
9. Introduce KPI and trend card presets for intelligence/sales/admin hubs (M).
10. Add admin reliability cockpit widgets for top failing endpoints (M).

## Avoid (Wastes Time Right Now)
1. Full visual redesign before fixing data and state reliability.
2. New animation-heavy hero work on public pages while core queries are failing.
3. Building more one-off tables/modals instead of consolidating primitives.
4. Expanding premium AI UI patterns before base CRUD/publish paths are complete.
5. Adding more token families before documenting and enforcing current token scopes.
