import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Settings, Upload } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function BusinessNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut();
    navigate('/portal/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `text-sm font-sans font-medium px-3 py-1.5 rounded-md transition-colors duration-150 ${
      isActive(path)
        ? 'bg-pro-ivory text-pro-charcoal'
        : 'text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-ivory/50'
    }`;

  const mobileLinkClass = (path: string) =>
    `block w-full text-left text-sm font-sans font-medium px-4 py-3 rounded-lg transition-colors duration-150 ${
      isActive(path)
        ? 'bg-pro-ivory text-pro-charcoal'
        : 'text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-ivory/60'
    }`;

  return (
    <nav className="bg-white border-b border-pro-stone sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* ── Left: Wordmark + portal links (authenticated only) ── */}
          <div className="flex items-center gap-8">
            <Link
              to={user ? '/portal/dashboard' : '/'}
              className="flex items-center"
              onClick={() => setMobileOpen(false)}
            >
              <span className="font-serif text-lg text-pro-charcoal tracking-tight leading-none">
                socelle<span className="text-pro-gold">.</span>
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                <Link to="/portal/dashboard" className={linkClass('/portal/dashboard')}>Dashboard</Link>
                <Link to="/portal/plans" className={linkClass('/portal/plans')}>Reports</Link>
                <Link to="/portal/orders" className={linkClass('/portal/orders')}>Orders</Link>
              </div>
            )}
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/portal/plans/new"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-pro-charcoal hover:bg-pro-charcoal/90 text-white text-sm font-medium font-sans rounded-lg transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload your menu
                </Link>
                <Link
                  to="/portal/account"
                  className={`hidden md:flex items-center gap-1.5 text-sm font-medium font-sans transition-colors ${
                    isActive('/portal/account') ? 'text-pro-charcoal' : 'text-pro-warm-gray hover:text-pro-charcoal'
                  }`}
                  title="Account settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/portal/login"
                  className="hidden md:inline text-sm font-medium font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors px-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/portal/signup"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium font-sans text-white bg-pro-charcoal hover:bg-pro-charcoal/90 rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-ivory transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-pro-stone bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {user ? (
              <>
                <Link to="/portal/dashboard" className={mobileLinkClass('/portal/dashboard')} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/portal/plans" className={mobileLinkClass('/portal/plans')} onClick={() => setMobileOpen(false)}>Reports</Link>
                <Link to="/portal/orders" className={mobileLinkClass('/portal/orders')} onClick={() => setMobileOpen(false)}>Orders</Link>

                <div className="pt-3 mt-3 border-t border-pro-stone space-y-1">
                  <Link
                    to="/portal/plans/new"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium font-sans text-white bg-pro-charcoal hover:bg-pro-charcoal/90 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload your menu
                  </Link>
                  <Link
                    to="/portal/account"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium font-sans rounded-lg transition-colors ${
                      isActive('/portal/account') ? 'bg-pro-ivory text-pro-charcoal' : 'text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-ivory/60'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium font-sans text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-ivory/60 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 py-2">
                <Link
                  to="/portal/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium font-sans text-pro-charcoal border border-pro-stone hover:bg-pro-ivory rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/portal/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium font-sans text-white bg-pro-charcoal hover:bg-pro-charcoal/90 rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
