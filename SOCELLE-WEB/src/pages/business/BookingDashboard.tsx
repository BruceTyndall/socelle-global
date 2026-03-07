import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Scissors, ArrowRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAppointments, useBookingServices, useBookingStaff } from '../../lib/useBooking';

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

  const loading = apptLoading || svcLoading || staffLoading;

  const apptStats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const noShow = appointments.filter(a => a.no_show).length;
    const upcoming = appointments.filter(a => a.status === 'scheduled' && new Date(a.start_time) > new Date()).length;
    return { total, completed, noShow, upcoming };
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal">Booking Management</h1>
          <p className="text-sm text-pro-warm-gray mt-1">Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
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
            <div key={stat.label} className="bg-white rounded-xl border border-pro-stone/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-pro-warm-gray uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-semibold text-pro-charcoal">{loading ? '-' : stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
        <h2 className="text-sm font-semibold text-pro-charcoal uppercase tracking-wider mb-4">Today&apos;s Schedule</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-pro-stone/10 rounded-lg" />)}</div>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-pro-warm-gray py-4">No appointments scheduled for today</p>
        ) : (
          <div className="space-y-2">
            {appointments.map(appt => (
              <Link key={appt.id} to={`/portal/booking/appointments/${appt.id}`} className="flex items-center gap-4 p-3 rounded-lg border border-pro-stone/20 hover:border-accent/30 transition-colors">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm font-semibold text-pro-charcoal">{new Date(appt.start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-pro-charcoal">{appt.client_first_name} {appt.client_last_name}</p>
                  <p className="text-xs text-pro-warm-gray">{appt.service_name ?? 'Service'}{appt.staff_first_name ? ` · ${appt.staff_first_name} ${appt.staff_last_name}` : ''}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status] ?? 'bg-pro-stone/20 text-pro-warm-gray'}`}>
                  {appt.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/portal/booking/services" className="bg-white rounded-xl border border-pro-stone/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Scissors className="w-5 h-5 text-accent" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-pro-charcoal">Services</p>
              <p className="text-xs text-pro-warm-gray">{services.length} services configured</p>
            </div>
            <ArrowRight className="w-4 h-4 text-pro-warm-gray group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/booking/staff" className="bg-white rounded-xl border border-pro-stone/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pro-gold/10 flex items-center justify-center"><Users className="w-5 h-5 text-pro-gold" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-pro-charcoal">Staff</p>
              <p className="text-xs text-pro-warm-gray">{staff.length} team members</p>
            </div>
            <ArrowRight className="w-4 h-4 text-pro-warm-gray group-hover:text-accent transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
