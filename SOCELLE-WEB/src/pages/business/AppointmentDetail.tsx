import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Scissors, CheckCircle, XCircle, AlertTriangle, ClipboardList, UserPlus } from 'lucide-react';
import { useAppointmentDetail, useAppointments } from '../../lib/useBooking';
import { useAuth } from '../../lib/auth';
import { useState } from 'react';

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: 'bg-blue-50 text-blue-700', label: 'Scheduled' },
  checked_in: { bg: 'bg-purple-50 text-purple-700', label: 'Checked In' },
  in_progress: { bg: 'bg-accent/10 text-accent', label: 'In Progress' },
  completed: { bg: 'bg-green-50 text-green-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-50 text-red-700', label: 'Cancelled' },
  no_show: { bg: 'bg-signal-warn/10 text-signal-warn', label: 'No Show' },
};

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { appointment, loading, isLive } = useAppointmentDetail(id);
  const { updateAppointmentStatus } = useAppointments(profile?.business_id);
  const [updating, setUpdating] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const handleStatusUpdate = async (status: string, reason?: string) => {
    if (!id) return;
    setUpdating(status);
    try {
      await updateAppointmentStatus(id, status, reason);
      window.location.reload();
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-accent-soft/20 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-accent-soft/30 p-6 animate-pulse"><div className="h-32 bg-accent-soft/20 rounded" /></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-graphite/60">Appointment not found</p>
        <Link to="/portal/booking/calendar" className="text-accent text-sm mt-2 inline-block">Back to calendar</Link>
      </div>
    );
  }

  const statusInfo = STATUS_STYLES[appointment.status] ?? { bg: 'bg-accent-soft/20 text-graphite/60', label: appointment.status };
  const canCheckIn = appointment.status === 'scheduled';
  const canComplete = appointment.status === 'checked_in' || appointment.status === 'in_progress';
  const canNoShow = appointment.status === 'scheduled';
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'checked_in';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/portal/booking/calendar" className="w-8 h-8 rounded-full border border-accent-soft/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-graphite/60" />
        </Link>
        <h1 className="text-xl font-semibold text-graphite flex-1">Appointment Detail</h1>
        {!isLive && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
        )}
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.bg}`}>{statusInfo.label}</span>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-accent-soft/30 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-graphite/60" />
            <div>
              <p className="text-xs text-graphite/60">Client</p>
              <p className="text-sm font-medium text-graphite">{appointment.client_first_name} {appointment.client_last_name}</p>
              {appointment.client_email && <p className="text-xs text-graphite/60">{appointment.client_email}</p>}
              {appointment.client_phone && <p className="text-xs text-graphite/60">{appointment.client_phone}</p>}
              {appointment.contact_id ? (
                <Link
                  to={`/portal/crm/contacts/${appointment.contact_id}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-accent hover:text-accent-hover"
                >
                  Open CRM profile
                </Link>
              ) : (
                <Link
                  to={`/portal/crm/contacts/new?first_name=${encodeURIComponent(appointment.client_first_name)}&last_name=${encodeURIComponent(appointment.client_last_name)}&email=${encodeURIComponent(appointment.client_email ?? '')}&phone=${encodeURIComponent(appointment.client_phone ?? '')}&source=booking`}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-accent hover:text-accent-hover"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create CRM contact
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-graphite/60" />
            <div>
              <p className="text-xs text-graphite/60">Service</p>
              <p className="text-sm font-medium text-graphite">{appointment.service_name ?? 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-graphite/60" />
            <div>
              <p className="text-xs text-graphite/60">Date</p>
              <p className="text-sm font-medium text-graphite">{new Date(appointment.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-graphite/60" />
            <div>
              <p className="text-xs text-graphite/60">Time</p>
              <p className="text-sm font-medium text-graphite">
                {new Date(appointment.start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} - {new Date(appointment.end_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {appointment.staff_first_name && (
          <div className="border-t border-accent-soft/10 pt-3">
            <p className="text-xs text-graphite/60">Assigned to</p>
            <p className="text-sm font-medium text-graphite">{appointment.staff_first_name} {appointment.staff_last_name}</p>
          </div>
        )}

        {appointment.notes && (
          <div className="border-t border-accent-soft/10 pt-3">
            <p className="text-xs text-graphite/60">Notes</p>
            <p className="text-sm text-graphite">{appointment.notes}</p>
          </div>
        )}

        {appointment.cancellation_reason && (
          <div className="border-t border-accent-soft/10 pt-3">
            <p className="text-xs text-signal-down">Cancellation reason: {appointment.cancellation_reason}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(canCheckIn || canComplete || canNoShow || canCancel) && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3">Actions</h2>
          <div className="flex flex-wrap gap-2">
            {canCheckIn && (
              <button onClick={() => handleStatusUpdate('checked_in')} disabled={!!updating} className="inline-flex items-center gap-2 h-9 px-4 bg-purple-50 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-100 disabled:opacity-50 transition-colors">
                <CheckCircle className="w-4 h-4" /> {updating === 'checked_in' ? 'Checking in...' : 'Check In'}
              </button>
            )}
            {canComplete && (
              <button onClick={() => handleStatusUpdate('completed')} disabled={!!updating} className="inline-flex items-center gap-2 h-9 px-4 bg-green-50 text-green-700 text-sm font-medium rounded-full hover:bg-green-100 disabled:opacity-50 transition-colors">
                <CheckCircle className="w-4 h-4" /> {updating === 'completed' ? 'Completing...' : 'Complete'}
              </button>
            )}
            {canNoShow && (
              <button onClick={() => handleStatusUpdate('no_show')} disabled={!!updating} className="inline-flex items-center gap-2 h-9 px-4 bg-signal-warn/10 text-signal-warn text-sm font-medium rounded-full hover:bg-signal-warn/20 disabled:opacity-50 transition-colors">
                <AlertTriangle className="w-4 h-4" /> {updating === 'no_show' ? 'Marking...' : 'No Show'}
              </button>
            )}
            {canCancel && !showCancel && (
              <button onClick={() => setShowCancel(true)} className="inline-flex items-center gap-2 h-9 px-4 bg-red-50 text-red-700 text-sm font-medium rounded-full hover:bg-red-100 transition-colors">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>

          {showCancel && (
            <div className="mt-3 p-3 bg-red-50/50 rounded-lg border border-red-100 space-y-2">
              <input type="text" value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Cancellation reason..." className="w-full h-9 px-3 border border-red-200 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={() => setShowCancel(false)} className="text-xs text-graphite/60">Dismiss</button>
                <button onClick={() => handleStatusUpdate('cancelled', cancelReason)} disabled={!!updating} className="h-8 px-4 bg-red-600 text-white text-xs font-medium rounded-full hover:bg-red-700 disabled:opacity-50">
                  {updating === 'cancelled' ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Service Record Link */}
      {appointment.contact_id && appointment.status === 'completed' && (
        <Link to={`/portal/crm/contacts/${appointment.contact_id}/records/new`} className="block bg-white rounded-xl border border-accent-soft/30 p-5 hover:border-accent/30 transition-colors">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-graphite">Add Service Record</p>
              <p className="text-xs text-graphite/60">Document treatment details, products used, and follow-up</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
