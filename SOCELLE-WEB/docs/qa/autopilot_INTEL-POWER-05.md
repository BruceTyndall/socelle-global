1. Planner Agent

- Next WO: INTEL-POWER-05 (Sentiment aggregate banner + More filters)
- Dependencies satisfied: P0 GATE, PREVIOUS WOs (`CMS-WO-07..12`, `INTEL-POWER-01..04`) ALL COMPLETE.
- Acceptance criteria (from build_tracker): Banner above feed; 'More filters' panel (date, impact, source)
- Plan:
  1. Add date, impact, and source filters to `useIntelligence.ts`.
  2. Map these filters into a 'More Filters' UI panel within `IntelligenceFeedSection.tsx`.
  3. Aggregate sentiment ('up', 'down', 'stable') over the active filtered signals.
  4. Render an aggregate "Sentiment Banner" component displaying the mood of the feed.
- Expected files touched: `useIntelligence.ts`, `types.ts`, `IntelligenceFeedSection.tsx`, `SignalFilter.tsx`
