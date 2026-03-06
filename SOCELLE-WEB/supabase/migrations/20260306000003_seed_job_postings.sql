-- Wave 10 / W10-06: Seed job_postings with representative professional beauty roles
-- employment_type column (not 'type') per 20260305090002_job_postings.sql schema
-- All slugs unique. Requirements stored as jsonb array.

insert into public.job_postings
  (slug, title, company, location, vertical, employment_type,
   salary_min, salary_max, salary_period, description, requirements, featured, status)
values
  (
    'spa-director-four-seasons-miami',
    'Spa Director',
    'Four Seasons Hotel Miami',
    'Miami, FL',
    'spa',
    'full-time',
    85000, 110000, 'year',
    'Lead a world-class spa team at one of Miami''s premier luxury hotels. Oversee operations, treatment programming, revenue management, and a team of 20+ therapists and estheticians. Collaborate with the hotel GM on wellness programming and brand partnerships.',
    '["5+ years spa management experience", "Licensed esthetician or massage therapist preferred", "Experience with spa management software (Book4Time, SpaSoft)", "Strong retail sales background", "Multi-unit or resort spa experience preferred"]'::jsonb,
    true,
    'active'
  ),
  (
    'lead-esthetician-hana-medspa-la',
    'Lead Esthetician',
    'Hana MedSpa',
    'Los Angeles, CA',
    'medspa',
    'full-time',
    65000, 85000, 'year',
    'Join a rapidly growing medspa in Beverly Hills as Lead Esthetician. Perform advanced facial treatments, chemical peels, dermaplaning, and microneedling. Train junior staff and build a loyal client book. Significant bonus potential on retail and service upsells.',
    '["Active CA esthetician license", "2+ years medspa experience", "Experience with Obagi, SkinMedica, or ZO Skin Health protocols", "Microneedling certification preferred", "Strong consultation and retail sales skills"]'::jsonb,
    true,
    'active'
  ),
  (
    'salon-manager-glow-salon-chicago',
    'Salon Manager',
    'Glow Salon & Spa',
    'Chicago, IL',
    'salon',
    'full-time',
    55000, 70000, 'year',
    'Manage day-to-day operations of a high-volume full-service salon in Lincoln Park. Oversee scheduling, inventory, staff performance, and client experience. Work closely with owner on retail strategy and brand partnerships.',
    '["3+ years salon management experience", "Cosmetology license preferred", "Experience with Vagaro or Mindbody scheduling systems", "Strong leadership and conflict resolution skills"]'::jsonb,
    false,
    'active'
  ),
  (
    'nurse-injector-atlanta-aesthetics',
    'Nurse Injector',
    'Atlanta Aesthetics Collective',
    'Atlanta, GA',
    'medspa',
    'full-time',
    90000, 130000, 'year',
    'Perform Botox, dermal fillers, and PRP treatments in a physician-supervised medspa. Build a loyal patient panel. Medical director oversight provided. Opportunity to lead injector training program.',
    '["Active RN license in Georgia", "2+ years injecting experience", "Allergan, Galderma, or Revance certification preferred", "Own patient book preferred", "Must pass background and credentialing review"]'::jsonb,
    false,
    'active'
  ),
  (
    'skincare-specialist-exhale-spa-nyc',
    'Skincare Specialist',
    'Exhale Spa',
    'New York, NY',
    'spa',
    'full-time',
    50000, 65000, 'year',
    'Provide high-touch skincare services including custom facials, body treatments, and waxing at our flagship NYC location. Expected to hit retail targets and build a strong client retention rate.',
    '["NY esthetician license required", "1+ years spa experience", "Knowledge of Eminence or Naturopathica product lines a plus", "Strong client communication skills"]'::jsonb,
    false,
    'active'
  ),
  (
    'medspa-coordinator-part-time-houston',
    'MedSpa Patient Coordinator',
    'Restore Medical Spa',
    'Houston, TX',
    'medspa',
    'part-time',
    22, 28, 'hour',
    'Front-of-house coordinator for a busy Houston medspa. Handle patient scheduling, consent forms, payment processing, and post-treatment follow-up calls. Part-time, 20–25 hrs/week with potential to grow.',
    '["1+ years medical front desk or spa reception", "Comfortable with EMR systems (Aesthetic Record, Symplast)", "Excellent phone and email communication", "HIPAA compliance training preferred"]'::jsonb,
    false,
    'active'
  ),
  (
    'brand-educator-skincare-contractor',
    'Brand Educator — Skincare',
    'Confidential (Professional Brand)',
    'Remote / National Travel',
    'spa',
    'contract',
    80, 120, 'hour',
    'Represent an established professional skincare brand as a freelance educator. Deliver in-person and virtual training to spa and medspa accounts. Develop curriculum, present at trade shows, and support regional sales teams.',
    '["Licensed esthetician with 5+ years clinical experience", "Prior brand education or trainer experience", "Excellent presentation skills", "Willingness to travel up to 40% nationally", "Experience with clinical skincare lines (prescription-adjacent preferred)"]'::jsonb,
    false,
    'active'
  ),
  (
    'medspa-director-scottsdale-az',
    'Medical Spa Director',
    'Luminary Aesthetics',
    'Scottsdale, AZ',
    'medspa',
    'full-time',
    95000, 125000, 'year',
    'Direct operations, staff, and clinical programs at a multi-provider medspa. Oversee injectors, estheticians, laser techs, and the patient services team. Report to medical director. Drive revenue through service mix optimization and membership programs.',
    '["5+ years medspa operations leadership", "P&L management experience", "Experience with membership program management", "Knowledge of FDA compliance and medical spa regulations", "RN or esthetician license a plus"]'::jsonb,
    true,
    'active'
  )
on conflict (slug) do nothing;
