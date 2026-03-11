import { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Users, Calendar, ArrowRight, CheckSquare,
  AlertTriangle, TrendingUp, Clock, DollarSign, Zap,
  Plus, RefreshCw, MessageSquare, Megaphone, ShoppingBag, Briefcase,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useOverdueTasks } from '../../lib/useCrmTasks';
import {
  CrossHubActionDispatcher,
  type SignalAction,
} from '../../components/CrossHubActionDispatcher';

// ── CRM Dashboard — "Today View" (V2-HUBS-06) ─────────────────────────
// Data source: crm_contacts, crm_tasks, appointments, market_signals (LIVE)
// TanStack Query v5. Pearl Mineral V2. No font-sans.

/* ── Skeleton helpers ──────────────────────────────────────────────────── */

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-graphite/5 p-5 animate-pulse">
      <div className="h-3 bg-graphite/10 rounded w-20 mb-3" />
      <div className="h-8 bg-graphite/10 rounded w-16" />
    </div>
  );
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-graphite/5 p-5 animate-pulse space-y-4">
      <div className="h-4 bg-graphite/10 rounded w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-graphite/10 rounded w-3/4" />
          <div className="h-3 bg-graphite/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* ── Types ─────────────────────────────────────────────────────────────── */

interface DashboardData {
  contactCount: number;
  todayTaskCount: number;
  overdueRebookingCount: number;
  totalRevenue: number;
  todayTasks: { id: string; title: string; priority: string; due_date: string | null; contact_id: string | null }[];
  upcomingAppointments: { id: string; client_first_name: string; client_last_name: string; start_time: string; service_name?: string }[];
  overdueClients: { id: string; first_name: string; last_name: string; last_visit_date: string | null; days_since: number; churn_risk_score: number }[];
  expiringSubscriptions: number;
  milestoneClients: { id: string; first_name: string; last_name: string; total_visits: number }[];
  topSignals: { id: string; title: string; magnitude: number; direction: string; category: string | null }[];
  recentOrders: { id: string; order_number: string; status: string; total_cents: number; created_at: string }[];
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function CrmDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const businessId = profile?.business_id;
  const { tasks: overdueTasks } = useOverdueTasks(businessId);

  const signalTaskMutation = useMutation({
    mutationFn: async (action: SignalAction) => {
      if (!businessId) return;
      const taskTitle =
        action.action_type === 'add_to_note'
          ? `Add signal note: ${action.signal_title}`
          : `Review CRM signal: ${action.signal_title}`;
      const description = [
        `Signal category: ${action.signal_category}`,
        `Source: ${action.signal_source}`,
        `Delta: ${action.signal_delta}`,
        `Confidence: ${action.signal_confidence}`,
      ].join(' | ');

      const { error } = await supabase.from('crm_tasks').insert({
        business_id: businessId,
        title: taskTitle,
        description,
        priority: 'medium',
        status: 'open',
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  });

  const handleSignalAction = useCallback(
    (action: SignalAction) => {
      if (!businessId) return;
      if (action.action_type === 'add_to_crm' || action.action_type === 'add_to_note') {
        signalTaskMutation.mutate(action);
        return;
      }

      if (
        action.action_type === 'create_campaign' ||
        action.action_type === 'create_brief' ||
        action.action_type === 'create_alert'
      ) {
        const prompt = [
          `Turn this signal into a lead generation plan: "${action.signal_title}".`,
          `Category: ${action.signal_category}.`,
          `Delta: ${action.signal_delta}.`,
          `Confidence: ${action.signal_confidence}.`,
          `Source: ${action.signal_source}.`,
          'Output: campaign concept, target segment, follow-up sequence, and KPI goals.',
        ].join(' ');
        navigate(`/portal/advisor?prompt=${encodeURIComponent(prompt)}`);
      }
    },
    [businessId, navigate, signalTaskMutation],
  );

  const firstName = useMemo(() => {
    const email = user?.email ?? profile?.email ?? '';
    return email.split('@')[0] ?? 'there';
  }, [user, profile]);

  const { data, isLoading, isError, error, refetch } = useQuery<DashboardData>({
    queryKey: ['crm_dashboard_today', businessId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00`;
      const todayEnd = `${today}T23:59:59`;
      const now = new Date().toISOString();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [
        contactRes,
        todayTasksRes,
        upcomingRes,
        overdueClientsRes,
        milestoneRes,
        signalsRes,
        revenueRes,
        recentOrdersRes,
      ] = await Promise.all([
        // Contact count
        supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('business_id', businessId!),
        // Today's tasks
        supabase.from('crm_tasks').select('id, title, priority, due_date, contact_id')
          .eq('business_id', businessId!)
          .neq('status', 'completed')
          .gte('due_date', todayStart)
          .lte('due_date', todayEnd)
          .order('priority', { ascending: true })
          .limit(10),
        // Upcoming appointments
        supabase.from('appointments').select('id, client_first_name, client_last_name, start_time, booking_services(name)')
          .eq('business_id', businessId!)
          .gte('start_time', now)
          .eq('status', 'scheduled')
          .order('start_time')
          .limit(5),
        // Overdue clients (>30 days since last visit) -> Rebooking Engine Prioritized by Churn Risk
        supabase.from('crm_contacts').select('id, first_name, last_name, last_visit_date, churn_risk_score')
          .eq('business_id', businessId!)
          .lt('last_visit_date', thirtyDaysAgo)
          .not('last_visit_date', 'is', null)
          .order('churn_risk_score', { ascending: false }) // CRM-POWER-02 Rebooking recommendation
          .limit(10),
        // Milestone clients (5th, 10th, 15th, 20th visit)
        supabase.from('crm_contacts').select('id, first_name, last_name, total_visits')
          .eq('business_id', businessId!)
          .in('total_visits', [5, 10, 15, 20, 25, 50, 100])
          .limit(5),
        // Top signals by magnitude
        supabase.from('market_signals').select('id, title, magnitude, direction, category')
          .order('magnitude', { ascending: false })
          .limit(3),
        // Revenue sum
        supabase.from('crm_contacts').select('total_spend')
          .eq('business_id', businessId!),
        // Recent commerce orders
        supabase.from('orders').select('id, order_number, status, total_cents, subtotal_cents, subtotal, created_at')
          .eq('business_id', businessId!)
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      const mappedUpcoming = (upcomingRes.data ?? []).map((row: Record<string, unknown>) => {
        const svc = row.booking_services as { name?: string } | null;
        return {
          id: row.id as string,
          client_first_name: row.client_first_name as string,
          client_last_name: row.client_last_name as string,
          start_time: row.start_time as string,
          service_name: svc?.name,
        };
      });

      const mappedOverdue = (overdueClientsRes.data ?? []).map((row: Record<string, unknown>) => {
        const lvd = row.last_visit_date as string | null;
        return {
          id: row.id as string,
          first_name: row.first_name as string,
          last_name: row.last_name as string,
          last_visit_date: lvd,
          days_since: lvd ? daysSince(lvd)! : 999,
          churn_risk_score: (row.churn_risk_score as number | null) ?? 0,
        };
      });

      const totalRevenue = (revenueRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.total_spend) || 0), 0);
      const todayTasks = (todayTasksRes.data ?? []) as DashboardData['todayTasks'];
      const recentOrders = (recentOrdersRes.data ?? []).map((row: Record<string, unknown>) => {
        const totalCentsRaw = Number(row.total_cents);
        const subtotalCentsRaw = Number(row.subtotal_cents);
        const subtotalRaw = Number(row.subtotal);
        const totalCents = Number.isFinite(totalCentsRaw)
          ? Math.round(totalCentsRaw)
          : Number.isFinite(subtotalCentsRaw)
            ? Math.round(subtotalCentsRaw)
            : Number.isFinite(subtotalRaw)
              ? Math.round(subtotalRaw * 100)
              : 0;
        return {
          id: row.id as string,
          order_number:
            (typeof row.order_number === 'string' && row.order_number.length > 0)
              ? row.order_number
              : `ORD-${String(row.id).slice(0, 8).toUpperCase()}`,
          status: (row.status as string) || 'pending',
          total_cents: totalCents,
          created_at: row.created_at as string,
        };
      });

      return {
        contactCount: contactRes.count ?? 0,
        todayTaskCount: todayTasks.length,
        overdueRebookingCount: mappedOverdue.length,
        totalRevenue,
        todayTasks,
        upcomingAppointments: mappedUpcoming,
        overdueClients: mappedOverdue,
        expiringSubscriptions: 0,
        milestoneClients: (milestoneRes.data ?? []) as DashboardData['milestoneClients'],
        topSignals: (signalsRes.data ?? []) as DashboardData['topSignals'],
        recentOrders,
      };
    },
    enabled: !!businessId,
  });

  const stats = data;

  /* ── Full loading skeleton ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-2">
          <div className="h-7 bg-graphite/10 rounded w-64" />
          <div className="h-4 bg-graphite/10 rounded w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <KpiSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
        <SectionSkeleton rows={4} />
      </div>
    );
  }

  /* ── Error state ──────────────────────────────────────────────────────── */
  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-signal-down/20 p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-signal-down mx-auto" />
        <h2 className="text-lg font-semibold text-graphite">Something went wrong</h2>
        <p className="text-sm text-graphite/60 max-w-md mx-auto">
          {error instanceof Error ? error.message : 'Unable to load your CRM dashboard. Please try again.'}
        </p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover transition-colors">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  /* ── Empty state (no business ID or no data) ──────────────────────────── */
  if (!stats || (stats.contactCount === 0 && stats.todayTaskCount === 0)) {
    return (
      <div className="bg-white rounded-xl border border-graphite/5 p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto">
          <Users className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-graphite">Your client relationships start here</h2>
        <p className="text-sm text-graphite/60 max-w-md mx-auto">
          Add your first contact to start tracking appointments, treatment records, and intelligence-driven insights for your business.
        </p>
        <Link
          to="/portal/crm/contacts/new"
          className="inline-flex items-center gap-2 h-10 px-5 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Your First Contact
        </Link>
      </div>
    );
  }

  /* ── KPI Cards ───────────────────────────────────────────────────────── */
  const kpis = [
    { label: 'Total Contacts', value: stats.contactCount.toLocaleString(), icon: Users, color: 'text-accent', to: '/portal/crm/contacts' },
    { label: "Today's Tasks", value: stats.todayTaskCount.toLocaleString(), icon: CheckSquare, color: 'text-signal-up', to: '/portal/crm/tasks' },
    { label: 'Overdue Rebookings', value: stats.overdueRebookingCount.toLocaleString(), icon: Clock, color: stats.overdueRebookingCount > 0 ? 'text-signal-down' : 'text-graphite/40', to: '/portal/crm/contacts' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-signal-up', to: '/portal/crm/contacts' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Good {getGreeting()}, {firstName}</h1>
          <p className="text-sm text-graphite/60 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/portal/crm/contacts/new"
            className="inline-flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </Link>
        </div>
      </div>

      {/* ── Overdue Tasks Alert ──────────────────────────────────────────── */}
      {overdueTasks.length > 0 && (
        <Link to="/portal/crm/tasks?filter=overdue" className="block bg-signal-down/5 border border-signal-down/20 rounded-xl px-5 py-4 hover:bg-signal-down/10 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-signal-down flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-graphite">{overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-graphite/60 mt-0.5">Review and update your tasks</p>
            </div>
            <ArrowRight className="w-4 h-4 text-signal-down ml-auto" />
          </div>
        </Link>
      )}

      {/* ── KPI Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} to={kpi.to} className="bg-white rounded-xl border border-graphite/5 p-5 hover:border-accent/30 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-graphite/50 uppercase tracking-wider">{kpi.label}</span>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-semibold text-graphite">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Today's Tasks + Upcoming Appointments ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white rounded-xl border border-graphite/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-accent" /> Today&apos;s Tasks ({stats.todayTaskCount})
            </h2>
            <Link to="/portal/crm/tasks" className="text-xs text-accent hover:text-accent-hover font-medium">View All</Link>
          </div>
          {stats.todayTasks.length === 0 ? (
            <p className="text-sm text-graphite/50 py-4">No tasks due today</p>
          ) : (
            <div className="space-y-2">
              {stats.todayTasks.map(task => (
                <Link key={task.id} to="/portal/crm/tasks" className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg border-b border-graphite/5 last:border-0 hover:bg-accent-soft/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-signal-down' : task.priority === 'medium' ? 'bg-signal-warn' : 'bg-accent'}`} />
                  <p className="text-sm text-graphite truncate flex-1">{task.title}</p>
                  <span className="text-[10px] text-graphite/40 uppercase">{task.priority}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-graphite/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-signal-warn" /> Upcoming Appointments
            </h2>
            <Link to="/portal/booking/calendar" className="text-xs text-accent hover:text-accent-hover font-medium">Calendar</Link>
          </div>
          {stats.upcomingAppointments.length === 0 ? (
            <p className="text-sm text-graphite/50 py-4">No upcoming appointments</p>
          ) : (
            <div className="space-y-2">
              {stats.upcomingAppointments.map(appt => (
                <Link key={appt.id} to={`/portal/booking/appointments/${appt.id}`} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-accent-soft/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-signal-warn/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-signal-warn" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-graphite">{appt.client_first_name} {appt.client_last_name}</p>
                    <p className="text-xs text-graphite/50">
                      {appt.service_name ?? 'Service'} &middot; {new Date(appt.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-graphite/30 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Commerce Orders ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-graphite/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-signal-warn" /> Recent Commerce Orders
          </h2>
          <Link to="/portal/orders" className="text-xs text-accent hover:text-accent-hover font-medium">View Orders</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-graphite/50 py-2">No orders yet. Commerce activity will appear here when purchases start flowing.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/portal/orders/${order.id}`}
                className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-accent-soft/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-graphite truncate">{order.order_number}</p>
                  <p className="text-xs text-graphite/50">
                    {new Date(order.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-graphite">${(order.total_cents / 100).toFixed(2)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-graphite/40">{order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Needs Attention ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-graphite/5 p-5">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">Needs Attention</h2>
        <div className="space-y-3">
          {/* Overdue rebookings */}
          {stats.overdueClients.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-signal-down/5 border border-signal-down/10">
              <div className="w-2.5 h-2.5 rounded-full bg-signal-down mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-graphite">{stats.overdueClients.length} client{stats.overdueClients.length !== 1 ? 's' : ''} overdue for rebooking</p>
                <p className="text-xs text-graphite/50 mt-0.5">More than 30 days since last visit</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {stats.overdueClients.slice(0, 5).map(c => (
                    <Link key={c.id} to={`/portal/crm/contacts/${c.id}`} className={`text-xs px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${c.churn_risk_score >= 67 ? 'bg-signal-warn/20 text-signal-warn hover:bg-signal-warn/30' : 'bg-signal-down/10 text-signal-down hover:bg-signal-down/20'}`}>
                      {c.first_name} {c.last_name} ({c.days_since}d)
                      {c.churn_risk_score >= 67 && <span className="font-bold opacity-80 pl-1 border-l border-signal-warn/30">Risk: {c.churn_risk_score}</span>}
                    </Link>
                  ))}
                  {stats.overdueClients.length > 5 && (
                    <span className="text-xs text-graphite/40">+{stats.overdueClients.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Milestone alerts */}
          {stats.milestoneClients.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-signal-up/5 border border-signal-up/10">
              <div className="w-2.5 h-2.5 rounded-full bg-signal-up mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-graphite">Milestone alerts</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {stats.milestoneClients.map(c => (
                    <Link key={c.id} to={`/portal/crm/contacts/${c.id}`} className="text-xs bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full hover:bg-signal-up/20 transition-colors">
                      {c.first_name} {c.last_name} — {c.total_visits} visits
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stats.overdueClients.length === 0 && stats.milestoneClients.length === 0 && (
            <p className="text-sm text-graphite/50 py-2">No items need attention right now</p>
          )}
        </div>
      </div>

      {/* ── Quick Links ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/portal/crm/tasks" className="bg-white rounded-xl border border-graphite/5 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">Tasks</p>
              <p className="text-xs text-graphite/50">Manage follow-ups and reminders</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/sales/pipeline" className="bg-white rounded-xl border border-graphite/5 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">Sales Pipeline</p>
              <p className="text-xs text-graphite/50">Turn CRM demand into active deals</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/marketing/campaigns/new?source=crm" className="bg-white rounded-xl border border-graphite/5 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">Launch Campaign</p>
              <p className="text-xs text-graphite/50">Turn CRM segments into lead-gen flows</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/messages" className="bg-white rounded-xl border border-graphite/5 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">AI Messenger</p>
              <p className="text-xs text-graphite/50">Draft and send intelligent follow-ups</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
          </div>
        </Link>
      </div>

      {/* ── Relevant Signals ─────────────────────────────────────────────── */}
      {stats.topSignals.length > 0 && (
        <div className="bg-white rounded-xl border border-accent/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Relevant Signals
            </h2>
            <Link to="/portal/intelligence" className="text-xs text-accent hover:text-accent-hover font-medium">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.topSignals.map(signal => (
              <div key={signal.id} className="p-3 rounded-lg bg-accent-soft/50 border border-accent/10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingUp className={`w-3.5 h-3.5 ${signal.direction === 'up' ? 'text-signal-up' : signal.direction === 'down' ? 'text-signal-down' : 'text-signal-warn'}`} />
                    <span className="text-[10px] text-graphite/50 uppercase truncate">{signal.category ?? 'Market'}</span>
                  </div>
                  <CrossHubActionDispatcher
                    compact
                    signal={{
                      id: signal.id,
                      title: signal.title,
                      category: signal.category ?? 'Market',
                      delta: signal.magnitude,
                      confidence: 0.8,
                      source: 'market_signals',
                    }}
                    onAction={handleSignalAction}
                  />
                </div>
                <p className="text-sm font-medium text-graphite line-clamp-2">{signal.title}</p>
                <p className="text-xs text-graphite/50 mt-1">Magnitude: {signal.magnitude}</p>
              </div>
            ))}
          </div>
          {signalTaskMutation.isError && (
            <p className="text-xs text-signal-down mt-3">
              Could not create CRM follow-up task from signal action.
            </p>
          )}
          {signalTaskMutation.isSuccess && (
            <p className="text-xs text-signal-up mt-3">
              CRM follow-up task created from selected signal action.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
