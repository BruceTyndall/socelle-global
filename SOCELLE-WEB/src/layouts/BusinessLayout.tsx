import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
  ArrowLeft,
  Brain,
  Bot,
  BarChart3,
  GraduationCap,
  MapPin,
  CalendarDays,
  ClipboardList,
  FileText,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  Users,
  Target,
  Bell,
  CreditCard,
  Store,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useState } from 'react';
import MainNav from '../components/MainNav';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import ChatPanel from '../components/ai/ChatPanel';
import NotificationCenter from '../components/notifications/NotificationCenter';
import LocationSwitcher from '../components/locations/LocationSwitcher';
import { LocationProvider } from '../lib/locations/useLocationContext';

export default function BusinessLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal');
  };

  const navSections = [
    {
      label: 'Intelligence',
      items: [
        { path: '/portal/dashboard', label: 'Dashboard', icon: Home },
        { path: '/portal/intelligence', label: 'Intelligence Hub', icon: Brain },
        { path: '/portal/advisor', label: 'AI Advisor', icon: Bot },
        { path: '/portal/benchmarks', label: 'Benchmarks', icon: BarChart3 },
        { path: '/portal/locations', label: 'Locations', icon: MapPin },
        { path: '/portal/ce-credits', label: 'CE Credits', icon: GraduationCap },
      ],
    },
    {
      label: 'Operations',
      items: [
        { path: '/portal/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/portal/messages', label: 'Messages', icon: MessageSquare },
        { path: '/portal/calendar', label: 'Calendar', icon: CalendarDays },
        { path: '/portal/plans', label: 'Plans', icon: ClipboardList },
        { path: '/portal/plans/new', label: 'New Plan', icon: ClipboardList },
        { path: '/portal/plans/compare', label: 'Compare Plans', icon: ClipboardList },
        { path: '/portal/apply', label: 'Apply', icon: FileText },
        { path: '/portal/claim/review', label: 'Claim Review', icon: CheckCircle2 },
      ],
    },
    {
      label: 'Growth',
      items: [
        { path: '/portal/sales', label: 'Sales', icon: TrendingUp },
        { path: '/portal/marketing', label: 'Marketing', icon: Megaphone },
        { path: '/portal/crm', label: 'CRM', icon: Users },
        { path: '/portal/booking', label: 'Booking', icon: CalendarDays },
        { path: '/portal/prospects', label: 'Prospects', icon: Target },
        { path: '/portal/reseller', label: 'Reseller', icon: Store },
      ],
    },
    {
      label: 'Discovery',
      items: [
        { path: '/brands', label: 'Browse Brands', icon: Sparkles },
      ],
    },
    {
      label: 'Account',
      items: [
        { path: '/portal/notifications', label: 'Notifications', icon: Bell },
        { path: '/portal/account', label: 'Account', icon: User },
        { path: '/portal/subscription', label: 'Subscription', icon: CreditCard },
      ],
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-pro-ivory">
        <MainNav />
        <Outlet />
      </div>
    );
  }

  return (
    <LocationProvider>
    <div className="min-h-screen bg-pro-ivory">
      <MainNav />
      <div className="flex">
        <aside className="w-64 bg-white/95 backdrop-blur-sm border-r border-pro-stone flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="p-6 border-b border-pro-stone">
            <Link to="/portal">
              <h1 className="font-serif text-lg text-pro-navy">
                socelle<span className="text-pro-gold">.</span>
              </h1>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-pro-warm-gray hover:bg-pro-cream hover:text-pro-navy mb-2 font-sans min-h-touch"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="text-[10px] font-sans font-semibold text-pro-warm-gray/70 uppercase tracking-wider px-4 pt-4 pb-1">
                  {section.label}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/brands'
                    ? location.pathname.startsWith('/brands')
                    : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors font-sans min-h-touch ${
                        isActive
                          ? 'bg-pro-cream text-pro-navy font-medium'
                          : 'text-pro-warm-gray hover:bg-pro-cream hover:text-pro-navy'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-pro-stone">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-pro-charcoal hover:bg-pro-cream rounded-lg transition-colors font-sans"
              >
                <span className="truncate">{profile?.spa_name || user.email}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-pro-stone overflow-hidden">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-pro-charcoal hover:bg-pro-cream transition-colors font-sans"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0" style={{ height: 'calc(100vh - 4rem)' }}>
          <header className="bg-white border-b border-pro-stone">
            <div className="px-8 py-5">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-lg text-pro-navy">
                  {profile?.spa_name || 'Business Portal'}
                </h1>
                <div className="flex items-center gap-3">
                  <LocationSwitcher />
                  <NotificationCenter preferencesUrl="/portal/notifications" />
                  <div className="text-sm text-pro-warm-gray font-sans">
                    Reseller Portal
                  </div>
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

          <footer className="border-t border-pro-stone bg-white">
            <div className="px-8 py-4">
              <p className="text-center text-sm text-pro-warm-gray font-sans">
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
