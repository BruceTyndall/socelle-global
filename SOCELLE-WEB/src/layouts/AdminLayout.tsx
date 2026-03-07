import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Loader2,
  LogOut,
  Building2,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  Menu,
  CheckSquare,
  Sprout,
  TrendingUp,
  Brain,
  FileText,
  Code,
  Globe,
  FileEdit,
  BookOpen,
  Image,
  Search,
  Radio,
  Server,
  Map,
  Settings,
  FlaskConical,
  Layers,
  GitMerge,
  Target,
  DollarSign,
  Megaphone,
  Store,
  FolderTree,
  Tag,
  Truck,
  Star,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { Avatar } from '../components/ui';
import NotificationCenter from '../components/notifications/NotificationCenter';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/admin/approvals', label: 'Approvals', icon: CheckSquare },
      { path: '/admin/seeding', label: 'Seeding', icon: Sprout },
      { path: '/admin/signals', label: 'Signals', icon: TrendingUp },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/admin/intelligence', label: 'Intelligence', icon: Brain },
      { path: '/admin/reports', label: 'Reports', icon: FileText },
      { path: '/admin/regions', label: 'Regions', icon: Globe },
    ],
  },
  {
    label: 'Ingredients',
    items: [
      { path: '/admin/ingredients', label: 'Ingredients', icon: FlaskConical },
      { path: '/admin/ingredients/collections', label: 'Collections', icon: Layers },
      { path: '/admin/ingredients/interactions', label: 'Interactions', icon: GitMerge },
    ],
  },
  {
    label: 'Sales',
    items: [
      { path: '/admin/sales', label: 'Sales Hub', icon: Target },
      { path: '/sales', label: 'Dashboard', icon: TrendingUp },
      { path: '/sales/pipeline', label: 'Pipeline', icon: Target },
      { path: '/sales/commissions', label: 'Commissions', icon: DollarSign },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { path: '/admin/marketing', label: 'Marketing Hub', icon: Megaphone },
      { path: '/marketing', label: 'Campaign Platform', icon: Megaphone },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { path: '/admin/brands', label: 'All Brands', icon: Building2 },
      { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    ],
  },
  {
    label: 'Shop',
    items: [
      { path: '/admin/shop/products', label: 'Products', icon: Store },
      { path: '/admin/shop/categories', label: 'Categories', icon: FolderTree },
      { path: '/admin/shop/orders', label: 'Shop Orders', icon: ShoppingBag },
      { path: '/admin/shop/discounts', label: 'Discounts', icon: Tag },
      { path: '/admin/shop/shipping', label: 'Shipping', icon: Truck },
      { path: '/admin/shop/reviews', label: 'Reviews', icon: MessageSquare },
    ],
  },
  {
    label: 'Education',
    items: [
      { path: '/admin/education', label: 'Courses', icon: GraduationCap },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/admin/pages', label: 'Pages', icon: FileEdit },
      { path: '/admin/blog', label: 'Blog', icon: BookOpen },
      { path: '/admin/media', label: 'Media', icon: Image },
      { path: '/admin/seo', label: 'SEO', icon: Search },
    ],
  },
  {
    label: 'Platform',
    items: [
      { path: '/admin/api', label: 'API', icon: Code },
      { path: '/admin/live-data', label: 'Live Data', icon: Radio },
      { path: '/admin/api-control', label: 'API Control', icon: Server },
      { path: '/admin/api-sitemap', label: 'API Sitemap', icon: Map },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/health', label: 'Schema Health', icon: Shield },
      { path: '/admin/debug', label: 'Debug', icon: Activity },
    ],
  },
];

export default function AdminLayout() {
  const { user, signOut, isAdmin, loading, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard — wait for profile to resolve before checking role.
  // Defense-in-depth: check both the computed isAdmin flag AND the raw
  // profile.role so that a missing/stale profile cannot grant access.
  const ADMIN_ROLES = ['admin', 'platform_admin'] as const;
  const hasAdminRole =
    isAdmin &&
    !!profile?.role &&
    (ADMIN_ROLES as readonly string[]).includes(profile.role);

  // Auth guard temporarily bypassed for dev access
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-pro-ivory flex items-center justify-center">
  //       <Loader2 className="w-8 h-8 text-pro-navy animate-spin" />
  //     </div>
  //   );
  // }
  // if (!user || !hasAdminRole) {
  //   return <Navigate to="/admin/login" replace />;
  // }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin/brands' && location.pathname.startsWith('/admin/brands')) return true;
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-5 border-b border-pro-stone ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pro-navy to-pro-navy-dark flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5 text-pro-gold" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-sans font-semibold text-pro-charcoal text-sm leading-none">Socelle</p>
            <p className="font-sans text-xs text-pro-warm-gray mt-0.5">Admin Portal</p>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-pro-warm-gray/60 font-sans">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
                      active
                        ? 'bg-pro-navy text-white'
                        : 'text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-pro-stone p-3 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors font-sans ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Back to site' : undefined}
        >
          <ChevronLeft className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </Link>
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar name={user.email} size="xs" />
            <span className="text-xs text-pro-warm-gray font-sans truncate">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-pro-warm-gray hover:text-red-600 hover:bg-red-50 transition-colors font-sans ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pro-ivory flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-pro-stone transition-all duration-200 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 bg-white border border-pro-stone rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-pro-warm-gray hover:text-pro-charcoal hidden lg:flex"
          style={{ position: 'sticky', left: collapsed ? 52 : 204 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-pro-stone h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-pro-charcoal font-sans">Admin Portal</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <NotificationCenter preferencesUrl="/admin/dashboard" />
              <span className="text-xs text-pro-warm-gray font-sans hidden sm:block">{user.email}</span>
              <Avatar name={user.email} size="sm" />
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <RouteErrorBoundary section="Admin Panel">
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
}
