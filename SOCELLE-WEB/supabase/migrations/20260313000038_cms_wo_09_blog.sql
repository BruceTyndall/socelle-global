-- Migration for CMS-WO-09: WordPress-grade blog enhancements
-- Add scheduled_at to cms_posts
ALTER TABLE public.cms_posts
ADD COLUMN scheduled_at TIMESTAMPTZ,
ADD COLUMN seo_twitter_card TEXT;

-- Update the auto-sitemap function if we want to add posts to sitemap_entries automatically, or we can just handle it in the application logic.
-- Actually, we can create a trigger to auto-add to sitemap_entries.

CREATE OR REPLACE FUNCTION public.handle_cms_post_sitemap()
RETURNS trigger AS $$
BEGIN
    -- If post just published, insert or update sitemap
    IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published' OR OLD.slug IS DISTINCT FROM NEW.slug) THEN
        INSERT INTO public.sitemap_entries (id, entity_type, entity_id, url_path, changefreq, priority, lastmod)
        VALUES (
            gen_random_uuid(),
            'cms_post',
            NEW.id,
            '/blog/' || NEW.slug,
            'weekly',
            0.7,
            COALESCE(NEW.updated_at, now())
        )
        ON CONFLICT (entity_type, entity_id) 
        DO UPDATE SET 
            url_path = EXCLUDED.url_path,
            lastmod = EXCLUDED.lastmod;
    END IF;

    -- If post is unpublished or archived, delete from sitemap
    IF NEW.status != 'published' AND OLD.status = 'published' THEN
        DELETE FROM public.sitemap_entries WHERE entity_type = 'cms_post' AND entity_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_cms_post_sitemap ON public.cms_posts;
CREATE TRIGGER tr_cms_post_sitemap
AFTER INSERT OR UPDATE ON public.cms_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_cms_post_sitemap();

-- Also handle deletion of posts
CREATE OR REPLACE FUNCTION public.handle_cms_post_sitemap_delete()
RETURNS trigger AS $$
BEGIN
    DELETE FROM public.sitemap_entries WHERE entity_type = 'cms_post' AND entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_cms_post_sitemap_delete ON public.cms_posts;
CREATE TRIGGER tr_cms_post_sitemap_delete
BEFORE DELETE ON public.cms_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_cms_post_sitemap_delete();
