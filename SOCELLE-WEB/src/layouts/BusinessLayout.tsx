import { Outlet, useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../lib/auth';
import MainNav from '../components/MainNav';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import ChatPanel from '../components/ai/ChatPanel';
import NotificationCenter from '../components/notifications/NotificationCenter';
import LocationSwitcher from '../components/locations/LocationSwitcher';
import { LocationProvider } from '../lib/locations/useLocationContext';
import { useCreditBalance } from '../lib/credits/useCreditBalance';
import PortalSidebar from '../components/layout/PortalSidebar';

export default function BusinessLayout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { balance: creditBalance, loading: creditLoading } = useCreditBalance();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <Outlet />
      </div>
    );
  }

  return (
    <LocationProvider>
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex">
          {/* ── Phase-grouped collapsible sidebar ── */}
          <PortalSidebar />

          {/* ── Main content area ── */}
          <div className="flex-1 flex flex-col min-w-0" style={{ height: 'calc(100vh - 4rem)' }}>
            <header className="bg-white border-b border-accent/60">
              <div className="px-8 py-5">
                <div className="flex items-center justify-between">
                  <h1 className="font-sans text-lg text-graphite">
                    {profile?.spa_name || 'Business Portal'}
                  </h1>
                  <div className="flex items-center gap-3">
                    {/* PAY-WO-02: Credit balance strip */}
                    <button
                      onClick={() => navigate('/portal/credits')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-accent-interactive flex-shrink-0" />
                      {creditLoading ? (
                        <div className="h-3 w-10 bg-foreground/10 rounded animate-pulse" />
                      ) : (
                        <span className="text-[11px] font-sans font-semibold text-foreground">
                          {creditBalance.isLive ? creditBalance.display : (
                            <span className="text-foreground/40">DEMO</span>
                          )}
                        </span>
                      )}
                    </button>
                    <LocationSwitcher />
                    <NotificationCenter preferencesUrl="/portal/notifications" />
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 px-8 py-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <RouteErrorBoundary section="Business Portal">
                  <Outlet />
                </RouteErrorBoundary>
              </div>
            </main>

            <footer className="border-t border-accent/60 bg-white">
              <div className="px-8 py-4">
                <p className="text-center text-sm text-graphite/60 font-sans">
                  © 2026 Socelle. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
        <ChatPanel userRole="operator" />
      </div>
    </LocationProvider>
  );
}
