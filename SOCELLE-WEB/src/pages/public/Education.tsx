import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Lock,
  Beaker,
  FlaskConical,
  BarChart3,
  Shield,
  Cpu,
  ShoppingBag,
  BookOpen,
  TrendingUp,
  Zap,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import EducationCard from '../../components/education/EducationCard';
import EducationFilter from '../../components/education/EducationFilter';
import CEProgressBar from '../../components/education/CEProgressBar';
import { useEducation, CATEGORY_LABELS } from '../../lib/education/useEducation';
import type { ContentCategory } from '../../lib/education/types';

// ── Category card metadata ──────────────────────────────────────────

interface CategoryMeta {
  key: ContentCategory;
  icon: React.ElementType;
  description: string;
}

const CATEGORY_CARDS: CategoryMeta[] = [
  {
    key: 'treatment_protocols',
    icon: Beaker,
    description:
      'Step-by-step protocols for chemical peels, LED therapy, microneedling, corrective facials, and high-volume treatment workflows.',
  },
  {
    key: 'ingredient_science',
    icon: FlaskConical,
    description:
      'Peptide biochemistry, retinoid delivery systems, tranexamic acid applications, and professional-grade ingredient science.',
  },
  {
    key: 'business_operations',
    icon: BarChart3,
    description:
      'Back bar optimization, treatment room layout, pricing strategies, and data-driven approaches to spa profitability.',
  },
  {
    key: 'compliance_regulatory',
    icon: Shield,
    description:
      'MoCRA compliance, scope of practice guides, FDA device classifications, and evolving regulatory requirements.',
  },
  {
    key: 'device_training',
    icon: Cpu,
    description:
      'IPL/BBL parameters, Hydrafacial customization, and advanced device protocols for every skin type.',
  },
  {
    key: 'retail_strategy',
    icon: ShoppingBag,
    description:
      'Home care regimen design, seasonal product rotation, recommendation cards, and retail conversion strategies.',
  },
];

// ── JSON-LD structured data ─────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Education Hub | Socelle',
  description:
    'CE-eligible courses, treatment protocols, ingredient science, and compliance training built for licensed beauty professionals.',
  url: 'https://socelle.com/education',
  publisher: {
    '@type': 'Organization',
    name: 'Socelle',
    url: 'https://socelle.com',
  },
};

// ── Page ────────────────────────────────────────────────────────────

export default function Education() {
  const {
    content,
    allContent,
    categoryCounts,
    totalCeCreditsAvailable,
    ceCreditsEarned,
    ceGoal,
    categoryFilter,
    setCategoryFilter,
    contentTypeFilter,
    setContentTypeFilter,
    difficultyFilter,
    setDifficultyFilter,
    ceOnlyFilter,
    setCeOnlyFilter,
    sortKey,
    setSortKey,
  } = useEducation();

  const totalCourses = allContent.length;
  const totalCategories = Object.keys(CATEGORY_LABELS).length;

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Education Hub | Socelle CE Credits &amp; Training</title>
        <meta
          name="description"
          content="CE-eligible courses, treatment protocols, ingredient science, and compliance training built for licensed beauty professionals. Earn continuing education credits on Socelle."
        />
        <meta
          property="og:title"
          content="Education Hub | Socelle CE Credits &amp; Training"
        />
        <meta
          property="og:description"
          content="Treatment protocols, ingredient science, compliance training, and CE-eligible courses built for licensed professionals."
        />
        <link rel="canonical" href="https://socelle.com/education" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <MainNav />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="section-container text-center">
          <BlockReveal>
            <p className="mn-eyebrow mb-5">Education Hub</p>
          </BlockReveal>
          <WordReveal
            text="Education"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-6 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Protocol training, research briefings, and category education — curated for working professionals.
            </p>
          </BlockReveal>

          <BlockReveal delay={250}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => document.getElementById('education-content')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-mineral-primary"
              >
                Follow Topics
              </button>
              <Link to="/portal/signup" className="btn-mineral-secondary">
                Track CE
              </Link>
            </div>
          </BlockReveal>

          {/* Stats row */}
          <BlockReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
              <div className="text-center">
                <p className="font-sans text-metric-md text-graphite">{totalCourses}+</p>
                <p className="mn-eyebrow mt-1">Courses</p>
              </div>
              <div className="text-center">
                <p className="font-sans text-metric-md text-accent">{totalCeCreditsAvailable}</p>
                <p className="mn-eyebrow mt-1">CE Credits Available</p>
              </div>
              <div className="text-center">
                <p className="font-sans text-metric-md text-graphite">{totalCategories}</p>
                <p className="mn-eyebrow mt-1">Categories</p>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Category Browse Section ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-mn-surface rounded-section">
        <div className="section-container">
          <div className="text-center mb-14">
            <BlockReveal>
              <p className="mn-eyebrow mb-4">Browse by Category</p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Six pillars of professional education
              </h2>
            </BlockReveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORY_CARDS.map((cat, i) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.key] ?? 0;
              return (
                <BlockReveal key={cat.key} delay={i * 80}>
                  <button
                    onClick={() => {
                      setCategoryFilter(cat.key);
                      document.getElementById('education-content')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-left w-full bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-7 transition-all duration-200 hover:shadow-panel hover:-translate-y-0.5 group"
                  >
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-accent/10 mb-5 transition-colors group-hover:bg-accent/20">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-sans text-lg font-semibold text-graphite mb-2">
                      {CATEGORY_LABELS[cat.key]}
                    </h3>
                    <p className="text-sm text-graphite/60 font-sans leading-relaxed mb-3">
                      {cat.description}
                    </p>
                    <span className="text-xs font-sans font-semibold text-accent">
                      {count} item{count !== 1 ? 's' : ''} available
                    </span>
                  </button>
                </BlockReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Filter Bar + Content Grid ───────────────────────────────── */}
      <section id="education-content" className="py-16 lg:py-24">
        <div className="section-container">
          {/* Section header */}
          <div className="mb-8">
            <h2 className="font-sans text-subsection text-graphite mb-1">
              All Education Content
            </h2>
            <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans">
              {content.length} result{content.length !== 1 ? 's' : ''}
              {categoryFilter !== 'all' && ` in ${CATEGORY_LABELS[categoryFilter]}`}
            </p>
          </div>

          {/* Filter bar */}
          <div className="mb-8">
            <EducationFilter
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              contentTypeFilter={contentTypeFilter}
              onContentTypeChange={setContentTypeFilter}
              difficultyFilter={difficultyFilter}
              onDifficultyChange={setDifficultyFilter}
              ceOnlyFilter={ceOnlyFilter}
              onCeOnlyChange={setCeOnlyFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
            />
          </div>

          {/* Content grid */}
          {content.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.map((item) => (
                <EducationCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-[rgba(30,37,43,0.22)] mx-auto mb-4" />
              <p className="text-[rgba(30,37,43,0.62)] font-sans">
                No content matches your filters. Try adjusting your selection.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CE Credits Section ──────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white rounded-section">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <BlockReveal>
                <p className="mn-eyebrow mb-4">Continuing Education</p>
              </BlockReveal>
              <BlockReveal delay={100}>
                <h2 className="font-sans font-semibold text-section text-graphite mb-4">
                  Continuing education that counts
                </h2>
              </BlockReveal>
              <BlockReveal delay={200}>
                <p className="text-graphite/60 font-sans leading-relaxed max-w-xl mx-auto">
                  Earn CE credits approved for esthetician and spa professional license renewal.
                  Track your progress, complete courses at your own pace, and download certificates
                  when you finish.
                </p>
              </BlockReveal>
            </div>

            <BlockReveal delay={300}>
              <CEProgressBar earned={ceCreditsEarned} goal={ceGoal} />
            </BlockReveal>

            <p className="text-center text-sm text-graphite/40 font-sans mt-6">
              Track your progress, earn certificates, stay licensed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Intelligence Integration Teaser ─────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <BlockReveal>
            <div className="bg-mn-dark rounded-section p-10 sm:p-14">
              <div className="max-w-3xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/[0.08]">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <Zap className="w-4 h-4 text-accent/50" />
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/[0.08]">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                </div>

                <h2 className="font-sans font-semibold text-subsection text-[#F7F5F2] mb-4">
                  Education powered by intelligence
                </h2>
                <p className="text-[rgba(247,245,242,0.55)] font-sans text-base leading-relaxed mb-8 max-w-xl mx-auto">
                  When LED therapy protocols trend +34%, we surface the training.
                  When new ingredients gain momentum, we have the science.
                  Intelligence drives what you learn next.
                </p>
                <Link
                  to="/intelligence"
                  className="inline-flex items-center gap-2 text-accent font-sans font-semibold text-sm hover:text-accent-hover transition-colors"
                >
                  Explore Socelle Intelligence
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Gated CTA ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <BlockReveal>
            <div className="relative bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent/[0.04] rounded-bl-[80px]" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mx-auto mb-6">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-sans font-semibold text-subsection text-graphite mb-4">
                  Full education access requires a professional account
                </h2>
                <p className="text-graphite/60 font-sans text-base max-w-xl mx-auto mb-8 leading-relaxed">
                  Unlock all CE-eligible courses, treatment protocols, and compliance training.
                  Track your progress, earn certificates, and stay licensed -- all in one place.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/request-access" className="btn-mineral-primary">
                    Request Professional Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/brand/apply" className="btn-mineral-secondary">
                    Brand Partner Application
                  </Link>
                </div>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
