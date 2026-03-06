/*
  # Modify brand_messages: add threading, attachments, and broadcast support

  The existing brand_messages table stores flat, unrelated messages.
  This migration adds:

    thread_id    — groups messages into conversations. The sender of the
                   first message in a thread generates this value and passes
                   it; all replies use the same thread_id. Indexed for fast
                   conversation loading.

    subject      — set on the first message of a thread only. Replies
                   inherit the thread subject in the application layer;
                   the column is NULL on reply rows.

    attachment_url — single Supabase Storage URL per message. For product
                   spec sheets, protocol cards, images. NULL = no attachment.

    is_broadcast — when true, this message was sent by a brand to all of
                   their resellers simultaneously. business_id will be NULL
                   on broadcast rows; the application fan-out creates one
                   row per recipient. Alternatively the UI filters broadcast
                   messages to show them to all relevant businesses.

  Realtime note:
    No schema change is required to enable Supabase Realtime on this table.
    After applying this migration, enable it in the Supabase dashboard under
    Database → Replication → brand_messages, or via:
      ALTER PUBLICATION supabase_realtime ADD TABLE brand_messages;
    The application's Messages component then subscribes with:
      supabase.channel('brand_messages').on('postgres_changes', ...).subscribe()
*/

-- ─────────────────────────────────────────────
-- 1. ADD NEW COLUMNS
-- ─────────────────────────────────────────────

ALTER TABLE brand_messages
  ADD COLUMN IF NOT EXISTS thread_id      uuid        DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS subject        text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS attachment_url text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_broadcast   boolean     NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────
-- 2. BACKFILL thread_id FOR EXISTING MESSAGES
--    Each existing standalone message becomes its own thread.
--    This preserves existing data while making the column non-null
--    in practice (DEFAULT gen_random_uuid() handles new inserts).
-- ─────────────────────────────────────────────

UPDATE brand_messages
SET thread_id = gen_random_uuid()
WHERE thread_id IS NULL;

-- ─────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────

-- Primary conversation query: all messages in a thread, ordered by time
CREATE INDEX IF NOT EXISTS idx_brand_messages_thread
  ON brand_messages (thread_id, created_at ASC);

-- Inbox query: latest message per thread for a brand (conversation list view)
CREATE INDEX IF NOT EXISTS idx_brand_messages_brand_thread
  ON brand_messages (brand_id, thread_id, created_at DESC);

-- Business inbox: threads involving a specific business
CREATE INDEX IF NOT EXISTS idx_brand_messages_business_thread
  ON brand_messages (business_id, thread_id, created_at DESC)
  WHERE business_id IS NOT NULL;

-- Broadcast messages: brand fetches all broadcasts (business_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_brand_messages_broadcast
  ON brand_messages (brand_id, created_at DESC)
  WHERE is_broadcast = true;

-- Unread count: messages where read_at IS NULL for the recipient
CREATE INDEX IF NOT EXISTS idx_brand_messages_unread
  ON brand_messages (business_id, read_at)
  WHERE read_at IS NULL AND business_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- 4. ENABLE SUPABASE REALTIME
-- ─────────────────────────────────────────────

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE brand_messages;
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- 5. COMMENTS
-- ─────────────────────────────────────────────

COMMENT ON COLUMN brand_messages.thread_id IS
  'Groups messages into a conversation thread. The first message in a '
  'thread generates this value; all replies use the same thread_id. '
  'Existing messages were each backfilled with a unique thread_id '
  '(each becomes its own single-message thread).';

COMMENT ON COLUMN brand_messages.subject IS
  'Thread subject line. Set on the first message only; NULL on replies. '
  'Application displays the parent subject for all messages in a thread.';

COMMENT ON COLUMN brand_messages.attachment_url IS
  'Supabase Storage public URL for a single file attachment. '
  'Store files in the brand-assets bucket under a messages/ prefix.';

COMMENT ON COLUMN brand_messages.is_broadcast IS
  'True when this message was sent by a brand to all their resellers. '
  'business_id is NULL on broadcast rows. Application shows broadcast '
  'messages in the inbox of every business that has interacted with this brand.';
