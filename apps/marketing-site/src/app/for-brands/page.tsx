import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'For Brands',
    description:
        'Put your brand in front of verified professional operators. Brand storefronts, protocol training, intelligence reports, and direct wholesale access — on Socelle.',
    alternates: { canonical: 'https://socelle.com/for-brands' },
    openGraph: {
        title: 'For Brands | Socelle',
        description:
            'Put your brand in front of verified professional operators. Brand storefronts, protocol training, intelligence reports, and direct wholesale access — on Socelle.',
        url: 'https://socelle.com/for-brands',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'For Brands | Socelle',
    description:
        'Brand storefronts, protocol training, intelligence reports, and direct wholesale access for professional beauty brands.',
    url: 'https://socelle.com/for-brands',
    breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socelle.com' },
            { '@type': 'ListItem', position: 2, name: 'For Brands', item: 'https://socelle.com/for-brands' },
        ],
    },
    publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

const FEATURES = [
    {
        label: 'Brand Storefront',
        body: 'A verified brand profile with your full product catalog, protocol library, and pricing tiers — surfaced directly to licensed operators in your category.',
    },
    {
        label: 'Protocol Training',
        body: 'Upload treatment protocols tied to your products. Operators and practitioners access them as part of their ongoing education. Credibility built into the catalog.',
    },
    {
        label: 'Intelligence Reports',
        body: 'See how your brand performs against the peer set — category adoption velocity, operator interest signals, and reorder indicators.',
    },
    {
        label: 'Direct Wholesale Access',
        body: 'Connect your wholesale pricing to verified operators without distributor margin compression. Accounts are license-verified before access.',
    },
    {
        label: 'Brand Analytics',
        body: 'Track operator engagement, protocol views, and product inquiry signals. Know which markets are moving toward your category.',
    },
    {
        label: 'Operator Connections',
        body: 'Inbound interest from operators who have reviewed your protocols and confirmed fit. Discovery → intent → procurement in one flow.',
    },
];

export default function ForBrandsPage() {
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
                        <p className="mn-eyebrow mb-5">For Brands</p>
                        <h1 className="font-sans font-semibold text-hero text-graphite mb-6 max-w-3xl mx-auto">
                            Your brand, in front of the operators who need it
                        </h1>
                        <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
                            Brand storefronts, protocol training, and intelligence reports — built for professional beauty brands that sell into the treatment room.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <Link
                                href="/request-access"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                Apply for Brand Access
                            </Link>
                            <Link
                                href="/brands"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-white/80 text-graphite border border-[rgba(30,37,43,0.12)] font-sans font-medium text-sm hover:bg-white transition-all"
                            >
                                Browse Brand Directory
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Feature grid */}
                <section className="pb-20 lg:pb-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {FEATURES.map((f) => (
                                <div
                                    key={f.label}
                                    className="rounded-2xl bg-white border border-[rgba(30,37,43,0.08)] p-8"
                                >
                                    <p className="mn-eyebrow mb-3">{f.label}</p>
                                    <p className="font-sans text-sm text-graphite/70 leading-relaxed">
                                        {f.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Positioning note */}
                <section className="pb-20 lg:pb-28 bg-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
                        <p className="mn-eyebrow mb-4">How It Works</p>
                        <h2 className="font-sans font-semibold text-3xl text-graphite mb-6">
                            Discovery → Intelligence → Transaction
                        </h2>
                        <p className="font-sans text-sm text-graphite/60 leading-relaxed mb-4">
                            Operators encounter your brand through intelligence context — category signals, protocol comparisons, and peer adoption data. They arrive at your storefront already informed. The transaction follows from earned trust, not interruption.
                        </p>
                        <div className="mt-8">
                            <Link
                                href="/request-access"
                                className="inline-flex items-center gap-2 rounded-full h-[52px] px-8 bg-graphite text-[#F7F5F2] font-sans font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                Get Intelligence Access
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
