-- eLearning/LMS: Certificates and certificate templates
-- WO-OVERHAUL-13 backend pass

-- ============================================================
-- TABLE: certificate_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS certificate_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  html_template   text NOT NULL,
  thumbnail_url   text,
  is_default      bool DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id       uuid REFERENCES course_enrollments(id),
  user_id             uuid NOT NULL,
  course_id           uuid REFERENCES courses(id),
  certificate_number  text UNIQUE NOT NULL,
  issued_at           timestamptz DEFAULT now(),
  expires_at          timestamptz,
  ce_credits_awarded  numeric,
  certificate_url     text,
  verification_token  text UNIQUE NOT NULL,
  created_at          timestamptz DEFAULT now()
);

-- Add FK from courses to certificate_templates now that both tables exist
ALTER TABLE courses
  ADD CONSTRAINT fk_courses_certificate_template
  FOREIGN KEY (certificate_template_id) REFERENCES certificate_templates(id);

-- Indexes
CREATE INDEX idx_certificates_enrollment_id ON certificates(enrollment_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_verification ON certificates(verification_token);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificate_templates_default ON certificate_templates(is_default);
