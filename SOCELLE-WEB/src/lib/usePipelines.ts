import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Pipeline Hook ────────────────────────
// Data source: sales_pipelines + pipeline_stages (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  const { data: pipelines = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['sales_pipelines'],
    queryFn: async () => {
      const { data: pData, error: pErr } = await supabase
        .from('sales_pipelines')
        .select('id, name, description, is_default, created_at, updated_at')
        .order('created_at', { ascending: true });
      if (pErr) {
        const msg = pErr.message.toLowerCase();
        if (msg.includes('does not exist') || pErr.code === '42P01') return [];
        throw new Error(pErr.message);
      }

      const { data: sData, error: sErr } = await supabase
        .from('pipeline_stages')
        .select('id, pipeline_id, name, position, color, is_won, is_lost, created_at')
        .order('position', { ascending: true });
      if (sErr) throw new Error(sErr.message);

      const stages = (sData ?? []) as PipelineStage[];
      return (pData ?? []).map((p): Pipeline => ({
        ...p,
        stages: stages.filter((s) => s.pipeline_id === p.id),
      }));
    },
  });

  const isLive = pipelines.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { pipelines, loading, error, isLive, reload };
}
