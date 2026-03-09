import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Download,
  AlertCircle,
  RefreshCw,
  CalendarSearch,
} from 'lucide-react';
import JsonLd from '../../components/seo/JsonLd';
import {
  DEFAULT_OG_IMAGE,
  buildCanonical,
  buildCollectionPageSchema,
  buildEventSchema,
} from '../../lib/seo';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { useEvents, type EventRow } from '../../lib/useEvents';

/* ══════════════════════════════════════════════════════════════════
   Events — W10-05: Live wire via useEvents / events table
   - TanStack Query v5 via useEvents
   - Filters: type
   - CSV export, skeleton shimmer, empty state, error with retry
   - DEMO fallback when Supabase not configured
   ══════════════════════════════════════════════════════════════════ */

const EVENT_TYPES = ['All', 'Conference', 'Trade-show', 'Workshop', 'Virtual'] as const;

// Map display labels → DB values
const TYPE_TO_DB: Record<string, string> = {
  Conference: 'conference',
  'Trade-show': 'trade-show',
  Workshop: 'workshop',
  Virtual: 'virtual',
};

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    conference: 'bg-[#6E879B]/15 text-[#6E879B]',
    'trade-show': 'bg-purple-500/15 text-purple-600',
    workshop: 'bg-blue-500/15 text-blue-600',
    virtual: 'bg-[#5F8A72]/15 text-[#5F8A72]',
  };
  const label =
    type === 'trade-show'
      ? 'Trade Show'
      : type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium ${
        colors[type] ?? 'bg-[#141418]/10 text-[#141418]/60'
      }`}
    >
      {label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ── Skeleton shimmer ──────────────────────────────────────────── */
function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#141418]/5 animate-pulse">
      <div className="aspect-[16/10] bg-[#141418]/[0.06]" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-[#141418]/[0.06] rounded-full" />
          <div className="h-4 w-16 bg-[#141418]/[0.04] rounded" />
        </div>
        <div className="h-5 w-3/4 bg-[#141418]/[0.06] rounded" />
        <div className="h-3 w-full bg-[#141418]/[0.04] rounded" />
        <div className="h-3 w-2/3 bg-[#141418]/[0.04] rounded" />
        <div className="h-3 w-1/3 bg-[#141418]/[0.04] rounded" />
      </div>
    </div>
  );
}

function eventsToCsv(events: EventRow[]): string {
  const header = 'Name,Type,Date,End Date,Location,Attendees,URL\n';
  const rows = events
    .map(
      (e) =>
        [
          `"${e.name.replace(/"/g, '""')}"`,
          e.type,
          e.date,
          e.date_end ?? '',
          `"${e.location.replace(/"/g, '""')}"`,
          e.attendees ?? '',
          e.url,
        ].join(','),
    )
    .join('\n');
  return header + rows;
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Events() {
  const [typeFilter, setTypeFilter] = useState('All');

  const { events, loading, error, isLive, refetch } = useEvents({
    upcoming: false,
    type: typeFilter !== 'All' ? typeFilter : undefined,
  });

  const featured = useMemo(() => events.find((e) => e.featured), [events]);
  const listings = useMemo(() => events.filter((e) => !e.featured), [events]);

  // Additional client-side filter (hook already filters by type but this handles display)
  const filtered = useMemo(() => {
    if (typeFilter === 'All') return listings;
    const dbType = TYPE_TO_DB[typeFilter] ?? typeFilter.toLowerCase();
    return listings.filter((e) => e.type === dbType);
  }, [listings, typeFilter]);

  const handleExport = useCallback(() => {
    const csv = eventsToCsv(events);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socelle-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const eventSchemas = useMemo(
    () =>
      events.slice(0, 20).map((e) =>
        buildEventSchema({
          name: e.name,
          description: e.description,
          startDate: e.date,
          endDate: e.date_end ?? undefined,
          locationName: e.location,
          url: e.url !== '#' ? e.url : buildCanonical('/events'),
          organizer: 'Socelle',
        }),
      ),
    [events],
  );

  return (
    <div className="min-h-screen bg-[#F6F3EF] font-sans">
      <Helmet>
        <title>Events - Socelle</title>
        <meta
          name="description"
          content="Industry events, masterclasses, and conferences for professional beauty operators and brands."
        />
        <meta property="og:title" content="Events - Socelle" />
        <meta
          property="og:description"
          content="Masterclasses, brand activations, and intelligence summits curated for practitioners and brands."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/events')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonical('/events')} />
      </Helmet>
      <JsonLd
        data={buildCollectionPageSchema({
          name: 'Professional Beauty Events',
          description:
            'Industry events, masterclasses, and conferences for professional beauty operators and brands.',
          url: buildCanonical('/events'),
        })}
      />
      {eventSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <img
          src="/images/brand/photos/19.svg"
          alt="Professional beauty industry event"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-white/60 backdrop-blur-xl"
          aria-hidden="true"
        />
        <div className="relative section-container text-center py-24 lg:py-32">
          <BlockReveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[#141418]/40">
                Industry Events
              </p>
              {!isLive && !loading && (
                <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
              {isLive && (
                <span className="text-[10px] font-semibold bg-[#5F8A72]/10 text-[#5F8A72] px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              )}
            </div>
          </BlockReveal>
          <WordReveal
            text="Industry Events and Conferences"
            as="h1"
            className="font-sans font-semibold text-hero text-[#141418] mb-8 max-w-3xl mx-auto justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-[#141418]/60 max-w-2xl mx-auto">
              Masterclasses, brand activations, and intelligence summits —
              curated for practitioners and brands defining modern aesthetics.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── DEMO Banner ──────────────────────────────────────────── */}
      {!isLive && !loading && (
        <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 text-center">
          PREVIEW — This data is for demonstration purposes. Events will be live when the events table is populated.
        </div>
      )}

      {/* ── Featured Event ───────────────────────────────────────── */}
      {!loading && featured && (
        <section className="py-14 lg:py-20">
          <div className="section-container">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[#6E879B] mb-6">
                Featured Event
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <FeaturedEventCard event={featured} />
            </BlockReveal>
          </div>
        </section>
      )}

      {/* ── Listings ─────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-white/60">
        <div className="section-container">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <BlockReveal>
              <h2 className="font-sans font-semibold text-subsection text-[#141418]">
                Upcoming Events
              </h2>
            </BlockReveal>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type filter pills */}
              <div className="flex gap-2 flex-wrap">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                      typeFilter === type
                        ? 'bg-[#141418] text-white'
                        : 'bg-white border border-[#141418]/10 text-[#141418]/60 hover:border-[#141418]/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {/* CSV export */}
              {events.length > 0 && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-[#141418]/10 bg-white text-[#141418]/60 text-xs font-medium hover:border-[#141418]/20 hover:text-[#141418] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* ── Loading skeleton ────────────────────────────────── */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ── Error state ─────────────────────────────────────── */}
          {!loading && error && (
            <div className="text-center py-16">
              <AlertCircle className="w-10 h-10 text-[#8E6464] mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-[#141418] mb-2">
                Unable to load events
              </h3>
              <p className="text-sm text-[#141418]/50 mb-6 max-w-md mx-auto">
                We encountered an issue fetching events. Please try again.
              </p>
              <button
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6E879B] text-white text-sm font-medium hover:bg-[#5A7185] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────── */}
          {!loading && !error && filtered.length === 0 && !featured && (
            <div className="text-center py-16">
              <CalendarSearch className="w-10 h-10 text-[#141418]/20 mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-[#141418] mb-2">
                No events matching your criteria
              </h3>
              <p className="text-sm text-[#141418]/50 mb-6 max-w-md mx-auto">
                {typeFilter !== 'All'
                  ? 'Try selecting a different event type.'
                  : 'No upcoming events at this time. Check back for masterclasses and industry summits.'}
              </p>
              {typeFilter !== 'All' && (
                <button
                  onClick={() => setTypeFilter('All')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#141418]/10 text-[#141418]/60 text-sm font-medium hover:border-[#141418]/20 transition-all cursor-pointer"
                >
                  Show all types
                </button>
              )}
            </div>
          )}

          {/* ── Event Cards Grid ─────────────────────────────────── */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <BlockReveal key={event.id} delay={i * 60}>
                  <EventCard event={event} />
                </BlockReveal>
              ))}
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <p className="text-xs text-[#141418]/35 mt-6 text-center">
              Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#141418] py-20 lg:py-24 rounded-3xl mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-[#F6F3EF] mb-5">
              Never miss an industry event
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-[#F6F3EF]/65 max-w-md mx-auto mb-10">
              Get notified about masterclasses, summits, and brand activations
              curated for your specialty.
            </p>
          </BlockReveal>
          <BlockReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/request-access"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F6F3EF] text-[#141418] text-sm font-semibold hover:bg-white transition-colors"
              >
                Get Event Alerts
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ── Featured Event Card ───────────────────────────────────────── */
function FeaturedEventCard({ event }: { event: EventRow }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 rounded-2xl bg-white shadow-sm overflow-hidden border border-[#141418]/5">
      <div className="aspect-[16/10] lg:aspect-auto bg-[#F6F3EF] flex items-center justify-center">
        <Calendar className="w-16 h-16 text-[#141418]/10" aria-hidden="true" />
      </div>
      <div className="flex flex-col justify-center p-8">
        <EventTypeBadge type={event.type} />
        <h2 className="font-sans font-semibold text-subsection text-[#141418] mt-4 mb-4">
          {event.name}
        </h2>
        <p className="text-[#141418]/60 leading-relaxed mb-6">
          {event.description}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-[#141418]/50 mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {formatDate(event.date)}
            {event.date_end && ` — ${formatDate(event.date_end)}`}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {event.location}
          </span>
          {event.attendees && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" aria-hidden="true" />
              {event.attendees} attendees
            </span>
          )}
        </div>
        {event.url && event.url !== '#' ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#6E879B] hover:text-[#5A7185] transition-colors text-sm font-medium"
          >
            Register Interest
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        ) : (
          <Link
            to="/request-access"
            className="inline-flex items-center gap-2 text-[#6E879B] hover:text-[#5A7185] transition-colors text-sm font-medium"
          >
            Register Interest
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── Event Card ────────────────────────────────────────────────── */
function EventCard({ event }: { event: EventRow }) {
  const inner = (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#141418]/5 shadow-sm hover:shadow-md transition-shadow duration-300 group h-full flex flex-col">
      <div className="aspect-[16/10] bg-[#F6F3EF] flex items-center justify-center overflow-hidden">
        <Calendar className="w-12 h-12 text-[#141418]/10 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <EventTypeBadge type={event.type} />
          <span className="text-[#141418]/40 text-xs">{formatDate(event.date)}</span>
        </div>
        <h3 className="font-sans font-medium text-[#141418] mb-2 group-hover:text-[#6E879B] transition-colors">
          {event.name}
        </h3>
        <p className="text-[#141418]/50 text-sm line-clamp-2 mb-3 flex-1">
          {event.description}
        </p>
        <div className="flex items-center gap-1.5 text-[#141418]/40 text-xs">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );

  if (event.url && event.url !== '#') {
    return (
      <a href={event.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {inner}
      </a>
    );
  }
  return inner;
}
