-- eLearning/LMS: Enrollments and lesson progress
-- WO-OVERHAUL-13 backend pass

-- ============================================================
-- TABLE: course_enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id             uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL,
  enrolled_at           timestamptz DEFAULT now(),
  completed_at          timestamptz,
  progress_pct          numeric DEFAULT 0,
  status                text DEFAULT 'enrolled' CHECK (status IN ('enrolled','in_progress','completed','expired')),
  expires_at            timestamptz,
  certificate_issued_at timestamptz,
  certificate_url       text,
  ce_credits_earned     numeric,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- ============================================================
-- TABLE: lesson_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   uuid NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id       uuid NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,
  status          text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  progress_pct    numeric DEFAULT 0,
  time_spent_seconds int DEFAULT 0,
  completed_at    timestamptz,
  score           numeric,
  attempts        int DEFAULT 0,
  last_accessed_at timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
