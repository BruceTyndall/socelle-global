-- eLearning/LMS: Quizzes, questions, and attempts
-- WO-OVERHAUL-13 backend pass

-- ============================================================
-- TABLE: quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id                uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id                uuid REFERENCES courses(id) ON DELETE CASCADE,
  title                    text NOT NULL,
  instructions             text,
  passing_score_pct        numeric DEFAULT 70,
  max_attempts             int DEFAULT 3,
  time_limit_seconds       int,
  shuffle_questions        bool DEFAULT false,
  show_results_immediately bool DEFAULT true,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: quiz_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text   text NOT NULL,
  question_type   text NOT NULL CHECK (question_type IN ('multiple_choice','true_false','short_answer','matching','ordering')),
  options         jsonb,
  correct_answer  jsonb,
  explanation     text,
  points          numeric DEFAULT 1,
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: quiz_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,
  enrollment_id   uuid REFERENCES course_enrollments(id),
  attempt_number  int NOT NULL,
  score_pct       numeric,
  passed          bool,
  answers         jsonb,
  time_spent_seconds int,
  started_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_sort ON quiz_questions(quiz_id, sort_order);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
