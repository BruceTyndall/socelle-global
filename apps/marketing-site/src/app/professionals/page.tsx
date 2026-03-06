import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'For Beauty Professionals',
    description:
        'Market signals, protocol intelligence, and brand access for licensed beauty professionals — estheticians, spa operators, medspa practitioners, and clinic purchasing managers.',
    alternates: { canonical: 'https://socelle.com/professionals' },
    openGraph: {
        title: 'For Beauty Professionals | Socelle',
        description:
            'Market signals, protocol intelligence, and brand access for licensed beauty professionals — estheticians, spa operators, medspa practitioners, and clinic purchasing managers.',
        url: 'https://socelle.com/professionals',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'For Beauty Professionals | Socelle',
    description:
        'Market signals, protocol intelligence, and brand access for licensed beauty professionals.',
    url: 'https://socelle.com/professionals',
    breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socelle.com' },
            { '@type': 'ListItem', position: 2, name: 'For Professionals', item: 'https://socelle.com/professionals' },
        ],
    },
    publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

const CAPABILITIES = [
    {
        label: 'Market Signals',
        body: 'Category-level demand shifts, treatment adoption velocity, and ingredient trend data — so you know what your clients are asking for before they ask.',
    },
    {
        label: 'Protocol Library',
        body: 'Curated treatment protocols from verified brands. Filter by modality, skin concern, and active category to build a rigorous service menu.',
    },
    {
        label: 'Peer Benchmarks',
        body: 'Compare your pricing, service mix, and product portfolio against operators in your category and region. Know where your gaps are.',
    },
    {
        label: 'Brand Access',
        body: 'Verified wholesale pricing and direct brand relationships — for licensed professionals only. No distributors in the middle.',
    },
    {
        label: 'Jobs Board',
        body: 'Roles across salons, spas, medspas, and clinic groups. Positions matched to your credentials and vertical.',
    },
    {
        label: 'Education Credits',
        body: 'Protocol training from active brands, mapped to CE credit categories. Stay current without leaving your market.',
    },
];

export default function ProfessionalsPage() {
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
                        <p className="mn-eyebrow mb-5">For Professionals</p>
                        <h1 className="font-sans font-semibold text-hero text-graphite mb-6 max-w-3xl mx-auto">
                            Intelligence built for the treatment room
                        </h1>
                        <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
                            Market signals, protocol intelligence, and brand access for estheticians, spa operators, medspa practitioners, and clinic purchasing managers.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <Link
                                href="/request-access"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                Get Intelligence Access
                            </Link>
                            <Link
                                href="/intelligence"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-white/80 text-graphite border border-[rgba(30,37,43,0.12)] font-sans font-medium text-sm hover:bg-white transition-all"
                            >
                                View Intelligence Hub
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Capabilities grid */}
                <section className="pb-20 lg:pb-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {CAPABILITIES.map((c) => (
                                <div
                                    key={c.label}
                                    className="rounded-2xl bg-white border border-[rgba(30,37,43,0.08)] p-8"
                                >
                                    <p className="mn-eyebrow mb-3">{c.label}</p>
                                    <p className="font-sans text-sm text-graphite/70 leading-relaxed">
                                        {c.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Who is this for */}
                <section className="pb-20 lg:pb-28 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
                        <p className="mn-eyebrow mb-4">Who This Is For</p>
                        <h2 className="font-sans font-semibold text-3xl text-graphite mb-6">
                            Built for licensed operators and practitioners
                        </h2>
                        <p className="font-sans text-sm text-graphite/60 leading-relaxed max-w-2xl mx-auto mb-4">
                            Independent estheticians, spa owners, medspa medical directors, clinic purchasing managers, and multi-location operators. If you make procurement decisions for a treatment business, this is built for you.
                        </p>
                        <p className="font-sans text-xs text-graphite/40 leading-relaxed max-w-xl mx-auto">
                            License verification is required for full access. Apply below to start your review.
                        </p>
                        <div className="mt-8">
                            <Link
                                href="/request-access"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                Apply for Access
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
