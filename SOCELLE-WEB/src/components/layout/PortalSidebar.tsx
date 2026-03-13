import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Database,
  FileText,
  User,
  Building,
  Briefcase,
  Users,
  Target,
  Megaphone,
  ShoppingCart,
  GraduationCap,
  Link2,
  Layout,
  Coins,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useModuleAccessContext } from '../../modules/_core/context/ModuleAccessContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  moduleKey?: string;
  adminOnly?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// ── Tooltip (collapsed mode) ─────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div
        className="
          pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
          whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5
          text-[11px] font-medium text-white shadow-md
          opacity-0 group-hover/tooltip:opacity-100
          transition-opacity duration-150
        "
      >
        {label}
        {/* Arrow */}
        <span
          className="
            absolute right-full top-1/2 -translate-y-1/2
            border-4 border-transparent border-r-foreground
          "
        />
      </div>
    </div>
  );
}

// ── NavItemRow ────────────────────────────────────────────────────────────────

interface NavItemRowProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}

function NavItemRow({ item, collapsed, isActive }: NavItemRowProps) {
  const Icon = item.icon;

  const className = [
    'flex items-center gap-3 rounded-lg text-sm transition-colors duration-150 cursor-pointer',
    collapsed ? 'px-3 py-2 justify-center' : 'px-3 py-2',
    isActive
      ? 'bg-accent border-l-2 border-accent-interactive text-primary font-medium'
      : 'text-foreground/70 hover:bg-accent/60 hover:text-primary',
  ].join(' ');

  const iconClass = isActive ? 'text-accent-interactive' : 'text-foreground/50';

  const inner = (
    <Link to={item.path} className={className}>
      <Icon size={16} strokeWidth={1.5} className={`flex-shrink-0 ${iconClass}`} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return <Tooltip label={item.label}>{inner}</Tooltip>;
  }

  return inner;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PortalSidebar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { checkAccess } = useModuleAccessContext();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar-collapsed', String(next));
      } catch {
        // localStorage unavailable — ignore
      }
      return next;
    });
  }, []);

  const isActive = (path: string) => {
    if (path === '/portal/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navSections: NavSection[] = [
    {
      label: 'Insight & Discovery',
      items: [
        { path: '/portal/intelligence', label: 'Intelligence Cloud', icon: Database },
        { path: '/portal/cms', label: 'CMS & Publishing', icon: FileText },
      ],
    },
    {
      label: 'Audience & Identity',
      items: [
        {
          path: '/portal/professionals',
          label: 'Pro Hub',
          icon: User,
          moduleKey: 'MODULE_PROFESSIONALS',
        },
        {
          path: '/portal/brands',
          label: 'Brand Hub',
          icon: Building,
          moduleKey: 'MODULE_BRANDS',
        },
        {
          path: '/portal/jobs',
          label: 'Jobs & Talent',
          icon: Briefcase,
          moduleKey: 'MODULE_JOBS',
        },
      ],
    },
    {
      label: 'Execution & Workflow',
      items: [
        { path: '/portal/crm', label: 'CRM & Audiences', icon: Users },
        { path: '/portal/sales', label: 'Sales Pipeline', icon: Target },
        { path: '/portal/marketing', label: 'Marketing Campaigns', icon: Megaphone },
      ],
    },
    {
      label: 'Commerce & Loyalty',
      items: [
        { path: '/portal/shop', label: 'B2B Commerce', icon: ShoppingCart },
        { path: '/portal/education', label: 'Education & Protocols', icon: GraduationCap },
        { path: '/portal/affiliates', label: 'Affiliate & Rewards', icon: Link2 },
      ],
    },
    {
      label: 'Platform & Admin',
      items: [
        { path: '/portal/studio', label: 'Authoring Studio', icon: Layout },
        { path: '/portal/credits', label: 'Credit Economy', icon: Coins },
        {
          path: '/admin',
          label: 'Admin Console',
          icon: Shield,
          adminOnly: true,
        },
      ],
    },
  ];

  const filterItems = (items: NavItem[]): NavItem[] =>
    items.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.moduleKey) return checkAccess(item.moduleKey);
      return true;
    });

  const sidebarWidth = collapsed ? 'w-14' : 'w-60';

  return (
    <aside
      className={`
        ${sidebarWidth} flex-shrink-0 flex flex-col
        bg-white border-r transition-all duration-200
      `}
      style={{ borderColor: 'rgba(0,0,0,0.08)', height: 'calc(100vh - 4rem)' }}
    >
      {/* ── Logo / wordmark (expanded) or dot (collapsed) ── */}
      <div
        className={`
          flex items-center border-b py-4
          ${collapsed ? 'justify-center px-0' : 'px-4'}
        `}
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        {collapsed ? (
          <Link to="/portal/dashboard" aria-label="Dashboard">
            <span className="font-sans text-base text-foreground leading-none">
              s<span className="text-accent-interactive">.</span>
            </span>
          </Link>
        ) : (
          <Link to="/portal/dashboard" className="flex items-center">
            <span className="font-sans text-base text-foreground tracking-tight leading-none">
              socelle<span className="text-accent-interactive">.</span>
            </span>
          </Link>
        )}
      </div>

      {/* ── Home shortcut ── */}
      <div className="px-2 pt-3 pb-1">
        {collapsed ? (
          <Tooltip label="Dashboard">
            <Link
              to="/portal/dashboard"
              className={`
                flex items-center justify-center rounded-lg py-2 transition-colors duration-150
                ${isActive('/portal/dashboard')
                  ? 'bg-accent border-l-2 border-accent-interactive text-primary'
                  : 'text-foreground/70 hover:bg-accent/60 hover:text-primary'}
              `}
            >
              <Home
                size={16}
                strokeWidth={1.5}
                className={isActive('/portal/dashboard') ? 'text-accent-interactive' : 'text-foreground/50'}
              />
            </Link>
          </Tooltip>
        ) : (
          <Link
            to="/portal/dashboard"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150
              ${isActive('/portal/dashboard')
                ? 'bg-accent border-l-2 border-accent-interactive text-primary font-medium'
                : 'text-foreground/70 hover:bg-accent/60 hover:text-primary'}
            `}
          >
            <Home
              size={16}
              strokeWidth={1.5}
              className={isActive('/portal/dashboard') ? 'text-accent-interactive' : 'text-foreground/50'}
            />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />

      {/* ── Nav sections ── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {navSections.map((section) => {
          const visibleItems = filterItems(section.items);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label} className="pt-1">
              {!collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-[0.16em] font-medium text-foreground/40 select-none">
                  {section.label}
                </p>
              )}
              {collapsed && (
                <div
                  className="mx-3 my-2 border-b"
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                />
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavItemRow
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                    isActive={isActive(item.path)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: user info + sign out + collapse toggle ── */}
      <div
        className="border-t px-2 pb-2 pt-2 space-y-1"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        {/* Sign out */}
        {user && (
          <>
            {collapsed ? (
              <Tooltip label="Sign out">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center py-2 rounded-lg text-foreground/50 hover:text-primary hover:bg-accent/60 transition-colors duration-150"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                </button>
              </Tooltip>
            ) : (
              <div className="px-3 py-2 rounded-lg">
                <p className="text-[11px] text-foreground/40 truncate mb-1">
                  {profile?.contact_email || user.email}
                </p>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-[11px] text-foreground/50 hover:text-primary transition-colors duration-150"
                >
                  <LogOut size={12} strokeWidth={1.5} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className={`
            w-full flex items-center py-2 rounded-lg
            text-foreground/40 hover:text-primary hover:bg-accent/60
            transition-colors duration-150 text-[11px] font-medium
            ${collapsed ? 'justify-center' : 'gap-2 px-3'}
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={14} strokeWidth={1.5} />
          ) : (
            <>
              <ChevronLeft size={14} strokeWidth={1.5} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
