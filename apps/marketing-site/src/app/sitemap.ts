import type { MetadataRoute } from 'next';
import { supabase, isSupabaseConfigured } from '@socelle/supabase-config';

const BASE = 'https://socelle.com';

// ── Static routes ────────────────────────────────────────────────────────────
// These never go stale — always include them.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/intelligence`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.95 },
    { url: `${BASE}/professionals`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/brands`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/for-brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/education`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/plans`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/request-access`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
];

// ── Dynamic routes ───────────────────────────────────────────────────────────
// Fetched from Supabase at build time / ISR revalidation
// Brand, job, and event slugs injected here for programmatic SEO coverage.

async function fetchBrandSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    if (!isSupabaseConfigured) return [];
    try {
        const { data, error } = await supabase
            .from('brands')
            .select('slug, updated_at')
            .eq('status', 'active')
            .not('slug', 'is', null);
        if (error) { console.error('Sitemap: brand fetch error', error.message); return []; }
        return (data ?? []).map((b: { slug: string; updated_at: string }) => ({ slug: b.slug, updatedAt: b.updated_at }));
    } catch {
        return [];
    }
}

async function fetchJobSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    if (!isSupabaseConfigured) return [];
    try {
        const { data, error } = await supabase
            .from('job_postings')
            .select('slug, posted_at')
            .eq('active', true)
            .not('slug', 'is', null);
        if (error) { console.error('Sitemap: job fetch error', error.message); return []; }
        return (data ?? []).map((j: { slug: string; posted_at: string }) => ({ slug: j.slug, updatedAt: j.posted_at }));
    } catch {
        return [];
    }
}

async function fetchEventSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    if (!isSupabaseConfigured) return [];
    try {
        const { data, error } = await supabase
            .from('events')
            .select('id, date')
            .order('date', { ascending: true });
        if (error) { console.error('Sitemap: event fetch error', error.message); return []; }
        return (data ?? []).map((e: { id: string; date: string }) => ({ slug: e.id, updatedAt: e.date }));
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [brands, jobs, events] = await Promise.all([
        fetchBrandSlugs(),
        fetchJobSlugs(),
        fetchEventSlugs(),
    ]);

    const brandRoutes: MetadataRoute.Sitemap = brands.map(({ slug, updatedAt }) => ({
        url: `${BASE}/brands/${slug}`,
        lastModified: new Date(updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const jobRoutes: MetadataRoute.Sitemap = jobs.map(({ slug, updatedAt }) => ({
        url: `${BASE}/jobs/${slug}`,
        lastModified: new Date(updatedAt),
        changeFrequency: 'daily',
        priority: 0.85,
    }));

    const eventRoutes: MetadataRoute.Sitemap = events.map(({ slug, updatedAt }) => ({
        url: `${BASE}/events/${slug}`,
        lastModified: new Date(updatedAt),
        changeFrequency: 'daily',
        priority: 0.8,
    }));

    return [...STATIC_ROUTES, ...brandRoutes, ...jobRoutes, ...eventRoutes];
}
