import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Plans',
    description:
        'Intelligence access levels for professional beauty operators, brands, and employers. Free preview to full platform — apply for access.',
    alternates: { canonical: 'https://socelle.com/plans' },
    openGraph: {
        title: 'Plans | Socelle',
        description:
            'Intelligence access levels for professional beauty operators, brands, and employers. Free preview to full platform — apply for access.',
        url: 'https://socelle.com/plans',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Plans | Socelle',
    description:
        'Intelligence access levels for professional beauty operators, brands, and employers.',
    url: 'https://socelle.com/plans',
    breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socelle.com' },
            { '@type': 'ListItem', position: 2, name: 'Plans', item: 'https://socelle.com/plans' },
        ],
    },
    publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

const TIERS = [
    {
        name: 'Intelligence Preview',
        badge: null,
        price: 'Free',
        description: 'Market signal previews and the brand directory — no license verification required.',
        features: [
            'Intelligence Hub (limited signals)',
            'Brand directory browsing',
            'Protocol library preview',
            'Jobs board access',
        ],
        cta: 'Start Free Preview',
        href: '/request-access',
        highlight: false,
    },
    {
        name: 'Intelligence Access',
        badge: 'Most Popular',
        price: 'By application',
        description: 'Full market intelligence for verified operators and practitioners. Benchmarks, full signal feed, and direct brand access.',
        features: [
            'Full Intelligence Hub — all signals',
            'Peer benchmark dashboard',
            'Brand wholesale access',
            'Protocol training library',
            'Jobs board with credential matching',
            'Education credits',
        ],
        cta: 'Apply for Access',
        href: '/request-access',
        highlight: true,
    },
    {
        name: 'Brand Platform',
        badge: null,
        price: 'By application',
        description: 'For professional beauty brands. Storefront, protocol publishing, intelligence reports, and operator connections.',
        features: [
            'Brand storefront with full catalog',
            'Protocol training publishing',
            'Brand intelligence reports',
            'Operator connection signals',
            'Brand analytics dashboard',
            'Wholesale order management',
        ],
        cta: 'Apply as a Brand',
        href: '/request-access',
        highlight: false,
    },
];

export default function PlansPage() {
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
                        <p className="mn-eyebrow mb-5">Access Levels</p>
                        <h1 className="font-sans font-semibold text-hero text-graphite mb-6">
                            Intelligence access for every stage
                        </h1>
                        <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
                            From free market signal previews to full platform access for operators and brands. License verification is required for paid tiers.
                        </p>
                        {/* DEMO label — pricing is subject to change, not yet live */}
                        <div className="flex justify-center mt-4">
                            <span className="text-[10px] font-semibold tracking-wide bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full font-sans uppercase">
                                Preview Pricing — Subject to Change
                            </span>
                        </div>
                    </div>
                </section>

                {/* Tier cards */}
                <section className="pb-20 lg:pb-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-6 items-start">
                            {TIERS.map((tier) => (
                                <div
                                    key={tier.name}
                                    className={`rounded-2xl border p-8 flex flex-col gap-5 ${
                                        tier.highlight
                                            ? 'bg-graphite text-[#F7F5F2] border-graphite'
                                            : 'bg-white text-graphite border-[rgba(30,37,43,0.08)]'
                                    }`}
                                >
                                    <div>
                                        {tier.badge && (
                                            <span className="text-[10px] font-semibold tracking-wide bg-white/10 text-[#F7F5F2] px-2.5 py-0.5 rounded-full font-sans uppercase mb-2 inline-block">
                                                {tier.badge}
                                            </span>
                                        )}
                                        <h2 className="font-sans font-semibold text-xl leading-snug mt-1">
                                            {tier.name}
                                        </h2>
                                        <p className={`font-sans font-semibold text-2xl mt-2 ${tier.highlight ? 'text-[#F7F5F2]' : 'text-graphite'}`}>
                                            {tier.price}
                                        </p>
                                        <p className={`font-sans text-sm leading-relaxed mt-2 ${tier.highlight ? 'text-white/60' : 'text-graphite/60'}`}>
                                            {tier.description}
                                        </p>
                                    </div>
                                    <ul className="space-y-2.5 flex-1">
                                        {tier.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2">
                                                <span className={`mt-0.5 text-xs ${tier.highlight ? 'text-white/50' : 'text-graphite/40'}`}>✓</span>
                                                <span className={`font-sans text-sm ${tier.highlight ? 'text-white/80' : 'text-graphite/70'}`}>
                                                    {f}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={tier.href}
                                        className={`inline-flex items-center justify-center rounded-full h-[48px] px-6 font-sans font-medium text-sm transition-all hover:scale-[1.02] ${
                                            tier.highlight
                                                ? 'bg-[#F7F5F2] text-graphite'
                                                : 'bg-graphite text-[#F7F5F2]'
                                        }`}
                                    >
                                        {tier.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-graphite/40 font-sans mt-8">
                            All access tiers require identity and license verification. Pricing finalised at launch.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
