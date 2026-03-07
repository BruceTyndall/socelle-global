import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Deal Activities Hook ─────────────────
// Data source: deal_activities table (LIVE when DB-connected)

export interface DealActivity {
  id: string;
  deal_id: string;
  activity_type: string; // call, email, meeting, note
  description: string;
  performed_by: string | null;
  performed_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NewDealActivity {
  deal_id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export function useDealActivities(dealId: string | undefined) {
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!dealId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('performed_at', { ascending: false });
      if (dbErr) throw dbErr;
      setActivities(data ?? []);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setActivities([]);
      } else {
        setError('Failed to load activities.');
      }
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  const addActivity = useCallback(async (activity: NewDealActivity) => {
    const { data, error: dbErr } = await supabase
      .from('deal_activities')
      .insert([{ ...activity, performed_at: new Date().toISOString() }])
      .select()
      .single();
    if (dbErr) throw dbErr;
    setActivities((prev) => [data as DealActivity, ...prev]);
    return data as DealActivity;
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('deal_activities')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { activities, loading, error, isLive, reload: load, addActivity, deleteActivity };
}
