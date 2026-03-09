import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, Briefcase, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface ProfessionalDetailRow {
  id: string;
  spa_name: string | null;
  role: string;
  created_at: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  email: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  business_user: 'Operator',
  spa_user: 'Practitioner',
  brand_admin: 'Brand Partner',
};

function ProfessionalDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-9 w-32 rounded-full bg-mn-surface mb-6" />
      <div className="bg-white rounded-2xl border border-graphite/8 p-8 space-y-4">
        <div className="h-8 w-56 rounded bg-mn-surface" />
        <div className="h-4 w-36 rounded bg-mn-surface" />
        <div className="h-4 w-80 rounded bg-mn-surface" />
      </div>
    </div>
  );
}

function formatMemberSince(value: string | null): string {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: profile,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ProfessionalDetailRow | null, Error>({
    queryKey: ['professional-detail', id],
    queryFn: async () => {
      if (!id) return null;
      if (!isSupabaseConfigured) {
        throw new Error('Platform is being configured. Check back soon.');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, spa_name, role, created_at, contact_email, contact_phone, email')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return (data as ProfessionalDetailRow | null) ?? null;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

  const error = queryError?.message ?? null;
  const displayName = profile?.spa_name ?? 'Professional';
  const roleLabel = profile ? ROLE_LABELS[profile.role] ?? 'Professional' : 'Professional';

  return (
    <div className="min-h-screen bg-mn-bg">
      <Helmet>
        <title>{displayName} | Professional Directory | Socelle</title>
        <meta
          name="description"
          content={`Profile for ${displayName} on the Socelle professional directory.`}
        />
      </Helmet>

      <MainNav />

      {isLoading ? (
        <ProfessionalDetailSkeleton />
      ) : error ? (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="border rounded-2xl bg-signal-down/5 border-signal-down/20 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-signal-down mt-0.5" />
              <div>
                <h1 className="font-semibold text-graphite">Unable to load profile</h1>
                <p className="text-sm text-graphite/70 mt-1">{error}</p>
                <button
                  onClick={() => {
                    void refetch();
                  }}
                  className="mt-4 btn-mineral-primary btn-mineral-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : !profile ? (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-2xl border border-graphite/8 p-8 text-center">
            <h1 className="text-xl font-semibold text-graphite">Profile not found</h1>
            <p className="text-sm text-graphite/60 mt-2">
              This professional may be private or no longer available.
            </p>
            <Link to="/professionals" className="inline-flex mt-5 btn-mineral-primary btn-mineral-sm">
              Back to directory
            </Link>
          </div>
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/professionals"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-graphite/12 bg-white text-sm text-graphite/70 hover:text-graphite transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to directory
          </Link>

          <section className="mt-6 bg-white rounded-2xl border border-graphite/8 p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-semibold text-graphite">{displayName}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-sm text-graphite/60">
                    <Briefcase className="w-4 h-4" />
                    {roleLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-signal-up bg-signal-up/10 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-graphite/50">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {formatMemberSince(profile.created_at)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-graphite/8 p-4 bg-background">
                <p className="text-xs uppercase tracking-wider text-graphite/50">Email</p>
                <p className="mt-1 text-sm text-graphite inline-flex items-center gap-2">
                  <Mail className="w-4 h-4 text-graphite/40" />
                  {profile.contact_email ?? profile.email ?? 'Not listed'}
                </p>
              </div>
              <div className="rounded-xl border border-graphite/8 p-4 bg-background">
                <p className="text-xs uppercase tracking-wider text-graphite/50">Phone</p>
                <p className="mt-1 text-sm text-graphite inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-graphite/40" />
                  {profile.contact_phone ?? 'Not listed'}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/request-access" className="btn-mineral-accent btn-mineral-sm">
                Request Collaboration
              </Link>
            </div>
          </section>
        </main>
      )}

      <SiteFooter />
    </div>
  );
}
