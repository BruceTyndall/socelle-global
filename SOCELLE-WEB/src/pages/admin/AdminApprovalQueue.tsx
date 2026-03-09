import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Users,
  RefreshCw,
  Globe,
  Mail,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/Toast';
import ErrorState from '../../components/ErrorState';

// ── Types ─────────────────────────────────────────────────────────────────

interface PendingBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  verification_status: string;
  service_tier: string;
  outreach_status: string;
  created_at: string;
}

interface PendingBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  state: string | null;
  business_type: string | null;
  website_url: string | null;
  verification_status: string;
  outreach_status: string | null;
  created_at: string;
}

type Tab = 'brands' | 'businesses';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BusinessTypeBadge({ type }: { type: string | null }) {
  if (!type) return null;
  const label = type === 'medspa' ? 'MedSpa' : type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-graphite font-sans">
      {label}
    </span>
  );
}

function ServiceTierBadge({ tier }: { tier: string }) {
  const isPremier = tier === 'premier';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-sans ${
      isPremier ? 'bg-accent/20 text-accent' : 'bg-accent-soft text-graphite'
    }`}>
      {isPremier ? 'Premier' : 'Standard'}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminApprovalQueue() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('brands');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const { data: queueData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin-approval-queue'],
    queryFn: async () => {
      const [brandsRes, bizRes] = await Promise.all([
        supabase
          .from('brands')
          .select('id, name, slug, description, short_description, logo_url, website_url, contact_email, verification_status, service_tier, outreach_status, created_at')
          .eq('verification_status', 'pending_verification')
          .order('created_at', { ascending: true }),
        supabase
          .from('businesses')
          .select('id, name, slug, description, city, state, business_type, website_url, verification_status, outreach_status, created_at')
          .eq('verification_status', 'pending_verification')
          .order('created_at', { ascending: true }),
      ]);
      if (brandsRes.error) throw brandsRes.error;
      if (bizRes.error) throw bizRes.error;
      return {
        pendingBrands: (brandsRes.data ?? []) as PendingBrand[],
        pendingBusinesses: (bizRes.data ?? []) as PendingBusiness[],
      };
    },
  });

  const pendingBrands = queueData?.pendingBrands ?? [];
  const pendingBusinesses = queueData?.pendingBusinesses ?? [];
  const error = queryError ? (queryError as Error).message : null;

  // ── Brand actions ──────────────────────────────────────────────────────

  const approveBrand = async (brand: PendingBrand) => {
    setActioningId(brand.id);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', brand.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-approval-queue'] });
      addToast(`${brand.name} approved.`, 'success');
    } catch (err: any) {
      console.error('Error approving brand:', err);
      addToast('Failed to approve brand.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const rejectBrand = async (brand: PendingBrand) => {
    setActioningId(brand.id);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          verification_status: 'unverified',
          outreach_status: 'not_contacted',
        })
        .eq('id', brand.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-approval-queue'] });
      addToast(`${brand.name} returned to unverified.`, 'info');
    } catch (err: any) {
      console.error('Error rejecting brand:', err);
      addToast('Failed to reject brand.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // ── Business actions ───────────────────────────────────────────────────

  const approveBusiness = async (biz: PendingBusiness) => {
    setActioningId(biz.id);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', biz.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-approval-queue'] });
      addToast(`${biz.name} approved.`, 'success');
    } catch (err: any) {
      console.error('Error approving business:', err);
      addToast('Failed to approve business.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const rejectBusiness = async (biz: PendingBusiness) => {
    setActioningId(biz.id);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          verification_status: 'unverified',
        })
        .eq('id', biz.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-approval-queue'] });
      addToast(`${biz.name} returned to unverified.`, 'info');
    } catch (err: any) {
      console.error('Error rejecting business:', err);
      addToast('Failed to reject business.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Queue Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadQueue }}
      />
    );
  }

  const totalPending = pendingBrands.length + pendingBusinesses.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-sans text-graphite">
            Approval Queue<span className="text-accent">.</span>
          </h1>
          <p className="text-graphite/60 font-sans mt-1">
            Review and approve brand and business verification requests
          </p>
        </div>
        <button
          type="button"
          onClick={loadQueue}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Queue summary */}
      {!loading && totalPending === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-sans">All clear — no pending verifications.</p>
        </div>
      )}

      {!loading && totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-sans font-medium">
            {totalPending} pending verification{totalPending !== 1 ? 's' : ''} —&nbsp;
            {pendingBrands.length} brand{pendingBrands.length !== 1 ? 's' : ''},&nbsp;
            {pendingBusinesses.length} business{pendingBusinesses.length !== 1 ? 'es' : ''}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit">
        <TabButton
          active={tab === 'brands'}
          icon={Building2}
          label="Brands"
          count={pendingBrands.length}
          onClick={() => setTab('brands')}
        />
        <TabButton
          active={tab === 'businesses'}
          icon={Users}
          label="Businesses"
          count={pendingBusinesses.length}
          onClick={() => setTab('businesses')}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-accent-soft rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent-soft flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-accent-soft rounded w-1/3" />
                  <div className="h-4 bg-accent-soft rounded w-1/2" />
                </div>
                <div className="flex gap-2">
                  <div className="w-24 h-9 bg-accent-soft rounded-lg" />
                  <div className="w-24 h-9 bg-accent-soft rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'brands' ? (
        <BrandsQueue
          brands={pendingBrands}
          actioningId={actioningId}
          onApprove={approveBrand}
          onReject={rejectBrand}
        />
      ) : (
        <BusinessesQueue
          businesses={pendingBusinesses}
          actioningId={actioningId}
          onApprove={approveBusiness}
          onReject={rejectBusiness}
        />
      )}
    </div>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────

function TabButton({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
        active
          ? 'bg-white text-graphite shadow-sm'
          : 'text-graphite/60 hover:text-graphite'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
          active ? 'bg-graphite text-white' : 'bg-amber-200 text-amber-800'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Brands queue ───────────────────────────────────────────────────────────

function BrandsQueue({
  brands,
  actioningId,
  onApprove,
  onReject,
}: {
  brands: PendingBrand[];
  actioningId: string | null;
  onApprove: (b: PendingBrand) => void;
  onReject: (b: PendingBrand) => void;
}) {
  if (brands.length === 0) {
    return (
      <EmptyQueue label="No brands pending verification." />
    );
  }

  return (
    <div className="space-y-4">
      {brands.map(brand => (
        <div key={brand.id} className="bg-white border border-accent-soft rounded-xl overflow-hidden">
          {/* Accent bar */}
          <div className="h-1 bg-graphite" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-graphite flex items-center justify-center flex-shrink-0">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-white font-sans text-xl font-bold">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-sans text-graphite leading-tight">{brand.name}</h3>
                  <ServiceTierBadge tier={brand.service_tier} />
                </div>
                <p className="text-xs text-graphite/60 font-sans mb-2">/{brand.slug}</p>

                {(brand.short_description || brand.description) && (
                  <p className="text-sm text-graphite font-sans line-clamp-2 mb-3">
                    {brand.short_description || brand.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-graphite/60 font-sans">
                  {brand.contact_email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {brand.contact_email}
                    </span>
                  )}
                  {brand.website_url && (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-graphite transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {brand.website_url.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Applied {formatDate(brand.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => onReject(brand)}
                  disabled={actioningId === brand.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-accent-soft text-graphite/60 hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 font-sans text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(brand)}
                  disabled={actioningId === brand.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-graphite text-white hover:bg-graphite disabled:opacity-50 font-sans text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Businesses queue ───────────────────────────────────────────────────────

function BusinessesQueue({
  businesses,
  actioningId,
  onApprove,
  onReject,
}: {
  businesses: PendingBusiness[];
  actioningId: string | null;
  onApprove: (b: PendingBusiness) => void;
  onReject: (b: PendingBusiness) => void;
}) {
  if (businesses.length === 0) {
    return <EmptyQueue label="No businesses pending verification." />;
  }

  return (
    <div className="space-y-4">
      {businesses.map(biz => (
        <div key={biz.id} className="bg-white border border-accent-soft rounded-xl overflow-hidden">
          <div className="h-1 bg-graphite" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-graphite flex items-center justify-center flex-shrink-0">
                <span className="text-white font-sans text-xl font-bold">
                  {biz.name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-sans text-graphite leading-tight">{biz.name}</h3>
                  <BusinessTypeBadge type={biz.business_type} />
                </div>
                {(biz.city || biz.state) && (
                  <p className="text-xs text-graphite/60 font-sans mb-2">
                    {[biz.city, biz.state].filter(Boolean).join(', ')}
                  </p>
                )}

                {biz.description && (
                  <p className="text-sm text-graphite font-sans line-clamp-2 mb-3">
                    {biz.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-graphite/60 font-sans">
                  {biz.website_url && (
                    <a
                      href={biz.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-graphite transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {biz.website_url.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Applied {formatDate(biz.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => onReject(biz)}
                  disabled={actioningId === biz.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-accent-soft text-graphite/60 hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 font-sans text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(biz)}
                  disabled={actioningId === biz.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-graphite text-white hover:bg-graphite disabled:opacity-50 font-sans text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyQueue({ label }: { label: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
      <p className="text-graphite/60 font-sans text-sm">{label}</p>
    </div>
  );
}
