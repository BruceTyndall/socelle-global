-- 20260313000039_nextgen_social_comments.sql
-- Creates the global_comments table to support the GlobalCommentThread component
-- across Intelligence Signals, Courses, and other entities.

CREATE TABLE IF NOT EXISTS global_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL, -- Flexible ID to attach to signals, courses, products
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast retrieval by topic
CREATE INDEX IF NOT EXISTS idx_global_comments_topic ON global_comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_global_comments_created ON global_comments(created_at DESC);

-- Enable RLS
ALTER TABLE global_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read comments"
    ON global_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON global_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON global_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON global_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Like tracking table to prevent double-voting
CREATE TABLE IF NOT EXISTS global_comment_likes (
    comment_id UUID REFERENCES global_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

-- Enable RLS on likes
ALTER TABLE global_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
    ON global_comment_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their likes"
    ON global_comment_likes FOR ALL
    USING (auth.uid() = user_id);

-- Function to handle liking and incrementing the count atomically
CREATE OR REPLACE FUNCTION toggle_comment_like(target_comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    uid UUID := auth.uid();
    exists BOOLEAN;
BEGIN
    if uid is null then
        raise exception 'Not authenticated';
    end if;

    SELECT TRUE INTO exists FROM global_comment_likes WHERE comment_id = target_comment_id AND user_id = uid;

    IF exists THEN
        DELETE FROM global_comment_likes WHERE comment_id = target_comment_id AND user_id = uid;
        UPDATE global_comments SET likes = likes - 1 WHERE id = target_comment_id;
    ELSE
        INSERT INTO global_comment_likes (comment_id, user_id) VALUES (target_comment_id, uid);
        UPDATE global_comments SET likes = likes + 1 WHERE id = target_comment_id;
    END IF;
END;
$$;
