import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth';
import { isSupabaseConfigured, supabase } from '../supabase';
import {
  mergeSmartFillContext,
  type SmartFillContext,
} from './studioTemplateVariables';

interface SmartFillState {
  context: SmartFillContext;
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
}

export function useStudioSmartFill(): SmartFillState {
  const { user, profile } = useAuth();

  const query = useQuery({
    queryKey: ['studio-smart-fill', user?.id, profile?.business_id, profile?.brand_id],
    enabled: isSupabaseConfigured && !!user?.id,
    queryFn: async () => {
      const businessId = profile?.business_id;
      const brandId = profile?.brand_id;

      const [businessRes, brandRes, signalRes] = await Promise.all([
        businessId
          ? supabase
              .from('businesses')
              .select('name, city')
              .eq('id', businessId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        brandId
          ? supabase
              .from('brands')
              .select('name, theme')
              .eq('id', brandId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from('market_signals')
          .select('title, magnitude, direction')
          .eq('active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (businessRes.error && businessRes.error.code !== 'PGRST116') {
        throw new Error(businessRes.error.message);
      }
      if (brandRes.error && brandRes.error.code !== 'PGRST116') {
        throw new Error(brandRes.error.message);
      }
      if (signalRes.error && signalRes.error.code !== 'PGRST116') {
        throw new Error(signalRes.error.message);
      }

      const businessName =
        businessRes.data?.name ??
        profile?.spa_name ??
        (typeof user?.user_metadata?.spa_name === 'string'
          ? user.user_metadata.spa_name
          : null) ??
        null;

      const city =
        businessRes.data?.city ??
        (typeof user?.user_metadata?.city === 'string'
          ? user.user_metadata.city
          : null) ??
        null;

      const brandTheme = (brandRes.data?.theme ?? null) as
        | Record<string, unknown>
        | null;

      const brandPrimary =
        typeof brandTheme?.primary === 'string'
          ? brandTheme.primary
          : typeof brandTheme?.primaryColor === 'string'
            ? brandTheme.primaryColor
            : '#6E879B';

      const signalMetric = signalRes.data
        ? `${signalRes.data.title} (${signalRes.data.direction} ${signalRes.data.magnitude})`
        : null;

      return {
        business_name: businessName ?? 'Your Business',
        city: city ?? 'Your City',
        offer: 'Limited-time pro treatment package',
        price: '$99',
        date: new Date().toLocaleDateString('en-US'),
        cta: 'Book now',
        brand_kit: {
          primary: brandPrimary,
        },
        signal: {
          metric: signalMetric ?? 'Latest signal value',
        },
      } satisfies SmartFillContext;
    },
  });

  const context = mergeSmartFillContext(query.data);

  return {
    context,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    isLive: !!query.data,
  };
}
