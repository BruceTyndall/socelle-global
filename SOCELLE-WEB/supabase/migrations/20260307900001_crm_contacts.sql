-- Migration: CRM Contacts & Companies
-- WO: WO-OVERHAUL-17 backend pass
-- Tables: crm_contacts, crm_companies

CREATE TABLE IF NOT EXISTS crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  company_id uuid,
  job_title text,
  contact_type text DEFAULT 'client' CHECK (contact_type IN ('client','lead','prospect','vendor','partner')),
  source text,
  lifecycle_stage text DEFAULT 'subscriber' CHECK (lifecycle_stage IN ('subscriber','lead','mql','sql','opportunity','customer','evangelist')),
  avatar_url text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  country text DEFAULT 'US',
  date_of_birth date,
  skin_type text,
  skin_concerns text[] DEFAULT '{}',
  product_preferences text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  notes text,
  metadata jsonb DEFAULT '{}',
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE,
  industry text,
  company_type text CHECK (company_type IN ('salon','spa','medspa','clinic','brand','supplier','distributor','other')),
  website text,
  phone text,
  email text,
  address_line1 text,
  city text,
  state text,
  zip text,
  country text DEFAULT 'US',
  employee_count int,
  annual_revenue_cents bigint,
  logo_url text,
  tags text[] DEFAULT '{}',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add FK from crm_contacts.company_id -> crm_companies after both tables exist
ALTER TABLE crm_contacts
  ADD CONSTRAINT fk_crm_contacts_company
  FOREIGN KEY (company_id) REFERENCES crm_companies(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_crm_contacts_owner ON crm_contacts(owner_id);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_type ON crm_contacts(contact_type);
CREATE INDEX idx_crm_contacts_lifecycle ON crm_contacts(lifecycle_stage);
CREATE INDEX idx_crm_companies_owner ON crm_companies(owner_id);
CREATE INDEX idx_crm_companies_slug ON crm_companies(slug);
CREATE INDEX idx_crm_companies_type ON crm_companies(company_type);
