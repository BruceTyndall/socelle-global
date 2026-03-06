import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, ExternalLink, ArrowRight, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { supabase } from '../../lib/supabase';

/* ══════════════════════════════════════════════════════════════════
   Events — Industry Events & Conferences
   W10-01: Live data from Supabase `events` table (replaces mock)
   ══════════════════════════════════════════════════════════════════ */

type EventType = 'all' | 'conference' | 'trade-show' | 'workshop' | 'virtual';
type Vertical = 'all' | 'spa' | 'medspa' | 'salon';

interface IndustryEvent {
  id: string;
  name: string;
  date: string;
  dateEnd?: string;
  location: string;
  type: Exclude<EventType, 'all'>;
  verticals: Exclude<Vertical, 'all'>[];
  description: string;
  url: string;
  attendees?: string;
  featured?: boolean;
}

// Raw shape returned by Supabase (snake_case columns)
interface DbEvent {
  id: string;
  name: string;
  date: string;
  date_end: string | null;
  location: string;
  type: string;
  verticals: string[];
  description: string;
  url: string;
  attendees: string | null;
  featured: boolean;
}

function dbToEvent(row: DbEvent): IndustryEvent {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    dateEnd: row.date_end ?? undefined,
    location: row.location,
    type: row.type as IndustryEvent['type'],
    verticals: row.verticals as IndustryEvent['verticals'],
    description: row.description,
    url: row.url,
    attendees: row.attendees ?? undefined,
    featured: row.featured,
  };
}

const TYPE_LABELS: Record<Exclude<EventType, 'all'>, string> = {
  'conference': 'Conference',
  'trade-show': 'Trade Show',
  'workshop': 'Workshop',
  'virtual': 'Virtual',
};

const TYPE_COLORS: Record<Exclude<EventType, 'all'>, string> = {
  'conference': 'bg-accent/10 text-accent',
  'trade-show': 'bg-signal-up/10 text-signal-up',
  'workshop': 'bg-edu-primary/10 text-edu-primary',
  'virtual': 'bg-graphite/8 text-graphite/60',
};

const FILTER_TYPES: { value: EventType; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'conference', label: 'Conferences' },
  { value: 'trade-show', label: 'Trade Shows' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'virtual', label: 'Virtual' },
];

const VERTICAL_FILTERS: { value: Vertical; label: string }[] = [
  { value: 'all', label: 'All Verticals' },
  { value: 'spa', label: 'Spa' },
  { value: 'medspa', label: 'Medspa' },
  { value: 'salon', label: 'Salon' },
];

function formatDateRange(start: string, end?: string): string {
  const startDate = new Date(start + 'T12:00:00');
  if (!end) {
    return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const endDate = new Date(end + 'T12:00:00');
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  if (sameMonth) {
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endDate.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
  }
  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// JSON-LD
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Industry Events | Socelle',
  description: 'Professional beauty and aesthetics industry events, conferences, and trade shows for spa, medspa, and salon operators.',
  url: 'https://socelle.com/events',
  publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

export default function Events() {
  const [typeFilter, setTypeFilter] = useState<EventType>('all');
  const [verticalFilter, setVerticalFilter] = useState<Vertical>('all');
  const [events, setEvents] = useState<IndustryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        setEvents((data as DbEvent[]).map(dbToEvent));
      }
      setLoading(false);
    }
    void fetchEvents();
  }, []);

  const filtered = events.filter((ev) => {
    const typeMatch = typeFilter === 'all' || ev.type === typeFilter;
    const vertMatch = verticalFilter === 'all' || ev.verticals.includes(verticalFilter as Exclude<Vertical, 'all'>);
    return typeMatch && vertMatch;
  });

  const featured = filtered.filter((e) => e.featured);
  const rest = filtered.filter((e) => !e.featured);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Industry Events — Socelle</title>
        <meta
          name="description"
          content="Professional beauty industry events, conferences, and trade shows for spa, medspa, and salon operators. Sourced and curated by Socelle."
        />
        <meta property="og:title" content="Industry Events — Socelle" />
        <meta
          property="og:description"
          content="Conferences, trade shows, and workshops for licensed beauty and aesthetics professionals."
        />
        <link rel="canonical" href="https://socelle.com/events" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <MainNav />

      {/* ── Dark Hero ────────────────────────────────────────────── */}
      <section className="bg-mn-dark pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <p className="text-[0.75rem] tracking-[0.18em] font-medium uppercase text-white/30 mb-5">
              INDUSTRY CALENDAR
            </p>
          </BlockReveal>
          <BlockReveal delay={80}>
            <h1 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5 max-w-3xl leading-[1.08] tracking-[-0.02em]">
              Industry Events
            </h1>
          </BlockReveal>
          <BlockReveal delay={160}>
            <p className="text-[1.125rem] text-white/55 font-sans max-w-2xl mb-10">
              Conferences, trainings, and trade events — curated and ranked by relevance to your specialty.
            </p>
          </BlockReveal>

          <BlockReveal delay={200}>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/portal/signup" className="inline-flex items-center justify-center h-[48px] px-7 bg-accent text-white font-sans font-semibold text-sm rounded-full transition-all hover:bg-accent-hover hover:-translate-y-[1px]">
                Get Event Alerts
              </Link>
              <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="inline-flex items-center justify-center rounded-full h-[48px] px-7 bg-white/10 text-[#F7F5F2] border border-[rgba(247,245,242,0.16)] font-sans font-medium text-sm hover:bg-white/15 transition-all duration-200">
                Browse by Specialty
              </button>
            </div>
          </BlockReveal>

          {/* Stats row */}
          <BlockReveal delay={240}>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="font-mono text-2xl font-bold text-[#F7F5F2]">
                  {loading ? '—' : events.length}
                </p>
                <p className="text-[0.8125rem] text-white/40 mt-0.5">events indexed</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#F7F5F2]">2026</p>
                <p className="text-[0.8125rem] text-white/40 mt-0.5">season</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#F7F5F2]">3</p>
                <p className="text-[0.8125rem] text-white/40 mt-0.5">verticals covered</p>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <section className="border-b border-graphite/8 bg-white/40 backdrop-blur-[8px] sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Type filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_TYPES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`
                    inline-flex items-center h-8 px-3.5 rounded-full text-[0.8125rem] font-sans font-medium
                    transition-colors duration-150
                    ${typeFilter === f.value
                      ? 'bg-graphite text-[#F7F5F2]'
                      : 'text-graphite/55 hover:text-graphite hover:bg-black/[0.04]'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-graphite/12 hidden sm:block" />

            {/* Vertical filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {VERTICAL_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setVerticalFilter(f.value)}
                  className={`
                    inline-flex items-center h-8 px-3.5 rounded-full text-[0.8125rem] font-sans font-medium
                    transition-colors duration-150
                    ${verticalFilter === f.value
                      ? 'bg-accent/15 text-accent'
                      : 'text-graphite/55 hover:text-graphite hover:bg-black/[0.04]'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="ml-auto text-[0.8125rem] text-graphite/40 font-sans hidden sm:block">
              {loading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'event' : 'events'}`}
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <section className="pt-12 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[20px] border border-graphite/8 p-6 animate-pulse">
                  <div className="h-6 bg-graphite/[0.06] rounded-full w-24 mb-4" />
                  <div className="h-5 bg-graphite/[0.06] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-graphite/[0.04] rounded w-1/2 mb-6" />
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-graphite/[0.04] rounded" />
                    <div className="h-3 bg-graphite/[0.04] rounded w-5/6" />
                    <div className="h-3 bg-graphite/[0.04] rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state (after load) */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <p className="text-graphite/50 font-sans">No events match your current filters.</p>
              <button
                onClick={() => { setTypeFilter('all'); setVerticalFilter('all'); }}
                className="mt-4 text-accent text-sm font-sans hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Featured events */}
          {!loading && featured.length > 0 && (
            <div className="mb-12">
              <p className="text-[0.75rem] tracking-[0.14em] uppercase font-medium text-graphite/35 font-sans mb-5">
                FEATURED
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((ev) => (
                  <EventCard key={ev.id} event={ev} featured />
                ))}
              </div>
            </div>
          )}

          {/* All other events */}
          {!loading && rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <p className="text-[0.75rem] tracking-[0.14em] uppercase font-medium text-graphite/35 font-sans mb-5">
                  ALL EVENTS
                </p>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-mn-dark py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[0.75rem] tracking-[0.18em] uppercase text-white/30 font-sans mb-4">
            INTELLIGENCE PLATFORM
          </p>
          <h2 className="font-sans font-semibold text-subsection text-[#F7F5F2] mb-4">
            Track the market between events
          </h2>
          <p className="text-white/55 font-sans max-w-xl mx-auto mb-8">
            Socelle surfaces signals, benchmarks, and brand adoption data continuously —
            not just when you're on the show floor.
          </p>
          <Link
            to="/request-access"
            className="inline-flex items-center gap-2 h-[48px] px-7 bg-accent text-white font-sans font-semibold text-sm rounded-full transition-all hover:bg-accent-hover hover:-translate-y-[1px]"
          >
            Get Intelligence Access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ── Event Card ───────────────────────────────────────────────────────

function EventCard({ event, featured }: { event: IndustryEvent; featured?: boolean }) {
  const isVirtual = event.type === 'virtual';

  return (
    <BlockReveal>
      <div className={`
        bg-white rounded-[20px] border border-graphite/8 p-6
        transition-all duration-200 hover:shadow-panel hover:-translate-y-[2px]
        flex flex-col h-full
        ${featured ? 'ring-1 ring-accent/20' : ''}
      `}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[0.7rem] font-sans font-semibold ${TYPE_COLORS[event.type]}`}>
            {isVirtual && <Video className="w-3 h-3" />}
            {TYPE_LABELS[event.type]}
          </span>
          {featured && (
            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.7rem] font-sans font-medium bg-accent/8 text-accent">
              Featured
            </span>
          )}
        </div>

        {/* Event name */}
        <h3 className="font-sans font-semibold text-[1.0625rem] text-graphite mb-2 leading-[1.3]">
          {event.name}
        </h3>

        {/* Date & location */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-[0.8125rem] text-graphite/55 font-sans">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatDateRange(event.date, event.dateEnd)}</span>
          </div>
          <div className="flex items-center gap-2 text-[0.8125rem] text-graphite/55 font-sans">
            {isVirtual ? <Video className="w-3.5 h-3.5 flex-shrink-0" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{event.location}</span>
          </div>
          {event.attendees && (
            <div className="flex items-center gap-2 text-[0.8125rem] text-graphite/40 font-sans">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{event.attendees} attendees</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-[0.875rem] text-graphite/60 font-sans leading-[1.6] mb-5 flex-1">
          {event.description}
        </p>

        {/* Verticals */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {event.verticals.map((v) => (
            <span key={v} className="inline-flex items-center h-5 px-2 rounded-full text-[0.7rem] font-sans font-medium bg-graphite/[0.06] text-graphite/50 capitalize">
              {v}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Event website
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </BlockReveal>
  );
}
