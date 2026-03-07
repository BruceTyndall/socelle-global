import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart2,
  MessageSquare,
  Megaphone,
  Zap,
  Tag,
  Users,
  Store,
  LogOut,
  ChevronLeft,
  Sparkles,
  Menu,
  Target,
  Brain,
  Bot,
  CreditCard,
  FileText,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { Avatar } from '../components/ui';
import ChatPanel from '../components/ai/ChatPanel';
import NotificationCenter from '../components/notifications/NotificationCenter';

const NAV_SECTIONS = [
  {
    label: 'Intelligence',
    items: [
      { path: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/brand/intelligence', label: 'Intelligence Hub', icon: Brain },
      { path: '/brand/advisor', label: 'AI Advisor', icon: Bot },
      { path: '/brand/intelligence-report', label: 'Intelligence Report', icon: FileText },
      { path: '/brand/intelligence-pricing', label: 'Intelligence Pricing', icon: CreditCard },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { path: '/brand/orders', label: 'Orders', icon: ShoppingBag },
      { path: '/brand/products', label: 'Products', icon: Package },
      { path: '/brand/customers', label: 'Retailers', icon: Users },
      { path: '/brand/storefront', label: 'Storefront', icon: Store },
    ],
  },
  {
    label: 'Growth',
    items: [
      { path: '/brand/performance', label: 'Performance', icon: BarChart2 },
      { path: '/brand/campaigns', label: 'Campaigns', icon: Megaphone },
      { path: '/brand/automations', label: 'Automations', icon: Zap },
      { path: '/brand/promotions', label: 'Promotions', icon: Tag },
      { path: '/brand/pipeline', label: 'Pipeline', icon: Target },
      { path: '/brand/leads', label: 'Leads', icon: Users },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/brand/messages', label: 'Messages', icon: MessageSquare },
      { path: '/brand/notifications', label: 'Notifications', icon: Bell },
      { path: '/brand/onboarding', label: 'Onboarding', icon: Sparkles },
      { path: '/brand/claim/review', label: 'Claim Review', icon: CheckCircle2 },
      { path: '/brand/plans', label: 'Plans', icon: CreditCard },
    ],
  },
];

const ALL_NAV = NAV_SECTIONS.flatMap((section) => section.items);

export default function BrandLayout() {
  const { user, signOut, brandId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    if (!brandId) return;
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('is_archived', false)
      .then(({ count, error }) => {
        if (error) return;
        setMsgCount(count ?? 0);
      });
  }, [brandId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/brand/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const currentLabel = ALL_NAV.find(i => isActive(i.path))?.label ?? 'Brand Portal';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand identity */}
      <div className="px-4 py-5 border-b border-pro-stone">
        <Link to="/brand/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pro-navy to-pro-navy-dark flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-pro-gold" />
          </div>
          <div>
            <p className="font-sans font-semibold text-pro-charcoal text-sm leading-none">Socelle</p>
            <p className="font-sans text-xs text-pro-warm-gray mt-0.5">Brand Portal</p>
          </div>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="pb-2">
            <p className="px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-pro-warm-gray/70 font-sans">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path) || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-sans transition-colors ${
                    active
                      ? 'bg-pro-navy text-white'
                      : 'text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.label === 'Messages' && msgCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1 rounded-full bg-pro-gold text-white text-[10px] font-bold flex items-center justify-center">
                      {msgCount > 99 ? '99+' : msgCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}


      </nav>

      {/* Footer */}
      <div className="border-t border-pro-stone p-3 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors font-sans"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to site</span>
        </Link>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar name={user.email} size="xs" />
            <span className="text-xs text-pro-warm-gray font-sans truncate">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-pro-warm-gray hover:text-red-600 hover:bg-red-50 transition-colors font-sans"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pro-ivory flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-pro-stone flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-pro-charcoal/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-pro-stone h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-pro-charcoal font-sans">{currentLabel}</p>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <NotificationCenter preferencesUrl="/brand/notifications" />
              <span className="text-xs text-pro-warm-gray font-sans hidden sm:block">{user.email}</span>
              <Avatar name={user.email} size="sm" />
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <RouteErrorBoundary section="Brand Portal">
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
      <ChatPanel userRole="brand_admin" />
    </div>
  );
}
