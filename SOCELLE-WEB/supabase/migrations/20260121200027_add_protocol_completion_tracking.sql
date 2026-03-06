/*
  # Add Protocol Completion Tracking

  1. Changes to canonical_protocols table
    - Add `completion_status` enum field (incomplete, steps_complete, fully_complete)
    - Add `completed_by` text field (admin user identifier)
    - Add `completed_at` timestamp field
    - Add `manual_entry_notes` text field for admin notes

  2. Purpose
    - Track manual protocol completion progress
    - Enable admin workflow for filling in missing protocol data
    - Gate Phase 3 unlock based on completion status
    - Audit trail for manual data entry

  3. Completion Rules
    - incomplete: Default status when protocol created
    - steps_complete: All steps entered, instructions present
    - fully_complete: Steps + products + concerns + contraindications present
*/

-- Create completion status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'protocol_completion_status') THEN
    CREATE TYPE protocol_completion_status AS ENUM (
      'incomplete',
      'steps_complete',
      'fully_complete'
    );
  END IF;
END $$;

-- Add completion tracking fields to canonical_protocols
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'completion_status'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN completion_status protocol_completion_status DEFAULT 'incomplete' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'completed_by'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN completed_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'manual_entry_notes'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN manual_entry_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'last_edited_by'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN last_edited_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canonical_protocols' AND column_name = 'last_edited_at'
  ) THEN
    ALTER TABLE canonical_protocols
    ADD COLUMN last_edited_at timestamptz;
  END IF;
END $$;

-- Create index on completion_status for filtering
CREATE INDEX IF NOT EXISTS idx_protocols_completion_status
  ON canonical_protocols(completion_status);

-- Create function to auto-update completion status based on related data
CREATE OR REPLACE FUNCTION update_protocol_completion_status()
RETURNS TRIGGER AS $$
DECLARE
  v_step_count INTEGER;
  v_steps_with_instructions INTEGER;
  v_has_concerns BOOLEAN;
  v_has_contraindications BOOLEAN;
  v_has_products BOOLEAN;
  v_new_status protocol_completion_status;
BEGIN
  -- Count steps and validate
  SELECT COUNT(*), COUNT(*) FILTER (WHERE step_instructions IS NOT NULL AND step_instructions != '')
  INTO v_step_count, v_steps_with_instructions
  FROM canonical_protocol_steps
  WHERE canonical_protocol_id = COALESCE(NEW.canonical_protocol_id, NEW.id);

  -- Check for concerns and contraindications
  SELECT
    target_concerns IS NOT NULL AND array_length(target_concerns, 1) > 0,
    contraindications IS NOT NULL AND array_length(contraindications, 1) > 0
  INTO v_has_concerns, v_has_contraindications
  FROM canonical_protocols
  WHERE id = COALESCE(NEW.canonical_protocol_id, NEW.id);

  -- Check for products
  SELECT COUNT(*) > 0
  INTO v_has_products
  FROM canonical_protocol_step_products cpsp
  JOIN canonical_protocol_steps cps ON cpsp.protocol_step_id = cps.id
  WHERE cps.canonical_protocol_id = COALESCE(NEW.canonical_protocol_id, NEW.id);

  -- Determine new status
  IF v_step_count = 0 THEN
    v_new_status := 'incomplete';
  ELSIF v_step_count > 0 AND v_steps_with_instructions = v_step_count THEN
    IF v_has_concerns AND v_has_contraindications AND v_has_products THEN
      v_new_status := 'fully_complete';
    ELSE
      v_new_status := 'steps_complete';
    END IF;
  ELSE
    v_new_status := 'incomplete';
  END IF;

  -- Update protocol status if needed
  UPDATE canonical_protocols
  SET
    completion_status = v_new_status,
    last_edited_at = NOW()
  WHERE id = COALESCE(NEW.canonical_protocol_id, NEW.id)
    AND completion_status != v_new_status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update completion status
DROP TRIGGER IF EXISTS trg_update_protocol_completion_on_step ON canonical_protocol_steps;
CREATE TRIGGER trg_update_protocol_completion_on_step
  AFTER INSERT OR UPDATE OR DELETE ON canonical_protocol_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_protocol_completion_status();

DROP TRIGGER IF EXISTS trg_update_protocol_completion_on_product ON canonical_protocol_step_products;
CREATE TRIGGER trg_update_protocol_completion_on_product
  AFTER INSERT OR UPDATE OR DELETE ON canonical_protocol_step_products
  FOR EACH ROW
  EXECUTE FUNCTION update_protocol_completion_status();

DROP TRIGGER IF EXISTS trg_update_protocol_completion_on_protocol ON canonical_protocols;
CREATE TRIGGER trg_update_protocol_completion_on_protocol
  AFTER UPDATE OF target_concerns, contraindications ON canonical_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_protocol_completion_status();

-- Add comment for documentation
COMMENT ON COLUMN canonical_protocols.completion_status IS 'Tracks manual completion progress: incomplete (default) → steps_complete (all steps with instructions) → fully_complete (steps + products + metadata)';
COMMENT ON COLUMN canonical_protocols.completed_by IS 'Admin user who marked protocol as complete';
COMMENT ON COLUMN canonical_protocols.completed_at IS 'Timestamp when protocol was marked as fully complete';
COMMENT ON COLUMN canonical_protocols.manual_entry_notes IS 'Admin notes about manual data entry, sources, or clarifications';
