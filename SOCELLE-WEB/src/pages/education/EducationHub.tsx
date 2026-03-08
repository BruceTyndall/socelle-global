/**
 * EducationHub — /education main landing (enhanced)
 * Re-exports the existing public Education page for now,
 * but adds featured courses, browse by category, continue learning, and certificates sections.
 * Data: courses table (LIVE when connected), education content (existing)
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  BookOpen,
  Award,
  Play,
  GraduationCap,
  Clock,
  Users,
  Star,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import { useCourses } from '../../lib/education/useCourses';
import { useCertificates } from '../../lib/education/useCertificates';
import { useAuth } from '../../lib/auth';

// ── JSON-LD ─────────────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Education Hub | Socelle',
  description: 'CE-eligible courses, treatment protocols, and professional training for licensed beauty professionals.',
  url: 'https://socelle.com/education',
  publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-signal-up/10 text-signal-up',
  intermediate: 'bg-signal-warn/10 text-signal-warn',
  advanced: 'bg-signal-down/10 text-signal-down',
};

export default function EducationHub() {
  const { user } = useAuth();
  const { courses: featuredCourses, loading: featuredLoading, isLive: featuredLive } = useCourses({ featured: true, sort: 'newest' });
  const { courses: allCourses, loading: allLoading, isLive: allLive, categories } = useCourses({ sort: 'popular' });
  const { certificates } = useCertificates();

  const isLive = featuredLive || allLive;

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Education Hub | Socelle CE Credits &amp; Training</title>
        <meta name="description" content="CE-eligible courses, treatment protocols, ingredient science, and compliance training built for licensed beauty professionals." />
        <meta property="og:title" content="Education Hub | Socelle" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/education" />
        <link rel="canonical" href="https://socelle.com/education" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-mn-bg via-mn-bg/95 to-mn-bg" />
        <div className="section-container text-center relative z-10">
          <BlockReveal>
            <p className="mn-eyebrow mb-5">Education Hub</p>
          </BlockReveal>
          <WordReveal
            text="Professional Education"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-6 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Protocol training, CE-eligible courses, and category education curated for working professionals.
            </p>
          </BlockReveal>
          <BlockReveal delay={250}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/education/courses" className="btn-mineral-primary">
                Browse Courses
              </Link>
              {user && (
                <Link to="/education/certificates" className="btn-mineral-secondary">
                  My Certificates
                </Link>
              )}
              {user && (
                <Link to="/education/ce-credits" className="btn-mineral-secondary">
                  CE Credits
                </Link>
              )}
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Data source label ─────────────────────────────────────── */}
      {!isLive && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — Course data is for demonstration purposes. Connect database for live content.
        </div>
      )}

      {/* ── Featured Courses ──────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sans text-subsection text-graphite">Featured Courses</h2>
              <p className="text-sm text-graphite/60 mt-1">Curated training for professional development</p>
            </div>
            <Link to="/education/courses" className="text-sm font-medium text-accent hover:text-accent-hover flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-mn-card rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 6).map(course => (
                <Link
                  key={course.id}
                  to={`/education/courses/${course.slug}`}
                  className="group bg-mn-card rounded-2xl overflow-hidden border border-graphite/5 hover:border-accent/20 hover:shadow-lg transition-all"
                >
                  {course.thumbnail_url ? (
                    <div className="aspect-video bg-mn-surface overflow-hidden">
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-mn-surface flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-graphite/20" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {course.level && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${LEVEL_BADGE[course.level] || 'bg-graphite/10 text-graphite/60'}`}>
                          {course.level}
                        </span>
                      )}
                      {course.ce_credits && course.ce_credits > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {course.ce_credits} CE
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans font-semibold text-graphite text-sm mb-1 group-hover:text-accent transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    {course.author_name && (
                      <p className="text-xs text-graphite/50 mb-2">{course.author_name}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-graphite/40">
                      {course.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {course.duration_minutes}m
                        </span>
                      )}
                      {course.enrollment_count != null && course.enrollment_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {course.enrollment_count}
                        </span>
                      )}
                      {course.rating_avg != null && course.rating_avg > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" /> {course.rating_avg.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-graphite/5">
                      <span className="text-xs font-semibold text-graphite">
                        {course.is_free ? 'Free' : course.price_cents ? `$${(course.price_cents / 100).toFixed(0)}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-graphite mb-2">No featured courses available yet</h3>
              <p className="text-graphite/60 max-w-md mx-auto mb-6">New courses are being added regularly. Browse the full catalog to find training.</p>
              <Link to="/education/courses" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                Browse all courses →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Browse by Category ────────────────────────────────────── */}
      {categories.length > 1 && (
        <section className="py-16 lg:py-24 bg-white rounded-section">
          <div className="section-container">
            <div className="text-center mb-10">
              <h2 className="font-sans font-semibold text-section text-graphite mb-3">Browse by Category</h2>
              <p className="text-graphite/60 font-sans">Find courses in your area of practice</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.filter(c => c !== 'all').map(cat => {
                const count = allCourses.filter(c => c.category === cat).length;
                return (
                  <Link
                    key={cat}
                    to={`/education/courses?category=${cat}`}
                    className="p-5 bg-mn-bg rounded-xl border border-graphite/5 hover:border-accent/20 hover:shadow-sm transition-all group"
                  >
                    <h3 className="font-sans font-semibold text-sm text-graphite capitalize group-hover:text-accent transition-colors">
                      {cat.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-graphite/50 mt-1">{count} course{count !== 1 ? 's' : ''}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Continue Learning (logged in users) ───────────────────── */}
      {user && allCourses.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-sans text-subsection text-graphite">Continue Learning</h2>
                <p className="text-sm text-graphite/60 mt-1">Pick up where you left off</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allCourses.slice(0, 4).map(course => (
                <Link
                  key={course.id}
                  to={`/education/learn/${course.slug}`}
                  className="p-4 bg-mn-card rounded-xl border border-graphite/5 hover:border-accent/20 transition-all group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-mn-surface flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-sans font-medium text-sm text-graphite truncate group-hover:text-accent transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-graphite/50 mt-0.5">
                      {course.duration_minutes ? `${course.duration_minutes}m` : 'Course'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── My Certificates ───────────────────────────────────────── */}
      {user && certificates.length > 0 && (
        <section className="py-16 lg:py-24 bg-white rounded-section">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-sans text-subsection text-graphite">My Certificates</h2>
                <p className="text-sm text-graphite/60 mt-1">{certificates.length} earned</p>
              </div>
              <Link to="/education/certificates" className="text-sm font-medium text-accent hover:text-accent-hover flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.slice(0, 3).map(cert => (
                <div key={cert.id} className="p-5 bg-mn-bg rounded-xl border border-graphite/5">
                  <Award className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-sans font-semibold text-sm text-graphite mb-1">{cert.course_title || 'Course Certificate'}</h3>
                  <p className="text-xs text-graphite/50">
                    Issued {new Date(cert.issued_at).toLocaleDateString()}
                    {cert.ce_credits ? ` — ${cert.ce_credits} CE credits` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container text-center">
          <h2 className="font-sans font-semibold text-section text-graphite mb-4">
            Start learning today
          </h2>
          <p className="text-graphite/60 font-sans max-w-lg mx-auto mb-8">
            Access professional training, earn CE credits, and advance your career with courses built for licensed practitioners.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/education/courses" className="btn-mineral-primary">
              Browse Courses <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Link>
            <Link to="/request-access" className="btn-mineral-secondary">
              Get Intelligence Access
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
