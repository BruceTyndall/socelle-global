import { Link } from 'react-router';
import { EmailCapture } from '../modules/EmailCapture';

export function Footer() {
  return (
    <footer className="bg-[#15191D] border-t border-[#F7F5F2]/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter capture — last chance conversion */}
        <div className="border-b border-[#F7F5F2]/10 pb-12 mb-12">
          <div className="max-w-lg">
            <span className="eyebrow text-[#F7F5F2]/40 mb-3 block">Stay Current</span>
            <h3 className="text-[#F7F5F2] text-xl lg:text-2xl mb-2">The Weekly Intelligence Brief</h3>
            <p className="text-[#F7F5F2]/40 text-sm mb-6">
              Market signals, brand launches, and practitioner insights — one email, every Friday.
            </p>
            <EmailCapture
              dark
              compact
              placeholder="Your professional email"
              buttonLabel="Subscribe"
              showTrust={false}
              showSocialProof={false}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <span className="text-[#F7F5F2] text-lg tracking-[0.15em] uppercase block mb-4" style={{ fontWeight: 600 }}>
              Socelle
            </span>
            <p className="text-[#F7F5F2]/40 text-sm max-w-xs">
              The intelligence network for independent brands and the practitioners who define aesthetics.
            </p>
          </div>

          <div>
            <h4 className="eyebrow text-[#F7F5F2]/40 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/intelligence" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">Intelligence</Link></li>
              <li><Link to="/professionals" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">For Professionals</Link></li>
              <li><Link to="/brands" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">For Brands</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-[#F7F5F2]/40 mb-4">Community</h4>
            <ul className="space-y-2.5">
              <li><Link to="/events" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">Events</Link></li>
              <li><Link to="/jobs" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">Careers</Link></li>
              <li><a href="#" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">Education</a></li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-[#F7F5F2]/40 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">Privacy</a></li>
              <li><a href="#" className="text-[#F7F5F2]/50 hover:text-[#F7F5F2] text-sm transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#F7F5F2]/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#F7F5F2]/30 text-xs">
            &copy; 2026 Socelle Global. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A72] animate-pulse" />
            <span className="text-[#5F8A72] text-[10px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              All Systems Nominal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}