import { Link } from 'react-router-dom';
import { Shield, Store, Briefcase, Compass, ExternalLink } from 'lucide-react';

export default function DevOnlyMasterLinks() {
  // Only show in Vite dev mode (build-time constant = false in production builds).
  // The runtime VITE_SHOW_MASTER_LINKS check has been removed because a
  // misconfigured production env var would expose internal navigation to all users.
  if (!import.meta.env.DEV) return null;

  const links = [
    { to: '/admin/login', label: 'Admin Login', icon: Shield },
    { to: '/admin/inbox', label: 'Admin Inbox', icon: Shield },
    { to: '/admin/brands', label: 'Admin Brands', icon: Shield },
    { to: '/brand/login', label: 'Brand Login', icon: Store },
    { to: '/brand/dashboard', label: 'Brand Dashboard', icon: Store },
    { to: '/portal/login', label: 'Business Login', icon: Briefcase },
    { to: '/portal/signup', label: 'Business Signup', icon: Briefcase },
    { to: '/portal/dashboard', label: 'Business Dashboard', icon: Briefcase },
    { to: '/brands', label: 'Explore Brands (Public)', icon: Compass },
    { to: '/portal', label: 'Explore Brands (Business)', icon: Compass },
  ];

  return (
    <div className="mt-16 border-t border-accent-soft bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-wide text-graphite/60 uppercase">
              Dev Tools
            </p>
            <h3 className="text-lg font-semibold text-graphite">
              Master Links
            </h3>
            <p className="text-sm text-graphite/60">
              Quick navigation for testing portals without hunting routes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-accent-soft bg-background text-graphite hover:bg-accent-soft transition-colors text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{l.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-graphite/60" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-3 text-xs text-graphite/60">
          Visible only in <span className="font-semibold">DEV</span> mode (never in production builds).
        </div>
      </div>
    </div>
  );
}
