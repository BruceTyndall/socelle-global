-- Migration 15: create message_read_status table
-- Per-user, per-conversation read tracking for unread badge counts

CREATE TABLE IF NOT EXISTS message_read_status (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

-- Inbox unread count query: get all conversations for a user
CREATE INDEX IF NOT EXISTS idx_message_read_status_user
  ON message_read_status(user_id);

CREATE INDEX IF NOT EXISTS idx_message_read_status_conversation
  ON message_read_status(conversation_id);

COMMENT ON TABLE message_read_status IS
  'Tracks each user''s read position per conversation. Unread count = messages.created_at > message_read_status.last_read_at for that conversation.';
COMMENT ON COLUMN message_read_status.last_read_at IS
  'Timestamp of the most recent message the user has seen. Updated by application when user opens a conversation.';
