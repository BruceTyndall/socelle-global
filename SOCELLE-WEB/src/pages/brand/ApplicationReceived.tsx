import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Mail } from 'lucide-react';

export default function ApplicationReceived() {
  return (
    <div className="min-h-screen bg-pro-ivory flex flex-col">
      {/* Header */}
      <header className="border-b border-pro-stone bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="font-serif text-xl text-pro-navy">
            socelle<span className="text-pro-gold">.</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>

          <div>
            <h1 className="text-3xl font-serif text-pro-navy mb-3">
              Application received<span className="text-pro-gold">.</span>
            </h1>
            <p className="text-pro-warm-gray font-sans text-sm leading-relaxed">
              Thanks for applying to Socelle. Our team reviews every application carefully to ensure the best fit for our reseller community.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-pro-stone p-6 text-left space-y-4">
            <h2 className="text-sm font-semibold text-pro-charcoal font-sans uppercase tracking-wide">What happens next</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pro-cream flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-pro-navy font-sans">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-pro-charcoal font-sans">Review (1–2 business days)</p>
                  <p className="text-xs text-pro-warm-gray font-sans mt-0.5">Our team reviews your brand, website, and product portfolio.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pro-cream flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-pro-navy" />
                </div>
                <div>
                  <p className="text-sm font-medium text-pro-charcoal font-sans">Approval notification</p>
                  <p className="text-xs text-pro-warm-gray font-sans mt-0.5">You'll receive an email to sign in and complete your brand setup.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pro-cream flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-pro-navy font-sans">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-pro-charcoal font-sans">Setup & launch</p>
                  <p className="text-xs text-pro-warm-gray font-sans mt-0.5">Add your products, set pricing tiers, and go live to thousands of resellers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 font-sans">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Review typically takes <strong>1–2 business days</strong>. Check your inbox for updates.</span>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/brand/login"
              className="block w-full px-6 py-3 bg-pro-navy text-white rounded-lg font-medium font-sans text-sm hover:bg-pro-charcoal transition-colors text-center"
            >
              Sign in to your account
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-white border border-pro-stone text-pro-charcoal rounded-lg font-medium font-sans text-sm hover:bg-pro-cream transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
