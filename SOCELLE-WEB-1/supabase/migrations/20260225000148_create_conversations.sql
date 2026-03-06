-- Migration 13: create conversations table
-- Core of the new messaging system. Replaces brand_messages as the primary conversation model.

CREATE TABLE IF NOT EXISTS conversations (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  text        NOT NULL
    CHECK (type IN ('direct', 'order_linked', 'brand_broadcast', 'platform_announcement', 'system')),
  subject               text,
  participant_one_id    uuid        REFERENCES auth.users(id),
  participant_two_id    uuid        REFERENCES auth.users(id),
  brand_id              uuid        REFERENCES brands(id),
  order_id              uuid        REFERENCES orders(id),
  last_message_at       timestamptz,
  last_message_preview  text,
  is_archived           boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Inbox queries: find all conversations for a user
CREATE INDEX IF NOT EXISTS idx_conversations_participant_one
  ON conversations(participant_one_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_two
  ON conversations(participant_two_id, last_message_at DESC);

-- Brand inbox: all conversations involving a brand
CREATE INDEX IF NOT EXISTS idx_conversations_brand_id
  ON conversations(brand_id, last_message_at DESC);

-- Order-linked conversation lookup
CREATE INDEX IF NOT EXISTS idx_conversations_order_id
  ON conversations(order_id);

-- Global inbox sort (admin view)
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON conversations(last_message_at DESC);

COMMENT ON TABLE conversations IS
  'Conversation threads. Supports direct DMs, order-linked threads, brand broadcasts, platform announcements, and system notifications.';
COMMENT ON COLUMN conversations.type IS
  'direct = 1:1 DM. order_linked = attached to a specific order. brand_broadcast = brand to all resellers. platform_announcement = Socelle to all. system = automated.';
COMMENT ON COLUMN conversations.participant_one_id IS
  'For direct conversations. Convention: lower UUID goes here, higher UUID in participant_two.';
COMMENT ON COLUMN conversations.last_message_preview IS
  'Truncated preview of the last message body. Updated by trigger or application layer on each new message.';
