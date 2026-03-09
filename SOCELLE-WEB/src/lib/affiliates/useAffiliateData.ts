import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

// ── V2-HUBS-13: Affiliate Engine — Affiliate Data Hook ───────────────────
// Data source: affiliate_links + commission_payouts (LIVE when DB-connected)
// Falls back to DEMO data with isLive=false when tables do not exist.
// Migrated to TanStack Query v5.

export interface AffiliateLink {
  id: string;
  product_name: string;
  product_category: string;
  original_url: string;
  affiliate_url: string;
  clicks: number;
  conversions: number;
  commission_earned: number;
  created_at: string;
}

export interface AffiliateMetrics {
  total_earned: number;
  pending_payouts: number;
  active_links: number;
  click_through_rate: number;
}

const DEMO_LINKS: AffiliateLink[] = [
  { id: 'afl-1', product_name: 'HydraGlow Vitamin C Serum', product_category: 'Skincare', original_url: 'https://brand.example.com/products/hydraglow-vc', affiliate_url: 'https://socelle.com/go/afl-1', clicks: 342, conversions: 28, commission_earned: 840.00, created_at: '2026-02-15T10:00:00Z' },
  { id: 'afl-2', product_name: 'DermaLux LED Panel Pro', product_category: 'Devices', original_url: 'https://brand.example.com/products/dermalux-led', affiliate_url: 'https://socelle.com/go/afl-2', clicks: 187, conversions: 12, commission_earned: 1440.00, created_at: '2026-02-20T14:30:00Z' },
  { id: 'afl-3', product_name: 'BioRepair Peptide Cream', product_category: 'Skincare', original_url: 'https://brand.example.com/products/biorepair-peptide', affiliate_url: 'https://socelle.com/go/afl-3', clicks: 521, conversions: 45, commission_earned: 675.00, created_at: '2026-01-10T09:15:00Z' },
  { id: 'afl-4', product_name: 'MicroNeedle Cartridge Pack (50)', product_category: 'Consumables', original_url: 'https://brand.example.com/products/microneedle-50', affiliate_url: 'https://socelle.com/go/afl-4', clicks: 98, conversions: 19, commission_earned: 285.00, created_at: '2026-03-01T11:45:00Z' },
  { id: 'afl-5', product_name: 'Pro Extraction Kit', product_category: 'Tools', original_url: 'https://brand.example.com/products/extraction-kit', affiliate_url: 'https://socelle.com/go/afl-5', clicks: 64, conversions: 5, commission_earned: 125.00, created_at: '2026-03-05T16:20:00Z' },
  { id: 'afl-6', product_name: 'NeuroTox Training Course Bundle', product_category: 'Education', original_url: 'https://brand.example.com/products/neurotox-bundle', affiliate_url: 'https://socelle.com/go/afl-6', clicks: 215, conversions: 31, commission_earned: 1550.00, created_at: '2026-02-28T08:00:00Z' },
];

const DEMO_METRICS: AffiliateMetrics = {
  total_earned: 4915.00,
  pending_payouts: 1675.00,
  active_links: 6,
  click_through_rate: 9.8,
};

export function useAffiliateData(categoryFilter?: string) {
  const { data, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['affiliate_data', categoryFilter],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') {
          const filtered = categoryFilter
            ? DEMO_LINKS.filter((l) => l.product_category === categoryFilter)
            : DEMO_LINKS;
          return { links: filtered, metrics: DEMO_METRICS, isLive: false };
        }
        throw new Error(error.message);
      }

      const allLinks = (rows ?? []) as AffiliateLink[];
      const filtered = categoryFilter
        ? allLinks.filter((l) => l.product_category === categoryFilter)
        : allLinks;

      const totalClicks = allLinks.reduce((s, l) => s + l.clicks, 0);
      const totalConversions = allLinks.reduce((s, l) => s + l.conversions, 0);

      const metrics: AffiliateMetrics = {
        total_earned: allLinks.reduce((s, l) => s + l.commission_earned, 0),
        pending_payouts: 0, // Would come from commission_payouts table
        active_links: allLinks.length,
        click_through_rate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 1000) / 10 : 0,
      };

      return { links: filtered, metrics, isLive: true };
    },
  });

  return {
    links: data?.links ?? DEMO_LINKS,
    metrics: data?.metrics ?? DEMO_METRICS,
    isLive: data?.isLive ?? false,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    reload,
  };
}
