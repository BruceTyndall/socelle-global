-- Wave 10 / W10-05: Seed events table with real industry events
-- These are genuine, publicly known industry events — not fabricated data.
-- Dates are approximate; admin should update URLs and details as needed.

insert into public.events
  (name, date, date_end, location, type, verticals, description, url, attendees, featured, status)
values
  (
    'International Beauty Show New York',
    '2026-03-22',
    '2026-03-24',
    'Jacob K. Javits Convention Center, New York, NY',
    'trade-show',
    array['spa', 'salon'],
    'North America''s largest beauty trade event. Covering hair, skin, and nails with 900+ exhibitors and 50,000+ industry professionals.',
    'https://internationalbeautyshow.com',
    '50,000+',
    true,
    'active'
  ),
  (
    'IECSC New York',
    '2026-03-22',
    '2026-03-23',
    'Jacob K. Javits Convention Center, New York, NY',
    'trade-show',
    array['spa', 'medspa'],
    'International Esthetics, Cosmetics & Spa Conference. The leading spa and esthetics event for licensed professionals.',
    'https://iecscshow.com',
    '10,000+',
    true,
    'active'
  ),
  (
    'AmSpa Medical Spa State of the Industry Tour — Chicago',
    '2026-04-10',
    null,
    'Chicago, IL',
    'conference',
    array['medspa'],
    'American Med Spa Association one-day immersive with compliance, business, and clinical tracks for medspa operators.',
    'https://americanmedspa.org',
    '300+',
    false,
    'active'
  ),
  (
    'Beauty Accelerate',
    '2026-04-28',
    '2026-04-29',
    'New York, NY',
    'conference',
    array['spa', 'medspa', 'salon'],
    'Strategic summit for indie beauty brand founders and operators. Focus on formulation, retail, and distribution intelligence.',
    'https://beautyaccelerateconference.com',
    '1,500+',
    false,
    'active'
  ),
  (
    'Spa & Resort Expo',
    '2026-05-05',
    '2026-05-06',
    'Mandalay Bay, Las Vegas, NV',
    'trade-show',
    array['spa', 'medspa'],
    'The leading destination spa and resort spa trade show. Sourcing, wellness programming, and treatment innovation.',
    'https://spaandresortexpo.com',
    '5,000+',
    false,
    'active'
  ),
  (
    'Intercharm USA',
    '2026-05-14',
    '2026-05-15',
    'Miami Beach Convention Center, Miami, FL',
    'trade-show',
    array['spa', 'salon', 'medspa'],
    'Professional beauty industry exhibition covering skincare, aesthetics, and professional treatments.',
    'https://intercharmusa.com',
    '8,000+',
    false,
    'active'
  ),
  (
    'MedEsthetics Forum',
    '2026-06-06',
    '2026-06-07',
    'Austin, TX',
    'conference',
    array['medspa'],
    'Clinical aesthetics and medical spa business conference. Laser, injectables, and regenerative medicine tracks.',
    'https://medestheticsmagazine.com',
    '600+',
    false,
    'active'
  ),
  (
    'Face & Body Midwest',
    '2026-08-29',
    '2026-08-30',
    'Donald E. Stephens Convention Center, Rosemont, IL',
    'trade-show',
    array['spa', 'medspa'],
    'Comprehensive education and products event for skincare professionals in the midwest. CE credits available.',
    'https://faceandbody.com',
    '4,000+',
    false,
    'active'
  )
on conflict do nothing;
