-- Protocol 1: Acne Clearing Facial
DO $$
DECLARE
  protocol_id uuid;
  step_id uuid;
BEGIN
  -- Get protocol ID
  SELECT id INTO protocol_id FROM canonical_protocols WHERE source_file = 'acneclearingfacial_protocol_060524.pdf';

  -- Update protocol metadata
  UPDATE canonical_protocols
  SET
    target_concerns = ARRAY['acne', 'congestion', 'oiliness', 'inflammation'],
    contraindications = ARRAY['active cystic acne', 'open wounds', 'recent laser treatment'],
    typical_duration = '60 minutes',
    completion_status = 'complete',
    completed_at = NOW()
  WHERE id = protocol_id;

  -- Delete existing steps
  DELETE FROM canonical_protocol_steps WHERE canonical_protocol_id = protocol_id;

  -- Insert steps
  INSERT INTO canonical_protocol_steps (canonical_protocol_id, step_number, step_title, step_instructions, timing_minutes, technique_notes)
  VALUES
    (protocol_id, 1, 'Cleanse', 'Double cleanse with Colloidal Silver & Salicylic Acid Acne Cleanser', 5, 'Use circular motions, focus on congested areas'),
    (protocol_id, 2, 'Analyze', 'Examine skin under magnification to assess congestion and inflammation', 3, 'Note areas requiring extraction'),
    (protocol_id, 3, 'Exfoliate', 'Apply Sweet Cherry Enzyme Peel to dissolve dead skin cells', 10, 'Leave on for 8-10 minutes with steam'),
    (protocol_id, 4, 'Extract', 'Perform gentle extractions on congested areas', 12, 'Use proper extraction technique, apply gentle pressure only'),
    (protocol_id, 5, 'Treat', 'Apply Colloidal Silver & Salicylic Acid Acne Serum to calm inflammation', 8, 'Gentle pressing motions'),
    (protocol_id, 6, 'Mask', 'Apply Watercress & Spirulina Detox Mask to purify and soothe', 15, 'Leave on for 12-15 minutes'),
    (protocol_id, 7, 'Moisturize', 'Apply lightweight hydration with Aloe Vera Gel', 5, 'Light upward strokes');

  RAISE NOTICE 'Updated Acne Clearing Facial with 7 steps';
END $$;

-- Protocol 2: Vitamin C Radiance Facial
DO $$
DECLARE
  protocol_id uuid;
BEGIN
  SELECT id INTO protocol_id FROM canonical_protocols WHERE source_file = 'vitamincradiancefacial.pdf';

  UPDATE canonical_protocols
  SET
    target_concerns = ARRAY['dullness', 'uneven tone', 'hyperpigmentation', 'aging', 'fatigue'],
    contraindications = ARRAY['active acne', 'sunburn', 'recent chemical peel', 'retinoid use within 5 days'],
    typical_duration = '60 minutes',
    completion_status = 'complete',
    completed_at = NOW()
  WHERE id = protocol_id;

  DELETE FROM canonical_protocol_steps WHERE canonical_protocol_id = protocol_id;

  INSERT INTO canonical_protocol_steps (canonical_protocol_id, step_number, step_title, step_instructions, timing_minutes, technique_notes)
  VALUES
    (protocol_id, 1, 'Cleanse', 'Double cleanse with Aloe Vera Cleansing Gel', 5, 'Remove makeup and surface impurities'),
    (protocol_id, 2, 'Analyze', 'Examine skin texture and tone under magnification', 3, 'Identify areas of hyperpigmentation'),
    (protocol_id, 3, 'Exfoliate', 'Apply Pumpkin Enzyme Peel to brighten and resurface', 10, 'Process with warm steam for 8-10 minutes'),
    (protocol_id, 4, 'Massage', 'Lymphatic drainage massage to boost circulation', 10, 'Follow lymphatic pathways, gentle pressure'),
    (protocol_id, 5, 'Treat', 'Apply Vitamin C15 Wrinkle Remedy Serum for brightening', 8, 'Gentle tapping motions to increase absorption'),
    (protocol_id, 6, 'Mask', 'Apply White Tea Antioxidant Mask for additional brightening', 15, 'Leave on for 12-15 minutes with cool globes'),
    (protocol_id, 7, 'Hydrate & Protect', 'Apply hydrating mist and protective moisturizer', 5, 'Seal in hydration with upward strokes');

  RAISE NOTICE 'Updated Vitamin C Radiance Facial with 7 steps';
END $$;

-- Protocol 3: Caffeine Gua Sha Facial
DO $$
DECLARE
  protocol_id uuid;
BEGIN
  SELECT id INTO protocol_id FROM canonical_protocols WHERE source_file = 'caffeineguashafacial_100224_1.pdf';

  UPDATE canonical_protocols
  SET
    target_concerns = ARRAY['puffiness', 'tired appearance', 'loss of firmness', 'poor circulation'],
    contraindications = ARRAY['rosacea', 'broken capillaries', 'active inflammation', 'recent facial surgery'],
    typical_duration = '75 minutes',
    completion_status = 'complete',
    completed_at = NOW()
  WHERE id = protocol_id;

  DELETE FROM canonical_protocol_steps WHERE canonical_protocol_id = protocol_id;

  INSERT INTO canonical_protocol_steps (canonical_protocol_id, step_number, step_title, step_instructions, timing_minutes, technique_notes)
  VALUES
    (protocol_id, 1, 'Cleanse', 'Double cleanse to prepare skin for massage', 5, 'Remove all impurities and prep skin'),
    (protocol_id, 2, 'Exfoliate', 'Polish skin with Oat Cleansing Facial Polish', 7, 'Focus on texture, avoid delicate eye area'),
    (protocol_id, 3, 'Tone', 'Apply hydrating mist to prep for massage', 2, 'Ensure skin is damp for slip'),
    (protocol_id, 4, 'Gua Sha Massage', 'Perform comprehensive gua sha facial massage', 25, 'Use gentle to medium pressure, follow natural contours, repeat each stroke 5-7 times'),
    (protocol_id, 5, 'Eye Treatment', 'Apply targeted treatment around eye area to reduce puffiness', 8, 'Use cooling eye tool, work from inner to outer corner'),
    (protocol_id, 6, 'Mask', 'Apply Aloe Vera Gel Mask to soothe and hydrate', 15, 'Leave on while performing hand and arm massage'),
    (protocol_id, 7, 'Seal & Protect', 'Lock in benefits with facial oil and moisturizer', 5, 'Finish with lifting massage strokes');

  RAISE NOTICE 'Updated Caffeine Gua Sha Facial with 7 steps';
END $$;
