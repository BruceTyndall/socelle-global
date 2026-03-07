-- eLearning/LMS: Row Level Security for all eLearning tables
-- WO-OVERHAUL-13 backend pass

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- courses: public SELECT WHERE is_published; admin ALL
-- ============================================================
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "courses_admin_all" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- course_modules: public SELECT WHERE is_published; admin ALL
-- ============================================================
CREATE POLICY "course_modules_public_read" ON course_modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "course_modules_admin_all" ON course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- course_lessons: public SELECT WHERE is_published; admin ALL
-- ============================================================
CREATE POLICY "course_lessons_public_read" ON course_lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "course_lessons_admin_all" ON course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- scorm_packages: admin ALL; service_role for processing
-- ============================================================
CREATE POLICY "scorm_packages_admin_all" ON scorm_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- service_role bypasses RLS automatically

-- ============================================================
-- scorm_tracking: user SELECT/INSERT/UPDATE own; admin SELECT
-- ============================================================
CREATE POLICY "scorm_tracking_user_select_own" ON scorm_tracking
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "scorm_tracking_user_insert_own" ON scorm_tracking
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "scorm_tracking_user_update_own" ON scorm_tracking
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "scorm_tracking_admin_select" ON scorm_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- course_enrollments: user SELECT/UPDATE own; admin ALL
-- ============================================================
CREATE POLICY "course_enrollments_user_select_own" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "course_enrollments_user_update_own" ON course_enrollments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "course_enrollments_admin_all" ON course_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- lesson_progress: user SELECT/UPDATE own; admin SELECT
-- ============================================================
CREATE POLICY "lesson_progress_user_select_own" ON lesson_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "lesson_progress_user_update_own" ON lesson_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "lesson_progress_admin_select" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- quizzes: authenticated SELECT; admin ALL
-- ============================================================
CREATE POLICY "quizzes_authenticated_read" ON quizzes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "quizzes_admin_all" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- quiz_questions: authenticated SELECT; admin ALL
-- ============================================================
CREATE POLICY "quiz_questions_authenticated_read" ON quiz_questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_questions_admin_all" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- quiz_attempts: user SELECT/INSERT own; admin SELECT
-- ============================================================
CREATE POLICY "quiz_attempts_user_select_own" ON quiz_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "quiz_attempts_user_insert_own" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "quiz_attempts_admin_select" ON quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- certificates: user SELECT own; anon SELECT by token; admin ALL
-- ============================================================
CREATE POLICY "certificates_user_select_own" ON certificates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "certificates_anon_verify" ON certificates
  FOR SELECT USING (
    -- Public verification: only when queried by verification_token
    -- App-level filter ensures token is provided
    auth.uid() IS NULL AND verification_token IS NOT NULL
  );

CREATE POLICY "certificates_admin_all" ON certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- certificate_templates: admin ALL
-- ============================================================
CREATE POLICY "certificate_templates_admin_all" ON certificate_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin','super_admin')
    )
  );
