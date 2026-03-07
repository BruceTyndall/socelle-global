import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Pipeline Hook ────────────────────────
// Data source: sales_pipelines + pipeline_stages (LIVE when DB-connected)

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string | null;
  is_won: boolean;
  is_lost: boolean;
  created_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  stages: PipelineStage[];
}

export function usePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: pData, error: pErr } = await supabase
        .from('sales_pipelines')
        .select('id, name, description, is_default, created_at, updated_at')
        .order('created_at', { ascending: true });
      if (pErr) throw pErr;

      const { data: sData, error: sErr } = await supabase
        .from('pipeline_stages')
        .select('id, pipeline_id, name, position, color, is_won, is_lost, created_at')
        .order('position', { ascending: true });
      if (sErr) throw sErr;

      const stages = sData ?? [];
      const result: Pipeline[] = (pData ?? []).map((p) => ({
        ...p,
        stages: stages.filter((s) => s.pipeline_id === p.id),
      }));
      setPipelines(result);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setPipelines([]);
      } else {
        setError('Failed to load pipelines.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { pipelines, loading, error, isLive, reload: load };
}
