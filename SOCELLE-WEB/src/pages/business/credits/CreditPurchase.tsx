import {
  ArrowLeft,
  AlertCircle,
  Coins,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── V2-HUBS-12: Credit Economy — Credit Purchase (Top-Up) ────────────────
// DEMO surface — Stripe not wired for credit purchases yet.

interface CreditPack {
  id: string;
  credits: number;
  price: number;
  perCredit: string;
  popular: boolean;
}

const CREDIT_PACKS: CreditPack[] = [
  { id: 'pack-100', credits: 100, price: 10, perCredit: '$0.10', popular: false },
  { id: 'pack-500', credits: 500, price: 40, perCredit: '$0.08', popular: true },
  { id: 'pack-1000', credits: 1000, price: 70, perCredit: '$0.07', popular: false },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function CreditPurchase() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/portal/credits"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Credit Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-sans font-semibold text-graphite">Buy Credits</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        </div>
        <p className="text-graphite/60 font-sans mt-1">
          Top up your credit balance for additional AI tool usage beyond your tier allocation.
        </p>
      </div>

      {/* Credit Packs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`relative bg-white rounded-2xl border p-6 flex flex-col items-center text-center space-y-4 ${
              pack.popular ? 'border-accent shadow-sm' : 'border-graphite/8'
            }`}
          >
            {pack.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-accent text-white text-xs font-sans font-semibold rounded-full">
                <Sparkles className="w-3 h-3" />
                Best Value
              </span>
            )}
            <Coins className={`w-8 h-8 ${pack.popular ? 'text-accent' : 'text-graphite/30'}`} />
            <div>
              <p className="text-3xl font-sans font-semibold text-graphite">
                {new Intl.NumberFormat('en-US').format(pack.credits)}
              </p>
              <p className="text-sm text-graphite/50 font-sans">credits</p>
            </div>
            <p className="text-2xl font-sans font-semibold text-graphite">{formatCurrency(pack.price)}</p>
            <p className="text-xs text-graphite/40 font-sans">{pack.perCredit} per credit</p>
            <button
              disabled
              className="w-full inline-flex items-center justify-center gap-2 h-10 px-5 bg-graphite/20 text-graphite/40 text-sm font-sans font-semibold rounded-full cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Buy — DEMO
            </button>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="bg-accent-soft rounded-xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-sans font-semibold text-graphite">
              Credit purchases are not yet available
            </p>
            <p className="text-sm text-graphite/60 font-sans">
              Stripe integration for credit top-ups is in development. Credits are currently allocated
              based on your subscription tier. Upgrade your plan for a higher monthly credit allocation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
