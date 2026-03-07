import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Users,
  FileText,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { Avatar } from '../components/ui';

// ── WO-OVERHAUL-15: Marketing Layout ─────────────────────────────────
// Sidebar navigation for the marketing platform.
// Pearl Mineral V2 design tokens only.

const NAV_ITEMS = [
  { path: '/marketing', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/marketing/campaigns', label: 'Campaigns', icon: Mail },
  { path: '/marketing/segments', label: 'Segments', icon: Users },
  { path: '/marketing/templates', label: 'Templates', icon: FileText },
  { path: '/marketing/landing-pages', label: 'Landing Pages', icon: Globe },
  { path: '/marketing/calendar', label: 'Calendar', icon: Calendar },
];

export default function MarketingLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/marketing" className={`flex items-center gap-3 px-4 py-5 border-b border-graphite/8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-mn-dark flex items-center justify-center flex-shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-sans font-semibold text-graphite text-sm leading-none">Marketing</p>
            <p className="font-sans text-xs text-graphite/40 mt-0.5">Campaign Platform</p>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
                  active
                    ? 'bg-mn-dark text-white'
                    : 'text-graphite/50 hover:text-graphite hover:bg-mn-surface'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t border-graphite/8 p-3 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-graphite/50 hover:text-graphite hover:bg-mn-surface transition-colors font-sans w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Back to site' : undefined}
        >
          <ChevronLeft className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </button>
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar name={user.email} size="xs" />
            <span className="text-xs text-graphite/40 font-sans truncate">{user.email}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mn-bg flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-mn-card border-r border-graphite/8 transition-all duration-200 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 bg-mn-card border border-graphite/10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-graphite/40 hover:text-graphite hidden lg:flex"
          style={{ position: 'sticky', left: collapsed ? 52 : 204 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-graphite/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-mn-card flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-mn-card border-b border-graphite/8 h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-graphite/40 hover:text-graphite hover:bg-mn-surface transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-graphite font-sans">Marketing Platform</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-graphite/40 font-sans hidden sm:block">{user.email}</span>
              <Avatar name={user.email} size="sm" />
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1">
          <RouteErrorBoundary section="Marketing Platform">
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
}
