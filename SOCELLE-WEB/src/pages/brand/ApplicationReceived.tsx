import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Mail } from 'lucide-react';

export default function ApplicationReceived() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-accent-soft bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="font-sans text-xl text-graphite">
            socelle<span className="text-accent">.</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>

          <div>
            <h1 className="text-3xl font-sans text-graphite mb-3">
              Application received<span className="text-accent">.</span>
            </h1>
            <p className="text-graphite/60 font-sans text-sm leading-relaxed">
              Thanks for applying to Socelle. Our team reviews every application carefully to ensure the best fit for our reseller community.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-accent-soft p-6 text-left space-y-4">
            <h2 className="text-sm font-semibold text-graphite font-sans uppercase tracking-wide">What happens next</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-graphite font-sans">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-graphite font-sans">Review (1–2 business days)</p>
                  <p className="text-xs text-graphite/60 font-sans mt-0.5">Our team reviews your brand, website, and product portfolio.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-graphite" />
                </div>
                <div>
                  <p className="text-sm font-medium text-graphite font-sans">Approval notification</p>
                  <p className="text-xs text-graphite/60 font-sans mt-0.5">You'll receive an email to sign in and complete your brand setup.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-graphite font-sans">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-graphite font-sans">Setup & launch</p>
                  <p className="text-xs text-graphite/60 font-sans mt-0.5">Add your products, set pricing tiers, and go live to thousands of resellers.</p>
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
              className="block w-full px-6 py-3 bg-graphite text-white rounded-lg font-medium font-sans text-sm hover:bg-graphite transition-colors text-center"
            >
              Sign in to your account
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-white border border-accent-soft text-graphite rounded-lg font-medium font-sans text-sm hover:bg-accent-soft transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
