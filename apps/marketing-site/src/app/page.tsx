import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Professional Beauty Intelligence',
    description:
        'Socelle is the intelligence platform for professional beauty operators, brands, and employers. Market signals, benchmarks, and brand access — updated continuously.',
    alternates: { canonical: 'https://socelle.com' },
    openGraph: {
        title: 'Socelle — Professional Beauty Intelligence',
        description:
            'Socelle is the intelligence platform for professional beauty operators, brands, and employers. Market signals, benchmarks, and brand access — updated continuously.',
        url: 'https://socelle.com',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Socelle',
    url: 'https://socelle.com',
    description:
        'Intelligence platform for professional beauty operators, brands, and employers. Market signals, benchmarks, and brand access.',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://socelle.com/brands?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
    },
    publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

const FEATURES = [
    {
        label: 'Market Intelligence',
        heading: 'Signals from across the market',
        body: 'Category movements, adoption velocity, margin shifts, and demand trends — verified against real procurement data, not social media.',
        href: '/intelligence',
        cta: 'View Intelligence Hub',
    },
    {
        label: 'Peer Benchmarks',
        heading: 'Know where you stand',
        body: 'Compare your service mix, pricing, and product portfolio against the peer set in your category and region.',
        href: '/request-access',
        cta: 'Request Access',
    },
    {
        label: 'Brand Access',
        heading: 'Verified professional brands',
        body: 'Direct access to wholesale pricing, protocol training, and brand intelligence — for licensed operators only.',
        href: '/brands',
        cta: 'Browse Brands',
    },
];

export default function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main>
                {/* Hero */}
                <section className="relative py-24 lg:py-32 overflow-hidden bg-mn-bg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="mn-eyebrow mb-5">Intelligence Platform</p>
                        <h1 className="font-sans font-semibold text-hero text-graphite mb-6 max-w-3xl mx-auto">
                            The intelligence layer for professional beauty
                        </h1>
                        <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
                            Market signals, peer benchmarks, and verified brand access — built for operators, practitioners, and the brands that serve them.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-10">
                            <Link
                                href="/intelligence"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                Explore Intelligence Hub
                            </Link>
                            <Link
                                href="/request-access"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-white/80 text-graphite border border-[rgba(30,37,43,0.12)] font-sans font-medium text-sm hover:bg-white transition-all"
                            >
                                Request Access
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Feature grid */}
                <section className="pb-24 lg:pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-6">
                            {FEATURES.map((f) => (
                                <div
                                    key={f.label}
                                    className="rounded-2xl bg-white border border-[rgba(30,37,43,0.08)] p-8 flex flex-col gap-4"
                                >
                                    <p className="mn-eyebrow">{f.label}</p>
                                    <h2 className="font-sans font-semibold text-xl text-graphite leading-snug">
                                        {f.heading}
                                    </h2>
                                    <p className="font-sans text-sm text-graphite/60 leading-relaxed flex-1">
                                        {f.body}
                                    </p>
                                    <Link
                                        href={f.href}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium font-sans text-graphite hover:opacity-70 transition-opacity mt-2"
                                    >
                                        {f.cta} →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Conversion */}
                <section className="pb-24 lg:pb-32">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="mn-eyebrow mb-4">Get Started</p>
                        <h2 className="font-sans font-semibold text-3xl text-graphite mb-4">
                            Intelligence access for verified professionals
                        </h2>
                        <p className="font-sans text-sm text-graphite/60 leading-relaxed mb-8">
                            Apply for access. Operators, practitioners, and brand teams use Socelle to stay ahead of the market.
                        </p>
                        <Link
                            href="/request-access"
                            className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                        >
                            Get Intelligence Access
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
