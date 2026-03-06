-- Migration 14: create messages table
-- Individual messages within a conversation thread

CREATE TABLE IF NOT EXISTS messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid        REFERENCES auth.users(id),
  sender_role     text,
  body            text        NOT NULL,
  body_html       text,
  attachments     jsonb       NOT NULL DEFAULT '[]',
  read_at         timestamptz,
  edited_at       timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Primary query: all messages in a conversation, ordered by time
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON messages(sender_id);

-- Unread messages query
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(conversation_id, created_at)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE messages IS
  'Individual messages within a conversation. Soft-delete only — deleted_at is set, body replaced with "This message was deleted".';
COMMENT ON COLUMN messages.sender_id IS
  'NULL for system-generated messages (automated notifications, order status updates).';
COMMENT ON COLUMN messages.sender_role IS
  'Role of the sender at the time of sending. Stored for audit trail since roles can change.';
COMMENT ON COLUMN messages.attachments IS
  'Array of attachment metadata objects: [{url, filename, size_bytes, mime_type}]. Phase 1: images + PDFs only.';
COMMENT ON COLUMN messages.body_html IS
  'Rich HTML version of the message body. NULL in Phase 1 — reserved for Phase 2 rich text editor.';
