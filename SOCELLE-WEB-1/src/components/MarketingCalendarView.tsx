import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Sparkles, Video, Package, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface MarketingMonth {
  id: string;
  month: number;
  month_name: string;
  year: number;
  theme: string;
  focus_moment: string;
  featured_products: string[];
  featured_protocols: string[];
  new_launches: string[];
  webinar_title: string;
  webinar_date: string;
  quarter: number;
}

export default function MarketingCalendarView() {
  const [calendarData, setCalendarData] = useState<MarketingMonth[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
    const currentDate = new Date();
    setCurrentMonth(currentDate.getMonth() + 1);
    setSelectedQuarter(Math.ceil((currentDate.getMonth() + 1) / 3));
  }, []);

  const fetchCalendarData = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_calendar')
        .select('*')
        .eq('year', 2026)
        .order('month');

      if (error) throw error;
      setCalendarData(data || []);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const quarterMonths = calendarData.filter(m => m.quarter === selectedQuarter);

  const getQuarterName = (q: number) => {
    const names = ['Q1: Winter/Spring', 'Q2: Spring/Summer', 'Q3: Summer/Fall', 'Q4: Fall/Winter'];
    return names[q - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pro-navy"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-pro-navy to-pro-charcoal rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl font-bold">2026 Marketing Calendar</h1>
        </div>
        <p className="text-white text-lg">
          Strategic planning for seasonal protocols, product launches, and promotional campaigns
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-pro-stone p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedQuarter(Math.max(1, selectedQuarter - 1))}
            disabled={selectedQuarter === 1}
            className="p-2 rounded-lg hover:bg-pro-stone disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-pro-charcoal">{getQuarterName(selectedQuarter)}</h2>
            <p className="text-pro-warm-gray mt-1">
              {quarterMonths.length > 0 && `${quarterMonths[0].month_name} - ${quarterMonths[quarterMonths.length - 1]?.month_name} 2026`}
            </p>
          </div>

          <button
            onClick={() => setSelectedQuarter(Math.min(4, selectedQuarter + 1))}
            disabled={selectedQuarter === 4}
            className="p-2 rounded-lg hover:bg-pro-stone disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quarterMonths.map((month) => (
          <div
            key={month.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${
              month.month === currentMonth
                ? 'border-pro-navy ring-2 ring-pro-stone'
                : 'border-pro-stone hover:border-pro-stone'
            }`}
          >
            <div className={`p-6 rounded-t-xl ${
              month.month === currentMonth
                ? 'bg-gradient-to-r from-pro-navy to-pro-charcoal text-white'
                : 'bg-pro-ivory text-pro-charcoal'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{month.month_name}</h3>
                {month.month === currentMonth && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    Current
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium ${
                month.month === currentMonth ? 'text-white' : 'text-pro-warm-gray'
              }`}>
                {month.theme}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-semibold text-pro-charcoal text-sm">Focus</h4>
                </div>
                <p className="text-pro-warm-gray text-sm leading-relaxed pl-6">
                  {month.focus_moment}
                </p>
              </div>

              {month.new_launches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-rose-500" />
                    <h4 className="font-semibold text-pro-charcoal text-sm">New Launches</h4>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {month.new_launches.map((launch, idx) => (
                      <li key={idx} className="text-sm text-rose-700 font-medium flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{launch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {month.featured_protocols.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-pro-navy" />
                    <h4 className="font-semibold text-pro-charcoal text-sm">Featured Protocols</h4>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {month.featured_protocols.map((protocol, idx) => (
                      <li key={idx} className="text-sm text-pro-charcoal flex items-start gap-2">
                        <span className="text-teal-400 mt-0.5">•</span>
                        <span>{protocol}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {month.featured_products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-pro-navy" />
                    <h4 className="font-semibold text-pro-charcoal text-sm">Featured Products</h4>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {month.featured_products.map((product, idx) => (
                      <li key={idx} className="text-sm text-pro-charcoal flex items-start gap-2">
                        <span className="text-pro-gold mt-0.5">•</span>
                        <span>{product}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {month.webinar_title && (
                <div className="pt-4 border-t border-pro-stone">
                  <div className="flex items-start gap-2">
                    <Video className="w-4 h-4 text-pro-navy mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-pro-charcoal text-sm mb-1">Webinar</h4>
                      <p className="text-sm text-pro-charcoal mb-1">{month.webinar_title}</p>
                      <p className="text-xs text-pro-navy font-medium">{month.webinar_date}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          How to Use This Calendar
        </h3>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Plan Ahead:</strong> Schedule protocols and promotions around monthly themes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Product Focus:</strong> Feature highlighted products in treatment rooms and retail displays</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Training:</strong> Register for webinars to stay current on techniques and product knowledge</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>New Launches:</strong> Prepare inventory and staff training for upcoming product releases</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
