# Intelligence Design & Template Audit — 2026-03-14

## 1. Constraints Observed (What Templates Enforce Today)

### 1.1 Layout & Components Used on Intelligence Surfaces

- **Public `/intelligence`**
  - Uses a hero section + Today Snapshot + vertical tabs + rail + card grid pattern.
  - Cards are Pearl Mineral V2–compliant, with substantial padding, hero image slots, and multi-row metadata (type label, segment badge, impact badge, tags, provenance, confidence, freshness, actions).
  - The layout assumes full-width feed on desktop, with editorial and channel rails sharing lateral space rather than a strict master-detail split.

- **Portal `IntelligenceHub`**
  - Uses a single-column dashboard with sticky tab bar (`Overview`, `Trends`, `Categories`, `Competitive`, `Local`, `Provenance`).
  - Each tab hosts large, glassy cards and modules (KPI strips, tables, charts) with generous spacing and visual hierarchy.
  - Side-panel detail (`SignalDetailPanel`) assumes a fixed-width right drawer over the main grid, not a columnar master-detail layout.

- **Signal Cards & Detail**
  - `SignalCard` and `SignalDetailPanel` are designed to be visually rich, with explicit Pearl Mineral glass/soft-card styles, stacked badges, and multi-line copy.
  - Both components treat provenance and confidence as badges within a larger visual composition, not as the primary line of text under the title.

- **Channel Rails & Secondary Strips**
  - `IntelligenceChannelRail` uses a two-column pattern: channel selector cards on the left, a featured channel pane on the right.
  - Secondary intelligence strips (Home preview, IntelligenceCommerce signal strip) reuse card-like modules with comfortable spacing, even where a thin list would suffice.

### 1.2 Pearl Mineral V2 Design Locks in Practice

- **Spacing & Density**
  - Global tokens and typical Tailwind stacks default to generous padding (`p-5`, `p-6`, `rounded-2xl`, section paddings of 80–120px).
  - Typography scale is tuned for readability at marketing scale (hero/section/body tokens) rather than dense data tables; list-style surfaces borrow these tokens.

- **Glass & Surfaces**
  - Intelligence modules heavily use glass/soft cards: `bg-white/70`, `backdrop-blur`, `border-graphite/10`, soft shadows.
  - This is consistent with Pearl Mineral doctrine but pushes designers toward card-first compositions vs. tight tables.

- **Typography & Color**
  - Sans and mono styles are correctly scoped; serif is banned on public pages.
  - Color doctrine is respected (graphite, background, accent, signal-up/down/warn), but data signaling (impact/sentiment/confidence) is constrained to a small set of brand-safe colors.

### 1.3 Template Assumptions That Influence UX

- Primary “content units” are **cards and rails**, not **rows and panes**.
- Intelligence UI favors **single-column scroll** plus occasional right-side panel; there is no standard template for persistent master-detail or split layouts.
- Navigation is primarily mouse/point-and-click; there are no template-level expectations for keyboard-first interaction or quick actions.

## 2. UX Harm Analysis (What Gets Worse Because of These Constraints)

1. **Scan efficiency for heavy users is lower than it could be.**
   - Card-first layouts with large paddings and hero imagery slow down scanning when a user needs to triage dozens of signals.

2. **Provenance and confidence are visually correct but not structurally primary.**
   - Template emphasis is on hero image + headline + trend; provenance is treated as a supporting badge instead of the main “trust” line.

3. **Card-only feed layouts make master-detail reading patterns harder to express.**
   - Without a canonical split-pane template, implementing “select on left, read on right” flows requires one-off layout work, which discourages their use.

4. **Filter and channel rails compete with the main feed instead of framing it.**
   - Because the baseline templates co-locate rails and feeds, it’s easy to end up with several competing panels instead of a crisp hierarchy.

5. **Keyboard-first workflows have no obvious home in the template system.**
   - There is no canonical “table + keyboard focus + quick actions” template; developers default to clickable cards and dropdowns.

6. **Strict color doctrine narrows perceived affordances for data signaling.**
   - Although signal-up/down/warn colors exist, most module layouts use accent + graphite, which can blur the visual distinction between neutral content and high-signal events.

7. **Layouts optimize for first-impression aesthetics over sustained daily use.**
   - High production value and generous whitespace support demos and sales screenshots but can feel slow and indirect for repeat operator workflows.

## 3. Recommended Template Changes (Minimal Diffs, Component-Level)

1. **Introduce a reusable “IntelligenceTable” / dense list template.**
   - A dedicated component that renders rows with: title, vertical, topic tags, provenance summary, impact, and quick actions, in a compact and keyboard-friendly grid.

2. **Add a “MasterDetailShell” layout template.**
   - A responsive shell with a left column for list/filter and a right pane for detail; used for signals, channels, and saved signal libraries.

3. **Create a standard “ProvenanceRow” subcomponent.**
   - A small, reusable row that consistently renders `source_name`, `provenance_tier`, `confidence_score`, and `updated_at` in one line, used by cards, lists, and detail views.

4. **Add a template-level “FilterRail” pattern.**
   - A layout for persistent vertical filter rails that ensures filters do not visually fight the main content; includes a compact summary of active filters and a reset control.

5. **Standardize a “StickyActionsBar” for detail views.**
   - A horizontal bar pinned to the bottom or side of a detail view containing the primary cross-hub actions and any safety gating; ensures “Act” is always visible.

6. **Define a “SignalsSummaryStrip” molecule.**
   - A compact strip used in Home, Commerce, and other hubs that always includes a mini provenance summary rather than a purely marketing-style blurb.

## 4. Safe Pearl Mineral Deviations (Explicitly Allowed)

1. **Dense Mode for Intelligence Lists (desktop-only toggle).**
   - Reduce vertical padding, hide hero imagery by default, and compress tag rows into a single provenance line while staying within Pearl Mineral color and typography tokens.

2. **Master-Detail Split for Signals.**
   - On large screens, allow a two-column layout with a scrollable list on the left and a reading pane on the right; on mobile, fallback to stacked views.

3. **Compact Provenance Row Placement.**
   - Allow placing a mono-style provenance line directly under the title, even when it bumps other decorative elements (segment badges, secondary tags) lower.

4. **Persistent Filter Rail on Desktop.**
   - Permit a vertical, always-visible filter rail on `/intelligence` and portal Intelligence, provided it uses Pearl Mineral spacing and color tokens and does not introduce new color primitives.

5. **Sticky “Take Action” Bar on Detail Views.**
   - A subtle, glassy bar that anchors actions at the bottom of a detail view, using existing accent/signal tokens; this is a structural deviation rather than a color deviation.

6. **Keyboard Navigation affordances.**
   - Allow focus outlines, hover/focus background changes, and key-command hints that slightly compress whitespace around interactive elements where needed for clarity.

## 5. Before/After UX Spec Notes (How the Experience Changes)

- **Before**
  - Intelligence is positioned as a high-polish, card-based surface with strong visuals and clear but distributed provenance.
  - Power users must scroll and click repeatedly to move from one signal to the next and to convert intelligence into deals, tasks, and campaigns.
  - Channels and filters are powerful but feel like peers to the feed rather than scaffolding around it.

- **After**
  - Intelligence gains a “work mode” that emphasizes scan speed and trust: dense tables, clear master-detail flows, structured provenance rows, and persistent action bars.
  - Operators can move quickly from Today view to a focused list, into detail, and then into Sales/CRM/Marketing without losing context.
  - Rails and filters frame the experience with clearer semantics (“For You”, “Channel X”, “Vertical Y”) instead of competing for attention.

## 6. Risks & Validation Plan

### 6.1 Risks

1. **Visual drift from Pearl Mineral aesthetic if dense mode is over-extended.**
   - Risk that teams generalize dense tables to marketing or onboarding surfaces where the doctrine expects generous spacing.

2. **Component sprawl if new templates are not adopted consistently.**
   - If teams continue building ad-hoc tables and layouts instead of using the new shells, UX fragmentation will increase.

3. **Keyboard and dense-mode paths could regress accessibility if not tested.**
   - Tighter layouts and focus states need WCAG-grade keyboard navigation and contrast checks.

4. **Action bars might be overused beyond Intelligence.**
   - Without guidance, sticky action bars could leak into flows where they distract from reading rather than support it.

### 6.2 Validation Plan

- **Design-lock-enforcer + token-drift-scanner**
  - Run on any dense-mode or master-detail implementation to ensure all colors, fonts, and glass/spacing tokens remain within Pearl Mineral V2.

- **hub-shell-detector + live-demo-detector**
  - Confirm that new layouts do not re-introduce shell-like surfaces or mock data without DEMO labels.

- **cta-validator**
  - Ensure new “Take Action” bars respect intelligence-first hierarchy and do not elevate commerce on intelligence surfaces.

- **accessibility-checker**
  - Run over new tables, master-detail layouts, and keyboard affordances to verify focus management, ARIA roles, and color contrast.

- **Route-mapper + flow re-crawl**
  - After implementation, re-run flow audits (Playwright/e2e) to confirm:
    - no dead ends were introduced;
    - keyboard and dense-mode paths behave as intended;
    - actions from Intelligence to Sales/CRM/Marketing remain live and well-routed.

