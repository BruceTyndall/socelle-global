-- CMS-POWER-01: publish_story_draft RPC
-- Promotes an approved story_draft to a published cms_post.
-- Called by AdminStoryDrafts.tsx via supabase.rpc('publish_story_draft', { p_draft_id })
-- Security: SECURITY DEFINER, admin-only via is_admin()
-- Applied: 2026-03-13

CREATE OR REPLACE FUNCTION public.publish_story_draft(
  p_draft_id   uuid,
  p_space_slug text DEFAULT 'intelligence'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draft      public.story_drafts%ROWTYPE;
  v_space_id   uuid;
  v_post_id    uuid;
  v_slug       text;
  v_base_slug  text;
  v_counter    int := 0;
BEGIN
  -- Admin-only gate
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  -- Fetch the approved draft
  SELECT * INTO v_draft
  FROM public.story_drafts
  WHERE id = p_draft_id AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found or not in approved status (id: %)', p_draft_id;
  END IF;

  -- Resolve target CMS space
  SELECT id INTO v_space_id
  FROM public.cms_spaces
  WHERE slug = p_space_slug;

  IF v_space_id IS NULL THEN
    RAISE EXCEPTION 'CMS space not found: %', p_space_slug;
  END IF;

  -- Generate a unique slug from title or existing slug
  v_base_slug := COALESCE(
    v_draft.slug,
    regexp_replace(lower(v_draft.title), '[^a-z0-9]+', '-', 'g')
  );
  -- Strip leading/trailing hyphens
  v_base_slug := regexp_replace(regexp_replace(v_base_slug, '^-+', ''), '-+$', '');
  -- Truncate to 200 chars
  v_base_slug := substring(v_base_slug, 1, 200);

  v_slug := v_base_slug;
  WHILE EXISTS (
    SELECT 1 FROM public.cms_posts WHERE slug = v_slug AND space_id = v_space_id
  ) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter;
  END LOOP;

  -- Promote draft → cms_post (published)
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
    source_type,
    metadata
  ) VALUES (
    v_space_id,
    v_draft.title,
    v_slug,
    v_draft.excerpt,
    v_draft.body,
    COALESCE(v_draft.hero_image, v_draft.hero_image_url),   -- RSS hero first, CMS hero fallback
    v_draft.reviewed_by,                                     -- reviewer becomes author
    v_draft.category,
    COALESCE(v_draft.tags, '{}'),
    'published',
    NOW(),
    'rss_draft',
    jsonb_build_object(
      'vertical',    v_draft.vertical,
      'source_url',  v_draft.source_url,
      'source_name', v_draft.source_name,
      'rss_item_id', v_draft.rss_item_id::text,
      'quality_score', v_draft.quality_score
    )
  )
  RETURNING id INTO v_post_id;

  -- Mark draft published + link to cms_post
  UPDATE public.story_drafts
  SET
    status           = 'published',
    promoted_post_id = v_post_id,
    published_at     = NOW()
  WHERE id = p_draft_id;

  RETURN v_post_id;
END;
$$;

-- Grant execute to authenticated users (RLS on story_drafts + is_admin() check enforces security)
GRANT EXECUTE ON FUNCTION public.publish_story_draft(uuid, text) TO authenticated;
