import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Professionals', href: '/professionals' },
  { label: 'Brands', href: '/brands' },
  { label: 'Events', href: '/events' },
  { label: 'Jobs', href: '/jobs' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      {/* Floating liquid glass bar */}
      <div
        className="rounded-2xl mx-auto max-w-6xl"
        style={{
          background: 'rgba(31, 36, 40, 0.35)',
          backdropFilter: 'blur(40px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="px-5 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[#F7F5F2] text-lg tracking-[0.15em] uppercase" style={{ fontWeight: 600 }}>
                Socelle
              </span>
              <span
                className="hidden sm:inline text-[10px] tracking-[0.3em] uppercase px-2 py-0.5 rounded-full"
                style={{
                  color: '#3F5465',
                  border: '1px solid rgba(63, 84, 101, 0.3)',
                  background: 'rgba(63, 84, 101, 0.1)',
                }}
              >
                Beta
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-4 py-2 text-sm transition-all rounded-xl"
                  style={
                    location.pathname === link.href
                      ? {
                          color: '#F7F5F2',
                          background: 'rgba(255, 255, 255, 0.1)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                        }
                      : { color: 'rgba(247, 245, 242, 0.6)' }
                  }
                  onMouseEnter={(e) => {
                    if (location.pathname !== link.href) {
                      e.currentTarget.style.color = '#F7F5F2';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== link.href) {
                      e.currentTarget.style.color = 'rgba(247, 245, 242, 0.6)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-2">
              <a href="#" className="text-[#F7F5F2]/60 hover:text-[#F7F5F2] text-sm transition-colors px-3 py-2">
                Sign In
              </a>
              <a href="#" className="btn-liquid-glass btn-liquid-sm">
                Join Waitlist
              </a>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setOpen(!open)} className="lg:hidden text-[#F7F5F2] p-2">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="lg:hidden mt-2 mx-auto max-w-6xl rounded-2xl"
          style={{
            background: 'rgba(31, 36, 40, 0.5)',
            backdropFilter: 'blur(40px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm transition-colors"
                style={
                  location.pathname === link.href
                    ? { color: '#F7F5F2', background: 'rgba(255, 255, 255, 0.08)' }
                    : { color: 'rgba(247, 245, 242, 0.6)' }
                }
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-4 flex gap-3">
              <a href="#" className="text-[#F7F5F2]/60 text-sm px-4 py-3">Sign In</a>
              <a href="#" className="btn-liquid-glass btn-liquid-sm flex-1 text-center">Join Waitlist</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}