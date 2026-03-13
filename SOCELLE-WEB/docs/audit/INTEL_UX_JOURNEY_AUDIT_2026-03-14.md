# Intelligence UX & Journey Audit — 2026-03-14

## 1. Walkthrough Notes (Public → Portal → Detail → Take Action)

### 1.1 Public `/intelligence`

- **Entry state**
  - Hero and “Today’s snapshot” framing are visually strong and Pearl Mineral–compliant; vertical tabs (Cross-Market, Medspa, Salon, Brands) are clear.
  - Snapshot metrics (hero stats, KPI cards) pull from `useIntelligence` and `useDataFeedStats`, but the relationship between these numbers and the feed below is not explicitly narrated.
- **Filters and rails**
  - Filter affordances (pill filters, FEED_FILTERS, vertical tabs, channels rail) are present but cognitively heavy:
    - multiple layers (vertical tabs, channel rail, filter pills, segment rails) stack without a single canonical “mode” indicator.
    - no global “reset” or “For You vs All Signals” toggle; users must infer what combination they’re currently in.
- **Feed list**
  - Signal cards are information-rich: type/segment badges, impact badge, description, tags, provenance tier, confidence, freshness, and actions.
  - Scroll density is moderate; on desktop the card grid and editorial rail compete for attention, and provenance is sometimes visually subordinate to hero media and headline.
- **Live/demo labeling**
  - LIVE vs DEMO is clearly labeled in the hero context and on most intelligence-linked surfaces, but `/intelligence` itself relies on copy and layout more than an explicit pill at the top of the feed.

### 1.2 Portal `IntelligenceHub` (business)

- **Dashboard shell**
  - Tab bar (Overview/Trends/Categories/Competitive/Local/Provenance) is sticky and well behaved; header conveys DEMO state when `isLive=false`.
  - Overview tab brings together KPIs, tables, trend stacks, and AI toolbar, but there is no single “start here” action; the mental model is “dashboard with many modules” rather than a guided “Today” flow.
- **States**
  - Loading, error, and DEMO states are correctly handled via shared skeleton and error components.
  - `isLive` usage is consistent on the hub surface; no unlabeled mock data on portal Intelligence proper.
- **Navigation**
  - Path from portal dash/intelligence to signal details is split between in-panel `SignalDetailPanel` and public `/intelligence/signals/:id` detail page; there is no user-facing explanation of why some views open a side panel vs full page.

### 1.3 Signal Detail (`/intelligence/signals/:id` + `SignalDetailPanel`)

- **Hero and metadata**
  - Both the public detail page and the portal side panel show:
    - clear title, direction/magnitude, content segment, geography, author/date, reading time, confidence and provenance tiers.
  - Signal-level provenance (source name, source URL) is consistently present and linkified where URLs exist.
- **Body and engagement**
  - Full-article rendering uses `sanitizeArticleHtml` with fallbacks to `article_body` or excerpt; excerpt vs external-only states are labeled.
  - Engagement controls (like/save, comments, cross-hub actions) are available but visually dispersed between top and bottom of the layout.
- **Take Action**
  - CrossHubActionDispatcher is wired and reachable from both list cards and detail/side panel; action options (Create Deal, Add CRM Note, Create Campaign, etc.) use consistent labels.
  - Post-click journeys (OpportunityFinder, CrmDashboard, CampaignBuilder) preserve context via `fromSignal` state and `signal_id` query parameter.

### 1.4 Take Action Journeys (Sales/CRM/Marketing)

- **Sales: OpportunityFinder**
  - From-signal banner clearly acknowledges the origin (“You came from a signal… Find it below and click Create Deal”).
  - Filters (search, direction, category) and cards are dense but intelligible; DEMO badge is shown when signals are not live.
  - Create Deal path is live and non-shell: new deal row is created, user is routed to the pipeline/deal detail with context.
- **CRM: CrmDashboard tasks from signals**
  - When landing with `fromSignal` for CRM actions, a task is automatically inserted into `crm_tasks` and state is cleared after navigation replacement.
  - Resulting tasks include key signal fields (category, delta, confidence, source), but they do not yet reflect taxonomy tags or channel context.
- **Marketing: CampaignBuilder**
  - When launched with `signal_id` or `fromSignal`, campaign name and objective are prefilled using signal title/category.
  - Later steps (Audience, Content, Review) are structurally sound but not yet deeply “intelligence-first” (no live preview of which signals/segments the campaign is meant to ride).

## 2. Top 15 UX Failures (with Why)

1. **No canonical “mode” indicator on `/intelligence`.**
   - *Where*: Public Intelligence landing.
   - *Why it breaks value*: Users cannot easily tell if they are seeing cross-market, vertical-filtered, personalized, or channel-specific feed; this obscures “what this view represents.”

2. **Filter stack is multi-layered without a reset/summary affordance.**
   - *Where*: `/intelligence` filters, channel rail, and pills.
   - *Why*: Combined vertical + filter + channel + segment state can be hard to unwind; users risk getting “stuck” in a narrow slice without noticing.

3. **Inconsistent LIVE/DEMO labeling at the top of intelligence surfaces.**
   - *Where*: Public `/intelligence` (vs Home, IntelligenceHub, IntelligenceCommerce).
   - *Why*: Some intelligence-derived surfaces show an explicit DEMO/LIVE banner, others rely on subtle context; this weakens trust for first-time visitors.

4. **Split detail experiences (portal panel vs public page) with no explanation.**
   - *Where*: Portal IntelligenceHub vs `/intelligence/signals/:id`.
   - *Why*: Users may not realize they can pivot from a quick panel view to a deeper, shareable public detail; current behavior feels arbitrary.

5. **Action row is discoverable but not yet the primary path-to-value.**
   - *Where*: Signal cards and detail views.
   - *Why*: Core value is “see a signal → act in a hub”; actions share real estate with many secondary badges, so cognitive priority is lower than it should be.

6. **Channel rail lacks clear semantics for “For You” vs “All Signals”.**
   - *Where*: Channel rails on intelligence surfaces.
   - *Why*: Personalization is core to value; currently the user must infer whether they are seeing personalized channels vs generic rails.

7. **No “Dense Mode” or compact table alternative for heavy users.**
   - *Where*: Intelligence feeds, Today snapshot lists, OpportunityFinder.
   - *Why*: Power users scanning dozens of signals per session must scroll more than necessary; this can slow analysis.

8. **Keyboard-first flows are not foregrounded for intelligence tasks.**
   - *Where*: Intelligence list, OpportunityFinder, channel rails.
   - *Why*: Heavy users benefit from quick keyboard navigation (up/down, open detail, trigger action), but current surfaces are mouse-first.

9. **Provenance and confidence are visually correct but not narratively framed.**
   - *Where*: Signal cards and detail views.
   - *Why*: Users see badges and percentages but do not get a short, consistent line such as “Regulatory source, high confidence, updated X ago,” which would anchor trust.

10. **Today/Snapshot vs Feed vs Detail hierarchy is implicit, not explicit.**
    - *Where*: `/intelligence` layout.
    - *Why*: The hierarchy exists in layout but is not named; users may treat the feed as a simple news list instead of a curated “Today” lens atop a deeper corpus.

11. **No explicit “channel rail → detail” explanatory copy.**
    - *Where*: IntelligenceChannelRail sections.
    - *Why*: Channels are powerful product objects; without copy that explains “This rail is tuned to X, driven by tags Y/Z,” the UX feels like another card carousel.

12. **Signal → CRM task hides the intelligence context after creation.**
    - *Where*: CrmDashboard tasks auto-created from signals.
    - *Why*: Tasks embed some context in the description, but there is no quick-return link to the originating signal; this introduces a mild dead end.

13. **Signal → Campaign path does not surface expected impact or sample content.**
    - *Where*: CampaignBuilder prefilled from signals.
    - *Why*: Users see a prefilled name/objective but not “why this signal matters” in the later steps; this risks the journey feeling thin relative to the intelligence source.

14. **Secondary intelligence surfaces (e.g., product-matched signal strip) downplay provenance.**
    - *Where*: IntelligenceCommerce, small strips on Home.
    - *Why*: Users see signal titles and trend badges without matching provenance labels; the intelligence feels more like generic marketing copy there.

15. **No single “End of path” summary tying actions back to the originating signal.**
    - *Where*: Deal detail, CRM task view, campaign detail.
    - *Why*: After acting, users lose the thread “this came from signal X”; this weakens the mental model of Intelligence as the root of cross-hub work.

## 3. Proposed Fixes (Tight, Minimal, Pearl-Mineral-Compliant)

1. **Add a compact “View mode” indicator + reset control on `/intelligence`.**
   - Implement a small pill in the header that reads `View: Cross-Market · All Signals` (or `View: Medspa · For You · Channels`), with a `Reset` button that clears filters and channels.

2. **Introduce a “Dense Mode” toggle for signal feeds.**
   - Add a per-surface toggle that reduces padding, hides hero imagery in list view, and collapses secondary badges into a single compact provenance row.

3. **Standardize a LIVE/DEMO banner component for all Intelligence surfaces.**
   - Reuse the pattern from IntelligenceHub/IntelligenceCommerce and mount it consistently on `/intelligence`, `/intelligence/signals/:id`, and key portal views.

4. **Add a “Panel vs Full Page” affordance to signal detail.**
   - Provide a simple “Open full page” link in `SignalDetailPanel` and a “Back to panel” affordance on the public detail when navigated from portal.

5. **Promote the Take Action row visually.**
   - In both list cards and detail, cluster the action button(s) into a single, slightly elevated region with clearer copy (e.g., “Move this into Sales / CRM / Marketing”).

6. **Label personalized channels explicitly.**
   - Add a small caption above IntelligenceChannelRail such as “Channels tuned to your activity” when user/tag preferences are present, falling back to “Recommended channels for this vertical” otherwise.

7. **Add minimal keyboard navigation for feeds.**
   - Support up/down to move between signals and `Enter` to open detail or panel; add ARIA roles and focus management so this works with screen readers.

8. **Introduce a compact provenance summary line on every card.**
   - Add a dedicated line such as “Regulatory · High confidence · Updated 2d ago” under each signal title, using existing `provenance_tier`, `confidence_score`, and `updated_at`.

9. **Clarify Today/Snapshot hierarchy with headings and microcopy.**
   - Label the snapshot block “Today’s Briefing” and the feed “Live Signal Feed,” with one-line descriptors explaining their roles.

10. **Augment channel rail descriptions with tag-based hints.**
   - For each channel, add a short note like “Driven by medspa body device and claim_regulation tags” using the top 2–3 `channel.top_tags`.

11. **Attach “View signal” links to CRM tasks created from signals.**
   - Include the originating `signal_id` on tasks and render a small link or button that routes back to `/intelligence/signals/:id`.

12. **Surface expected impact inside CampaignBuilder when launched from a signal.**
   - Show a small intelligence summary card in step 0 or review step, including magnitude, vertical, and 2–3 key tags, so the campaign remains anchored to the triggering signal.

13. **Ensure secondary intelligence strips include provenance badges.**
   - Extend compact signal representations (Home, IntelligenceCommerce cards) to include at least a short source label and/or provenance pill.

14. **Add a “From Intelligence” banner on destination hubs when arriving from signals.**
   - For OpportunityFinder, CRM, and Marketing routes, show a non-intrusive banner that confirms “You’re acting on signal X (category, magnitude, confidence).”

15. **Document the full cross-hub journey in a short in-app explainer.**
   - Add a small “How Intelligence connects your hubs” explainer accessible from `/intelligence` and portal IntelligenceHub describing the spot → understand → act ladder.

