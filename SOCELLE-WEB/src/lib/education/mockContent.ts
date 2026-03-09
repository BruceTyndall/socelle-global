import type { EducationContent, EducationProgress } from './types';

// ── Mock education content — 22 items across all categories ────────

export const mockEducationContent: EducationContent[] = [
  // ── Treatment Protocols ────────────────────────────────────────────
  {
    id: 'edu-tp-001',
    title: 'Advanced Chemical Peel Protocol: Lactic + TCA Combination',
    content_type: 'protocol',
    category: 'treatment_protocols',
    tags: ['chemical peels', 'TCA', 'lactic acid', 'exfoliation', 'advanced treatments'],
    summary:
      'Step-by-step protocol for combining lactic acid prep with TCA application for controlled medium-depth peels. Includes contraindications, skin typing criteria, and post-treatment recovery timelines.',
    duration_minutes: 45,
    ce_eligible: true,
    ce_credits: 2,
    difficulty: 'advanced',
    published_at: '2025-11-15',
  },
  {
    id: 'edu-tp-002',
    title: 'LED Light Therapy: Integration into Facial Protocols',
    content_type: 'protocol',
    category: 'treatment_protocols',
    tags: ['LED therapy', 'red light', 'blue light', 'anti-aging', 'acne'],
    summary:
      'How to integrate LED light therapy into existing facial protocols for enhanced outcomes. Covers wavelength selection, treatment timing, and combination strategies with serums and masks.',
    duration_minutes: 30,
    ce_eligible: true,
    ce_credits: 1.5,
    difficulty: 'intermediate',
    published_at: '2025-12-01',
  },
  {
    id: 'edu-tp-003',
    title: 'Microneedling Aftercare Protocol',
    content_type: 'protocol',
    category: 'treatment_protocols',
    tags: ['microneedling', 'aftercare', 'wound healing', 'collagen induction'],
    summary:
      'Comprehensive aftercare protocol for microneedling treatments. Includes 72-hour post-treatment care, product recommendations, and managing client expectations for recovery timelines.',
    duration_minutes: 20,
    ce_eligible: false,
    difficulty: 'intermediate',
    published_at: '2025-10-20',
  },
  {
    id: 'edu-tp-004',
    title: 'Corrective Facial: Hyperpigmentation Treatment Plan',
    content_type: 'ce_course',
    category: 'treatment_protocols',
    tags: ['hyperpigmentation', 'corrective', 'melanin', 'Fitzpatrick', 'brightening'],
    summary:
      'Multi-session treatment plan for addressing hyperpigmentation across Fitzpatrick skin types III-VI. Covers ingredient layering, treatment cadence, and realistic outcome timelines for clients.',
    duration_minutes: 60,
    ce_eligible: true,
    ce_credits: 3,
    difficulty: 'advanced',
    published_at: '2026-01-10',
  },
  {
    id: 'edu-tp-005',
    title: 'Express Facial Protocol for High-Volume Treatment Rooms',
    content_type: 'protocol',
    category: 'treatment_protocols',
    tags: ['express facial', 'efficiency', 'high volume', 'time management'],
    summary:
      'Efficient 30-minute facial protocol designed for high-volume practices. Maximizes results while maintaining treatment room throughput and client satisfaction.',
    duration_minutes: 15,
    ce_eligible: false,
    difficulty: 'beginner',
    published_at: '2025-09-05',
  },

  // ── Ingredient Science ────────────────────────────────────────────
  {
    id: 'edu-is-001',
    title: 'Peptide Complexes: Mechanisms of Action in Professional Formulations',
    content_type: 'ce_course',
    category: 'ingredient_science',
    tags: ['peptides', 'anti-aging', 'collagen synthesis', 'signaling peptides'],
    summary:
      'Deep dive into peptide biochemistry for estheticians. Covers signaling peptides, carrier peptides, and neurotransmitter-inhibiting peptides with clinical evidence for professional-grade formulations.',
    duration_minutes: 40,
    ce_eligible: true,
    ce_credits: 2,
    difficulty: 'advanced',
    published_at: '2025-11-28',
  },
  {
    id: 'edu-is-002',
    title: 'Understanding Retinoid Delivery Systems',
    content_type: 'article',
    category: 'ingredient_science',
    tags: ['retinoids', 'retinol', 'encapsulation', 'delivery systems', 'vitamin A'],
    summary:
      'How modern delivery systems affect retinoid efficacy and tolerability. Compare liposomal, encapsulated, and time-release retinoid technologies used in professional skincare lines.',
    duration_minutes: 25,
    ce_eligible: false,
    difficulty: 'intermediate',
    published_at: '2025-10-14',
  },
  {
    id: 'edu-is-003',
    title: 'Tranexamic Acid: Clinical Applications for Hyperpigmentation',
    content_type: 'ce_course',
    category: 'ingredient_science',
    tags: ['tranexamic acid', 'hyperpigmentation', 'melasma', 'brightening'],
    summary:
      'Evidence-based review of tranexamic acid in topical and professional formulations. Covers mechanism of action, optimal concentrations, and combination strategies with other brightening agents.',
    duration_minutes: 35,
    ce_eligible: true,
    ce_credits: 1.5,
    difficulty: 'advanced',
    published_at: '2026-01-22',
  },
  {
    id: 'edu-is-004',
    title: 'Niacinamide at Professional Concentrations',
    content_type: 'article',
    category: 'ingredient_science',
    tags: ['niacinamide', 'vitamin B3', 'barrier repair', 'sebum regulation'],
    summary:
      'What happens when you move beyond consumer-grade niacinamide concentrations. Professional dosing, combination compatibility, and treatment-room applications for barrier repair and oil control.',
    duration_minutes: 20,
    ce_eligible: false,
    difficulty: 'beginner',
    published_at: '2025-08-30',
  },

  // ── Business Operations ───────────────────────────────────────────
  {
    id: 'edu-bo-001',
    title: 'Optimizing Back Bar Costs Without Compromising Outcomes',
    content_type: 'article',
    category: 'business_operations',
    tags: ['back bar', 'cost optimization', 'margins', 'product selection'],
    summary:
      'Strategic approach to managing back bar inventory and costs. Learn how top-performing spas reduce per-treatment product costs by 15-25% while maintaining or improving clinical outcomes.',
    duration_minutes: 30,
    ce_eligible: false,
    difficulty: 'intermediate',
    published_at: '2025-11-05',
  },
  {
    id: 'edu-bo-002',
    title: 'Treatment Room Layout for Maximum Revenue',
    content_type: 'video',
    category: 'business_operations',
    tags: ['treatment room', 'layout', 'workflow', 'revenue optimization'],
    summary:
      'How physical treatment room layout impacts throughput, upsell opportunities, and client experience. Practical layout templates for single-room and multi-room operations.',
    duration_minutes: 25,
    ce_eligible: false,
    difficulty: 'beginner',
    published_at: '2025-09-18',
  },
  {
    id: 'edu-bo-003',
    title: 'Building a Retail Strategy That Converts',
    content_type: 'webinar',
    category: 'business_operations',
    tags: ['retail', 'sales strategy', 'product recommendations', 'conversion'],
    summary:
      'Turn your treatment room into a retail engine. Data-driven strategies for product recommendations, display optimization, and staff training that increase retail attachment rates.',
    duration_minutes: 35,
    ce_eligible: false,
    difficulty: 'intermediate',
    published_at: '2025-12-10',
  },
  {
    id: 'edu-bo-004',
    title: 'Service Menu Pricing: Data-Driven Approach',
    content_type: 'ce_course',
    category: 'business_operations',
    tags: ['pricing', 'service menu', 'profitability', 'market analysis'],
    summary:
      'Use market data and cost analysis to price your service menu competitively and profitably. Includes benchmarking data from 500+ professional accounts and margin calculators.',
    duration_minutes: 45,
    ce_eligible: true,
    ce_credits: 2,
    difficulty: 'intermediate',
    published_at: '2026-02-01',
  },

  // ── Compliance & Regulatory ───────────────────────────────────────
  {
    id: 'edu-cr-001',
    title: 'MoCRA Compliance: What Estheticians Need to Know',
    content_type: 'ce_course',
    category: 'compliance_regulatory',
    tags: ['MoCRA', 'FDA', 'compliance', 'cosmetic regulation', 'labeling'],
    summary:
      'The Modernization of Cosmetics Regulation Act changes how professional products are manufactured, labeled, and reported. Understand your obligations as a licensed professional and business operator.',
    duration_minutes: 40,
    ce_eligible: true,
    ce_credits: 2,
    difficulty: 'intermediate',
    published_at: '2025-10-28',
  },
  {
    id: 'edu-cr-002',
    title: 'Scope of Practice: State-by-State Guide for Estheticians',
    content_type: 'ce_course',
    category: 'compliance_regulatory',
    tags: ['scope of practice', 'licensing', 'state regulations', 'esthetician'],
    summary:
      'Comprehensive overview of esthetician scope of practice across all 50 states. Covers permitted treatments, device usage, and the evolving regulatory landscape for advanced esthetic procedures.',
    duration_minutes: 60,
    ce_eligible: true,
    ce_credits: 3,
    difficulty: 'beginner',
    published_at: '2025-11-20',
  },
  {
    id: 'edu-cr-003',
    title: 'FDA Device Classification for Medspa Operators',
    content_type: 'ce_course',
    category: 'compliance_regulatory',
    tags: ['FDA', 'device classification', 'medspa', 'Class II devices', 'clearance'],
    summary:
      'Navigate FDA device classifications relevant to medspa operations. Understand 510(k) clearances, off-label use policies, and compliance requirements for Class II aesthetic devices.',
    duration_minutes: 30,
    ce_eligible: true,
    ce_credits: 1.5,
    difficulty: 'advanced',
    published_at: '2026-01-05',
  },

  // ── Device Training ───────────────────────────────────────────────
  {
    id: 'edu-dt-001',
    title: 'IPL/BBL: Treatment Parameters and Skin Type Protocols',
    content_type: 'ce_course',
    category: 'device_training',
    tags: ['IPL', 'BBL', 'phototherapy', 'skin typing', 'treatment parameters'],
    summary:
      'Master IPL/BBL treatment parameters across Fitzpatrick skin types. Covers wavelength selection, fluence settings, pulse duration optimization, and managing adverse event risks.',
    duration_minutes: 50,
    ce_eligible: true,
    ce_credits: 2.5,
    difficulty: 'advanced',
    published_at: '2025-12-15',
  },
  {
    id: 'edu-dt-002',
    title: 'Hydrafacial: Advanced Customization Techniques',
    content_type: 'video',
    category: 'device_training',
    tags: ['Hydrafacial', 'customization', 'boosters', 'treatment protocols'],
    summary:
      'Go beyond standard Hydrafacial protocols with advanced customization. Learn booster selection strategies, multi-pass techniques, and combination treatments that elevate outcomes and ticket values.',
    duration_minutes: 35,
    ce_eligible: false,
    difficulty: 'intermediate',
    published_at: '2025-10-02',
  },

  // ── Retail Strategy ───────────────────────────────────────────────
  {
    id: 'edu-rs-001',
    title: 'Home Care Regimen Design: From Treatment Room to Vanity',
    content_type: 'article',
    category: 'retail_strategy',
    tags: ['home care', 'regimen', 'retail', 'client compliance', 'recommendations'],
    summary:
      'Design effective home care regimens that extend treatment room results. Covers product sequencing, client education techniques, and follow-up strategies that drive compliance and reorders.',
    duration_minutes: 25,
    ce_eligible: false,
    difficulty: 'intermediate',
    published_at: '2025-11-12',
  },
  {
    id: 'edu-rs-002',
    title: 'Seasonal Product Rotation: Maximizing Retail Revenue Year-Round',
    content_type: 'webinar',
    category: 'retail_strategy',
    tags: ['seasonal', 'product rotation', 'retail revenue', 'merchandising'],
    summary:
      'How to rotate retail displays and product recommendations with seasonal skin needs. Includes merchandising templates and seasonal marketing calendar aligned to professional beauty purchasing cycles.',
    duration_minutes: 30,
    ce_eligible: false,
    difficulty: 'beginner',
    published_at: '2025-09-25',
  },
  {
    id: 'edu-rs-003',
    title: 'Professional Recommendation Cards: Converting Consultations to Sales',
    content_type: 'article',
    category: 'retail_strategy',
    tags: ['recommendation cards', 'consultation', 'sales conversion', 'client retention'],
    summary:
      'Create branded recommendation cards that turn every consultation into a retail opportunity. Templates, scripts, and follow-up workflows that increase retail attachment by 40%+.',
    duration_minutes: 20,
    ce_eligible: false,
    difficulty: 'beginner',
    published_at: '2026-02-10',
  },
];

// ── Mock progress — simulates a user 8/24 CE credits in ─────────

export const mockEducationProgress: EducationProgress[] = [
  { content_id: 'edu-tp-001', status: 'completed', progress_pct: 100, completed_at: '2026-01-20', ce_credits_earned: 2 },
  { content_id: 'edu-tp-002', status: 'completed', progress_pct: 100, completed_at: '2026-02-05', ce_credits_earned: 1.5 },
  { content_id: 'edu-is-001', status: 'in_progress', progress_pct: 60, ce_credits_earned: 0 },
  { content_id: 'edu-cr-002', status: 'completed', progress_pct: 100, completed_at: '2026-01-30', ce_credits_earned: 3 },
  { content_id: 'edu-bo-004', status: 'in_progress', progress_pct: 35, ce_credits_earned: 0 },
  { content_id: 'edu-cr-001', status: 'completed', progress_pct: 100, completed_at: '2026-02-12', ce_credits_earned: 1.5 },
];
