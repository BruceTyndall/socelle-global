import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Scissors, ArrowRight, CheckCircle, XCircle, AlertTriangle, UserPlus, Zap, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAppointments, useBookingServices, useBookingStaff } from '../../lib/useBooking';
import { useActionableSignals } from '../../lib/intelligence/useActionableSignals';
import { CrossHubActionDispatcher } from '../../components/CrossHubActionDispatcher';
import { exportToCsv } from '../../lib/csvExport';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700',
  checked_in: 'bg-purple-50 text-purple-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  no_show: 'bg-signal-warn/10 text-signal-warn',
};

export default function BookingDashboard() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const today = new Date().toISOString().split('T')[0];
  const { appointments, loading: apptLoading, isLive } = useAppointments(businessId, { start: `${today}T00:00:00`, end: `${today}T23:59:59` });
  const { services, loading: svcLoading } = useBookingServices(businessId);
  const { staff, loading: staffLoading } = useBookingStaff(businessId);
  const { signals, loading: signalsLoading, error: signalsError, refetch: refetchSignals } = useActionableSignals(3);

  const loading = apptLoading || svcLoading || staffLoading;

  const apptStats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const noShow = appointments.filter(a => a.no_show).length;
    const upcoming = appointments.filter(a => a.status === 'scheduled' && new Date(a.start_time) > new Date()).length;
    return { total, completed, noShow, upcoming };
  }, [appointments]);

  const handleExportAppointments = () => {
    exportToCsv(
      appointments.map((appt) => ({
        id: appt.id,
        client: `${appt.client_first_name} ${appt.client_last_name}`.trim(),
        service: appt.service_name ?? '',
        start_time: appt.start_time,
        end_time: appt.end_time,
        status: appt.status,
        staff: `${appt.staff_first_name ?? ''} ${appt.staff_last_name ?? ''}`.trim(),
        contact_id: appt.contact_id ?? '',
      })),
      'booking_appointments',
    );
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Booking Management</h1>
          <p className="text-sm text-graphite/60 mt-1">Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAppointments}
            disabled={appointments.length === 0}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-accent-soft text-xs font-medium text-graphite hover:bg-accent-soft/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <Link to="/portal/booking/calendar" className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Calendar className="w-4 h-4" /> View Calendar
          </Link>
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: apptStats.total, icon: Calendar, color: 'text-accent' },
          { label: 'Upcoming', value: apptStats.upcoming, icon: Clock, color: 'text-blue-600' },
          { label: 'Completed', value: apptStats.completed, icon: CheckCircle, color: 'text-signal-up' },
          { label: 'No Shows', value: apptStats.noShow, icon: AlertTriangle, color: 'text-signal-warn' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-accent-soft/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-graphite/60 uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-semibold text-graphite">{loading ? '-' : stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
        <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">Today&apos;s Schedule</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-accent-soft/10 rounded-lg" />)}</div>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-graphite/60 py-4">No appointments scheduled for today</p>
        ) : (
          <div className="space-y-2">
            {appointments.map(appt => (
              <div key={appt.id} className="flex items-center gap-2">
                <Link to={`/portal/booking/appointments/${appt.id}`} className="flex items-center gap-4 p-3 rounded-lg border border-accent-soft/20 hover:border-accent/30 transition-colors flex-1 min-w-0">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-semibold text-graphite">{new Date(appt.start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-graphite">{appt.client_first_name} {appt.client_last_name}</p>
                    <p className="text-xs text-graphite/60">{appt.service_name ?? 'Service'}{appt.staff_first_name ? ` · ${appt.staff_first_name} ${appt.staff_last_name}` : ''}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status] ?? 'bg-accent-soft/20 text-graphite/60'}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </Link>
                {appt.contact_id ? (
                  <Link
                    to={`/portal/crm/contacts/${appt.contact_id}`}
                    className="h-9 px-3 rounded-lg border border-accent/30 text-accent text-xs font-medium hover:bg-accent/5 transition-colors inline-flex items-center"
                  >
                    CRM
                  </Link>
                ) : (
                  <Link
                    to={`/portal/crm/contacts/new?first_name=${encodeURIComponent(appt.client_first_name)}&last_name=${encodeURIComponent(appt.client_last_name)}&email=${encodeURIComponent(appt.client_email ?? '')}&phone=${encodeURIComponent(appt.client_phone ?? '')}&source=booking`}
                    className="h-9 px-3 rounded-lg border border-accent/30 text-accent text-xs font-medium hover:bg-accent/5 transition-colors inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add to CRM
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signal-driven actions */}
      <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Signals to Activate</h2>
          <Link to="/portal/intelligence" className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
            Open Intelligence
          </Link>
        </div>
        {signalsLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-11 bg-accent-soft/10 rounded-lg" />
            <div className="h-11 bg-accent-soft/10 rounded-lg" />
          </div>
        ) : signalsError ? (
          <div className="flex items-center justify-between gap-3 bg-signal-down/5 border border-signal-down/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-signal-down" />
              <p className="text-xs text-graphite/70">{signalsError}</p>
            </div>
            <button
              onClick={() => {
                void refetchSignals();
              }}
              className="inline-flex items-center gap-1 text-xs text-graphite/70 hover:text-graphite transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-6">
            <Zap className="w-6 h-6 text-graphite/20 mx-auto mb-2" />
            <p className="text-xs text-graphite/60">No active signals available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {signals.map((signal) => (
              <div key={signal.id} className="flex items-center gap-2 border border-accent-soft/20 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-graphite truncate">{signal.title}</p>
                  <p className="text-xs text-graphite/60">
                    {signal.category} • Δ {signal.delta.toFixed(1)} • {(signal.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
                <CrossHubActionDispatcher
                  compact
                  signal={{
                    id: signal.id,
                    title: signal.title,
                    category: signal.category,
                    delta: signal.delta,
                    confidence: signal.confidence,
                    source: signal.source,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link to="/portal/booking/services" className="bg-white rounded-xl border border-accent-soft/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Scissors className="w-5 h-5 text-accent" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">Services</p>
              <p className="text-xs text-graphite/60">{services.length} services configured</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/60 group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/booking/staff" className="bg-white rounded-xl border border-accent-soft/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Users className="w-5 h-5 text-accent" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">Staff</p>
              <p className="text-xs text-graphite/60">{staff.length} team members</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/60 group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/crm/contacts" className="bg-white rounded-xl border border-accent-soft/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Users className="w-5 h-5 text-accent" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">CRM Contacts</p>
              <p className="text-xs text-graphite/60">View profiles, notes, and lifecycle stage</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/60 group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/crm/tasks" className="bg-white rounded-xl border border-accent-soft/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-accent" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-graphite">Follow-up Tasks</p>
              <p className="text-xs text-graphite/60">Create post-appointment actions in CRM</p>
            </div>
            <ArrowRight className="w-4 h-4 text-graphite/60 group-hover:text-accent transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
