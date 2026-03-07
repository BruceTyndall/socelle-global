import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
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

/* ── DEMO Data ─── events table is stub (W10-05) ────────────── */
const DEMO_EVENTS = [
  {
    id: 'demo-1',
    title: 'Professional Beauty Intelligence Summit',
    description: 'Annual gathering of operators and brand leaders exploring market signals, procurement intelligence, and category trends shaping the professional beauty landscape.',
    event_type: 'Conference',
    location: 'Miami, FL',
    start_date: '2026-06-14',
    end_date: '2026-06-16',
    capacity: 500,
    image: '/images/brand/photos/5.svg',
    is_featured: true,
  },
  {
    id: 'demo-2',
    title: 'Advanced Facial Protocol Masterclass',
    description: 'Hands-on training in protocol-driven treatment planning with peer benchmarking and product intelligence.',
    event_type: 'Masterclass',
    location: 'Los Angeles, CA',
    start_date: '2026-05-22',
    end_date: null,
    capacity: 40,
    image: '/images/brand/photos/6.svg',
    is_featured: false,
  },
  {
    id: 'demo-3',
    title: 'Brand Partner Activation: Spring Launch',
    description: 'Exclusive brand showcase featuring new product lines, ingredient intelligence, and distributor partnerships.',
    event_type: 'Activation',
    location: 'New York, NY',
    start_date: '2026-04-10',
    end_date: '2026-04-11',
    capacity: 120,
    image: '/images/brand/photos/7.svg',
    is_featured: false,
  },
  {
    id: 'demo-4',
    title: 'Procurement Intelligence Webinar',
    description: 'Virtual deep-dive into market signals, reorder optimization, and category gap analysis for medspa operators.',
    event_type: 'Webinar',
    location: 'Virtual',
    start_date: '2026-04-28',
    end_date: null,
    capacity: null,
    image: '/images/brand/photos/8.svg',
    is_featured: false,
  },
  {
    id: 'demo-5',
    title: 'Ingredient Intelligence Workshop',
    description: 'Clinical formulation trends, ingredient adoption velocity, and treatment room data for ingredient-forward brands.',
    event_type: 'Masterclass',
    location: 'Austin, TX',
    start_date: '2026-07-09',
    end_date: null,
    capacity: 60,
    image: '/images/brand/photos/9.svg',
    is_featured: false,
  },
  {
    id: 'demo-6',
    title: 'Operator Benchmarking Forum',
    description: 'Peer-to-peer benchmarking sessions segmented by business type and region. Compare performance and procurement strategy.',
    event_type: 'Conference',
    location: 'Chicago, IL',
    start_date: '2026-09-18',
    end_date: '2026-09-19',
    capacity: 200,
    image: '/images/brand/photos/10.svg',
    is_featured: false,
  },
];

const EVENT_TYPES = ['All', 'Conference', 'Masterclass', 'Activation', 'Webinar'];

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Conference: 'bg-accent/15 text-accent',
    Masterclass: 'bg-blue-500/15 text-blue-600',
    Activation: 'bg-purple-500/15 text-purple-600',
    Webinar: 'bg-emerald-500/15 text-emerald-600',
  };
  return (
    <span
      className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium ${
        colors[type] || 'bg-graphite/10 text-graphite/60'
      }`}
    >
      {type}
    </span>
  );
}

function DemoBadge() {
  return (
    <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
      DEMO
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

/* ── Page ─────────────────────────────────────────────────────── */
export default function Events() {
  const [filter, setFilter] = useState('All');

  const featured = DEMO_EVENTS.find((e) => e.is_featured);
  const filtered = useMemo(() => {
    const list = DEMO_EVENTS.filter((e) => !e.is_featured);
    if (filter === 'All') return list;
    return list.filter((e) => e.event_type === filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Events -- Socelle</title>
        <meta
          name="description"
          content="Industry events, masterclasses, and conferences for professional beauty operators and brands."
        />
        <meta property="og:title" content="Events -- Socelle" />
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
      {/* DEMO: JSON-LD Event schemas from hardcoded data — will be LIVE when events table wired (W10-05) */}
      <JsonLd data={[
        buildCollectionPageSchema({
          name: 'Professional Beauty Events',
          description: 'Industry events, masterclasses, and conferences for professional beauty operators and brands.',
          url: buildCanonical('/events'),
        }),
        ...DEMO_EVENTS.map((e) =>
          buildEventSchema({
            name: e.title,
            description: e.description,
            startDate: e.start_date,
            endDate: e.end_date ?? undefined,
            locationName: e.location,
            url: buildCanonical('/events'),
            organizer: 'Socelle',
          })
        ),
      ]} />
      <MainNav />

      {/* ── Hero — photo 19 with glass overlay ──────────────────── */}
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
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40">
                Industry Events
              </p>
              <DemoBadge />
            </div>
          </BlockReveal>
          <WordReveal
            text="Industry Events and Conferences"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-8 max-w-3xl mx-auto justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto">
              Masterclasses, brand activations, and intelligence summits --
              curated for practitioners and brands defining modern aesthetics.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── DEMO Banner ──────────────────────────────────────────── */}
      <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
        PREVIEW -- This data is for demonstration purposes. Events will be live when the events table is wired.
      </div>

      {/* ── Featured Event ───────────────────────────────────────── */}
      {featured && (
        <section className="py-14 lg:py-20" id="events">
          <div className="section-container">
            <BlockReveal>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-accent">
                  Featured Event
                </p>
                <DemoBadge />
              </div>
            </BlockReveal>
            <BlockReveal delay={100}>
              <div className="grid lg:grid-cols-2 gap-8 rounded-2xl bg-white shadow-sm overflow-hidden border border-graphite/5">
                <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center p-8">
                  <EventTypeBadge type={featured.event_type} />
                  <h2 className="font-sans font-semibold text-subsection text-graphite mt-4 mb-4">
                    {featured.title}
                  </h2>
                  <p className="text-graphite/60 leading-relaxed mb-6">
                    {featured.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-graphite/50 mb-6">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featured.start_date)}
                      {featured.end_date && ` -- ${formatDate(featured.end_date)}`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {featured.location}
                    </span>
                    {featured.capacity && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {featured.capacity} spots
                      </span>
                    )}
                  </div>
                  <Link
                    to="/request-access"
                    className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium"
                  >
                    Register Interest
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </BlockReveal>
          </div>
        </section>
      )}

      {/* ── Filter Pills ─────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-mn-surface">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <BlockReveal>
              <h2 className="font-sans font-semibold text-subsection text-graphite">
                Upcoming Events
              </h2>
            </BlockReveal>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                    filter === type
                      ? 'bg-graphite text-white'
                      : 'bg-white border border-graphite/10 text-graphite/60 hover:border-graphite/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* ── Event Cards Grid ─────────────────────────────────── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <BlockReveal key={event.id} delay={i * 60}>
                <div className="bg-white rounded-2xl overflow-hidden border border-graphite/5 shadow-sm hover:shadow-md transition-shadow duration-300 group h-full flex flex-col">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <EventTypeBadge type={event.event_type} />
                      <span className="text-graphite/40 text-xs">
                        {formatDate(event.start_date)}
                      </span>
                    </div>
                    <h3 className="font-sans font-medium text-graphite mb-2 group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-graphite/50 text-sm line-clamp-2 mb-3 flex-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-graphite/40 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </BlockReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-graphite/40 text-sm">
                No events match the selected filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-mn-dark py-20 lg:py-24 rounded-section mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-mn-bg mb-5">
              Never miss an industry event
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-mn-bg/65 max-w-md mx-auto mb-10">
              Get notified about masterclasses, summits, and brand activations
              curated for your specialty.
            </p>
          </BlockReveal>
          <BlockReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-dark">
                Get Event Alerts
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
