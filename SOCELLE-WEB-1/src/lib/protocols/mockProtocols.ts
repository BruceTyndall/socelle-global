import type { TreatmentProtocol, CEProgress } from './types';

// ── Mock Treatment Protocols ────────────────────────────────────────

export const MOCK_PROTOCOLS: TreatmentProtocol[] = [
  {
    id: 'proto-001',
    title: 'Signature Brightening Facial',
    slug: 'signature-brightening-facial',
    category: 'facial',
    subcategory: 'corrective',
    description:
      'A comprehensive brightening protocol combining enzymatic exfoliation, targeted serums, and LED light therapy to address hyperpigmentation, uneven tone, and post-inflammatory discoloration. Designed for Fitzpatrick I–IV skin types with customizable intensity.',
    durationMinutes: 60,
    skillLevel: 'intermediate',
    skinConcerns: ['hyperpigmentation', 'uneven tone', 'dullness', 'sun damage'],
    contraindications: ['active retinoid use within 72 hours', 'open wounds', 'active herpes simplex'],
    ceEligible: true,
    ceCredits: 2.0,
    brandName: 'SkinCeuticals',
    published: true,
    adoptionCount: 1247,
    steps: [
      {
        stepNumber: 1,
        title: 'Double Cleanse & Skin Analysis',
        description:
          'Remove makeup and SPF with oil-based cleanser, follow with gel cleanser. Perform thorough skin analysis under magnification lamp noting areas of hyperpigmentation, texture, and sensitivity.',
        durationMinutes: 10,
        products: [
          { name: 'Soothing Cleanser', brand: 'SkinCeuticals', usage: 'First cleanse, 2 pumps emulsified with warm water' },
          { name: 'Simply Clean Gel', brand: 'SkinCeuticals', usage: 'Second cleanse, gentle circular motions for 60 seconds' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Enzymatic Exfoliation',
        description:
          'Apply papain-based enzyme mask to damp skin avoiding the eye area. Process for 8–10 minutes under warm steam. This dissolves dead cell buildup without mechanical trauma, preparing skin for serum penetration.',
        durationMinutes: 12,
        products: [
          { name: 'Micropeel Plus 20 Enzyme', brand: 'SkinCeuticals', usage: 'Even layer across face and décolleté, avoid periorbital area' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Brightening Serum Application',
        description:
          'Apply vitamin C serum using press-and-hold technique to maximize absorption. Follow with targeted spot treatment on areas of concentrated hyperpigmentation.',
        durationMinutes: 8,
        products: [
          { name: 'C E Ferulic', brand: 'SkinCeuticals', usage: '6–8 drops applied with fingertips using press-and-hold method' },
          { name: 'Discoloration Defense', brand: 'SkinCeuticals', usage: 'Targeted application to pigmented areas' },
        ],
      },
      {
        stepNumber: 4,
        title: 'LED Light Therapy',
        description:
          'Position LED panel 2 inches from skin surface. Use red (633nm) for 10 minutes to stimulate cellular renewal and reduce post-inflammatory erythema. Switch to amber (590nm) for 5 minutes to target melanocyte regulation.',
        durationMinutes: 15,
        products: [
          { name: 'Celluma PRO LED Panel', brand: 'Celluma', usage: 'Red mode 633nm for 10 min, amber 590nm for 5 min' },
        ],
      },
      {
        stepNumber: 5,
        title: 'Hydration & Barrier Repair',
        description:
          'Apply hyaluronic acid booster to damp skin followed by ceramide-rich moisturizer to lock in hydration and support barrier function post-treatment.',
        durationMinutes: 8,
        products: [
          { name: 'Hydrating B5 Gel', brand: 'SkinCeuticals', usage: '4–5 drops applied to damp skin' },
          { name: 'Triple Lipid Restore 2:4:2', brand: 'SkinCeuticals', usage: 'Full face and neck application' },
        ],
      },
      {
        stepNumber: 6,
        title: 'SPF & Aftercare',
        description:
          'Apply broad-spectrum SPF 50 and provide aftercare instructions. Advise client to avoid direct sun exposure for 48 hours and continue daily SPF use. Schedule follow-up in 2 weeks.',
        durationMinutes: 7,
        products: [
          { name: 'Physical Fusion UV Defense SPF 50', brand: 'SkinCeuticals', usage: 'Generous application to face and exposed areas' },
        ],
      },
    ],
  },
  {
    id: 'proto-002',
    title: 'Advanced Chemical Peel Protocol',
    slug: 'advanced-chemical-peel-protocol',
    category: 'clinical',
    subcategory: 'resurfacing',
    description:
      'A medium-depth chemical peel using glycolic and salicylic acid combination for treatment of acne scarring, fine lines, and photodamage. Requires client consent form and patch test 48 hours prior. Fitzpatrick I–III only.',
    durationMinutes: 45,
    skillLevel: 'advanced',
    skinConcerns: ['acne scarring', 'fine lines', 'photodamage', 'texture irregularities'],
    contraindications: ['Fitzpatrick IV–VI', 'pregnancy', 'isotretinoin use within 6 months', 'eczema or psoriasis in treatment area'],
    ceEligible: true,
    ceCredits: 3.0,
    published: true,
    adoptionCount: 892,
    steps: [
      {
        stepNumber: 1,
        title: 'Pre-Peel Preparation',
        description:
          'Cleanse thoroughly and degrease skin with acetone prep pad. Review client consent form and confirm patch test results from 48 hours prior. Document pre-treatment photos.',
        durationMinutes: 8,
        products: [
          { name: 'Pre-Peel Cleanser', brand: 'PCA Skin', usage: 'Double cleanse to remove all residue' },
          { name: 'Acetone Prep Pads', brand: 'PCA Skin', usage: 'Degrease entire treatment area' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Acid Application — Layer 1',
        description:
          'Apply glycolic acid 30% solution evenly using fan brush. Start at forehead, move to cheeks, chin, then nose. Monitor for frosting and erythema. Time 3 minutes.',
        durationMinutes: 5,
        products: [
          { name: 'Ultra Peel I', brand: 'PCA Skin', usage: 'Single even layer with fan brush, timed application' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Acid Application — Layer 2',
        description:
          'Assess skin response. If tolerated, apply second pass focusing on areas of greatest concern. Watch for uniform frosting. Total acid contact time not to exceed 7 minutes.',
        durationMinutes: 7,
        products: [
          { name: 'Ultra Peel I', brand: 'PCA Skin', usage: 'Second pass on targeted areas only' },
        ],
      },
      {
        stepNumber: 4,
        title: 'Neutralization',
        description:
          'Neutralize with sodium bicarbonate solution using saturated gauze. Apply in same order as acid. Confirm complete neutralization with pH indicator strip. Client may feel stinging during neutralization.',
        durationMinutes: 10,
        products: [
          { name: 'Neutralizer Solution', brand: 'PCA Skin', usage: 'Saturated 4x4 gauze, press and hold technique' },
        ],
      },
      {
        stepNumber: 5,
        title: 'Post-Peel Recovery & Protection',
        description:
          'Apply calming serum and recovery balm. Apply physical SPF. Provide written aftercare instructions including 7-day recovery protocol. Schedule 48-hour check-in call.',
        durationMinutes: 15,
        products: [
          { name: 'Calming Balm', brand: 'PCA Skin', usage: 'Generous application to entire treated area' },
          { name: 'Weightless Protection SPF 45', brand: 'PCA Skin', usage: 'Physical SPF layer for immediate sun protection' },
        ],
      },
    ],
  },
  {
    id: 'proto-003',
    title: 'Hydrating Body Wrap',
    slug: 'hydrating-body-wrap',
    category: 'body',
    subcategory: 'hydration',
    description:
      'A full-body hydration treatment combining dry brushing, algae-based wrap, and warm stone massage to restore moisture, improve circulation, and promote lymphatic drainage. Ideal for dehydrated skin or post-travel recovery.',
    durationMinutes: 90,
    skillLevel: 'beginner',
    skinConcerns: ['dehydration', 'dullness', 'poor circulation', 'rough texture'],
    contraindications: ['shellfish allergy', 'open wounds', 'sunburn'],
    ceEligible: true,
    ceCredits: 1.5,
    brandName: 'Eminence Organic',
    published: true,
    adoptionCount: 634,
    steps: [
      {
        stepNumber: 1,
        title: 'Dry Brushing & Exfoliation',
        description:
          'Begin with full-body dry brushing using upward strokes toward the heart. This stimulates lymphatic drainage and removes dead skin cells for better product absorption.',
        durationMinutes: 15,
        products: [
          { name: 'Professional Body Brush Set', brand: 'Eminence Organic', usage: 'Long upward strokes, starting at ankles moving to torso' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Algae Wrap Application',
        description:
          'Apply warmed algae body mask in even strokes across full body. Wrap client in thermal blanket and allow mask to process for 25 minutes while performing scalp massage.',
        durationMinutes: 35,
        products: [
          { name: 'Seaweed Body Wrap Mask', brand: 'Eminence Organic', usage: 'Warm to 100°F, apply in long even strokes with body brush' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Warm Rinse & Stone Massage',
        description:
          'Remove wrap with warm towels. Apply body oil and perform warm stone massage focusing on shoulders, lower back, and legs for deep relaxation and product absorption.',
        durationMinutes: 25,
        products: [
          { name: 'Stone Crop Body Oil', brand: 'Eminence Organic', usage: 'Warm between palms, apply with effleurage strokes' },
          { name: 'Basalt Hot Stones Set', brand: 'Eminence Organic', usage: 'Heated to 130°F, gliding and placement technique' },
        ],
      },
      {
        stepNumber: 4,
        title: 'Finishing Hydration',
        description:
          'Complete with full-body application of shea butter body lotion. Offer water and aftercare guidance including hydration recommendations for 48 hours post-treatment.',
        durationMinutes: 15,
        products: [
          { name: 'Stone Crop Body Lotion', brand: 'Eminence Organic', usage: 'Full body application with gentle massage technique' },
        ],
      },
    ],
  },
  {
    id: 'proto-004',
    title: 'LED Light Therapy Add-On',
    slug: 'led-light-therapy-add-on',
    category: 'facial',
    subcategory: 'device',
    description:
      'A versatile LED add-on service that can complement any facial treatment. Uses multi-wavelength LED panels to target acne, inflammation, collagen synthesis, or hyperpigmentation depending on wavelength selection.',
    durationMinutes: 15,
    skillLevel: 'beginner',
    skinConcerns: ['acne', 'inflammation', 'aging', 'redness'],
    contraindications: ['photosensitizing medications', 'epilepsy', 'active cancer treatment'],
    ceEligible: true,
    ceCredits: 1.0,
    published: true,
    adoptionCount: 2103,
    steps: [
      {
        stepNumber: 1,
        title: 'Wavelength Selection',
        description:
          'Based on client skin analysis and treatment goals, select appropriate LED wavelength. Blue (415nm) for acne, Red (633nm) for anti-aging, Near-infrared (830nm) for deep tissue, Amber (590nm) for pigmentation.',
        durationMinutes: 2,
        products: [
          { name: 'Celluma PRO LED Panel', brand: 'Celluma', usage: 'Select wavelength mode based on treatment goal' },
        ],
      },
      {
        stepNumber: 2,
        title: 'LED Treatment Session',
        description:
          'Position panel 1–3 inches from skin surface. Provide eye protection. Run selected program for full cycle. Client should feel gentle warmth but no discomfort.',
        durationMinutes: 10,
        products: [
          { name: 'Celluma PRO LED Panel', brand: 'Celluma', usage: 'Position at optimal distance, run full program cycle' },
          { name: 'LED Safety Goggles', brand: 'Celluma', usage: 'Required for both client and operator' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Post-LED Serum & Protection',
        description:
          'Apply appropriate finishing serum based on treatment goal. LED enhances product absorption, so this step maximizes the synergistic effect of light therapy and active ingredients.',
        durationMinutes: 3,
        products: [
          { name: 'Phloretin CF Serum', brand: 'SkinCeuticals', usage: '4–5 drops, press into skin while still warm from LED' },
        ],
      },
    ],
  },
  {
    id: 'proto-005',
    title: 'Microneedling Corrective Treatment',
    slug: 'microneedling-corrective-treatment',
    category: 'clinical',
    subcategory: 'resurfacing',
    description:
      'An advanced collagen induction therapy using professional-grade microneedling device at controlled depths (0.5–2.0mm) for treatment of acne scarring, fine lines, enlarged pores, and stretch marks. Requires topical anesthetic and sterile technique.',
    durationMinutes: 75,
    skillLevel: 'advanced',
    skinConcerns: ['acne scarring', 'fine lines', 'enlarged pores', 'stretch marks', 'uneven texture'],
    contraindications: ['active acne', 'blood thinners', 'keloid history', 'pregnancy', 'active infection'],
    ceEligible: true,
    ceCredits: 3.5,
    published: true,
    adoptionCount: 1567,
    steps: [
      {
        stepNumber: 1,
        title: 'Numbing & Preparation',
        description:
          'Apply topical anesthetic (BLT compound) to treatment area 30 minutes prior. Cleanse and degrease skin. Set up sterile field with single-use cartridge and confirm device calibration.',
        durationMinutes: 10,
        products: [
          { name: 'Professional Numbing Cream', brand: 'SkinPen', usage: 'Apply 30 min prior, cover with occlusive film' },
          { name: 'Pre-Treatment Cleanser', brand: 'SkinPen', usage: 'Chlorhexidine-free antimicrobial cleanse' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Depth Mapping',
        description:
          'Map treatment zones by depth. Forehead: 0.5mm, cheeks: 1.0–1.5mm, acne scars: 1.5–2.0mm, periorbital: 0.25mm. Document depth map in client chart. Apply hyaluronic acid glide medium.',
        durationMinutes: 5,
        products: [
          { name: 'HA Glide Solution', brand: 'SkinPen', usage: 'Apply liberally to maintain smooth device glide' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Microneedling — Zone 1 (Forehead & Temples)',
        description:
          'Begin with forehead at 0.5mm depth, 3 passes in perpendicular directions. Maintain consistent speed and pressure. Reapply glide medium as needed. Watch for uniform pinpoint bleeding.',
        durationMinutes: 10,
        products: [
          { name: 'SkinPen Precision Device', brand: 'SkinPen', usage: '0.5mm depth, speed setting 2, 3 perpendicular passes' },
        ],
      },
      {
        stepNumber: 4,
        title: 'Microneedling — Zone 2 (Cheeks & Chin)',
        description:
          'Increase depth to 1.0–1.5mm for cheeks. Focus additional passes on areas of scarring. Chin at 1.0mm. Maintain sterile technique throughout. Monitor for excessive bleeding.',
        durationMinutes: 15,
        products: [
          { name: 'SkinPen Precision Device', brand: 'SkinPen', usage: '1.0–1.5mm depth, speed setting 2–3, targeted scar passes' },
        ],
      },
      {
        stepNumber: 5,
        title: 'Microneedling — Zone 3 (Nose & Periorbital)',
        description:
          'Reduce depth to 0.25–0.5mm for delicate periorbital area. Nose at 0.5mm with careful attention to contours. Gentle, controlled passes only.',
        durationMinutes: 10,
        products: [
          { name: 'SkinPen Precision Device', brand: 'SkinPen', usage: '0.25–0.5mm depth, speed setting 1, 2 gentle passes' },
        ],
      },
      {
        stepNumber: 6,
        title: 'Growth Factor Application',
        description:
          'Immediately post-needling, apply growth factor serum to take advantage of the micro-channels created. The channels close within 10–15 minutes, so timing is critical for maximum absorption.',
        durationMinutes: 10,
        products: [
          { name: 'AnteAGE MD Serum', brand: 'AnteAGE', usage: 'Apply within 5 minutes of needling, press into skin' },
          { name: 'AnteAGE MD Solution', brand: 'AnteAGE', usage: 'Follow serum with solution for enhanced growth factor delivery' },
        ],
      },
      {
        stepNumber: 7,
        title: 'Post-Treatment Recovery',
        description:
          'Apply calming, occlusive recovery balm. Provide written aftercare: no makeup for 24 hours, no actives for 72 hours, SPF mandatory. Schedule 48-hour and 7-day follow-ups.',
        durationMinutes: 15,
        products: [
          { name: 'Calecim Professional Serum', brand: 'Calecim', usage: 'Hydrating recovery layer, generous application' },
          { name: 'Physical UV Defense SPF 50', brand: 'SkinCeuticals', usage: 'Physical-only SPF for post-procedure protection' },
        ],
      },
    ],
  },
  {
    id: 'proto-006',
    title: 'Express Enzyme Renewal',
    slug: 'express-enzyme-renewal',
    category: 'facial',
    subcategory: 'express',
    description:
      'A 30-minute express facial designed for high-volume treatment rooms. Uses fruit enzyme exfoliation for gentle resurfacing followed by targeted hydration. Perfect as a lunchtime treatment or pre-event refresh.',
    durationMinutes: 30,
    skillLevel: 'beginner',
    skinConcerns: ['dullness', 'rough texture', 'dehydration', 'congestion'],
    contraindications: ['active retinoid use within 48 hours', 'sunburn'],
    ceEligible: true,
    ceCredits: 1.0,
    brandName: 'iS Clinical',
    published: true,
    adoptionCount: 1890,
    steps: [
      {
        stepNumber: 1,
        title: 'Quick Cleanse',
        description:
          'Single-pass cleanse with gentle foaming cleanser. Focus on T-zone and areas of congestion. Pat dry.',
        durationMinutes: 5,
        products: [
          { name: 'Cleansing Complex', brand: 'iS Clinical', usage: 'Single-pass cleanse, 1 pump, 45-second massage' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Enzyme Mask Application',
        description:
          'Apply fruit enzyme mask in thin, even layer. Process for 10 minutes with warm steam. The pumpkin and papaya enzymes dissolve dead cells without irritation.',
        durationMinutes: 12,
        products: [
          { name: 'Warming Honey Cleanser', brand: 'iS Clinical', usage: 'Thin layer as enzyme mask, self-heating formula activates on contact' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Hydrating Serum Infusion',
        description:
          'Remove enzyme mask with warm towels. While skin is still damp, apply hyaluronic acid serum using press technique for maximum absorption.',
        durationMinutes: 8,
        products: [
          { name: 'Hydra-Cool Serum', brand: 'iS Clinical', usage: '3–4 drops, press-and-hold technique on damp skin' },
          { name: 'Pro-Heal Serum Advance+', brand: 'iS Clinical', usage: '2–3 drops layered over hyaluronic serum' },
        ],
      },
      {
        stepNumber: 4,
        title: 'Moisturize & Protect',
        description:
          'Apply lightweight moisturizer with SPF. Client is immediately makeup-ready. Recommend rebooking in 2–4 weeks for cumulative results.',
        durationMinutes: 5,
        products: [
          { name: 'Reparative Moisture Emulsion', brand: 'iS Clinical', usage: 'Full face application, gentle upward strokes' },
          { name: 'Eclipse SPF 50+', brand: 'iS Clinical', usage: 'Even application, sets matte for immediate makeup application' },
        ],
      },
    ],
  },
  {
    id: 'proto-007',
    title: 'Back Treatment Protocol',
    slug: 'back-treatment-protocol',
    category: 'body',
    subcategory: 'corrective',
    description:
      'A targeted back treatment addressing acne, congestion, and rough texture. Combines deep cleansing, manual extractions, chemical exfoliation, and high-frequency for antibacterial action. Popular add-on for bridal and event prep.',
    durationMinutes: 60,
    skillLevel: 'intermediate',
    skinConcerns: ['back acne', 'congestion', 'rough texture', 'hyperpigmentation'],
    contraindications: ['pacemaker (high-frequency)', 'pregnancy (chemical peel)', 'open wounds'],
    ceEligible: true,
    ceCredits: 2.0,
    published: true,
    adoptionCount: 723,
    steps: [
      {
        stepNumber: 1,
        title: 'Deep Cleanse & Steam',
        description:
          'Cleanse entire back with salicylic acid cleanser using warm towels. Apply steam for 5 minutes to soften comedones and prepare for extraction.',
        durationMinutes: 10,
        products: [
          { name: 'BHA Cleanser', brand: 'PCA Skin', usage: 'Applied with warm towels in circular motions' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Manual Extractions',
        description:
          'Using comedone extractor and gloved fingers, perform extractions on congested areas. Focus on shoulders, upper back, and along spine where sebaceous activity is highest.',
        durationMinutes: 15,
        products: [
          { name: 'Extraction Tools (sterile)', brand: 'PCA Skin', usage: 'Sanitized stainless steel comedone extractors' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Chemical Exfoliation',
        description:
          'Apply modified Jessner peel solution to back. Process for 3–5 minutes monitoring for frosting. Neutralize with cool water compresses.',
        durationMinutes: 12,
        products: [
          { name: 'Smoothing Body Peel', brand: 'PCA Skin', usage: 'Even application with gauze pad, timed 3–5 minutes' },
        ],
      },
      {
        stepNumber: 4,
        title: 'High-Frequency Treatment',
        description:
          'Apply high-frequency (argon/violet) to treated areas for antibacterial action and inflammation reduction. Glide over gauze for indirect method.',
        durationMinutes: 10,
        products: [
          { name: 'High-Frequency Device', brand: 'Zemits', usage: 'Violet electrode, indirect method over gauze, 3–5 min per zone' },
        ],
      },
      {
        stepNumber: 5,
        title: 'Soothing Mask & SPF',
        description:
          'Apply calming sulfur-based mask for 10 minutes. Remove with cool towels. Apply oil-free SPF and provide aftercare instructions.',
        durationMinutes: 13,
        products: [
          { name: 'Clarifying Mask', brand: 'PCA Skin', usage: 'Medium-thickness layer, 10-minute process time' },
          { name: 'Sheer Tint SPF 45', brand: 'PCA Skin', usage: 'Oil-free formula, blends into all skin tones' },
        ],
      },
    ],
  },
  {
    id: 'proto-008',
    title: 'Post-Procedure Recovery',
    slug: 'post-procedure-recovery',
    category: 'clinical',
    subcategory: 'recovery',
    description:
      'A gentle recovery protocol for clients 3–7 days post-laser, post-peel, or post-surgical procedure. Focuses on barrier repair, inflammation reduction, and promoting healing without disrupting recovery. No actives, no exfoliation.',
    durationMinutes: 45,
    skillLevel: 'intermediate',
    skinConcerns: ['post-procedure sensitivity', 'erythema', 'dehydration', 'barrier compromise'],
    contraindications: ['less than 72 hours post-procedure without physician clearance', 'active infection', 'oozing or open wounds'],
    ceEligible: true,
    ceCredits: 2.5,
    published: true,
    adoptionCount: 456,
    steps: [
      {
        stepNumber: 1,
        title: 'Gentle Cleanse Assessment',
        description:
          'Using thermal spring water and soft cotton pads, gently cleanse the treatment area. Assess healing progress — note erythema level, peeling stage, and any areas of concern. Document with photos.',
        durationMinutes: 8,
        products: [
          { name: 'Toleriane Dermo-Cleanser', brand: 'La Roche-Posay', usage: 'Applied with saturated cotton pads, no rubbing' },
          { name: 'Thermal Spring Water', brand: 'La Roche-Posay', usage: 'Mist from 8 inches, pat dry with sterile gauze' },
        ],
      },
      {
        stepNumber: 2,
        title: 'Calming LED Therapy',
        description:
          'Apply near-infrared LED (830nm) at reduced intensity for 12 minutes. This wavelength penetrates deeper tissue to reduce inflammation and accelerate cellular repair without thermal damage.',
        durationMinutes: 14,
        products: [
          { name: 'Celluma PRO LED Panel', brand: 'Celluma', usage: 'Near-infrared 830nm mode, 12-minute cycle, 3-inch distance' },
        ],
      },
      {
        stepNumber: 3,
        title: 'Barrier Repair Serum Application',
        description:
          'Apply ceramide and peptide-based recovery serum using fingertip press technique. No dragging or massage — skin is too fragile. Layer generously.',
        durationMinutes: 10,
        products: [
          { name: 'Cicaplast Baume B5', brand: 'La Roche-Posay', usage: 'Thick layer applied with fingertip press, no rubbing' },
          { name: 'Epidermal Repair Serum', brand: 'Calecim', usage: '6–8 drops pressed into skin before balm' },
        ],
      },
      {
        stepNumber: 4,
        title: 'Occlusive Protection & Aftercare',
        description:
          'Apply mineral SPF designed for post-procedure skin. Provide updated aftercare checklist and confirm next follow-up appointment. Recommend continued barrier support at home.',
        durationMinutes: 13,
        products: [
          { name: 'Anthelios Mineral SPF 50', brand: 'La Roche-Posay', usage: 'Mineral-only formula, gentle application avoiding any peeling areas' },
          { name: 'Cicaplast Gel B5', brand: 'La Roche-Posay', usage: 'Recovery take-home sample for continued barrier support' },
        ],
      },
    ],
  },
];

// ── Mock CE Progress Data ───────────────────────────────────────────

const MOCK_CE_CREDITS = [
  {
    id: 'ce-001',
    protocolId: 'proto-001',
    creditsEarned: 2.0,
    earnedAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'ce-002',
    protocolId: 'proto-004',
    creditsEarned: 1.0,
    earnedAt: '2026-01-22T14:00:00Z',
  },
  {
    id: 'ce-003',
    contentId: 'edu-003',
    creditsEarned: 1.5,
    earnedAt: '2026-02-03T09:15:00Z',
  },
  {
    id: 'ce-004',
    protocolId: 'proto-006',
    creditsEarned: 1.0,
    earnedAt: '2026-02-10T16:45:00Z',
  },
  {
    id: 'ce-005',
    protocolId: 'proto-002',
    creditsEarned: 3.0,
    earnedAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 'ce-006',
    contentId: 'edu-007',
    creditsEarned: 2.0,
    earnedAt: '2026-02-25T13:30:00Z',
  },
  {
    id: 'ce-007',
    protocolId: 'proto-008',
    creditsEarned: 2.5,
    earnedAt: '2026-03-01T10:00:00Z',
  },
];

const MOCK_CE_PROGRESS: CEProgress = {
  totalEarned: 13.0,
  goal: 24.0,
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
  credits: MOCK_CE_CREDITS,
};

// ── Data Access Helpers ─────────────────────────────────────────────

export function getProtocols(): TreatmentProtocol[] {
  return MOCK_PROTOCOLS.filter((p) => p.published);
}

export function getProtocolBySlug(slug: string): TreatmentProtocol | undefined {
  return MOCK_PROTOCOLS.find((p) => p.slug === slug);
}

export function getProtocolsByCategory(category: string): TreatmentProtocol[] {
  if (category === 'all') return getProtocols();
  return MOCK_PROTOCOLS.filter((p) => p.published && p.category === category);
}

export function getCEProgress(): CEProgress {
  return MOCK_CE_PROGRESS;
}
