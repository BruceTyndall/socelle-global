-- eLearning/LMS: SCORM packages and tracking
-- WO-OVERHAUL-13 backend pass

-- ============================================================
-- TABLE: scorm_packages
-- ============================================================
CREATE TABLE IF NOT EXISTS scorm_packages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id       uuid REFERENCES course_lessons(id),
  package_name    text NOT NULL,
  version         text CHECK (version IN ('1.2','2004')),
  manifest_url    text,
  launch_url      text,
  file_size_bytes bigint,
  upload_status   text DEFAULT 'pending' CHECK (upload_status IN ('pending','processing','ready','failed')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: scorm_tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS scorm_tracking (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorm_package_id  uuid NOT NULL REFERENCES scorm_packages(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL,
  enrollment_id     uuid,
  session_id        text,
  completion_status text DEFAULT 'unknown' CHECK (completion_status IN ('unknown','not_attempted','incomplete','completed','passed','failed')),
  success_status    text DEFAULT 'unknown' CHECK (success_status IN ('unknown','passed','failed')),
  score_raw         numeric,
  score_min         numeric,
  score_max         numeric,
  score_scaled      numeric,
  total_time_seconds int DEFAULT 0,
  suspend_data      text,
  lesson_location   text,
  interactions      jsonb DEFAULT '[]',
  last_accessed_at  timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scorm_packages_course_id ON scorm_packages(course_id);
CREATE INDEX idx_scorm_packages_lesson_id ON scorm_packages(lesson_id);
CREATE INDEX idx_scorm_tracking_package_id ON scorm_tracking(scorm_package_id);
CREATE INDEX idx_scorm_tracking_user_id ON scorm_tracking(user_id);
CREATE INDEX idx_scorm_tracking_enrollment ON scorm_tracking(enrollment_id);
