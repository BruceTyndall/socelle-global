// AccountProfile.tsx — /account — Main user account hub (Shopify parity)
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Heart, LogOut, Settings, User as UserIcon, CreditCard, Clock, Bookmark } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useAuth } from '../../lib/auth';
import { useSignalLibrary } from '../../lib/intelligence/useSignalEngagement';

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Recently saved';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'Recently saved';
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function humanizeSignalType(value?: string | null): string {
  if (!value) return 'Signal';
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export default function AccountProfile() {
  const { user, profile, signOut } = useAuth();
  const {
    data: signalLibrary,
    isLoading: libraryLoading,
    error: libraryError,
  } = useSignalLibrary(4);

  return (
    <>
      <Helmet>
        <title>My Account | SOCELLE</title>
        <meta name="description" content="Manage your SOCELLE account, view order history, and saved items." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pt-28">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-sans font-semibold text-graphite mb-1">My Account</h1>
              <p className="text-sm font-sans text-graphite/60">
                Welcome back, {profile?.contact_email?.split('@')[0] || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
            <button 
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-graphite/15 text-sm font-sans font-medium text-graphite hover:bg-mn-card transition-colors w-fit"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Main Action Grid */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Primary Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/account/orders" className="bg-mn-card rounded-xl p-6 border border-graphite/5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-graphite/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Package className="w-6 h-6 text-graphite" />
                  </div>
                  <h3 className="text-lg font-sans font-semibold text-graphite mb-1">Order History</h3>
                  <p className="text-sm font-sans text-graphite/60 line-clamp-2">
                    Track recent orders, download invoices, and view order statuses.
                  </p>
                </Link>

                <Link to="/account/wishlist" className="bg-mn-card rounded-xl p-6 border border-graphite/5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Bookmark className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-sans font-semibold text-graphite mb-1">Saved Intelligence</h3>
                  <p className="text-sm font-sans text-graphite/60 line-clamp-2">
                    Articles and signals you have saved for later.
                  </p>
                </Link>
              </div>

              <section className="bg-mn-card rounded-xl border border-graphite/5 overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-graphite/5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite/45">Saved intelligence</p>
                    <p className="text-sm text-graphite/60 mt-1">Your profile-ready library of signals and stories.</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-graphite/42">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-graphite/[0.04] px-3 py-1">
                      <Bookmark className="w-3.5 h-3.5" />
                      {signalLibrary?.savedCount ?? 0} saved
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-graphite/[0.04] px-3 py-1">
                      <Heart className="w-3.5 h-3.5" />
                      {signalLibrary?.likedCount ?? 0} liked
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {libraryLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="h-16 rounded-xl bg-graphite/[0.05]" />
                      ))}
                    </div>
                  ) : libraryError ? (
                    <div className="rounded-xl border border-graphite/10 bg-white p-5">
                      <p className="text-sm font-semibold text-graphite">Saved library unavailable</p>
                      <p className="mt-1 text-sm text-graphite/60">
                        Your account is live, but this library will appear after the saved-signal migration is applied.
                      </p>
                    </div>
                  ) : signalLibrary?.savedSignals?.length ? (
                    <div className="space-y-3">
                      {signalLibrary.savedSignals.map(({ signal, isLiked, savedAt }) => (
                        <Link
                          key={signal.id}
                          to={`/intelligence/signals/${signal.id}`}
                          className="flex items-start justify-between gap-4 rounded-xl border border-graphite/8 bg-white px-4 py-4 transition-colors hover:border-graphite/16 hover:bg-graphite/[0.02]"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-graphite/42">
                              <span>{humanizeSignalType(signal.signal_type)}</span>
                              {signal.source_name && <span>{signal.source_name}</span>}
                            </div>
                            <p className="mt-2 text-sm font-semibold leading-6 text-graphite">{signal.title}</p>
                            {signal.description && (
                              <p className="mt-1 text-sm text-graphite/60 line-clamp-2">{signal.description}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="flex items-center justify-end gap-2 text-graphite/42">
                              <Bookmark className="w-4 h-4 fill-current" />
                              {isLiked && <Heart className="w-4 h-4 fill-current" />}
                            </div>
                            <p className="mt-2 text-[11px] font-mono text-graphite/42">{timeAgo(savedAt)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-graphite/12 bg-white p-6 text-center">
                      <p className="text-sm font-semibold text-graphite">No saved intelligence yet</p>
                      <p className="mt-2 text-sm text-graphite/60">
                        Save or like content from the Intelligence feed and it will show up here.
                      </p>
                      <Link
                        to="/intelligence"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-graphite/12 px-4 py-2 text-sm font-medium text-graphite hover:border-graphite/20 hover:bg-graphite/[0.03]"
                      >
                        Browse intelligence
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Utility List */}
              <div className="bg-mn-card rounded-xl border border-graphite/5 overflow-hidden">
                <div className="divide-y divide-graphite/5">
                  <Link to="/settings" className="flex items-center justify-between p-4 hover:bg-graphite/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-graphite/5 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-graphite/70" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-semibold text-graphite">Account Settings</p>
                        <p className="text-xs font-sans text-graphite/60">Update your email, password, and preferences</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/account/addresses" className="flex items-center justify-between p-4 hover:bg-graphite/[0.02] transition-colors disabled opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-graphite/5 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-graphite/70" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-semibold text-graphite">Saved Addresses</p>
                        <p className="text-xs font-sans text-graphite/60">Manage your shipping destinations</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/account/payment-methods" className="flex items-center justify-between p-4 hover:bg-graphite/[0.02] transition-colors disabled opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-graphite/5 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-graphite/70" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-semibold text-graphite">Payment Methods</p>
                        <p className="text-xs font-sans text-graphite/60">Manage your linked cards</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

            </div>

            {/* Sidebar Profile Card */}
            <div className="md:col-span-4">
              <div className="bg-mn-card rounded-xl p-6 border border-graphite/5">
                <div className="w-16 h-16 bg-gradient-to-br from-graphite to-mn-dark rounded-full text-white flex items-center justify-center text-xl font-sans font-bold mb-4">
                  {profile?.contact_email?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                
                <h2 className="text-lg font-sans font-semibold text-graphite truncate">
                  {profile?.contact_email?.split('@')[0] || 'Retail Customer'}
                </h2>
                <p className="text-sm font-sans text-graphite/60 truncate mb-6">{user?.email}</p>

                <div className="space-y-4 pt-4 border-t border-graphite/10">
                  <div className="flex items-center gap-3 text-sm font-sans">
                    <Clock className="w-4 h-4 text-graphite/40" />
                    <span className="text-graphite/70">
                      Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2026'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <SiteFooter />
    </>
  );
}
