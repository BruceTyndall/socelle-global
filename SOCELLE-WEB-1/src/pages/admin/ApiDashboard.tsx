import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Code,
  Users,
  Activity,
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  X,
  AlertTriangle,
  BarChart3,
  Zap,
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
import {
  getApiClients,
  getApiUsage,
  getApiUsageSummary,
} from '../../lib/api/mockApiData';
import type { ApiClient, ApiUsage, ApiTier } from '../../lib/api/types';

// ─── Tier badge variant map ──────────────────────────────────────
const TIER_VARIANT: Record<ApiTier, 'default' | 'gold' | 'navy'> = {
  starter: 'default',
  professional: 'gold',
  enterprise: 'navy',
};

// ─── Create Client Modal ─────────────────────────────────────────
function CreateClientModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<ApiTier>('starter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(`API client "${name}" created (mock). Key provisioning coming soon.`, 'success');
    setName('');
    setEmail('');
    setTier('starter');
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Create API Client">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-pro-charcoal mb-1 font-sans">
                Client Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Beauty Analytics"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-pro-charcoal mb-1 font-sans">
                Contact Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-pro-charcoal mb-1 font-sans">
                Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as ApiTier)}
                className="w-full border border-pro-stone rounded-lg px-3 py-2 text-sm font-sans bg-white text-pro-charcoal focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
              >
                <option value="starter">Starter — $199/mo</option>
                <option value="professional">Professional — $499/mo</option>
                <option value="enterprise">Enterprise — Custom</option>
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Client</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Client Detail Panel ─────────────────────────────────────────
function ClientDetail({
  client,
  usage,
  onClose,
}: {
  client: ApiClient;
  usage: ApiUsage[];
  onClose: () => void;
}) {
  // Aggregate usage by endpoint
  const byEndpoint = usage.reduce<Record<string, { requests: number; errors: number }>>(
    (acc, u) => {
      if (!acc[u.endpoint]) acc[u.endpoint] = { requests: 0, errors: 0 };
      acc[u.endpoint].requests += u.requestCount;
      acc[u.endpoint].errors += u.errorCount;
      return acc;
    },
    {}
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{client.clientName} — Usage Detail</CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <div className="px-6 pb-6 space-y-6">
        {/* Info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-pro-warm-gray font-sans mb-1">Tier</p>
            <Badge variant={TIER_VARIANT[client.tier]}>{client.tier}</Badge>
          </div>
          <div>
            <p className="text-xs text-pro-warm-gray font-sans mb-1">Rate Limit</p>
            <p className="text-sm font-semibold text-pro-charcoal font-sans">
              {client.rateLimitPerMinute}/min
            </p>
          </div>
          <div>
            <p className="text-xs text-pro-warm-gray font-sans mb-1">Monthly Quota</p>
            <p className="text-sm font-semibold text-pro-charcoal font-sans">
              {client.monthlyQuota === -1 ? 'Unlimited' : client.monthlyQuota.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-pro-warm-gray font-sans mb-1">Monthly Used</p>
            <p className="text-sm font-semibold text-pro-charcoal font-sans">
              {client.monthlyUsed.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Requests by endpoint */}
        <div>
          <h4 className="text-sm font-semibold text-pro-charcoal mb-3 font-sans">
            Requests by Endpoint
          </h4>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Endpoint</Th>
                <Th>Requests</Th>
                <Th>Errors</Th>
                <Th>Error Rate</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(byEndpoint).map(([endpoint, data]) => {
                const errorRate =
                  data.requests > 0
                    ? ((data.errors / data.requests) * 100).toFixed(2)
                    : '0.00';
                return (
                  <TableRow key={endpoint}>
                    <Td>
                      <code className="text-xs font-mono text-pro-navy">{endpoint}</code>
                    </Td>
                    <Td>{data.requests.toLocaleString()}</Td>
                    <Td>
                      {data.errors > 0 ? (
                        <span className="text-red-600 font-semibold">{data.errors}</span>
                      ) : (
                        <span className="text-pro-warm-gray">0</span>
                      )}
                    </Td>
                    <Td>
                      <span
                        className={
                          parseFloat(errorRate) > 1
                            ? 'text-red-600 font-semibold'
                            : 'text-pro-warm-gray'
                        }
                      >
                        {errorRate}%
                      </span>
                    </Td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ApiDashboard() {
  const clients = getApiClients();
  const allUsage = getApiUsage();
  const summary = getApiUsageSummary();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const toggleKeyVisibility = (clientId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const toggleClientStatus = (client: ApiClient) => {
    addToast(
      `${client.clientName} ${client.active ? 'deactivated' : 'activated'} (mock).`,
      'info'
    );
  };

  return (
    <>
      <Helmet>
        <title>API Management | Socelle Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-pro-charcoal flex items-center gap-2">
              <Code className="w-6 h-6 text-pro-navy" />
              API Management
            </h1>
            <p className="text-sm text-pro-warm-gray font-sans mt-1">
              Monitor API clients, usage, and revenue from the Enterprise Intelligence API.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Client
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Active Clients"
            value={summary.totalClients.toString()}
            icon={Users}
          />
          <StatCard
            title="Total Requests"
            value={summary.totalRequests.toLocaleString()}
            icon={Activity}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${summary.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Avg Latency"
            value={`${summary.avgLatency}ms`}
            icon={Zap}
          />
        </div>

        {/* Error rate notice */}
        {parseFloat(summary.errorRate) > 0.5 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-sans">
              Platform error rate is {summary.errorRate}% — above the 0.5% threshold. Investigate
              high-error endpoints below.
            </p>
          </div>
        )}

        {/* Client Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Clients</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <Th>Client</Th>
                    <Th>Tier</Th>
                    <Th>API Key</Th>
                    <Th>Rate Limit</Th>
                    <Th>Monthly Usage</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => {
                    const revealed = revealedKeys.has(client.id);
                    const usagePercent =
                      client.monthlyQuota > 0
                        ? Math.round((client.monthlyUsed / client.monthlyQuota) * 100)
                        : null;

                    return (
                      <TableRow key={client.id}>
                        <Td>
                          <div>
                            <p className="font-semibold text-pro-charcoal font-sans text-sm">
                              {client.clientName}
                            </p>
                            <p className="text-xs text-pro-warm-gray font-sans">
                              {client.contactEmail}
                            </p>
                          </div>
                        </Td>
                        <Td>
                          <Badge variant={TIER_VARIANT[client.tier]}>{client.tier}</Badge>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-pro-warm-gray">
                              {revealed ? client.apiKey : 'sk_live_•••••••••'}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(client.id)}
                              className="p-1 rounded text-pro-warm-gray hover:text-pro-charcoal transition-colors"
                              title={revealed ? 'Hide key' : 'Reveal key'}
                            >
                              {revealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </Td>
                        <Td>
                          <span className="text-sm font-mono text-pro-charcoal">
                            {client.rateLimitPerMinute}/min
                          </span>
                        </Td>
                        <Td>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-pro-charcoal font-sans">
                              {client.monthlyUsed.toLocaleString()}
                              {client.monthlyQuota > 0 && (
                                <span className="text-pro-warm-gray font-normal">
                                  {' '}
                                  / {client.monthlyQuota.toLocaleString()}
                                </span>
                              )}
                              {client.monthlyQuota === -1 && (
                                <span className="text-pro-warm-gray font-normal"> / unlimited</span>
                              )}
                            </p>
                            {usagePercent !== null && (
                              <div className="w-24 h-1.5 bg-pro-stone rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    usagePercent > 90
                                      ? 'bg-red-500'
                                      : usagePercent > 70
                                        ? 'bg-amber-500'
                                        : 'bg-pro-gold'
                                  }`}
                                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <button
                            onClick={() => toggleClientStatus(client)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              client.active ? 'bg-emerald-500' : 'bg-pro-stone'
                            }`}
                            title={client.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                                client.active ? 'translate-x-4' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </Td>
                        <Td>
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="text-xs font-semibold text-pro-navy hover:text-pro-charcoal transition-colors font-sans"
                          >
                            View Details
                          </button>
                        </Td>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* Usage Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-pro-navy" />
              Usage Over Time
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="h-48 bg-pro-ivory rounded-xl border border-pro-stone/50 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-pro-stone mx-auto mb-3" />
                <p className="text-sm text-pro-warm-gray font-sans">
                  Chart visualization coming soon
                </p>
                <p className="text-xs text-pro-warm-gray/60 font-sans mt-1">
                  Historical request volume, error rates, and latency trends
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Client Detail Panel */}
        {selectedClient && (
          <ClientDetail
            client={selectedClient}
            usage={allUsage.filter((u) => u.clientId === selectedClient.id)}
            onClose={() => setSelectedClient(null)}
          />
        )}

        {/* Create Client Modal */}
        <CreateClientModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </>
  );
}
