// ── HelpCenter — V2-HUBS-14 ──────────────────────────────────────────
// In-app help center: /help
// Data: cms_posts where space='help' (falls back to DEMO FAQ items)
// Pearl Mineral V2 tokens only.

import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronDown, HelpCircle, BookOpen } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPosts } from '../../lib/cms';

// ── DEMO FAQ Data ────────────────────────────────────────────────────

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const DEMO_FAQS: FaqItem[] = [
  {
    id: 'demo-1',
    question: 'What is SOCELLE Intelligence?',
    answer:
      'SOCELLE Intelligence is a market intelligence platform built for the professional beauty and medspa industry. It tracks treatment demand signals, competitive benchmarks, and category trends to help operators make data-driven decisions about their service menus and business strategy.',
    category: 'Getting Started',
  },
  {
    id: 'demo-2',
    question: 'How do I access intelligence signals?',
    answer:
      'After signing up and choosing a plan, navigate to the Intelligence Hub from the main navigation. You will see the KPI Strip, Signal Table, and Trend Stacks with data relevant to your market. Starter plans include national signals, while Pro and Enterprise unlock local and historical data.',
    category: 'Intelligence',
  },
  {
    id: 'demo-3',
    question: 'What are intelligence credits and how do they work?',
    answer:
      'Credits are used when you activate AI-powered tools like Explain Signal, Treatment Planner, Gap Analysis, or generate PDF reports. Each plan includes a monthly credit allotment (Starter: 500, Pro: 2,500, Enterprise: 10,000). Unused credits do not roll over. You can track usage in your account settings.',
    category: 'Billing',
  },
  {
    id: 'demo-4',
    question: 'How do I upgrade or downgrade my plan?',
    answer:
      'Go to Account Settings and select "Manage Plan." You can upgrade at any time and the new features will activate immediately with prorated billing. Downgrades take effect at the start of your next billing cycle.',
    category: 'Billing',
  },
  {
    id: 'demo-5',
    question: 'What data sources does SOCELLE Intelligence use?',
    answer:
      'SOCELLE aggregates data from 37+ public and licensed feeds including FDA databases, Google Trends, PubMed clinical research, industry trade publications, NPI registry data, and proprietary treatment adoption surveys. All data carries provenance metadata showing source, freshness, and confidence level.',
    category: 'Intelligence',
  },
  {
    id: 'demo-6',
    question: 'How do I set up my operator profile?',
    answer:
      'After creating your account, you will be guided through a profile setup that captures your business type (spa, medspa, salon, clinic), location, specialty areas, and current service menu. This information powers personalized intelligence signals and local market comparisons.',
    category: 'Getting Started',
  },
  {
    id: 'demo-7',
    question: 'Can I export intelligence reports?',
    answer:
      'Yes. Starter plans can export signal data as CSV files. Pro plans add PDF exports with branded formatting. Enterprise plans include all export formats plus API access and webhook integrations for automated reporting.',
    category: 'Intelligence',
  },
  {
    id: 'demo-8',
    question: 'How do I reset my password?',
    answer:
      'Click "Sign In" from the top navigation, then select "Forgot Password." Enter your email address and you will receive a password reset link within a few minutes. If you do not receive the email, check your spam folder or contact support.',
    category: 'Account',
  },
  {
    id: 'demo-9',
    question: 'What is the AI Service Menu Analyst?',
    answer:
      'The AI Service Menu Analyst evaluates your current treatment menu against local demand signals, competitive benchmarks, and margin data to suggest additions, removals, or pricing adjustments. It uses 2 credits per analysis and provides a detailed action plan with projected revenue impact.',
    category: 'Intelligence',
  },
  {
    id: 'demo-10',
    question: 'How do I contact support?',
    answer:
      'You can reach our support team by emailing support@socelle.com. Pro and Enterprise subscribers also have access to priority support with faster response times. We aim to respond to all inquiries within one business day.',
    category: 'Account',
  },
];

const FAQ_CATEGORIES = [
  'Getting Started',
  'Intelligence',
  'Billing',
  'Account',
];

// ── Accordion ─────────────────────────────────────────────────────────

function FaqAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-[#141418]/5 rounded-xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[#141418] font-sans font-semibold text-base">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#6E879B] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <p className="text-[#141418]/60 font-sans text-sm leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────

function FaqSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border border-[#141418]/5 rounded-xl bg-white p-5 animate-pulse"
        >
          <div className="h-5 bg-[#141418]/5 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Try loading CMS help content
  const { posts, isLoading, isLive } = useCmsPosts({
    spaceSlug: 'help',
    status: 'published',
  });

  // Use CMS data if available, otherwise use DEMO
  const faqItems: FaqItem[] = useMemo(() => {
    if (isLive && posts.length > 0) {
      return posts.map((p) => ({
        id: p.id,
        question: p.title,
        answer: p.body ?? p.excerpt ?? '',
        category: p.category ?? 'General',
      }));
    }
    return DEMO_FAQS;
  }, [posts, isLive]);

  const isDemo = !isLive || posts.length === 0;

  // Filter by search + category
  const filtered = useMemo(() => {
    let result = faqItems;
    if (activeCategory) {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(term) ||
          f.answer.toLowerCase().includes(term)
      );
    }
    return result;
  }, [faqItems, activeCategory, searchTerm]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    filtered.forEach((f) => {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    });
    return map;
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>Help Center | SOCELLE</title>
        <meta
          name="description"
          content="Find answers to common questions about SOCELLE Intelligence, billing, account settings, and getting started."
        />
        <meta property="og:title" content="Help Center | SOCELLE" />
        <meta
          property="og:description"
          content="Find answers to common questions about SOCELLE Intelligence, billing, account settings, and getting started."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/help" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/help" />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#141418] font-sans">
              Help Center
            </h1>
            <p className="mt-3 text-[#141418]/60 font-sans text-lg max-w-xl mx-auto">
              Find answers to common questions about Intelligence, billing,
              and your account.
            </p>
            {isDemo && !isLoading && (
              <span className="inline-block mt-3 text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141418]/30" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#141418]/10 bg-white text-sm font-sans text-[#141418] placeholder:text-[#141418]/30 focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 focus:border-[#6E879B]"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-[#6E879B] text-white'
                  : 'bg-white text-[#141418]/60 hover:text-[#141418] border border-[#141418]/10'
              }`}
            >
              All
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#6E879B] text-white'
                    : 'bg-white text-[#141418]/60 hover:text-[#141418] border border-[#141418]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {isLoading && <FaqSkeleton />}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <HelpCircle className="w-8 h-8 text-[#141418]/20 mx-auto mb-4" />
              <p className="text-[#141418]/40 font-sans text-lg">
                {searchTerm
                  ? 'No results match your search.'
                  : 'No help articles available.'}
              </p>
            </div>
          )}

          {/* FAQ sections grouped by category */}
          {!isLoading && filtered.length > 0 && (
            <div className="space-y-10">
              {Array.from(grouped.entries()).map(([category, items]) => (
                <section key={category}>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-[#6E879B] font-sans uppercase tracking-wide mb-4">
                    <BookOpen className="w-4 h-4" />
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <FaqAccordion
                        key={item.id}
                        item={item}
                        isOpen={openId === item.id}
                        onToggle={() =>
                          setOpenId(openId === item.id ? null : item.id)
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 text-center p-8 bg-white rounded-xl border border-[#141418]/5">
            <HelpCircle className="w-8 h-8 text-[#6E879B] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#141418] font-sans mb-2">
              Still need help?
            </h3>
            <p className="text-[#141418]/60 font-sans text-sm mb-4">
              Contact our support team and we will get back to you within one
              business day.
            </p>
            <a
              href="mailto:support@socelle.com"
              className="inline-block px-6 py-2.5 rounded-lg bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
