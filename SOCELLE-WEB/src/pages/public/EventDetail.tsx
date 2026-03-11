import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Users, ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { useEvents } from '../../lib/useEvents';
import { useCart } from '../../lib/useCart';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import BlockReveal from '../../components/motion/BlockReveal';

export default function EventDetail() {
  const { slug } = useParams();
  const { events, loading, isLive } = useEvents({ upcoming: false });
  const { addItem } = useCart('socelle-events');
  const [added, setAdded] = useState(false);

  // Fallback slug matching, usually we'd have a true slug but we'll match on ID or sanitized name
  const event = events.find(e => e.id === slug || e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);

  // Mock Idea-Mining feature: Curated "Required Event Prep" product bundle
  const eventBundle = useMemo(() => {
    return {
      id: "bundle-" + (event?.id || "demo"),
      name: `VIP Access & Masterclass Prep Kit`,
      price: 299.00,
      description: "Includes VIP front-row seating, immediate post-event recording access, and a curated set of the exact backbar products featured in this masterclass.",
      items: ["Advanced Retinol Peel", "LED Recovery Device", "Event Workbook"]
    };
  }, [event]);

  const handleAddBundle = () => {
    addItem({
      productId: eventBundle.id,
      productName: eventBundle.name,
      productType: 'pro',
      unitPrice: eventBundle.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (loading) {
     return <div className="min-h-screen bg-[#F6F3EF] flex items-center justify-center">Loading event...</div>;
  }

  if (!event) {
     return (
        <div className="min-h-screen bg-[#F6F3EF] flex flex-col">
           <MainNav />
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
             <h1 className="text-2xl font-semibold mb-4">Event Not Found</h1>
             <Link to="/events" className="text-[#6E879B] underline">Return to Events</Link>
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EF] font-sans flex flex-col">
      <Helmet>
        <title>{event.name} - Socelle Events</title>
      </Helmet>
      <MainNav />

      <main className="flex-1 section-container py-24">
         <Link to="/events" className="inline-flex items-center gap-2 text-sm text-[#141418]/50 hover:text-[#141418] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
         </Link>

         <div className="grid lg:grid-cols-3 gap-12">
            {/* Event Content */}
            <div className="lg:col-span-2">
               <BlockReveal>
                 <div className="flex items-center gap-3 mb-4">
                   <span className="text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium bg-[#141418]/10 text-[#141418]/60">
                     {event.type}
                   </span>
                   {!isLive && <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">DEMO</span>}
                 </div>
               </BlockReveal>
               
               <BlockReveal delay={100}>
                 <h1 className="text-4xl lg:text-5xl font-semibold text-[#141418] mb-6">{event.name}</h1>
               </BlockReveal>

               <BlockReveal delay={200}>
                 <div className="flex flex-wrap gap-6 text-sm text-[#141418]/60 mb-10 pb-10 border-b border-[#141418]/10">
                   <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</span>
                   <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</span>
                   {event.attendees && <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {event.attendees} Attendees</span>}
                 </div>
               </BlockReveal>

               <BlockReveal delay={300}>
                 <div className="prose prose-[#141418] max-w-none mb-12">
                   <p className="text-lg leading-relaxed">{event.description}</p>
                   <p className="mt-6 text-[#141418]/70">Join top industry practitioners for this exclusive session. Deepen your intelligence, refine your operations, and connect with pioneering voices in aesthetic medicine.</p>
                 </div>
               </BlockReveal>
            </div>

            {/* Shoppable Registration Sidebar (IDEA MINING FEATURE) */}
            <div className="lg:col-span-1">
               <div className="bg-white p-8 rounded-2xl border border-[#141418]/10 sticky top-24 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Secure Your Spot</h3>
                  <p className="text-sm text-[#141418]/60 mb-8">Registration is currently open for validated practitioners.</p>
                  
                  {event.url && event.url !== '#' ? (
                     <a href={event.url} target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-4 bg-[#141418] text-white text-center rounded-xl text-sm font-semibold hover:bg-black transition-colors mb-4">
                        Register for Masterclass
                     </a>
                  ) : (
                     <button className="w-full py-3 px-4 bg-[#141418] text-white text-center rounded-xl text-sm font-semibold hover:bg-black transition-colors mb-4 cursor-not-allowed opacity-50">
                        Registration Closed
                     </button>
                  )}

                  <div className="my-8 border-t border-[#141418]/10 relative">
                     <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs text-[#141418]/40 uppercase tracking-widest">Recommended Upgrade</span>
                  </div>

                  {/* Monetization Block */}
                  <div className="bg-[#F6F3EF] p-5 rounded-xl border border-[#A97A4C]/20">
                     <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{eventBundle.name}</h4>
                        <span className="font-semibold text-[#A97A4C]">${eventBundle.price}</span>
                     </div>
                     <p className="text-xs text-[#141418]/60 mb-4">{eventBundle.description}</p>
                     
                     <ul className="text-xs text-[#141418]/70 space-y-2 mb-6">
                        {eventBundle.items.map((item, idx) => (
                           <li key={idx} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-[#5F8A72]" /> {item}
                           </li>
                        ))}
                     </ul>

                     <button 
                        onClick={handleAddBundle}
                        disabled={added}
                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                           added ? 'bg-[#5F8A72] text-white' : 'bg-transparent border border-[#141418]/20 text-[#141418] hover:border-[#141418]'
                        }`}
                     >
                        {added ? (
                           <>Added to Cart <Check className="w-4 h-4" /></>
                        ) : (
                           <>Add to Cart <ShoppingBag className="w-4 h-4" /></>
                        )}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </main>

      <SiteFooter />
    </div>
  );
}
