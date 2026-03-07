-- Migration: Sales Pipelines + Pipeline Stages
-- WO: WO-OVERHAUL-14 (Sales Platform schema)

CREATE TABLE IF NOT EXISTS sales_pipelines (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  description   text,
  owner_id      uuid,
  tenant_id     uuid,
  is_default    bool        DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id     uuid        NOT NULL REFERENCES sales_pipelines(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  description     text,
  sort_order      int         DEFAULT 0,
  probability_pct numeric     DEFAULT 0,
  color           text,
  created_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sales_pipelines_owner    ON sales_pipelines(owner_id);
CREATE INDEX idx_sales_pipelines_tenant   ON sales_pipelines(tenant_id);
CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX idx_pipeline_stages_sort     ON pipeline_stages(pipeline_id, sort_order);
