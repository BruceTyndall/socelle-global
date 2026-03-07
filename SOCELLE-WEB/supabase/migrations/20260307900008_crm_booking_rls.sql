-- Migration: RLS policies for CRM, Booking, Client Records, B2B Prospecting
-- WO: WO-OVERHAUL-17 backend pass
-- Covers: crm_contacts, crm_companies, crm_activities, crm_tags,
--         booking_services, booking_service_addons, booking_staff,
--         staff_services, staff_schedules, staff_time_off,
--         appointments, appointment_history,
--         client_treatment_records, client_product_history, client_visit_summary,
--         b2b_prospects, prospect_touchpoints

-- ============================================================
-- Helper: admin check (reuse pattern from existing codebase)
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS bool AS $$
  SELECT coalesce(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    ''
  ) = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 1. crm_contacts
-- ============================================================
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_contacts_owner_select ON crm_contacts
  FOR SELECT USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY crm_contacts_owner_insert ON crm_contacts
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR is_admin());

CREATE POLICY crm_contacts_owner_update ON crm_contacts
  FOR UPDATE USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY crm_contacts_owner_delete ON crm_contacts
  FOR DELETE USING (owner_id = auth.uid() OR is_admin());

-- ============================================================
-- 2. crm_companies
-- ============================================================
ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_companies_owner_select ON crm_companies
  FOR SELECT USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY crm_companies_owner_insert ON crm_companies
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR is_admin());

CREATE POLICY crm_companies_owner_update ON crm_companies
  FOR UPDATE USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY crm_companies_owner_delete ON crm_companies
  FOR DELETE USING (owner_id = auth.uid() OR is_admin());

-- ============================================================
-- 3. crm_activities
-- ============================================================
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_activities_user_select ON crm_activities
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY crm_activities_user_insert ON crm_activities
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY crm_activities_user_update ON crm_activities
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

CREATE POLICY crm_activities_user_delete ON crm_activities
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- 4. crm_tags
-- ============================================================
ALTER TABLE crm_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_tags_auth_select ON crm_tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY crm_tags_admin_insert ON crm_tags
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY crm_tags_admin_update ON crm_tags
  FOR UPDATE USING (is_admin());

CREATE POLICY crm_tags_admin_delete ON crm_tags
  FOR DELETE USING (is_admin());

-- ============================================================
-- 5. booking_services
-- ============================================================
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

-- Public can see active services
CREATE POLICY booking_services_public_select ON booking_services
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY booking_services_owner_insert ON booking_services
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY booking_services_owner_update ON booking_services
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY booking_services_owner_delete ON booking_services
  FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- 6. booking_service_addons
-- ============================================================
ALTER TABLE booking_service_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY booking_service_addons_public_select ON booking_service_addons
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY booking_service_addons_owner_insert ON booking_service_addons
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT bs.id FROM booking_services bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY booking_service_addons_owner_update ON booking_service_addons
  FOR UPDATE USING (
    service_id IN (
      SELECT bs.id FROM booking_services bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY booking_service_addons_owner_delete ON booking_service_addons
  FOR DELETE USING (
    service_id IN (
      SELECT bs.id FROM booking_services bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- 7. booking_staff
-- ============================================================
ALTER TABLE booking_staff ENABLE ROW LEVEL SECURITY;

-- Public can see active staff who accept bookings
CREATE POLICY booking_staff_public_select ON booking_staff
  FOR SELECT USING (
    (is_active = true AND accept_bookings = true)
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY booking_staff_owner_insert ON booking_staff
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY booking_staff_owner_update ON booking_staff
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY booking_staff_owner_delete ON booking_staff
  FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- 8. staff_services
-- ============================================================
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_services_public_select ON staff_services
  FOR SELECT USING (true);

CREATE POLICY staff_services_owner_insert ON staff_services
  FOR INSERT WITH CHECK (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_services_owner_update ON staff_services
  FOR UPDATE USING (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_services_owner_delete ON staff_services
  FOR DELETE USING (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- 9. staff_schedules
-- ============================================================
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_schedules_public_select ON staff_schedules
  FOR SELECT USING (true);

CREATE POLICY staff_schedules_owner_insert ON staff_schedules
  FOR INSERT WITH CHECK (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_schedules_owner_update ON staff_schedules
  FOR UPDATE USING (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_schedules_owner_delete ON staff_schedules
  FOR DELETE USING (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- 10. staff_time_off
-- ============================================================
ALTER TABLE staff_time_off ENABLE ROW LEVEL SECURITY;

-- Staff can see their own; business owner sees all their staff
CREATE POLICY staff_time_off_select ON staff_time_off
  FOR SELECT USING (
    staff_id IN (SELECT id FROM booking_staff WHERE user_id = auth.uid())
    OR staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_time_off_owner_insert ON staff_time_off
  FOR INSERT WITH CHECK (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_time_off_owner_update ON staff_time_off
  FOR UPDATE USING (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY staff_time_off_owner_delete ON staff_time_off
  FOR DELETE USING (
    staff_id IN (
      SELECT bs.id FROM booking_staff bs
      JOIN businesses b ON bs.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- 11. appointments
-- ============================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointments_select ON appointments
  FOR SELECT USING (
    -- Client sees own
    client_id IN (SELECT id FROM crm_contacts WHERE owner_id = auth.uid())
    -- Staff sees assigned
    OR staff_id IN (SELECT id FROM booking_staff WHERE user_id = auth.uid())
    -- Business owner sees all for their business
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY appointments_insert ON appointments
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY appointments_update ON appointments
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY appointments_delete ON appointments
  FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- 12. appointment_history
-- ============================================================
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointment_history_select ON appointment_history
  FOR SELECT USING (
    appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE a.client_id IN (SELECT id FROM crm_contacts WHERE owner_id = auth.uid())
        OR a.staff_id IN (SELECT id FROM booking_staff WHERE user_id = auth.uid())
        OR a.business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
    OR is_admin()
  );

CREATE POLICY appointment_history_insert ON appointment_history
  FOR INSERT WITH CHECK (
    appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE a.business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
    OR is_admin()
  );

-- ============================================================
-- 13. client_treatment_records
-- ============================================================
ALTER TABLE client_treatment_records ENABLE ROW LEVEL SECURITY;

-- Client sees own records
CREATE POLICY treatment_records_client_select ON client_treatment_records
  FOR SELECT USING (
    client_id IN (SELECT id FROM crm_contacts WHERE owner_id = auth.uid())
    OR staff_id IN (SELECT id FROM booking_staff WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY treatment_records_staff_insert ON client_treatment_records
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT id FROM booking_staff WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY treatment_records_staff_update ON client_treatment_records
  FOR UPDATE USING (
    staff_id IN (SELECT id FROM booking_staff WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY treatment_records_admin_delete ON client_treatment_records
  FOR DELETE USING (is_admin());

-- ============================================================
-- 14. client_product_history
-- ============================================================
ALTER TABLE client_product_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_history_client_select ON client_product_history
  FOR SELECT USING (
    client_id IN (SELECT id FROM crm_contacts WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY product_history_staff_insert ON client_product_history
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' OR is_admin()
  );

CREATE POLICY product_history_staff_update ON client_product_history
  FOR UPDATE USING (
    auth.role() = 'authenticated' OR is_admin()
  );

CREATE POLICY product_history_admin_delete ON client_product_history
  FOR DELETE USING (is_admin());

-- ============================================================
-- 15. client_visit_summary
-- ============================================================
ALTER TABLE client_visit_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY visit_summary_client_select ON client_visit_summary
  FOR SELECT USING (
    client_id IN (SELECT id FROM crm_contacts WHERE owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY visit_summary_staff_select ON client_visit_summary
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY visit_summary_admin_insert ON client_visit_summary
  FOR INSERT WITH CHECK (is_admin() OR auth.role() = 'authenticated');

CREATE POLICY visit_summary_admin_update ON client_visit_summary
  FOR UPDATE USING (is_admin() OR auth.role() = 'authenticated');

CREATE POLICY visit_summary_admin_delete ON client_visit_summary
  FOR DELETE USING (is_admin());

-- ============================================================
-- 16. b2b_prospects
-- ============================================================
ALTER TABLE b2b_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY b2b_prospects_owner_select ON b2b_prospects
  FOR SELECT USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY b2b_prospects_owner_insert ON b2b_prospects
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR is_admin());

CREATE POLICY b2b_prospects_owner_update ON b2b_prospects
  FOR UPDATE USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY b2b_prospects_owner_delete ON b2b_prospects
  FOR DELETE USING (owner_id = auth.uid() OR is_admin());

-- ============================================================
-- 17. prospect_touchpoints
-- ============================================================
ALTER TABLE prospect_touchpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY prospect_touchpoints_user_select ON prospect_touchpoints
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY prospect_touchpoints_user_insert ON prospect_touchpoints
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY prospect_touchpoints_user_update ON prospect_touchpoints
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

CREATE POLICY prospect_touchpoints_user_delete ON prospect_touchpoints
  FOR DELETE USING (user_id = auth.uid() OR is_admin());
