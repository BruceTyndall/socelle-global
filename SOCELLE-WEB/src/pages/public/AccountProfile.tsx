// AccountProfile.tsx — /account — Main user account hub (Shopify parity)
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Heart, LogOut, Settings, User as UserIcon, CreditCard, Clock } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useAuth } from '../../lib/auth';

export default function AccountProfile() {
  const { user, profile, signOut } = useAuth();

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
                    <Heart className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-sans font-semibold text-graphite mb-1">Saved Items</h3>
                  <p className="text-sm font-sans text-graphite/60 line-clamp-2">
                    Products and protocols you have saved for later.
                  </p>
                </Link>
              </div>

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
                        <p className="text-sm font-sans font-semibold text-graphite flex items-center gap-2">
                          Saved Addresses
                          <span className="text-[9px] uppercase tracking-wider bg-graphite/10 px-1.5 py-0.5 rounded font-medium text-graphite/60">Coming Soon</span>
                        </p>
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
                        <p className="text-sm font-sans font-semibold text-graphite flex items-center gap-2">
                          Payment Methods
                          <span className="text-[9px] uppercase tracking-wider bg-graphite/10 px-1.5 py-0.5 rounded font-medium text-graphite/60">Coming Soon</span>
                        </p>
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
