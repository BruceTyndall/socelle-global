/**
 * StaffTraining — /education/staff
 * Operator staff training dashboard: team members' training status, compliance gaps, expirations
 * Data: profiles + course_enrollments + certificates + courses (LIVE)
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Shield,
  TrendingUp,
  XCircle,
  Download,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useStaffTraining, type StaffTrainingProfile } from '../../lib/education/useStaffTraining';
import { useAuth } from '../../lib/auth';
import { exportToCSV } from '../../lib/csvExport';

const COMPLIANCE_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  compliant: { label: 'Compliant', color: 'bg-signal-up/10 text-signal-up', icon: CheckCircle },
  at_risk: { label: 'At Risk', color: 'bg-signal-warn/10 text-signal-warn', icon: AlertTriangle },
  non_compliant: { label: 'Non-Compliant', color: 'bg-signal-down/10 text-signal-down', icon: XCircle },
};

export default function StaffTraining() {
  const { user } = useAuth();
  const { staffProfiles, loading, error, isLive } = useStaffTraining();
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'compliant' | 'at_risk' | 'non_compliant'>('all');

  const toggleMember = (id: string) => {
    setExpandedMember(prev => prev === id ? null : id);
  };

  const filteredProfiles = filter === 'all'
    ? staffProfiles
    : staffProfiles.filter(p => p.complianceStatus === filter);

  const handleExportCompliance = () => {
    if (staffProfiles.length === 0) return;
    exportToCSV(
      staffProfiles.map((p: StaffTrainingProfile) => ({
        name: p.member.full_name ?? p.member.email ?? 'Unknown',
        status: p.complianceStatus.replace(/_/g, ' '),
        ce_credits: p.totalCeCredits,
        completed_courses: p.completedCourses,
        in_progress: p.inProgressCourses,
        next_expiry: p.nextExpiry ? new Date(p.nextExpiry).toLocaleDateString() : '—',
      })),
      'socelle_staff_compliance',
      [
        { key: 'name', label: 'Team Member' },
        { key: 'status', label: 'Compliance Status' },
        { key: 'ce_credits', label: 'CE Credits' },
        { key: 'completed_courses', label: 'Completed Courses' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'next_expiry', label: 'Next Expiry' },
      ]
    );
  };

  // Summary stats
  const compliantCount = staffProfiles.filter(p => p.complianceStatus === 'compliant').length;
  const atRiskCount = staffProfiles.filter(p => p.complianceStatus === 'at_risk').length;
  const nonCompliantCount = staffProfiles.filter(p => p.complianceStatus === 'non_compliant').length;
  const totalCeCredits = staffProfiles.reduce((sum, p) => sum + p.totalCeCredits, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-mn-bg font-sans">
        <MainNav />
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-graphite mb-2">Sign in to view staff training</h3>
          <p className="text-graphite/60 max-w-md mx-auto mb-6">Manage your team's training and compliance status.</p>
          <Link to="/portal/login" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
            Sign In →
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Staff Training | Socelle Education</title>
        <meta name="description" content="Monitor your team's training progress, CE credit compliance, and upcoming certificate expirations." />
      </Helmet>

      <MainNav />

      {/* Header */}
      <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
        <div className="section-container">
          <div className="flex items-center gap-2 text-sm text-graphite/50 mb-4">
            <Link to="/education" className="hover:text-accent transition-colors">Education</Link>
            <span>/</span>
            <span className="text-graphite/80">Staff Training</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-2">
                Staff Training Dashboard
              </h1>
              <p className="text-graphite/60 font-sans">
                Monitor your team's training progress and CE compliance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLive && (
                <span className="text-[10px] font-semibold text-signal-up bg-signal-up/10 px-2 py-0.5 rounded-full">LIVE</span>
              )}
              {staffProfiles.length > 0 && (
                <button
                  onClick={handleExportCompliance}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {!isLive && !loading && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — Staff training data will populate when team members enroll in courses.
        </div>
      )}

      <section className="py-8 lg:py-12">
        <div className="section-container">
          {loading ? (
            <div className="space-y-6">
              {/* Skeleton: summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-mn-card rounded-xl border border-graphite/5 p-5 space-y-2">
                    <div className="h-4 w-5 bg-graphite/10 rounded animate-pulse" />
                    <div className="h-8 w-12 bg-graphite/10 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-graphite/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              {/* Skeleton: compliance bar */}
              <div className="bg-mn-card rounded-2xl border border-graphite/5 p-6 space-y-3">
                <div className="h-4 w-36 bg-graphite/10 rounded animate-pulse" />
                <div className="h-3 bg-graphite/10 rounded-full animate-pulse" />
              </div>
              {/* Skeleton: staff list */}
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-mn-card rounded-2xl border border-graphite/5 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-graphite/10 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-graphite/10 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-graphite/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-8 h-8 text-signal-warn mx-auto mb-3" />
              <p className="text-graphite/60 text-sm">{error}</p>
            </div>
          ) : staffProfiles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-graphite mb-2">No team members found</h3>
              <p className="text-graphite/60 max-w-md mx-auto mb-6">Add team members to your business to track their training progress.</p>
              <Link to="/portal/team" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                Manage Team →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                  <Users className="w-5 h-5 text-accent mb-2" />
                  <p className="text-2xl font-sans font-bold text-graphite">{staffProfiles.length}</p>
                  <p className="text-xs text-graphite/50">Team Members</p>
                </div>
                <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                  <Shield className="w-5 h-5 text-signal-up mb-2" />
                  <p className="text-2xl font-sans font-bold text-graphite">{compliantCount}</p>
                  <p className="text-xs text-graphite/50">Compliant</p>
                </div>
                <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                  <AlertTriangle className="w-5 h-5 text-signal-warn mb-2" />
                  <p className="text-2xl font-sans font-bold text-graphite">{atRiskCount + nonCompliantCount}</p>
                  <p className="text-xs text-graphite/50">Need Attention</p>
                </div>
                <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                  <TrendingUp className="w-5 h-5 text-accent mb-2" />
                  <p className="text-2xl font-sans font-bold text-graphite">{totalCeCredits}</p>
                  <p className="text-xs text-graphite/50">Total CE Credits</p>
                </div>
              </div>

              {/* Compliance overview chart */}
              {staffProfiles.length > 0 && (
                <div className="bg-mn-card rounded-2xl border border-graphite/5 p-6">
                  <h2 className="font-sans font-semibold text-graphite mb-4">Compliance Overview</h2>
                  <div className="h-3 bg-graphite/10 rounded-full overflow-hidden flex">
                    {compliantCount > 0 && (
                      <div
                        className="bg-signal-up h-full transition-all"
                        style={{ width: `${(compliantCount / staffProfiles.length) * 100}%` }}
                        title={`${compliantCount} compliant`}
                      />
                    )}
                    {atRiskCount > 0 && (
                      <div
                        className="bg-signal-warn h-full transition-all"
                        style={{ width: `${(atRiskCount / staffProfiles.length) * 100}%` }}
                        title={`${atRiskCount} at risk`}
                      />
                    )}
                    {nonCompliantCount > 0 && (
                      <div
                        className="bg-signal-down h-full transition-all"
                        style={{ width: `${(nonCompliantCount / staffProfiles.length) * 100}%` }}
                        title={`${nonCompliantCount} non-compliant`}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-xs text-graphite/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-signal-up" /> {compliantCount} Compliant
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-signal-warn" /> {atRiskCount} At Risk
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-signal-down" /> {nonCompliantCount} Non-Compliant
                    </span>
                  </div>
                </div>
              )}

              {/* Filter bar */}
              <div className="flex items-center gap-2">
                {(['all', 'compliant', 'at_risk', 'non_compliant'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                      filter === f
                        ? 'bg-mn-dark text-mn-bg'
                        : 'bg-mn-card border border-graphite/10 text-graphite/60 hover:text-graphite'
                    }`}
                  >
                    {f === 'all' ? 'All Members' :
                     f === 'compliant' ? 'Compliant' :
                     f === 'at_risk' ? 'At Risk' : 'Non-Compliant'}
                    <span className="ml-1.5 opacity-60">
                      ({f === 'all' ? staffProfiles.length :
                        staffProfiles.filter(p => p.complianceStatus === f).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Staff list */}
              <div className="space-y-3">
                {filteredProfiles.map(profile => {
                  const isExpanded = expandedMember === profile.member.id;
                  const badge = COMPLIANCE_BADGE[profile.complianceStatus];
                  const BadgeIcon = badge.icon;

                  return (
                    <div key={profile.member.id} className="bg-mn-card rounded-2xl border border-graphite/5 overflow-hidden">
                      {/* Member summary row */}
                      <button
                        onClick={() => toggleMember(profile.member.id)}
                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-mn-surface/30 transition-colors"
                      >
                        {/* Avatar */}
                        {profile.member.avatar_url ? (
                          <img src={profile.member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                            {(profile.member.full_name ?? profile.member.email ?? '?').charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Name and stats */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-sans font-semibold text-sm text-graphite truncate">
                              {profile.member.full_name ?? profile.member.email ?? 'Team Member'}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}>
                              <BadgeIcon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-graphite/50">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" /> {profile.totalCeCredits} CE credits
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {profile.completedCourses} completed
                            </span>
                            {profile.inProgressCourses > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {profile.inProgressCourses} in progress
                              </span>
                            )}
                            {profile.nextExpiry && (
                              <span className="flex items-center gap-1 text-signal-warn">
                                <AlertTriangle className="w-3 h-3" /> Next expiry: {new Date(profile.nextExpiry).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand */}
                        <div className="flex-shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-graphite/30" /> : <ChevronDown className="w-4 h-4 text-graphite/30" />}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-graphite/5 px-5 py-4 space-y-4">
                          {/* Enrollments */}
                          {profile.enrollments.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-graphite/50 uppercase tracking-wider mb-2">Course Enrollments</h4>
                              <div className="space-y-2">
                                {profile.enrollments.map(enr => (
                                  <div key={enr.id} className="flex items-center justify-between p-3 bg-mn-bg rounded-lg">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-graphite font-medium truncate">{enr.course_title ?? 'Course'}</p>
                                      <p className="text-xs text-graphite/50 capitalize">{enr.course_category?.replace(/_/g, ' ') ?? '—'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      {enr.ce_credits && enr.ce_credits > 0 && (
                                        <span className="text-xs text-accent font-medium">{enr.ce_credits} CE</span>
                                      )}
                                      <div className="w-16">
                                        <div className="h-1.5 bg-graphite/10 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${enr.status === 'completed' ? 'bg-signal-up' : 'bg-accent'}`}
                                            style={{ width: `${enr.progress_pct}%` }}
                                          />
                                        </div>
                                        <p className="text-[10px] text-graphite/40 text-right mt-0.5">{enr.progress_pct}%</p>
                                      </div>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        enr.status === 'completed' ? 'bg-signal-up/10 text-signal-up' :
                                        enr.status === 'active' ? 'bg-accent/10 text-accent' :
                                        'bg-graphite/10 text-graphite/50'
                                      }`}>
                                        {enr.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certificates */}
                          {profile.certificates.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-graphite/50 uppercase tracking-wider mb-2">Certificates</h4>
                              <div className="space-y-2">
                                {profile.certificates.map(cert => (
                                  <div key={cert.id} className="flex items-center justify-between p-3 bg-mn-bg rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Award className="w-4 h-4 text-accent flex-shrink-0" />
                                      <div>
                                        <p className="text-sm text-graphite font-medium">{cert.course_title ?? 'Certificate'}</p>
                                        <p className="text-xs text-graphite/50">
                                          Issued {new Date(cert.issued_at).toLocaleDateString()}
                                          {cert.ce_credits ? ` — ${cert.ce_credits} CE` : ''}
                                        </p>
                                      </div>
                                    </div>
                                    {cert.expires_at && (
                                      <span className={`text-xs ${
                                        new Date(cert.expires_at) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                          ? 'text-signal-warn font-medium'
                                          : 'text-graphite/40'
                                      }`}>
                                        Expires {new Date(cert.expires_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {profile.enrollments.length === 0 && profile.certificates.length === 0 && (
                            <p className="text-sm text-graphite/50 text-center py-4">No training activity yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredProfiles.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-graphite mb-2">No team members match this filter</h3>
                  <p className="text-graphite/60 max-w-md mx-auto mb-6">Try adjusting your filters to see more team members.</p>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/education/courses" className="btn-mineral-primary">
                  <BookOpen className="w-4 h-4 mr-2 inline" /> Browse Courses
                </Link>
                <Link to="/education/ce-credits" className="btn-mineral-secondary">
                  <GraduationCap className="w-4 h-4 mr-2 inline" /> My CE Credits
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
