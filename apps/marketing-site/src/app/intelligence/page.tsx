import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Intelligence Hub',
    description:
        'Daily signals across brands, treatments, and operator markets — verified, scored, and updated continuously.',
    alternates: { canonical: 'https://socelle.com/intelligence' },
    openGraph: {
        title: 'Intelligence Hub | Socelle',
        description:
            'Daily signals across brands, treatments, and operator markets — verified, scored, and updated continuously.',
        url: 'https://socelle.com/intelligence',
    },
};

// JSON-LD structured data
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Intelligence Hub | Socelle',
    description:
        'Daily signals across brands, treatments, and operator markets — verified, scored, and updated continuously.',
    url: 'https://socelle.com/intelligence',
    breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socelle.com' },
            { '@type': 'ListItem', position: 2, name: 'Intelligence Hub', item: 'https://socelle.com/intelligence' },
        ],
    },
    publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

export default function IntelligencePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main>
                {/* Hero */}
                <section className="relative py-20 lg:py-28 overflow-hidden bg-mn-bg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="mn-eyebrow mb-5">Intelligence Hub</p>
                        <h1 className="font-sans font-semibold text-hero text-graphite mb-6">
                            Intelligence Hub
                        </h1>
                        <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
                            Daily signals across brands, treatments, and operator markets — verified, scored, and updated continuously.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <Link
                                href="/portal/signup"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                Get Intelligence Access
                            </Link>
                            <a
                                href="#daily-briefing"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-white/80 text-graphite border border-[rgba(30,37,43,0.12)] font-sans font-medium text-sm hover:bg-white transition-all"
                            >
                                View Today&apos;s Briefing
                            </a>
                        </div>
                    </div>
                </section>

                {/* Daily Briefing — server-rendered for SEO freshness */}
                <section id="daily-briefing" className="pb-16 lg:pb-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-xs uppercase tracking-[0.14em] font-medium text-graphite/40 font-sans mb-5">
                            TOP MOVEMENTS IN THE LAST 24 HOURS
                        </p>
                        {/* Signal cards rendered here via server component fetching from Supabase */}
                        <p className="text-graphite/40 text-sm font-sans italic">
                            Signals loading — sign in for your live briefing.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
