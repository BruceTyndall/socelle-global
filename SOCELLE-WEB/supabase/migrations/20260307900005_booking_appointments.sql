-- Migration: Appointments & Appointment History
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: appointments, appointment_history

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  client_id uuid REFERENCES crm_contacts(id),
  staff_id uuid REFERENCES booking_staff(id),
  service_id uuid REFERENCES booking_services(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','checked_in','in_progress','completed','cancelled','no_show')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  actual_start timestamptz,
  actual_end timestamptz,
  price_cents int NOT NULL,
  deposit_paid_cents int DEFAULT 0,
  addons jsonb DEFAULT '[]',
  notes_client text,
  notes_staff text,
  notes_internal text,
  cancellation_reason text,
  cancelled_at timestamptz,
  reminder_sent bool DEFAULT false,
  source text DEFAULT 'online' CHECK (source IN ('online','phone','walk_in','app','social')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  changed_by uuid,
  old_status text,
  new_status text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_appointments_business ON appointments(business_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_appointments_business_start ON appointments(business_id, start_time);
CREATE INDEX idx_appointment_history_appt ON appointment_history(appointment_id);
