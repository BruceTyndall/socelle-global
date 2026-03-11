-- CMS-WO-08: Editorial approval workflow RPC
-- Promotes an approved story draft to the cms_posts table securely

CREATE OR REPLACE FUNCTION public.publish_story_draft(
  p_draft_id UUID,
  p_space_slug TEXT DEFAULT 'intelligence'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_draft public.story_drafts%ROWTYPE;
  v_space_id UUID;
  v_post_id UUID;
  v_slug TEXT;
BEGIN
  -- 1. Ensure the user is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Fetch the approved draft
  SELECT * INTO v_draft
  FROM public.story_drafts
  WHERE id = p_draft_id AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found or not in approved status';
  END IF;

  -- 3. Fetch the target space
  SELECT id INTO v_space_id
  FROM public.cms_spaces
  WHERE slug = p_space_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Space % not found', p_space_slug;
  END IF;

  -- 4. Generate a unique slug
  v_slug := regexp_replace(lower(v_draft.title), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug) || '-' || substr(md5(random()::text), 1, 6);

  -- 5. Insert the promoted post
  INSERT INTO public.cms_posts (
    space_id,
    title,
    slug,
    excerpt,
    body,
    hero_image,
    author_id,
    category,
    tags,
    status,
    published_at,
    source_type
  ) VALUES (
    v_space_id,
    v_draft.title,
    v_slug,
    v_draft.excerpt,
    COALESCE(v_draft.body, v_draft.excerpt),
    v_draft.hero_image,
    v_draft.reviewed_by, -- Assuming the reviewer becomes the author
    v_draft.vertical,   -- Mapping vertical to category
    v_draft.tags,
    'published',
    now(),
    'rss_draft'
  ) RETURNING id INTO v_post_id;

  -- 6. Link the post to the draft and mark as published
  UPDATE public.story_drafts
  SET 
    status = 'published',
    promoted_post_id = v_post_id,
    updated_at = now()
  WHERE id = p_draft_id;

  RETURN v_post_id;
END;
$$;
