import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { MarketingCampaign } from '../../lib/useCampaigns';

// ── WO-OVERHAUL-15: Marketing Calendar (/marketing/calendar) ─────────
// Monthly view of scheduled campaigns.
// Data source: campaigns table via useCampaigns()
// isLive flag drives DEMO badge.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-graphite/30',
  scheduled: 'bg-accent',
  active: 'bg-signal-up',
  paused: 'bg-signal-warn',
  completed: 'bg-graphite/20',
  archived: 'bg-graphite/10',
};

export default function MarketingCalendar() {
  const { campaigns, isLive, loading } = useCampaigns();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  }, [year, month]);

  const getCampaignsForDay = (day: number): MarketingCampaign[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return campaigns.filter((c: MarketingCampaign) => {
      if (c.scheduled_at) return c.scheduled_at.startsWith(dateStr);
      if (c.sent_at) return c.sent_at.startsWith(dateStr);
      return c.created_at.startsWith(dateStr);
    });
  };

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Marketing Calendar</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">Monthly view of scheduled and active campaigns</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : (
          <div className="bg-mn-card border border-graphite/8 rounded-xl overflow-hidden">
            {/* Month Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-graphite/8">
              <button onClick={prevMonth} className="p-2 rounded-lg text-graphite/40 hover:text-graphite hover:bg-mn-surface transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-graphite font-sans">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg text-graphite/40 hover:text-graphite hover:bg-mn-surface transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-graphite/8">
              {DAYS.map((d) => (
                <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-graphite/40 font-sans">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dayCampaigns = day ? getCampaignsForDay(day) : [];
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                return (
                  <div
                    key={i}
                    className={`min-h-[80px] lg:min-h-[100px] p-1.5 border-b border-r border-graphite/5 ${!day ? 'bg-graphite/2' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-sans ${
                          isToday ? 'bg-mn-dark text-white rounded-full font-semibold' : 'text-graphite/50'
                        }`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayCampaigns.slice(0, 2).map((c: MarketingCampaign) => (
                            <Link
                              key={c.id}
                              to={`/marketing/campaigns/${c.id}`}
                              className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-sans text-graphite/70 hover:bg-accent/5 transition-colors truncate"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[c.status] || 'bg-graphite/20'}`} />
                              <span className="truncate">{c.name}</span>
                            </Link>
                          ))}
                          {dayCampaigns.length > 2 && (
                            <span className="text-[9px] text-graphite/30 font-sans pl-1">+{dayCampaigns.length - 2} more</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-graphite/8 flex items-center gap-4">
              <Calendar className="w-3.5 h-3.5 text-graphite/30" />
              {['scheduled', 'active', 'completed'].map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                  <span className="text-[10px] text-graphite/40 font-sans capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
