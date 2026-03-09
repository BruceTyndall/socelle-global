import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarDays, Loader2, Plus } from 'lucide-react';
import MarketingCalendarView from '../../components/MarketingCalendarView';
import { useMarketingCampaigns } from '../../lib/marketing/useMarketingCampaigns';

export default function BusinessMarketingCalendar() {
  const {
    campaigns,
    isLive,
    isLoading,
    error,
    refetch,
  } = useMarketingCampaigns();

  return (
    <>
      <Helmet>
        <title>Marketing Calendar | Socelle</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-sans font-semibold text-graphite">Marketing Calendar</h1>
              {!isLive && !isLoading && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-warn/10 text-signal-warn">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Schedule campaign drops, content windows, and launch cadence
            </p>
          </div>
          <Link
            to="/portal/marketing/campaigns/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {error && (
          <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-signal-down" />
              <p className="text-sm text-graphite/70">{error}</p>
            </div>
            <button
              onClick={() => {
                void refetch();
              }}
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-xl border border-accent-soft p-8 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-graphite/50" />
            <span className="text-sm text-graphite/60 font-sans">Loading campaign schedule...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-accent-soft p-12 text-center">
            <CalendarDays className="w-8 h-8 text-graphite/20 mx-auto mb-2" />
            <p className="text-sm font-sans text-graphite/60 mb-3">No campaigns scheduled yet</p>
            <Link
              to="/portal/marketing/campaigns/new"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-accent-soft p-4">
            <MarketingCalendarView />
          </div>
        )}
      </div>
    </>
  );
}
