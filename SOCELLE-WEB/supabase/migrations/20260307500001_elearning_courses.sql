-- eLearning/LMS: Core course structure (courses, modules, lessons)
-- WO-OVERHAUL-13 backend pass

-- ============================================================
-- TABLE: courses
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text UNIQUE NOT NULL,
  description     text,
  short_description text,
  thumbnail_url   text,
  trailer_video_url text,
  author_id       uuid,
  category        text[] DEFAULT '{}',
  tags            text[] DEFAULT '{}',
  level           text CHECK (level IN ('beginner','intermediate','advanced','expert')),
  language        text DEFAULT 'en',
  is_published    bool DEFAULT false,
  is_featured     bool DEFAULT false,
  is_free         bool DEFAULT true,
  price_cents     int DEFAULT 0,
  estimated_duration_minutes int,
  ce_credits      numeric,
  ce_credit_type  text,
  certificate_template_id uuid,
  scorm_package_url text,
  version         text DEFAULT '1.0',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: course_modules
-- ============================================================
CREATE TABLE IF NOT EXISTS course_modules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  sort_order      int DEFAULT 0,
  is_published    bool DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: course_lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS course_lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id       uuid NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  sort_order      int DEFAULT 0,
  lesson_type     text NOT NULL CHECK (lesson_type IN ('video','text','quiz','scorm','interactive','assignment','live_session')),
  content_url     text,
  content_body    jsonb,
  duration_seconds int,
  is_preview      bool DEFAULT false,
  is_published    bool DEFAULT false,
  scorm_data      jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_sort ON course_modules(course_id, sort_order);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_sort ON course_lessons(module_id, sort_order);
