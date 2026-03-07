import { Calendar, MapPin, Users, ChevronRight, ArrowRight } from 'lucide-react';
import { HeroMediaRail } from '../components/modules/HeroMediaRail';
import { SpotlightPanel } from '../components/modules/SpotlightPanel';
import { CTASection } from '../components/modules/CTASection';
import { BigStatBanner } from '../components/modules/BigStatBanner';
import { IMAGES, EVENT_IMAGES } from '../data/images';
import { events } from '../data/mock';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const featured = events.find(e => e.isFeatured)!;
const upcoming = events.filter(e => !e.isFeatured);

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Conference: 'bg-[#3F5465]/15 text-[#3F5465]',
    Masterclass: 'bg-blue-500/15 text-blue-400',
    Activation: 'bg-purple-500/15 text-purple-400',
    Webinar: 'bg-[#5F8A72]/15 text-[#5F8A72]',
  };
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${colors[type] || 'bg-gray-500/15 text-gray-400'}`}>
      {type}
    </span>
  );
}

export function Events() {
  return (
    <>
      <HeroMediaRail
        image={IMAGES.heroEvents}
        eyebrow="Gatherings"
        headline="Where the Industry Convenes"
        subtitle="Masterclasses, brand activations, and intelligence summits — curated for the practitioners and brands defining modern aesthetics."
        primaryCTA={{ label: 'See the Schedule', href: '#events' }}
        secondaryCTA={{ label: 'Host With Us', href: '#' }}
        overlayMetric={{ value: String(events.length), label: 'On the Calendar' }}
      />

      {/* Event stats */}
      <BigStatBanner
        backgroundImage={IMAGES.eventSummit}
        eyebrow="This Season"
        stats={[
          { value: '4,645', label: 'Expected Attendees' },
          { value: '6', label: 'Events Scheduled' },
          { value: '24', label: 'Brand Launches' },
          { value: '5', label: 'Cities' },
        ]}
      />

      {/* Featured Event — Spotlight */}
      <SpotlightPanel
        image={IMAGES.eventSummit}
        imagePosition="left"
        eyebrow="Flagship Event"
        headline={featured.title}
        metric={{ value: featured.attendees.toLocaleString(), label: 'Expected Attendees' }}
        bullets={[
          featured.description,
          `${featured.date} — ${featured.location}`,
          'Priority registration closes March 15',
        ]}
        cta={{ label: 'Reserve Your Place', href: '#' }}
      />

      {/* Event cards — visual grid */}
      <section id="events" className="bg-[#FAF9F7] py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="eyebrow text-[#141418]/50 mb-3 block">Upcoming</span>
            <h2 className="text-[#141418] text-2xl lg:text-4xl">The Calendar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {upcoming.map((event) => (
              <div
                key={event.id}
                className="card-mineral overflow-hidden group cursor-pointer"
              >
                {/* Event image */}
                <div className="aspect-[16/10] relative overflow-hidden">
                  <ImageWithFallback
                    src={EVENT_IMAGES[event.id] || IMAGES.heroEvents}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/80 via-[#1F2428]/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <EventTypeBadge type={event.type} />
                  </div>
                  {/* Date overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="glass-panel rounded-xl px-4 py-3">
                      <div className="text-[#F7F5F2] text-xl" style={{ fontFamily: 'var(--font-mono)' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[#F7F5F2]/60 text-[10px] tracking-widest uppercase">
                        {new Date(event.date).getFullYear()}
                      </div>
                    </div>
                  </div>
                  {/* Attendees overlay */}
                  <div className="absolute bottom-4 right-4">
                    <div className="glass-panel rounded-xl px-3 py-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#F7F5F2]/60" />
                      <span className="text-[#F7F5F2] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                        {event.attendees.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-[#141418] text-base mb-2 group-hover:text-[#141418]/70 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-[#141418]/50 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#141418]/40 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1 text-[#141418]/50 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      View Event <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Past Events — inline instead of separate section */}
          <div className="mt-16">
            <span className="eyebrow text-[#141418]/50 mb-3 block">Previous</span>
            <h2 className="text-[#141418] text-2xl lg:text-3xl mb-8">Recent Gatherings</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {[
                { title: 'Intelligence Summit 2025', img: IMAGES.eventSummit, attendees: '1,100' },
                { title: 'Brand Discovery NYC', img: IMAGES.eventActivation, attendees: '320' },
                { title: 'Clinical Protocols LA', img: IMAGES.eventMasterclass, attendees: '95' },
                { title: 'European Forum London', img: IMAGES.spaPool, attendees: '780' },
              ].map((item, i) => (
                <div key={i} className="min-w-[300px] lg:min-w-[360px] group cursor-pointer shrink-0 snap-start">
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 relative">
                    <ImageWithFallback
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <span className="text-[#F7F5F2] text-sm">{item.title}</span>
                      <span className="text-[#F7F5F2]/60 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        {item.attendees} attendees
                      </span>
                    </div>
                  </div>
                  <div className="text-[#141418]/50 text-xs">2025</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Partnerships"
        headline="Host With Us. Bring the Data."
        subtitle="Education sessions, brand activations, or market intelligence briefings — produced in partnership with your team."
        primaryCTA={{ label: 'Propose a Partnership', href: '#' }}
        secondaryCTA={{ label: 'Partnership Brief', href: '#' }}
      />
    </>
  );
}