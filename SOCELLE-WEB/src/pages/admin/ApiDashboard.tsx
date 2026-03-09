import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Code,
  Activity,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  ShieldOff,
  Power,
  PowerOff,
  TestTube2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  StatCard,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Th,
  Td,
} from '../../components/ui';
import { useToast } from '../../components/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type ApiCategory =
  | 'payments'
  | 'ai'
  | 'search'
  | 'analytics'
  | 'email'
  | 'storage'
  | 'auth'
  | 'monitoring'
  | 'other';

type ApiEnvironment = 'development' | 'staging' | 'production';
type ApiTestStatus = 'pass' | 'fail' | 'timeout' | 'untested' | null;

interface ApiRegistryRow {
  id: string;
  name: string;
  provider: string;
  category: ApiCategory;
  base_url: string | null;
  docs_url: string | null;
  environment: ApiEnvironment;
  api_key_vault_ref: string | null;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_status: ApiTestStatus;
  last_test_latency_ms: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateIntegrationInput {
  name: string;
  provider: string;
  category: ApiCategory;
  base_url: string;
  docs_url: string;
  environment: ApiEnvironment;
  api_key_vault_ref: string;
  notes: string;
}

const SAFE_COLUMNS =
  'id,name,provider,category,base_url,docs_url,environment,api_key_vault_ref,is_active,last_tested_at,last_test_status,last_test_latency_ms,notes,created_at,updated_at';

const CATEGORIES: ApiCategory[] = [
  'payments',
  'ai',
  'search',
  'analytics',
  'email',
  'storage',
  'auth',
  'monitoring',
  'other',
];

const STATUS_BADGE: Record<Exclude<ApiTestStatus, null>, 'green' | 'red' | 'amber' | 'gray'> = {
  pass: 'green',
  fail: 'red',
  timeout: 'amber',
  untested: 'gray',
};

function formatDateTime(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function maskVaultRef(ref: string | null, revealed: boolean): string {
  if (!ref) return 'not configured';
  if (revealed) return ref;
  if (ref.length <= 8) return '********';
  return `${ref.slice(0, 4)}••••${ref.slice(-4)}`;
}

function CreateIntegrationModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateIntegrationInput>({
    name: '',
    provider: '',
    category: 'other',
    base_url: '',
    docs_url: '',
    environment: 'production',
    api_key_vault_ref: '',
    notes: '',
  });

  const update = <K extends keyof CreateIntegrationInput>(key: K, value: CreateIntegrationInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setForm({
      name: '',
      provider: '',
      category: 'other',
      base_url: '',
      docs_url: '',
      environment: 'production',
      api_key_vault_ref: '',
      notes: '',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      addToast('Supabase is not configured', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('api_registry').insert({
        name: form.name.trim(),
        provider: form.provider.trim(),
        category: form.category,
        base_url: form.base_url.trim() || null,
        docs_url: form.docs_url.trim() || null,
        environment: form.environment,
        api_key_vault_ref: form.api_key_vault_ref.trim() || null,
        is_active: true,
        last_test_status: 'untested',
        notes: form.notes.trim() || null,
      });

      if (error) throw error;

      addToast(`Integration "${form.name}" created`, 'success');
      reset();
      await onCreated();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create integration';
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add API Integration">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-3">
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Integration name"
              required
            />
            <Input
              value={form.provider}
              onChange={(e) => update('provider', e.target.value)}
              placeholder="Provider"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value as ApiCategory)}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans bg-white text-graphite"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={form.environment}
                onChange={(e) => update('environment', e.target.value as ApiEnvironment)}
                className="w-full border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans bg-white text-graphite"
              >
                <option value="development">development</option>
                <option value="staging">staging</option>
                <option value="production">production</option>
              </select>
            </div>
            <Input
              value={form.base_url}
              onChange={(e) => update('base_url', e.target.value)}
              placeholder="Base URL"
            />
            <Input
              value={form.docs_url}
              onChange={(e) => update('docs_url', e.target.value)}
              placeholder="Docs URL"
            />
            <Input
              value={form.api_key_vault_ref}
              onChange={(e) => update('api_key_vault_ref', e.target.value)}
              placeholder="Vault key reference"
            />
            <Input
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Notes"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default function ApiDashboard() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ApiCategory>('all');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: registryData, isLoading: loading, refetch: load } = useQuery({
    queryKey: ['api_registry'],
    queryFn: async () => {
      const [{ data, error }, { count, error: routeError }] = await Promise.all([
        supabase.from('api_registry').select(SAFE_COLUMNS).order('name', { ascending: true }),
        supabase.from('api_route_map').select('*', { count: 'exact', head: true }),
      ]);

      if (error) throw error;
      if (routeError) throw routeError;

      return {
        rows: (data as ApiRegistryRow[]) ?? [],
        routeCount: count ?? 0,
      };
    },
    enabled: isSupabaseConfigured,
  });

  const rows = registryData?.rows ?? [];
  const routeCount = registryData?.routeCount ?? 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter;
      const matchesQuery =
        q.length === 0 ||
        row.name.toLowerCase().includes(q) ||
        row.provider.toLowerCase().includes(q) ||
        (row.notes ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, query, rows]);

  const summary = useMemo(() => {
    const active = rows.filter((row) => row.is_active).length;
    const healthy = rows.filter((row) => row.last_test_status === 'pass').length;
    const failing = rows.filter((row) => row.last_test_status === 'fail' || row.last_test_status === 'timeout').length;
    return {
      totalIntegrations: rows.length,
      activeIntegrations: active,
      healthyIntegrations: healthy,
      failingIntegrations: failing,
      routeCount,
    };
  }, [routeCount, rows]);

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleActive = async (row: ApiRegistryRow) => {
    setBusyId(row.id);
    try {
      const { error } = await supabase
        .from('api_registry')
        .update({
          is_active: !row.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['api_registry'] });
      addToast(`${row.name} ${row.is_active ? 'deactivated' : 'activated'}`, 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update integration status';
      addToast(message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const revokeKey = async (row: ApiRegistryRow) => {
    setBusyId(row.id);
    try {
      const { error } = await supabase
        .from('api_registry')
        .update({
          api_key_vault_ref: null,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['api_registry'] });
      addToast(`Key revoked for ${row.name}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke key';
      addToast(message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const testConnection = async (row: ApiRegistryRow) => {
    setBusyId(row.id);
    try {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { registry_id: row.id },
      });

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['api_registry'] });
      const status = (data as { status?: string })?.status ?? 'UNKNOWN';
      addToast(`${row.name} test status: ${status}`, 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run connection test';
      addToast(message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>API Control Center | Socelle Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-sans font-bold text-graphite flex items-center gap-2">
              <Code className="w-6 h-6 text-graphite" />
              API Control Center
            </h1>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Live registry-backed key management, health checks, and revoke controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => void queryClient.invalidateQueries({ queryKey: ['api_registry'] })} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Integration
            </Button>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-sans">
              Supabase is not configured. API registry controls require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Integrations" value={summary.totalIntegrations.toString()} icon={Activity} />
          <StatCard label="Active" value={summary.activeIntegrations.toString()} icon={CheckCircle2} />
          <StatCard label="Healthy" value={summary.healthyIntegrations.toString()} icon={CheckCircle2} />
          <StatCard label="Failing" value={summary.failingIntegrations.toString()} icon={AlertTriangle} />
          <StatCard label="Mapped Routes" value={summary.routeCount.toString()} icon={Clock3} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle>API Registry</CardTitle>
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search integrations"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as 'all' | ApiCategory)}
                  className="border border-accent-soft rounded-lg px-3 py-2 text-sm font-sans bg-white text-graphite"
                >
                  <option value="all">All categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <Th>Integration</Th>
                    <Th>Category</Th>
                    <Th>Key Ref</Th>
                    <Th>Status</Th>
                    <Th>Last Test</Th>
                    <Th>Actions</Th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((row) => {
                    const show = revealed.has(row.id);
                    const disabled = busyId === row.id;

                    return (
                      <TableRow key={row.id}>
                        <Td>
                          <div>
                            <p className="font-semibold text-graphite font-sans text-sm">{row.name}</p>
                            <p className="text-xs text-graphite/60 font-sans">{row.provider}</p>
                          </div>
                        </Td>
                        <Td>
                          <Badge variant="default">{row.category}</Badge>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-graphite/60">
                              {maskVaultRef(row.api_key_vault_ref, show)}
                            </code>
                            <button
                              onClick={() => toggleReveal(row.id)}
                              className="p-1 rounded text-graphite/60 hover:text-graphite transition-colors"
                              title={show ? 'Hide key reference' : 'Reveal key reference'}
                            >
                              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <Badge variant={row.is_active ? 'green' : 'gray'}>
                              {row.is_active ? 'active' : 'inactive'}
                            </Badge>
                            <Badge variant={STATUS_BADGE[row.last_test_status ?? 'untested']}>
                              {row.last_test_status ?? 'untested'}
                            </Badge>
                          </div>
                        </Td>
                        <Td>
                          <div>
                            <p className="text-xs text-graphite/60">{formatDateTime(row.last_tested_at)}</p>
                            {row.last_test_latency_ms !== null && (
                              <p className="text-[11px] text-graphite/60">{row.last_test_latency_ms}ms</p>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void testConnection(row)}
                              disabled={disabled}
                            >
                              <TestTube2 className="w-3.5 h-3.5 mr-1" />
                              Test
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void toggleActive(row)}
                              disabled={disabled}
                            >
                              {row.is_active ? (
                                <PowerOff className="w-3.5 h-3.5 mr-1" />
                              ) : (
                                <Power className="w-3.5 h-3.5 mr-1" />
                              )}
                              {row.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void revokeKey(row)}
                              disabled={disabled || !row.api_key_vault_ref}
                            >
                              <ShieldOff className="w-3.5 h-3.5 mr-1" />
                              Revoke
                            </Button>
                          </div>
                        </Td>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-10">
                <X className="w-8 h-8 text-accent-soft mx-auto mb-2" />
                <p className="text-sm text-graphite/60">No integrations matched your filters.</p>
              </div>
            )}
          </div>
        </Card>

        <CreateIntegrationModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={async () => { await queryClient.invalidateQueries({ queryKey: ['api_registry'] }); }}
        />
      </div>
    </>
  );
}
