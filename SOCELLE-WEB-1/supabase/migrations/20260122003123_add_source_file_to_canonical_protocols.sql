/*
  # Add source_file column to canonical_protocols

  1. Changes
    - Add `source_file` column to `canonical_protocols` table to track which PDF the protocol was ingested from
*/

ALTER TABLE canonical_protocols 
ADD COLUMN IF NOT EXISTS source_file text;
