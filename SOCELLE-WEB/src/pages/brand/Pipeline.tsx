/**
 * Unverified business listing — /brand/pipeline
 *
 * Brands can browse unverified businesses (potential resellers) and
 * "Flag as Potential Fit" to record interest (business_interest_signals).
 * Migration 10; RLS allows brand users to insert for their brand_id.
 */
import { useState } from 'react';
import { MapPin, Users, Flag, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Badge, Button, EmptyState } from '../../components/ui';

interface BusinessRow {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  state: string | null;
  verification_status: string;
  flagged: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  unverified: 'Unverified',
  pending_claim: 'Pending claim',
  pending_verification: 'Pending verification',
};

export default function BrandPipeline() {
  const { user, brandId } = useAuth();
  const queryClient = useQueryClient();
  const [flagging, setFlagging] = useState<string | null>(null);

  const { data: businesses = [], isLoading: loading } = useQuery({
    queryKey: ['brand-pipeline', brandId],
    queryFn: async () => {
      const [bizRes, signalsRes] = await Promise.all([
        supabase
          .from('businesses')
          .select('id, name, type, city, state, verification_status')
          .neq('verification_status', 'verified')
          .order('name'),
        supabase
          .from('business_interest_signals')
          .select('business_id')
          .eq('brand_id', brandId!)
          .eq('signal_type', 'potential_fit'),
      ]);

      const flaggedSet = new Set((signalsRes.data ?? []).map((r: any) => r.business_id));
      return (bizRes.data ?? []).map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        city: b.city,
        state: b.state,
        verification_status: b.verification_status || 'unverified',
        flagged: flaggedSet.has(b.id),
      }));
    },
    enabled: !!brandId,
  });

  const handleFlag = async (businessId: string) => {
    if (!user || !brandId) return;
    setFlagging(businessId);
    try {
      await supabase.from('business_interest_signals').upsert(
        {
          brand_id: brandId,
          business_id: businessId,
          user_id: user.id,
          signal_type: 'potential_fit',
        },
        { onConflict: 'business_id,brand_id,signal_type' }
      );
      queryClient.invalidateQueries({ queryKey: ['brand-pipeline', brandId] });
    } finally {
      setFlagging(null);
    }
  };

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-graphite/60 font-sans text-sm">No brand associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl text-graphite">Pipeline</h1>
        <p className="text-sm text-graphite/60 font-sans mt-1">
          Unverified businesses that could become retailers. Flag as Potential Fit to track interest.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-accent-soft divide-y divide-accent-soft/50">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-accent-soft/30" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-accent-soft/30 rounded w-48" />
                <div className="h-3 bg-accent-soft/30 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No unverified businesses yet"
          description="When the platform seeds business listings (e.g. from Google Places or admin), they will appear here. You can then flag potential fits for outreach."
        />
      ) : (
        <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="border-b border-accent-soft bg-background/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/60 uppercase tracking-wider">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/60 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-graphite/60 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft/50">
                {businesses.map(b => (
                  <tr key={b.id} className="hover:bg-background/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-graphite">{b.name}</p>
                        {b.type && <p className="text-xs text-graphite/60">{b.type}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-graphite/60">
                      {(b.city || b.state) ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {[b.city, b.state].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="gray" dot>
                        {STATUS_BADGE[b.verification_status] ?? b.verification_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {b.flagged ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                          <Check className="w-4 h-4" />
                          Flagged
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          iconLeft={<Flag className="w-3.5 h-3.5" />}
                          onClick={() => handleFlag(b.id)}
                          disabled={flagging === b.id}
                        >
                          {flagging === b.id ? 'Saving…' : 'Flag as Fit'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
