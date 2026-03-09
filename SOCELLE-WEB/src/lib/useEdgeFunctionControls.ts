/**
 * useEdgeFunctionControls — CTRL-WO-02: API Kill-Switch
 *
 * Reads edge_function_controls table and provides a toggle mutation
 * for enabling/disabling edge functions at runtime.
 *
 * Falls back to empty array on 42P01 (table missing).
 * Uses TanStack Query with 30-second staleTime.
 *
 * Authority: docs/operations/OPERATION_BREAKOUT.md -> CTRL-WO-02
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { logAudit } from './auditLog';

// ── Types ─────────────────────────────────────────────────────────────────

export interface EdgeFunctionControl {
  id: string;
  function_name: string;
  is_enabled: boolean;
  display_name: string;
  description: string;
  last_toggled_at: string | null;
  last_toggled_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return code === '42P01' || message.includes('does not exist');
}

// ── Data fetching ─────────────────────────────────────────────────────────

async function fetchControls(): Promise<{
  controls: EdgeFunctionControl[];
  isDemo: boolean;
}> {
  const { data, error } = await supabase
    .from('edge_function_controls')
    .select('*')
    .order('function_name', { ascending: true });

  if (error && isMissingTableError(error)) {
    return { controls: [], isDemo: true };
  }
  if (error) {
    throw error;
  }
  return { controls: (data as EdgeFunctionControl[]) ?? [], isDemo: false };
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useEdgeFunctionControls() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'edge-function-controls'],
    queryFn: fetchControls,
    staleTime: 30_000,
    gcTime: 60_000,
  });

  return {
    controls: data?.controls ?? [],
    isDemo: data?.isDemo ?? true,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useToggleEdgeFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      functionName,
      newEnabled,
    }: {
      id: string;
      functionName: string;
      newEnabled: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('edge_function_controls')
        .update({
          is_enabled: newEnabled,
          last_toggled_at: new Date().toISOString(),
          last_toggled_by: user?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Audit log the toggle
      await logAudit({
        action: 'admin.action',
        resourceType: 'edge_function',
        resourceId: id,
        details: {
          function_name: functionName,
          is_enabled: newEnabled,
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'edge-function-controls'],
      });
    },
  });
}
