-- CMS-POWER-01: Admin RLS policies for story_drafts
-- Problem: Only 2 policies existed — authenticated users see only 'published' rows,
-- service role sees all. Admins using user JWT (authenticated role) were blocked from
-- reading pending/approved/rejected drafts and from updating status (approve/reject/publish).
-- Applied: 2026-03-13

-- Policy 1: Admin SELECT all rows (all statuses)
DROP POLICY IF EXISTS "Admin can read all story_drafts" ON public.story_drafts;
CREATE POLICY "Admin can read all story_drafts"
  ON public.story_drafts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 2: Admin INSERT (edge fn uses service role, but allow admin UI too)
DROP POLICY IF EXISTS "Admin can insert story_drafts" ON public.story_drafts;
CREATE POLICY "Admin can insert story_drafts"
  ON public.story_drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Policy 3: Admin UPDATE (approve / reject / publish mutations from AdminStoryDrafts)
DROP POLICY IF EXISTS "Admin can update story_drafts" ON public.story_drafts;
CREATE POLICY "Admin can update story_drafts"
  ON public.story_drafts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy 4: Admin DELETE
DROP POLICY IF EXISTS "Admin can delete story_drafts" ON public.story_drafts;
CREATE POLICY "Admin can delete story_drafts"
  ON public.story_drafts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
