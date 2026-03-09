/**
 * IntelligenceDashboard — Admin Intelligence Command Center
 * Data: live from market_signals, businesses, brands, api_registry, data_feeds
 * LIVE badge when DB-connected; DEMO fallback otherwise
 * Authority: INTEL-ADMIN-01
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Building2,
  CreditCard,
  Activity,
  Plus,
  Archive,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Rss,
  Zap,
  Server,
  Circle,
} from 'lucide-react';
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
} from '../../components/ui';
import { useToast } from '../../components/Toast';
import {
  useAdminIntelligence,
  type AdminSignalRow,
} from '../../lib/intelligence/useAdminIntelligence';
import { supabase } from '../../lib/supabase';

// ── Constants ─────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'draft' | 'archived';

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  product_velocity: 'Product Velocity',
  treatment_trend: 'Treatment Trend',
  ingredient_momentum: 'Ingredient Momentum',
  brand_adoption: 'Brand Adoption',
  regional: 'Regional',
  pricing_benchmark: 'Pricing Benchmark',
  regulatory_alert: 'Regulatory Alert',
  education: 'Education',
};

const SIGNAL_TYPE_VARIANTS: Record<
  string,
  'navy' | 'gold' | 'green' | 'amber' | 'red' | 'default'
> = {
  product_velocity: 'navy',
  treatment_trend: 'green',
  ingredient_momentum: 'gold',
  brand_adoption: 'navy',
  regional: 'amber',
  pricing_benchmark: 'default',
  regulatory_alert: 'red',
  education: 'green',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function LiveDemoBadge({ isLive }: { isLive: boolean }) {
  if (isLive) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-up opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-up" />
        </span>
        <span className="text-xs font-medium text-signal-up font-sans">LIVE</span>
      </div>
    );
  }
  return (
    <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full font-sans">
      DEMO
    </span>
  );
}

function DirectionIcon({ direction }: { direction: 'up' | 'down' | 'stable' | null }) {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-signal-up" />;
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-signal-down" />;
  return <Minus className="w-4 h-4 text-graphite/60" />;
}

function ApiStatusIcon({ status }: { status: string | null }) {
  if (status === 'pass')
    return <CheckCircle2 className="w-4 h-4 text-signal-up" />;
  if (status === 'fail')
    return <AlertTriangle className="w-4 h-4 text-signal-down" />;
  if (status === 'timeout')
    return <Clock3 className="w-4 h-4 text-signal-warn" />;
  return <Circle className="w-4 h-4 text-graphite/30" />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-accent-soft/40" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-accent-soft/40" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-48 rounded-xl bg-accent-soft/40" />
        <div className="h-48 rounded-xl bg-accent-soft/40" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IntelligenceDashboard() {
  const {
    metrics,
    signals,
    apiHealth,
    feedHealth,
    isLoading,
    isLive,
    refetch,
  } = useAdminIntelligence();

  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create Signal form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('product_velocity');
  const [newDirection, setNewDirection] = useState<'up' | 'down' | 'stable'>('up');
  const [newConfidence, setNewConfidence] = useState(75);

  // Derived
  const filteredSignals = signals.filter(s =>
    statusFilter === 'all' ? true : s.status === statusFilter
  );

  const statusCounts = {
    all: signals.length,
    active: signals.filter(s => s.status === 'active').length,
    draft: signals.filter(s => s.status === 'draft').length,
    archived: signals.filter(s => s.status === 'archived').length,
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreateSignal = async () => {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('market_signals').insert({
        title: newTitle.trim(),
        summary: newDescription.trim() || null,
        signal_type: newType,
        direction: newDirection,
        confidence: newConfidence,
        status: 'draft',
        tier_visibility: 'free',
      });
      if (error) throw error;
      showToast('Signal created as draft');
      setNewTitle('');
      setNewDescription('');
      setNewType('product_velocity');
      setNewDirection('up');
      setNewConfidence(75);
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create signal';
      showToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveSignal = async (signal: AdminSignalRow) => {
    try {
      const { error } = await supabase
        .from('market_signals')
        .update({ status: 'archived' })
        .eq('id', signal.id);
      if (error) throw error;
      showToast(`"${signal.title}" archived`);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to archive signal';
      showToast(msg);
    }
  };

  const handleDeleteSignal = async (signal: AdminSignalRow) => {
    try {
      const { error } = await supabase
        .from('market_signals')
        .delete()
        .eq('id', signal.id);
      if (error) throw error;
      showToast(`"${signal.title}" deleted`);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete signal';
      showToast(msg);
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <>
      <Helmet>
        <title>Intelligence Admin | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-2xl font-heading text-graphite">
                Intelligence Command Center
              </h1>
              <LiveDemoBadge isLive={isLive} />
            </div>
            <p className="text-sm text-graphite/60 font-sans">
              Monitor, manage, and curate marketplace intelligence signals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="p-2 rounded-lg text-graphite/60 hover:text-graphite hover:bg-accent-soft transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Signal
            </Button>
          </div>
        </div>

        {/* Platform Metrics KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Signals"
            value={metrics?.totalSignals ?? 0}
            icon={Activity}
          />
          <StatCard
            label="Active Operators"
            value={(metrics?.totalOperators ?? 0).toLocaleString()}
            icon={Users}
          />
          <StatCard
            label="Active Brands"
            value={metrics?.totalBrands ?? 0}
            icon={Building2}
          />
          <StatCard
            label="Active Subscriptions"
            value={metrics?.totalSubscriptions ?? 0}
            icon={CreditCard}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>

        {/* Signal Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-graphite">Signal Management</h2>
            <span className="text-xs text-graphite/50 font-sans">
              Most recent 20 signals
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-accent-soft mb-4">
            {(['all', 'active', 'draft', 'archived'] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2.5 text-sm font-medium font-sans border-b-2 transition-colors -mb-px capitalize ${
                  statusFilter === f
                    ? 'border-graphite text-graphite'
                    : 'border-transparent text-graphite/60 hover:text-graphite hover:border-accent-soft'
                }`}
              >
                {f} ({statusCounts[f]})
              </button>
            ))}
          </div>

          {/* Signal Table */}
          <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
            {filteredSignals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="w-10 h-10 text-accent-soft mb-3" />
                <p className="text-sm font-sans font-medium text-graphite/70 mb-1">
                  No signals
                </p>
                <p className="text-xs font-sans text-graphite/50">
                  {isLive
                    ? 'No signals match this filter.'
                    : 'Supabase not configured — no live signals available.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-accent-soft/50">
                {filteredSignals.map(signal => (
                  <div
                    key={signal.id}
                    className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors"
                  >
                    <DirectionIcon direction={signal.direction} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-graphite font-sans text-sm truncate">
                          {signal.title}
                        </p>
                        <Badge
                          variant={
                            signal.status === 'active'
                              ? 'green'
                              : signal.status === 'draft'
                              ? 'amber'
                              : 'gray'
                          }
                          dot
                        >
                          {signal.status ?? 'unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={SIGNAL_TYPE_VARIANTS[signal.signal_type] || 'default'}>
                          {SIGNAL_TYPE_LABELS[signal.signal_type] || signal.signal_type}
                        </Badge>
                        {signal.confidence !== null && (
                          <span className="text-[11px] text-graphite/60 font-sans">
                            {signal.confidence}% confidence
                          </span>
                        )}
                        {signal.source_name && (
                          <span className="text-[11px] text-graphite/50 font-sans truncate max-w-[120px]">
                            {signal.source_name}
                          </span>
                        )}
                        <span className="text-[11px] text-graphite/40 font-sans">
                          {new Date(signal.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleArchiveSignal(signal)}
                        className="p-1.5 rounded-lg text-graphite/60 hover:text-signal-warn hover:bg-amber-50 transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSignal(signal)}
                        className="p-1.5 rounded-lg text-graphite/60 hover:text-signal-down hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Health Panel + Feed Status Strip */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* API Health Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-accent" />
                <CardTitle>API Health</CardTitle>
              </div>
            </CardHeader>
            {apiHealth.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Server className="w-8 h-8 text-accent-soft mb-2" />
                <p className="text-sm font-sans text-graphite/60">
                  {isLive ? 'No APIs registered.' : 'Connect Supabase to view API health.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-accent-soft/50">
                {apiHealth.slice(0, 6).map(api => (
                  <div key={api.id} className="flex items-center gap-3 py-2.5">
                    <ApiStatusIcon status={api.last_test_status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium text-graphite truncate">
                        {api.name}
                      </p>
                      <p className="text-[11px] text-graphite/50 font-sans capitalize">
                        {api.category}
                        {api.last_test_latency_ms !== null &&
                          ` · ${api.last_test_latency_ms}ms`}
                      </p>
                    </div>
                    <Badge variant={api.is_active ? 'green' : 'gray'} dot>
                      {api.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Feed Status Strip */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rss className="w-4 h-4 text-accent" />
                <CardTitle>Feed Status</CardTitle>
              </div>
            </CardHeader>
            {feedHealth.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Rss className="w-8 h-8 text-accent-soft mb-2" />
                <p className="text-sm font-sans text-graphite/60">
                  {isLive ? 'No feeds configured.' : 'Connect Supabase to view feed status.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-accent-soft/50">
                {feedHealth.slice(0, 6).map(feed => {
                  const hasError = Boolean(feed.last_error);
                  return (
                    <div key={feed.id} className="flex items-center gap-3 py-2.5">
                      {hasError ? (
                        <AlertTriangle className="w-4 h-4 text-signal-warn flex-shrink-0" />
                      ) : (
                        <Zap className="w-4 h-4 text-signal-up flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-medium text-graphite truncate">
                          {feed.name}
                        </p>
                        <p className="text-[11px] text-graphite/50 font-sans">
                          {feed.signal_count} signals
                          {feed.last_fetched_at &&
                            ` · ${new Date(feed.last_fetched_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}`}
                        </p>
                        {hasError && (
                          <p className="text-[11px] text-signal-warn font-sans truncate mt-0.5">
                            {feed.last_error}
                          </p>
                        )}
                      </div>
                      <Badge variant={feed.is_enabled ? 'green' : 'gray'} dot>
                        {feed.is_enabled ? 'enabled' : 'paused'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create Signal Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Intelligence Signal"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Signal Title"
              placeholder="e.g., Peptide Complex Serums Velocity Surge"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm text-graphite placeholder:text-graphite/50 focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite resize-none"
                rows={3}
                placeholder="Describe the signal, its market significance, and potential operator impact..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Signal Type
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                >
                  {Object.entries(SIGNAL_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Direction
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite"
                  value={newDirection}
                  onChange={e =>
                    setNewDirection(e.target.value as 'up' | 'down' | 'stable')
                  }
                >
                  <option value="up">Trending Up</option>
                  <option value="down">Trending Down</option>
                  <option value="stable">Stable</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                Confidence: {newConfidence}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={newConfidence}
                onChange={e => setNewConfidence(Number(e.target.value))}
                className="w-full accent-graphite"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateModal(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => void handleCreateSignal()}
            disabled={!newTitle.trim() || isSaving}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            {isSaving ? 'Saving…' : 'Create Signal'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
