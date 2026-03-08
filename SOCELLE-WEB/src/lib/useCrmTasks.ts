import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── CRM Tasks Hook ──────────────────────────────────────────────────────
// Data source: crm_tasks table (LIVE when DB-connected)
// TanStack Query v5 pattern (V2-HUBS-06).

export interface CrmTask {
  id: string;
  business_id: string;
  contact_id: string | null;
  company_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  assignee_id: string | null;
  assignee_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewCrmTask {
  business_id: string;
  contact_id?: string;
  company_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  assignee_id?: string;
  assignee_name?: string;
}

export function useCrmTasks(businessId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['crm_tasks', businessId];

  const { data: tasks = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*')
        .eq('business_id', businessId!)
        .order('due_date', { ascending: true });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CrmTask[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (task: NewCrmTask) => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .insert({ ...task, status: task.status ?? 'open', priority: task.priority ?? 'medium' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CrmTask;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewCrmTask> }) => {
      const { error } = await supabase
        .from('crm_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_tasks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createTask = async (task: NewCrmTask) => createMut.mutateAsync(task);
  const updateTask = async (id: string, updates: Partial<NewCrmTask>) => updateMut.mutateAsync({ id, updates });
  const deleteTask = async (id: string) => deleteMut.mutateAsync(id);
  const completeTask = async (id: string) => updateTask(id, { status: 'completed' });

  const isLive = tasks.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { tasks, loading, error, isLive, reload, createTask, updateTask, deleteTask, completeTask };
}

export function useCrmTasksForContact(contactId?: string) {
  const { data: tasks = [], isLoading: loading, refetch: reload } = useQuery({
    queryKey: ['crm_tasks_contact', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*')
        .eq('contact_id', contactId!)
        .order('due_date', { ascending: true });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CrmTask[];
    },
    enabled: !!contactId,
  });

  const isLive = tasks.length > 0;

  return { tasks, loading, isLive, reload };
}

export function useOverdueTasks(businessId?: string | null) {
  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ['crm_tasks_overdue', businessId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*')
        .eq('business_id', businessId!)
        .neq('status', 'completed')
        .lt('due_date', now)
        .order('due_date', { ascending: true });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CrmTask[];
    },
    enabled: !!businessId,
  });

  return { tasks, loading };
}
