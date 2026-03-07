import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth';

/* ──────────────────────────────────────────────────────────────
   MainNav — Liquid Glass 3-Floating-Children Navigation
   Three independent glass pills floating inside a fixed wrapper.
   ────────────────────────────────────────────────────────────── */

// NAV_LINKS — locked spec per SOCELLE-WEB CLAUDE.md §C. Update only via work order.
const NAV_LINKS = [
  { to: '/intelligence', label: 'Intelligence' },
  { to: '/brands', label: 'Brands' },
  { to: '/education', label: 'Education' },
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/professionals', label: 'For Buyers' },
  { to: '/for-brands', label: 'For Brands' },
  { to: '/plans', label: 'Pricing' },
] as const;

export default function MainNav() {
  const { user, profile, signOut, loading, effectiveRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile dialog on route change ── */
  useEffect(() => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [location.pathname]);

  /* ── Mobile dialog handlers ── */
  const openMobileMenu = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeMobileMenu = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  /* ── Auth ── */
  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const _displayName = profile?.spa_name || user?.email || '';

  const scrolledAttr = scrolled ? 'true' : 'false';

  return (
    <>
      {/* ── Fixed outer wrapper ── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-5 pt-3 sm:pt-4">
          <div className="flex justify-between items-start gap-3 max-w-6xl mx-auto">

            {/* ── Child 1: Logo pill ── */}
            <Link
              to="/"
              className="glass-nav-child flex items-center h-[48px] px-5 flex-shrink-0"
              data-scrolled={scrolledAttr}
            >
              <span className="nav-logo font-sans text-[17px] font-semibold text-graphite tracking-[0.12em] uppercase leading-none select-none">
                SOCELLE
              </span>
            </Link>

            {/* ── Child 2: Nav links pill (desktop only) ── */}
            <nav
              className="glass-nav-child hidden lg:flex items-center h-[48px] px-2 gap-0.5"
              data-scrolled={scrolledAttr}
            >
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    inline-flex items-center px-3.5 py-2 rounded-full
                    text-sm font-sans font-medium
                    transition-colors duration-150
                    ${isActive(to)
                      ? 'text-graphite bg-black/[0.05]'
                      : 'text-graphite/60 hover:text-graphite hover:bg-black/[0.03]'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Child 3: Actions pill ── */}
            <div
              className="glass-nav-child flex items-center h-[48px] px-3 flex-shrink-0"
              data-scrolled={scrolledAttr}
            >
              {/* Desktop: auth actions */}
              {!loading && !user && (
                <div className="hidden lg:flex items-center gap-1">
                  <Link
                    to="/portal/login"
                    className="inline-flex items-center text-sm font-sans font-medium text-graphite/60 hover:text-graphite transition-colors duration-150 px-3 py-2 rounded-full hover:bg-black/[0.03]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/request-access"
                    className="inline-flex items-center justify-center h-[36px] px-5 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full transition-all duration-200 hover:bg-mn-dark/90 hover:shadow-[0_4px_16px_rgba(31,36,40,0.25)] hover:-translate-y-[1px] active:translate-y-0"
                  >
                    Request Access
                  </Link>
                </div>
              )}

              {!loading && user && (
                <div className="hidden lg:flex items-center gap-2">
                  {/* Role-aware portal shortcut */}
                  {(effectiveRole === 'admin' || effectiveRole === 'platform_admin') && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center justify-center h-[36px] px-4 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full transition-all duration-200 hover:bg-mn-dark/90 hover:-translate-y-[1px]"
                    >
                      Admin →
                    </Link>
                  )}
                  {effectiveRole === 'business_user' && (
                    <Link
                      to="/portal/dashboard"
                      className="inline-flex items-center justify-center h-[36px] px-4 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full transition-all duration-200 hover:bg-mn-dark/90 hover:-translate-y-[1px]"
                    >
                      My Portal →
                    </Link>
                  )}
                  {effectiveRole === 'brand_admin' && (
                    <Link
                      to="/brand/dashboard"
                      className="inline-flex items-center justify-center h-[36px] px-4 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full transition-all duration-200 hover:bg-mn-dark/90 hover:-translate-y-[1px]"
                    >
                      Brand Portal →
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-graphite/50 hover:text-graphite transition-colors duration-150 px-2 py-1.5 rounded-full hover:bg-black/[0.04]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}

              {/* Mobile: hamburger button */}
              <button
                onClick={openMobileMenu}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-graphite/70 hover:text-graphite hover:bg-black/[0.04] transition-colors duration-150"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Spacer to offset fixed nav ── */}
      <div className="h-[72px] sm:h-[80px]" />

      {/* ── Mobile full-screen dialog ── */}
      <dialog
        ref={dialogRef}
        className="mobile-nav-dialog fixed inset-0 w-full h-full z-[60]"
        onCancel={closeMobileMenu}
      >
        <div className="flex flex-col h-full">

          {/* Dialog header */}
          <div className="flex items-center justify-between h-16 px-5 flex-shrink-0">
            <span className="font-sans text-[15px] font-semibold text-graphite tracking-[0.1em] uppercase select-none">
              SOCELLE
            </span>
            <button
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full text-graphite/60 hover:text-graphite hover:bg-black/[0.04] transition-colors"
              aria-label="Close menu"
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dialog nav links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                className={`
                  flex items-center h-12 px-5 rounded-full
                  text-[15px] font-sans font-medium
                  transition-colors duration-150
                  ${isActive(to)
                    ? 'text-graphite bg-black/[0.05]'
                    : 'text-graphite/60 hover:text-graphite hover:bg-black/[0.03]'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Dialog auth section */}
          <div className="flex-shrink-0 px-4 pb-8 pt-4 border-t border-black/[0.06]">
            {!loading && !user && (
              <div className="space-y-2.5">
                <Link
                  to="/portal/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center h-12 w-full rounded-full border border-black/10 text-[15px] font-sans font-medium text-graphite hover:bg-black/[0.03] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/request-access"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center h-12 w-full rounded-full bg-mn-dark text-mn-bg text-[15px] font-sans font-semibold transition-all hover:bg-mn-dark/90"
                >
                  Request Access
                </Link>
              </div>
            )}

            {!loading && user && (
              <div className="space-y-2.5">
                {/* Role-aware portal shortcut (mobile) */}
                {(effectiveRole === 'admin' || effectiveRole === 'platform_admin') && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center h-12 w-full rounded-full bg-mn-dark text-mn-bg text-[15px] font-sans font-semibold transition-all hover:bg-mn-dark/90"
                  >
                    Admin →
                  </Link>
                )}
                {effectiveRole === 'business_user' && (
                  <Link
                    to="/portal/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center h-12 w-full rounded-full bg-mn-dark text-mn-bg text-[15px] font-sans font-semibold transition-all hover:bg-mn-dark/90"
                  >
                    My Portal →
                  </Link>
                )}
                {effectiveRole === 'brand_admin' && (
                  <Link
                    to="/brand/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center h-12 w-full rounded-full bg-mn-dark text-mn-bg text-[15px] font-sans font-semibold transition-all hover:bg-mn-dark/90"
                  >
                    Brand Portal →
                  </Link>
                )}
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 h-12 w-full px-5 rounded-full text-[15px] font-sans font-medium text-graphite/60 hover:text-graphite hover:bg-black/[0.03] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </dialog>
    </>
  );
}
