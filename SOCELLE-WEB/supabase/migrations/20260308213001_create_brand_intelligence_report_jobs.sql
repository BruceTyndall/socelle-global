-- W11-05 follow-up: brand intelligence report queue + delivery status
-- Adds DB-backed report job lifecycle for /brand/intelligence-report.

CREATE TABLE IF NOT EXISTS public.brand_intelligence_report_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  report_month date NOT NULL,
  output_format text NOT NULL CHECK (output_format IN ('pdf', 'email')),
  delivery_email text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  status_message text,
  artifact_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_brand_report_jobs_brand_created
  ON public.brand_intelligence_report_jobs (brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brand_report_jobs_status
  ON public.brand_intelligence_report_jobs (status, created_at DESC);

ALTER TABLE public.brand_intelligence_report_jobs ENABLE ROW LEVEL SECURITY;

-- Brand admins + admins can read jobs for their own brand.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'brand_intelligence_report_jobs'
      AND policyname = 'Brand users can view own report jobs'
  ) THEN
    CREATE POLICY "Brand users can view own report jobs"
      ON public.brand_intelligence_report_jobs
      FOR SELECT
      TO authenticated
      USING (
        brand_id IN (
          SELECT up.brand_id
          FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role IN ('brand_admin', 'admin')
            AND up.brand_id IS NOT NULL
        )
        OR EXISTS (
          SELECT 1
          FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role = 'platform_admin'
        )
      );
  END IF;
END $$;

-- Brand admins + admins can queue jobs for their own brand.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'brand_intelligence_report_jobs'
      AND policyname = 'Brand users can queue own report jobs'
  ) THEN
    CREATE POLICY "Brand users can queue own report jobs"
      ON public.brand_intelligence_report_jobs
      FOR INSERT
      TO authenticated
      WITH CHECK (
        brand_id IN (
          SELECT up.brand_id
          FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role IN ('brand_admin', 'admin')
            AND up.brand_id IS NOT NULL
        )
        OR EXISTS (
          SELECT 1
          FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role = 'platform_admin'
        )
      );
  END IF;
END $$;

-- Platform admins + service_role can manage lifecycle statuses.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'brand_intelligence_report_jobs'
      AND policyname = 'Platform can manage report jobs'
  ) THEN
    CREATE POLICY "Platform can manage report jobs"
      ON public.brand_intelligence_report_jobs
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role = 'platform_admin'
        )
        OR auth.role() = 'service_role'
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_profiles up
          WHERE up.id = auth.uid()
            AND up.role = 'platform_admin'
        )
        OR auth.role() = 'service_role'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
      AND pg_function_is_visible(oid)
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_brand_report_jobs_updated_at'
      AND tgrelid = 'public.brand_intelligence_report_jobs'::regclass
  ) THEN
    CREATE TRIGGER trg_brand_report_jobs_updated_at
      BEFORE UPDATE ON public.brand_intelligence_report_jobs
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

COMMENT ON TABLE public.brand_intelligence_report_jobs IS
  'Queue and delivery status tracking for brand intelligence report generation requests.';
