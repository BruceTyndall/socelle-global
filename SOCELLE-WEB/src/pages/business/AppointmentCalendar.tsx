import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAppointments } from '../../lib/useBooking';

type View = 'month' | 'day';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const STATUS_DOT: Record<string, string> = {
  scheduled: 'bg-blue-500',
  checked_in: 'bg-purple-500',
  completed: 'bg-signal-up',
  cancelled: 'bg-signal-down',
  no_show: 'bg-signal-warn',
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am-8pm

export default function AppointmentCalendar() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${getDaysInMonth(year, month)}T23:59:59`;
  const dayStr = date.toISOString().split('T')[0];
  const dayStart = `${dayStr}T00:00:00`;
  const dayEnd = `${dayStr}T23:59:59`;

  const range = view === 'month' ? { start: monthStart, end: monthEnd } : { start: dayStart, end: dayEnd };
  const { appointments, loading, isLive } = useAppointments(businessId, range);

  const apptsByDate = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    appointments.forEach(a => {
      const d = a.start_time.split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    return map;
  }, [appointments]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));
  const prevDay = () => setDate(new Date(date.getTime() - 86400000));
  const nextDay = () => setDate(new Date(date.getTime() + 86400000));

  const dayAppts = useMemo(() =>
    appointments.filter(a => a.start_time.startsWith(dayStr)).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [appointments, dayStr]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal">Calendar</h1>
          <p className="text-sm text-pro-warm-gray mt-1">
            {view === 'month' ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <div className="flex bg-pro-ivory rounded-lg border border-pro-stone/20 overflow-hidden">
            <button onClick={() => setView('month')} className={`px-3 py-1.5 text-xs font-medium ${view === 'month' ? 'bg-accent text-white' : 'text-pro-warm-gray hover:text-pro-charcoal'}`}>Month</button>
            <button onClick={() => setView('day')} className={`px-3 py-1.5 text-xs font-medium ${view === 'day' ? 'bg-accent text-white' : 'text-pro-warm-gray hover:text-pro-charcoal'}`}>Day</button>
          </div>
        </div>
      </div>

      {view === 'month' ? (
        <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30"><ChevronLeft className="w-4 h-4 text-pro-warm-gray" /></button>
            <h2 className="text-sm font-semibold text-pro-charcoal">{date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30"><ChevronRight className="w-4 h-4 text-pro-warm-gray" /></button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-pro-stone/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-pro-warm-gray uppercase tracking-wider py-2 bg-white">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="bg-white min-h-[80px]" />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayApptList = apptsByDate[dayKey] ?? [];
              const isToday = dayKey === new Date().toISOString().split('T')[0];
              return (
                <button
                  key={day}
                  onClick={() => { setDate(new Date(year, month, day)); setView('day'); }}
                  className={`bg-white min-h-[80px] p-1 text-left hover:bg-accent/5 transition-colors ${isToday ? 'ring-1 ring-accent/30' : ''}`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-accent' : 'text-pro-charcoal'}`}>{day}</span>
                  {dayApptList.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayApptList.slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[a.status] ?? 'bg-pro-stone'}`} />
                          <span className="text-[9px] text-pro-warm-gray truncate">{a.client_first_name}</span>
                        </div>
                      ))}
                      {dayApptList.length > 3 && <span className="text-[9px] text-accent">+{dayApptList.length - 3} more</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevDay} className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30"><ChevronLeft className="w-4 h-4 text-pro-warm-gray" /></button>
            <h2 className="text-sm font-semibold text-pro-charcoal">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <button onClick={nextDay} className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30"><ChevronRight className="w-4 h-4 text-pro-warm-gray" /></button>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-pro-stone/10 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-0">
              {HOURS.map(hour => {
                const hourAppts = dayAppts.filter(a => new Date(a.start_time).getHours() === hour);
                return (
                  <div key={hour} className="flex border-t border-pro-stone/10 min-h-[48px]">
                    <div className="w-16 py-2 text-xs text-pro-warm-gray text-right pr-3 flex-shrink-0">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </div>
                    <div className="flex-1 py-1 space-y-1">
                      {hourAppts.map(a => (
                        <Link key={a.id} to={`/portal/booking/appointments/${a.id}`} className="block p-2 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[a.status] ?? 'bg-pro-stone'}`} />
                            <span className="text-xs font-medium text-pro-charcoal">{a.client_first_name} {a.client_last_name}</span>
                            <span className="text-[10px] text-pro-warm-gray">{a.service_name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
              {dayAppts.length === 0 && (
                <div className="py-8 text-center">
                  <CalIcon className="w-8 h-8 text-pro-stone mx-auto mb-2" />
                  <p className="text-sm text-pro-warm-gray">No appointments on this day</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
