-- MERCH-REMEDIATION-01 Pass 2
-- Extended off-topic archiving across ALL topics from NewsAPI/GNews
-- Pass 1 only targeted topic='other'. Pass 2 covers science/regulation/events/pricing
-- where the titles are clearly non-beauty (NASA, depression drugs, measles, dog videos).

UPDATE market_signals
SET
  active  = false,
  status  = 'archived'
WHERE active = true
  AND (
    -- Hard non-beauty keywords (regardless of source)
    lower(title) ~ 'nasa|space station|astronaut|depression.*drug|magic mushroom|measles|golden retriever'
    OR lower(title) ~ 'dog\b|puppy|pet owner|brain development|brain maturity|brain.*age'
    OR lower(title) ~ 'surgery.*digital twin|digital twin.*surgery'
    OR lower(title) ~ 'yo.yo diet|fad diet'
    OR lower(title) ~ 'salmon skin|eat salmon|eating.*fish'
    OR lower(title) ~ 'colon.*risk|cancer.*fuel|cancer.*supplement'
    -- Broad cleanup: NewsAPI/GNews rows across any topic that fail beauty keyword test
    OR (
      lower(source_name) IN ('gnews industry press', 'newsapi industry press')
      AND topic IN ('other', 'science', 'regulation', 'events', 'pricing', 'consumer_trend')
      AND lower(title) !~ 'skin\b|skincare|botox|filler|aesthet|medspa|med spa|esthetician|spa\b|salon\b|beauty\b|cosmetic\b|serum\b|treatment\b|ingredient\b|laser\b|retinol|peptide|collagen|hyaluronic|vitamin.*skin|anti.?aging|wrinkle|acne\b|hair\b|nail\b|wax\b|peel\b|microneedle|rf \b|ipl\b|blephar|lash\b|brow\b|injectab|botulinum|neurotox|dermal|moisturiz|exfoliat|sunscreen|spf\b|toner|cleanser|serum|esthethe|aesthet|lip\b|pigment|rosacea|eczema|psoriasis|hyperpigment|melasma|chemical peel|glycolic|lactic acid|salicylic|niacinamide|ceramide|squalane|bakuchiol|tretinoin|micro.?blading|dermaplaning|cryotherapy|led\b|photobiomodulation|radio.?frequency|ultrasound.*skin|hifu|ultherapy|coolsculpt|kybella|sculptra|juvederm|restylane|radiesse|prp|exosome|microcurrent'
      AND lower(description) !~ 'skin\b|skincare|botox|filler|aesthet|medspa|med spa|esthetician|spa\b|salon\b|beauty\b|cosmetic\b|serum\b|treatment\b|ingredient\b|laser\b|retinol|peptide|collagen|hyaluronic|anti.?aging|wrinkle|acne\b|injectab|dermal|moisturiz|exfoliat|sunscreen'
    )
  );
