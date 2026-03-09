## A) Must-have capabilities (ranked P0/P1/P2)

| Priority | Capability | User type | Job-to-be-done | Growth driver | Dependency | Risks | Testable acceptance |
|---|---|---|---|---|---|---|---|
| P0 | 3-panel studio workspace (picker/canvas/properties) | Pro / Brand / Educator | Build publish-ready assets quickly without tool switching | Activation | Authoring Core, CMS | UX complexity, mobile overflow | 95% of tested users can create + save a doc in <= 3 minutes on first session |
| P0 | Structured canvas model (no opaque blobs) | Pro / Brand / Educator / Admin | Persist and reopen exact layout state for reuse/versioning | Retention | Authoring Core, CMS | Data drift, migration complexity | Canvas JSON validates against schema; open-save-open retains position/size/z-index for 100% of objects |
| P0 | Template library (50+ by category) | Pro / Brand / Educator | Start from proven layouts instead of blank canvas | Activation, Revenue | CMS, Media | Quality variance, stale templates | >= 50 templates available; each template can be instantiated and saved without schema errors |
| P0 | Template variable system + Smart Fill | Pro / Brand | Auto-populate localized offers and brand-safe content | Revenue, Retention | Authoring Core, CMS, Intelligence | Incorrect substitutions, stale profile data | Variables resolve from profile/signal context; unresolved vars listed in Fix panel with clickable field targets |
| P0 | Channel output presets (IG/Story/Reel/TikTok/Email/Flyer/SOP/Slide) | Pro / Brand | Produce channel-specific assets without manual resizing | Activation, Retention | CMS, Media | Layout clipping, ratio mismatch | Preset switch applies dimensions + safe margins; exported output matches preset spec |
| P0 | Export engine (PNG/JPG/PDF/PPTX/SCORM/SVG/GIF) | Pro / Brand / Educator | Deliver outputs for marketing, sales, training, and ops | Revenue | Authoring Core, Education, Media | Font/embed failures, queue failures | Export job status tracked; all 7 formats complete for baseline templates with checksum + metadata record |
| P0 | Export fidelity harness (golden diff) | Admin | Prevent regressions in pixel/layout/font fidelity | Retention | CMS, Media | False positives, CI runtime | CI golden suite runs on 5 templates; diff thresholds enforce pass/fail with artifact images |
| P0 | Version history + branching UI | Pro / Brand / Educator | Iterate safely and recover prior variants | Retention | Authoring Core, CMS | Storage growth, branch confusion | Create 3 versions, restore v1, verify text + canvas object graph hash matches v1 snapshot |
| P0 | Review/approval workflow (author/reviewer/publisher) | Brand / Educator / Admin | Route assets through governance before publishing | Revenue, Retention | Authoring Core, Notifications, CMS | Role abuse, bottlenecks | Non-publisher blocked from publish; reviewer comments required for reject; publish writes audit event |
| P0 | Embed Intelligence widgets (KPI/sparkline/signal/citation/timeline) | Pro / Brand | Turn market signals into ready-to-share visual content | Acquisition, Revenue | Intelligence, Authoring Core, CMS | Misleading data, stale cache | Widget bound to `signal_id` renders current value + provenance; fallback cache shown when live fetch fails |
| P0 | Asset governance + licensing rules | Brand / Admin | Ensure only licensed and approved assets are publishable | Revenue, Risk control | Media, CMS | IP infringement, takedown risk | Banned/unlicensed asset blocked with remediation action and audit row |
| P0 | Compliance guardrails + required disclaimer blocks | Educator / Brand / Admin | Prevent unsafe or non-compliant medical/efficacy claims | Risk control, Retention | Authoring Core, CMS, Notifications | Regulatory exposure | Restricted template cannot publish until disclaimer block exists and passes policy check |
| P0 | Audit logging on create/edit/approve/publish/export | Admin | Reconstruct who changed what and why | Retention, Risk control | CMS, Notifications | Missing coverage, noisy logs | 100% of protected actions create audit rows with actor, action, target, before/after ids |
| P1 | Share-pack generator (assets + captions + UTM + QR + manifest) | Pro / Brand | Publish multichannel kits faster from one source | Revenue | CMS, Media, Search | Broken links, invalid UTM | Generated ZIP contains required files + `manifest.json` + valid signed URLs |
| P1 | Team presence + threaded comments | Brand / Educator | Coordinate edits/review without external chat | Retention | Notifications, CMS | Concurrency conflicts | Comment threads persist per object id; mention triggers in-app notification |
| P1 | Brand kit inheritance (org -> location override) | Brand / Admin | Keep every output on-brand across teams/locations | Retention, Revenue | CMS, Media | Inconsistent fallback | Applying org kit recolors/retypes all mapped tokens; location override wins when set |
| P1 | Searchable template intelligence (by vertical/goal/signal) | Pro / Brand | Find best template for objective quickly | Activation | Search, Intelligence | Poor ranking relevance | Search query returns ranked templates with >= 1 matching signal/use-case facet |
| P1 | Mobile quick authoring flow (template -> fill -> export -> share <=30s) | Pro | Create short-form assets from phone between appointments | Activation, Retention | CMS, Media | Tap density, upload latency | On mobile viewport, user completes quick flow in <= 30 seconds median test run |
| P2 | Cross-hub handoff actions (Studio -> Marketing/Sales/CRM/Education) | Pro / Brand | Push approved assets into downstream workflows | Revenue | Notifications, Search, Intelligence | Workflow fragmentation | One-click dispatch creates linked records in target hub with traceable origin id |
| P2 | Template performance analytics (adoption/export/publish success) | Admin | Prioritize templates that convert and retire underperformers | Revenue | Search, Notifications | Misattribution | Dashboard shows per-template usage, publish rate, export failures, and 30-day trend |

## B) Competitive parity matrix (Canva vs SOCELLE Studio vs minimum viable)

| Capability area | Canva | SOCELLE Studio target | Build 4 minimum viable |
|---|---|---|---|
| Canvas editing | Mature freeform editor with layers | Structured canvas + block-aware editor tied to Authoring Core | Drag/resize/rotate/z-index for text/image/shape/widget objects |
| Template ecosystem | Large marketplace + quick start templates | 50+ verticalized beauty/pro/education templates | 50 curated internal templates with categories + search |
| Brand control | Brand Kit, shared styles | Org/location brand kits + policy-locked tokens | Brand kit apply + override + publish validation |
| Collaboration | Comments, team permissions, approvals | Role-based review pipeline with audit trail | Author/reviewer/publisher flow + threaded comments |
| Variables/data merge | Limited data merge by plan | Smart Fill with profile + signal + brand values | Required variable set + unresolved variable fix panel |
| Export formats | PNG/JPG/PDF/MP4/GIF, etc. | PNG/JPG/PDF/PPTX/SCORM/SVG/GIF with reliability harness | All listed formats available via tracked export jobs |
| Content distribution | Social scheduler/integrations | Share-pack generator for compliant outbound packaging | ZIP with captions, UTM links, QR, manifest |
| Compliance/governance | Basic team controls | Claims guardrails + required disclaimers + asset licensing checks | Publish blocked on missing disclaimer/licensing |
| Insight integration | Limited business intelligence embedding | Native Intelligence widgets with provenance and fallback | KPI/sparkline/citation widgets bound to `signal_id` |
| Vertical specialization | General-purpose design | Beauty/professional workflow-first output kits | Presets for SOP, menu insert, treatment promo, education deck |

## C) Non-negotiables for launch quality

| Category | Non-negotiable | Launch threshold | Verification |
|---|---|---|---|
| Performance | Editor responsiveness under realistic payload | p95 interaction latency < 120ms with 100 canvas objects | Playwright performance trace + custom timing marks |
| Performance | Time to first usable editor | TTI <= 2.5s on broadband desktop, <= 4.0s on mobile | Lighthouse + RUM metric capture |
| Reliability | Save/publish durability | 0 data loss on refresh; autosave checkpoints every <= 15s | Integration test: forced reload recovery |
| Reliability | Export success | >= 99% successful export completion for supported formats | Export job telemetry + CI export suite |
| Fidelity | Layout consistency across formats | Golden diff pass on 5 templates and 7 formats | `export-fidelity-validator` CI artifacts |
| Fidelity | Font consistency | 0 missing-font fallback in golden outputs | Font manifest + rendered text diff checks |
| Security/Governance | Role enforcement | Non-publisher cannot publish; reviewer cannot alter final publish state | Permission E2E tests |
| Security/Governance | Audit completeness | 100% publish/approve/export events logged with actor + target ids | Audit log query assertions |
| Compliance | Claims safety | Restricted templates blocked without disclaimer block | Publish policy tests |
| Compliance | Asset licensing | Unlicensed assets blocked before publish/export | Asset policy test matrix |
| Operations | Error observability | Export/publish failures visible in Admin health within <= 60s | Admin dashboard synthetic failure test |
| Operations | Recovery path | Retry/requeue available for failed exports | Export queue E2E retry test |

## D) Cut list (what NOT to build in Build 4)

| Cut item | Why cut now | Revisit trigger |
|---|---|---|
| Open community template marketplace | High moderation/IP/legal overhead; slows core quality | After governance + abuse tooling stable for 60 days |
| Real-time multiplayer cursor editing | High concurrency complexity; not required for initial team workflow | After comment/approval flow reaches adoption target |
| AI-generated image/video model hosting | Expensive inference + rights complexity | After external provider/legal policy finalized |
| Fully custom animation timeline editor | Large scope not required for SOP/brief/slide use-cases | After baseline export/fidelity passes 99% SLA |
| Native social posting/scheduling inside Studio | Violates current acquisition boundary if expanded to outreach workflows | Revisit with explicit outbound governance WO |
| Plugin marketplace/third-party app SDK | Security and support surface too large pre-launch | After platform API governance and tenant isolation hardening |
| Advanced vector path editor parity with Illustrator/Figma | Not needed for target jobs-to-be-done in Build 4 | Reassess with enterprise design-team demand |
| Multi-region distributed rendering farm | Premature infrastructure complexity | Trigger on sustained export queue saturation |
