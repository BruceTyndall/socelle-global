-- Migration: Booking Staff, Services Link, Schedules, Time Off
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: booking_staff, staff_services, staff_schedules, staff_time_off

CREATE TABLE IF NOT EXISTS booking_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  title text,
  bio text,
  avatar_url text,
  specializations text[] DEFAULT '{}',
  is_active bool DEFAULT true,
  accept_bookings bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES booking_staff(id) ON DELETE CASCADE,
  service_id uuid REFERENCES booking_services(id) ON DELETE CASCADE,
  custom_duration_minutes int,
  custom_price_cents int,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS staff_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES booking_staff(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS staff_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES booking_staff(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  is_approved bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_booking_staff_business ON booking_staff(business_id);
CREATE INDEX idx_booking_staff_active ON booking_staff(is_active);
CREATE INDEX idx_staff_services_staff ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service ON staff_services(service_id);
CREATE INDEX idx_staff_schedules_staff ON staff_schedules(staff_id);
CREATE INDEX idx_staff_time_off_staff ON staff_time_off(staff_id);
CREATE INDEX idx_staff_time_off_dates ON staff_time_off(start_date, end_date);
