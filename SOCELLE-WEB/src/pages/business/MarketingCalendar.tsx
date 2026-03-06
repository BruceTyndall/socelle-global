import BusinessNav from '../../components/BusinessNav';
import MarketingCalendarView from '../../components/MarketingCalendarView';

export default function BusinessMarketingCalendar() {
  return (
    <>
      <BusinessNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketingCalendarView />
      </div>
    </>
  );
}
