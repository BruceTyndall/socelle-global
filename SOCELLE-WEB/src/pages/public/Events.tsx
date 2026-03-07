import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroMediaRail from '../../components/public/HeroMediaRail';
import { BigStatBanner } from '../../components/modules/BigStatBanner';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import { supabase } from '../../lib/supabase';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1610207928705-0ecd72bd4b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_date: string;
  end_date: string | null;
  capacity: number | null;
  image_url: string | null;
  is_featured: boolean;
  status: string;
}

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Conference: 'bg-accent/15 text-accent',
    Masterclass: 'bg-blue-500/15 text-blue-500',
    Activation: 'bg-purple-500/15 text-purple-500',
    Webinar: 'bg-signal-up/15 text-signal-up',
  };
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${colors[type] || 'bg-graphite/10 text-graphite/60'}`}>
      {type}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .order('start_date', { ascending: true });
        if (!cancelled && data && !error) {
          setEvents(data);
          setIsLive(true);
        }
      } catch {
        // fallback — no mock needed, empty state is fine
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const featured = events.find(e => e.is_featured);
  const upcoming = events.filter(e => !e.is_featured);

  return (
    <>
      <HeroMediaRail
        image={HERO_IMAGE}
        eyebrow="Gatherings"
        headline="Where the Industry Convenes"
        subtitle="Masterclasses, brand activations, and intelligence summits — curated for practitioners and brands defining modern aesthetics."
        primaryCTA={{ label: 'See the Schedule', href: '#events' }}
        secondaryCTA={{ label: 'Host an Event', href: '/request-access' }}
        overlayMetric={{ value: events.length.toString(), label: 'Upcoming Events' }}
      />

      <BigStatBanner
        eyebrow="Events Network"
        stats={[
          { value: events.length.toString(), label: 'Upcoming Events' },
          { value: events.filter(e => e.event_type === 'Conference').length.toString(), label: 'Conferences' },
          { value: events.filter(e => e.event_type === 'Masterclass').length.toString(), label: 'Masterclasses' },
          { value: events.filter(e => e.event_type === 'Webinar').length.toString(), label: 'Webinars' },
        ]}
      />

      {/* Featured Event */}
      {featured && (
        <section className="bg-mn-bg py-14 lg:py-20" id="events">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-eyebrow text-accent mb-3 block">Featured Event</span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div className="aspect-[16/10] rounded-card overflow-hidden">
                <img
                  src={featured.image_url || HERO_IMAGE}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center">
                <EventTypeBadge type={featured.event_type} />
                <h2 className="text-graphite text-subsection mt-3 mb-4">{featured.title}</h2>
                <p className="text-graphite/60 mb-6 leading-relaxed">{featured.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-graphite/50 mb-6">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(featured.start_date)}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{featured.location}</span>
                  {featured.capacity && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{featured.capacity} spots</span>}
                </div>
                <Link to="/request-access" className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors text-sm font-medium">
                  Register Interest <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Grid */}
      {upcoming.length > 0 && (
        <section className="bg-mn-surface py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-eyebrow text-accent mb-3 block">Upcoming</span>
            <h2 className="text-graphite text-subsection mb-8">Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <div key={event.id} className="bg-white rounded-card overflow-hidden border border-graphite/5 group hover:shadow-panel transition-shadow">
                  {event.image_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <EventTypeBadge type={event.event_type} />
                      <span className="text-graphite/40 text-xs font-mono">{formatDate(event.start_date)}</span>
                    </div>
                    <h3 className="text-graphite font-medium mb-2 group-hover:text-accent transition-colors">{event.title}</h3>
                    <p className="text-graphite/50 text-sm line-clamp-2 mb-3">{event.description}</p>
                    <div className="flex items-center gap-1.5 text-graphite/40 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading / empty state */}
      {loading && (
        <section className="bg-mn-bg py-20 text-center">
          <p className="text-graphite/40 text-sm">Loading events...</p>
        </section>
      )}
      {!loading && events.length === 0 && (
        <section className="bg-mn-bg py-20 text-center">
          <p className="text-graphite/60 text-lg mb-2">No upcoming events</p>
          <p className="text-graphite/40 text-sm">Check back soon for new gatherings.</p>
        </section>
      )}

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
        imagePosition="right"
        eyebrow="Host With Us"
        headline="Bring Your Brand to the Right Audience"
        metric={{ value: events.length > 0 ? events.length.toString() : '12', label: 'Events This Quarter' }}
        bullets={[
          'Curated audience of verified practitioners and decision-makers',
          'Intelligence-backed event matching — reach the right specialties',
          'Full event analytics and attendee engagement reporting',
        ]}
        cta={{ label: 'Apply to Host', href: '/request-access' }}
      />

      <CTASection
        eyebrow="Never Miss an Event"
        headline="Stay Connected to the Industry"
        subtitle="Get notified about masterclasses, summits, and brand activations curated for your specialty."
        primaryCTA={{ label: 'Get Event Alerts', href: '/request-access' }}
      />

      <StickyConversionBar />
    </>
  );
}
