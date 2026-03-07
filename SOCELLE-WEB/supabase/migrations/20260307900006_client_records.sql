-- Migration: Client Treatment Records, Product History, Visit Summary
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: client_treatment_records, client_product_history, client_visit_summary

CREATE TABLE IF NOT EXISTS client_treatment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES crm_contacts(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id),
  staff_id uuid REFERENCES booking_staff(id),
  treatment_date timestamptz NOT NULL,
  service_name text NOT NULL,
  products_used jsonb DEFAULT '[]',
  notes text,
  before_photo_url text,
  after_photo_url text,
  skin_analysis jsonb,
  contraindications text[] DEFAULT '{}',
  follow_up_date date,
  follow_up_notes text,
  consent_signed bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_product_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES crm_contacts(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  reorder_reminder_date date,
  notes text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_visit_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES crm_contacts(id) ON DELETE CASCADE UNIQUE,
  total_visits int DEFAULT 0,
  total_spend_cents bigint DEFAULT 0,
  avg_spend_cents int DEFAULT 0,
  last_visit_at timestamptz,
  next_appointment_at timestamptz,
  preferred_staff_id uuid,
  preferred_services uuid[] DEFAULT '{}',
  lifetime_value_cents bigint DEFAULT 0,
  churn_risk_score numeric,
  retention_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_treatment_records_client ON client_treatment_records(client_id);
CREATE INDEX idx_treatment_records_appointment ON client_treatment_records(appointment_id);
CREATE INDEX idx_treatment_records_staff ON client_treatment_records(staff_id);
CREATE INDEX idx_treatment_records_date ON client_treatment_records(treatment_date);
CREATE INDEX idx_product_history_client ON client_product_history(client_id);
CREATE INDEX idx_visit_summary_client ON client_visit_summary(client_id);
CREATE INDEX idx_visit_summary_churn ON client_visit_summary(churn_risk_score);
