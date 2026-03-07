import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Platform: [
    { to: '/intelligence', label: 'Intelligence Hub' },
    { to: '/protocols', label: 'Protocols' },
    { to: '/brands', label: 'Marketplace' },
    { to: '/education', label: 'Education' },
  ],
  Solutions: [
    { to: '/for-buyers', label: 'For Buyers' },
    { to: '/for-brands', label: 'For Brands' },
    { to: '/for-medspas', label: 'For Medspas' },
    { to: '/for-salons', label: 'For Salons' },
  ],
  Company: [
    { to: '/about', label: 'About' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/plans', label: 'Pricing' },
    { to: '/faq', label: 'FAQ' },
  ],
  Developers: [
    { to: '/api/docs', label: 'API Docs' },
    { to: '/api/pricing', label: 'API Pricing' },
    { to: '/request-access', label: 'Request Access' },
  ],
};

export default function SiteFooter() {
  return (
    <footer className="bg-mn-footer rounded-t-section mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        {/* Top: brand + link columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-mn-bg font-sans text-lg font-semibold tracking-[0.12em] uppercase">
              Socelle
            </span>
            <p className="mt-3 text-sm text-mn-bg/55 leading-relaxed max-w-[200px]">
              The intelligence platform for professional beauty.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-mn-bg/40 font-sans text-xs font-medium tracking-[0.08em] uppercase mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-mn-bg/65 text-sm hover:text-mn-bg transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-mn-bg/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-mn-bg/[0.35] text-xs">
            {new Date().getFullYear()} Socelle. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-mn-bg/[0.35] text-xs hover:text-mn-bg/[0.6] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-mn-bg/[0.35] text-xs hover:text-mn-bg/[0.6] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
