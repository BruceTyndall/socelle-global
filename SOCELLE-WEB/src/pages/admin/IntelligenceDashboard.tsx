import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Building2,
  DollarSign,
  Activity,
  Plus,
  Archive,
  Trash2,
  Edit3,
  Eye,
  MousePointerClick,
  Lightbulb,
  AlertTriangle,
  BarChart2,
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
import {
  getPlatformMetrics,
  getAdminSignals,
  getWeeklyInsights,
} from '../../lib/intelligence/adminIntelligence';
import type { AdminSignal } from '../../lib/intelligence/adminIntelligence';

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

const SIGNAL_TYPE_VARIANTS: Record<string, 'navy' | 'gold' | 'green' | 'amber' | 'red' | 'default'> = {
  product_velocity: 'navy',
  treatment_trend: 'green',
  ingredient_momentum: 'gold',
  brand_adoption: 'navy',
  regional: 'amber',
  pricing_benchmark: 'default',
  regulatory_alert: 'red',
  education: 'green',
};

const INSIGHT_TYPE_STYLES: Record<string, { bg: string; border: string; icon: typeof Lightbulb; iconColor: string }> = {
  opportunity: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Lightbulb, iconColor: 'text-emerald-600' },
  risk: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' },
  benchmark: { bg: 'bg-blue-50', border: 'border-blue-200', icon: BarChart2, iconColor: 'text-blue-600' },
};

export default function IntelligenceDashboard() {
  const metrics = getPlatformMetrics();
  const allSignals = getAdminSignals();
  const insights = getWeeklyInsights();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Signal form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('product_velocity');
  const [newDirection, setNewDirection] = useState<'up' | 'down' | 'stable'>('up');

  const filteredSignals = allSignals.filter(s =>
    statusFilter === 'all' ? true : s.status === statusFilter
  );

  const statusCounts = {
    all: allSignals.length,
    active: allSignals.filter(s => s.status === 'active').length,
    draft: allSignals.filter(s => s.status === 'draft').length,
    archived: allSignals.filter(s => s.status === 'archived').length,
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSignal = () => {
    if (!newTitle.trim()) return;
    showToast(`Signal "${newTitle}" created as draft (Supabase integration in Wave 6)`);
    setNewTitle('');
    setNewDescription('');
    setNewType('product_velocity');
    setNewDirection('up');
    setShowCreateModal(false);
  };

  const handleAction = (action: string, signal: AdminSignal) => {
    showToast(`${action} action on "${signal.title}" (Supabase integration in Wave 6)`);
  };

  const DirectionIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
    if (direction === 'up') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (direction === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-graphite/60" />;
  };

  return (
    <>
      <Helmet>
        <title>Intelligence Admin | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-graphite text-white text-sm font-sans px-4 py-2.5 rounded-lg shadow-lg">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading text-graphite">
              Intelligence Command Center
            </h1>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Monitor, manage, and curate marketplace intelligence signals
            </p>
          </div>
          <Button
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Signal
          </Button>
        </div>

        {/* Platform Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Signals"
            value={metrics.totalSignals}
            icon={Activity}
            delta={8}
            deltaLabel="this week"
          />
          <StatCard
            label="Active Operators"
            value={metrics.totalOperators.toLocaleString()}
            icon={Users}
            delta={metrics.operatorGrowth}
            deltaLabel="growth"
          />
          <StatCard
            label="Active Brands"
            value={metrics.totalBrands}
            icon={Building2}
            delta={metrics.brandGrowth}
            deltaLabel="growth"
          />
          <StatCard
            label="Monthly Revenue"
            value={`$${(metrics.monthlyRevenue / 1000).toFixed(0)}k`}
            icon={DollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            delta={6}
            deltaLabel="vs last month"
          />
        </div>

        {/* Signal Management Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-graphite">Signal Management</h2>
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
                <p className="text-sm font-sans text-graphite/60">No signals with this status.</p>
              </div>
            ) : (
              <div className="divide-y divide-accent-soft/50">
                {filteredSignals.map(signal => (
                  <div key={signal.id} className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors">
                    <DirectionIcon direction={signal.direction} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-graphite font-sans text-sm truncate">
                          {signal.title}
                        </p>
                        <Badge variant={signal.status === 'active' ? 'green' : signal.status === 'draft' ? 'amber' : 'gray'} dot>
                          {signal.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-graphite/60 font-sans truncate max-w-lg">
                        {signal.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={SIGNAL_TYPE_VARIANTS[signal.type] || 'default'}>
                          {SIGNAL_TYPE_LABELS[signal.type] || signal.type}
                        </Badge>
                        <span className="text-[11px] text-graphite/60 font-sans">
                          {new Date(signal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-right">
                      <div className="flex items-center gap-1 text-xs text-graphite/60 font-sans">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{signal.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-graphite/60 font-sans">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span>{signal.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAction('Edit', signal)}
                        className="p-1.5 rounded-lg text-graphite/60 hover:text-graphite hover:bg-accent-soft transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('Archive', signal)}
                        className="p-1.5 rounded-lg text-graphite/60 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('Delete', signal)}
                        className="p-1.5 rounded-lg text-graphite/60 hover:text-red-600 hover:bg-red-50 transition-colors"
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

        {/* Weekly Insights */}
        <div>
          <h2 className="text-lg font-heading text-graphite mb-4">
            Weekly Platform Insights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map(insight => {
              const style = INSIGHT_TYPE_STYLES[insight.type] || INSIGHT_TYPE_STYLES.benchmark;
              const Icon = style.icon;
              return (
                <div
                  key={insight.id}
                  className={`rounded-xl border p-5 ${style.bg} ${style.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'opportunity' ? 'bg-emerald-100' :
                      insight.type === 'risk' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-graphite font-sans text-sm">{insight.title}</p>
                        <Badge variant={
                          insight.type === 'opportunity' ? 'green' :
                          insight.type === 'risk' ? 'red' : 'navy'
                        }>
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-graphite/60 font-sans mb-2">
                        {insight.description}
                      </p>
                      <p className="text-sm font-bold text-graphite font-sans">
                        {insight.metric}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Health Summary */}
        <div>
          <h2 className="text-lg font-heading text-graphite mb-4">
            Platform Health
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Operator Acquisition</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans text-graphite/60">This Month</span>
                  <span className="text-sm font-bold font-sans text-graphite">+47 operators</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans text-graphite/60">Last Month</span>
                  <span className="text-sm font-bold font-sans text-graphite">+42 operators</span>
                </div>
                <div className="h-2 bg-accent-soft/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
                </div>
                <p className="text-xs text-graphite/60 font-sans">72% of quarterly target</p>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Adoption Rate</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans text-graphite/60">Active Brands</span>
                  <span className="text-sm font-bold font-sans text-graphite">{metrics.totalBrands}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans text-graphite/60">Published</span>
                  <span className="text-sm font-bold font-sans text-graphite">134</span>
                </div>
                <div className="h-2 bg-accent-soft/40 rounded-full overflow-hidden">
                  <div className="h-full bg-graphite rounded-full" style={{ width: '86%' }} />
                </div>
                <p className="text-xs text-graphite/60 font-sans">86% publish rate</p>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trend</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans text-graphite/60">This Month</span>
                  <span className="text-sm font-bold font-sans text-graphite">387 orders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans text-graphite/60">Avg Order Value</span>
                  <span className="text-sm font-bold font-sans text-graphite">$847</span>
                </div>
                <div className="h-2 bg-accent-soft/40 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '68%' }} />
                </div>
                <p className="text-xs text-graphite/60 font-sans">68% of revenue target</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Signal Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Intelligence Signal" size="lg">
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
                className="w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm text-graphite placeholder:text-graphite/60/60 focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite resize-none"
                rows={3}
                placeholder="Describe the intelligence signal, its market significance, and potential impact on operators or brands..."
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
                    <option key={key} value={key}>{label}</option>
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
                  onChange={e => setNewDirection(e.target.value as 'up' | 'down' | 'stable')}
                >
                  <option value="up">Trending Up</option>
                  <option value="down">Trending Down</option>
                  <option value="stable">Stable</option>
                </select>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreateSignal}
            disabled={!newTitle.trim()}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Create Signal
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
