-- Migration: Booking Services & Addons
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: booking_services, booking_service_addons

CREATE TABLE IF NOT EXISTS booking_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  category text,
  duration_minutes int NOT NULL,
  buffer_minutes int DEFAULT 0,
  price_cents int NOT NULL,
  compare_at_price_cents int,
  deposit_required bool DEFAULT false,
  deposit_cents int,
  max_capacity int DEFAULT 1,
  is_active bool DEFAULT true,
  requires_patch_test bool DEFAULT false,
  image_url text,
  sort_order int DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_service_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES booking_services(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes int DEFAULT 0,
  price_cents int NOT NULL,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_booking_services_business ON booking_services(business_id);
CREATE INDEX idx_booking_services_category ON booking_services(category);
CREATE INDEX idx_booking_services_active ON booking_services(is_active);
CREATE INDEX idx_booking_service_addons_service ON booking_service_addons(service_id);
