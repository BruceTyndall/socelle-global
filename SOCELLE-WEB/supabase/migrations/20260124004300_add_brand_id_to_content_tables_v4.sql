/*
  # Add brand_id to Content Tables

  1. Add brand_id Column
    - Add to all brand-owned content tables and migrate to Naturopathica
    - Core protocol and product tables
    - Business rules and configuration tables
    - Business/plan tracking tables
    - Skip views (protocol_complete_details)

  2. Data Migration
    - Set all existing records to Naturopathica brand_id
    - Add NOT NULL constraint after migration

  3. Update Indexes
    - Add indexes on brand_id for performance
*/

-- Add brand_id to canonical_protocols (parent table)
ALTER TABLE canonical_protocols ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE canonical_protocols SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE canonical_protocols ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_canonical_protocols_brand_id ON canonical_protocols(brand_id);

-- Add brand_id to canonical_protocol_steps (inherits from protocol via canonical_protocol_id)
ALTER TABLE canonical_protocol_steps ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE canonical_protocol_steps cps
SET brand_id = cp.brand_id
FROM canonical_protocols cp
WHERE cps.canonical_protocol_id = cp.id;
ALTER TABLE canonical_protocol_steps ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_canonical_protocol_steps_brand_id ON canonical_protocol_steps(brand_id);

-- Add brand_id to canonical_protocol_step_products (inherits from step via protocol_step_id)
ALTER TABLE canonical_protocol_step_products ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE canonical_protocol_step_products cpsp
SET brand_id = cps.brand_id
FROM canonical_protocol_steps cps
WHERE cpsp.protocol_step_id = cps.id;
ALTER TABLE canonical_protocol_step_products ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_canonical_protocol_step_products_brand_id ON canonical_protocol_step_products(brand_id);

-- Add brand_id to protocol_costing (inherits from protocol via canonical_protocol_id)
ALTER TABLE protocol_costing ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE protocol_costing pc
SET brand_id = cp.brand_id
FROM canonical_protocols cp
WHERE pc.canonical_protocol_id = cp.id;
ALTER TABLE protocol_costing ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_protocol_costing_brand_id ON protocol_costing(brand_id);

-- Add brand_id to pro_products
ALTER TABLE pro_products ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE pro_products SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE pro_products ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_pro_products_brand_id ON pro_products(brand_id);

-- Add brand_id to retail_products
ALTER TABLE retail_products ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE retail_products SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE retail_products ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_retail_products_brand_id ON retail_products(brand_id);

-- Add brand_id to marketing_calendar
ALTER TABLE marketing_calendar ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE marketing_calendar SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE marketing_calendar ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_marketing_calendar_brand_id ON marketing_calendar(brand_id);

-- Add brand_id to retail_attach_rules
ALTER TABLE retail_attach_rules ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE retail_attach_rules SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE retail_attach_rules ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_retail_attach_rules_brand_id ON retail_attach_rules(brand_id);

-- Add brand_id to mixing_rules
ALTER TABLE mixing_rules ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE mixing_rules SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE mixing_rules ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_mixing_rules_brand_id ON mixing_rules(brand_id);

-- Add brand_id to pricing_uplift_rules
ALTER TABLE pricing_uplift_rules ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE pricing_uplift_rules SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE pricing_uplift_rules ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_pricing_uplift_rules_brand_id ON pricing_uplift_rules(brand_id);

-- Add brand_id to spa_leads (businesses exploring brands)
ALTER TABLE spa_leads ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE spa_leads SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE spa_leads ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_spa_leads_brand_id ON spa_leads(brand_id);

-- Add brand_id to plan_outputs (plans are brand-specific)
ALTER TABLE plan_outputs ADD COLUMN brand_id uuid REFERENCES brands(id);
UPDATE plan_outputs SET brand_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE brand_id IS NULL;
ALTER TABLE plan_outputs ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_plan_outputs_brand_id ON plan_outputs(brand_id);