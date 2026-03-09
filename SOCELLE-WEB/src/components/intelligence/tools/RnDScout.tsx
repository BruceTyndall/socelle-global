import { useState } from 'react';
import {
  X,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Bot,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface RnDScoutProps {
  onClose: () => void;
  userTier?: 'free' | 'starter' | 'pro' | 'enterprise';
}

interface DemoResearchResult {
  safetyProfile: {
    rating: string;
    ewgScore: number;
    summary: string;
  };
  regulatoryStatus: {
    fdaStatus: string;
    euStatus: string;
    mocraNotes: string;
  };
  marketAdoption: number;
  competingProducts: Array<{ name: string; brand: string; concentration: string }>;
  recentStudies: Array<{ title: string; journal: string; year: number; finding: string }>;
}

const DEMO_RESULT: DemoResearchResult = {
  safetyProfile: {
    rating: 'Generally Recognized as Safe',
    ewgScore: 1,
    summary:
      'Bakuchiol has a strong safety profile with no known photosensitivity, irritation, or toxicity concerns at concentrations up to 2%. Suitable for sensitive skin and pregnancy-safe, making it a viable retinol alternative for a broader client base.',
  },
  regulatoryStatus: {
    fdaStatus: 'No restrictions — classified as a cosmetic ingredient under FDA guidelines.',
    euStatus: 'Approved for cosmetic use in the EU. Listed in the CosIng database without restrictions.',
    mocraNotes:
      'Under MoCRA (Modernization of Cosmetics Regulation Act of 2022), products containing bakuchiol require standard cosmetic facility registration and product listing. No special safety substantiation is mandated beyond standard requirements.',
  },
  marketAdoption: 67,
  competingProducts: [
    { name: 'Bakuchiol Retinol Alternative Serum', brand: 'Herbivore Botanicals', concentration: '1.3%' },
    { name: 'A-Passioni Retinol Cream', brand: 'Drunk Elephant', concentration: 'Retinol + Bakuchiol blend' },
    { name: 'Bakuchiol Peptides Serum', brand: 'The Inkey List', concentration: '1%' },
    { name: 'Phyto-Retinol Complex', brand: 'Biossance', concentration: '0.5% + squalane' },
  ],
  recentStudies: [
    {
      title: 'Bakuchiol as a Functional Retinol Analogue',
      journal: 'British Journal of Dermatology',
      year: 2025,
      finding:
        'Bakuchiol showed comparable anti-aging efficacy to 0.5% retinol over 12 weeks with significantly fewer adverse effects.',
    },
    {
      title: 'Consumer Perception of Plant-Based Retinol Alternatives',
      journal: 'Journal of Cosmetic Dermatology',
      year: 2025,
      finding:
        '72% of consumers surveyed preferred plant-based alternatives when informed of equivalent efficacy.',
    },
    {
      title: 'Stability and Formulation of Bakuchiol in Professional Skincare',
      journal: 'International Journal of Cosmetic Science',
      year: 2024,
      finding:
        'Bakuchiol demonstrated superior photostability compared to retinol, enabling daytime use in professional protocols.',
    },
  ],
};

export function RnDScout({ onClose, userTier = 'pro' }: RnDScoutProps) {
  const [ingredient, setIngredient] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const isTierGated = userTier === 'free' || userTier === 'starter';

  const handleSearch = () => {
    if (ingredient.trim() && !isTierGated) {
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (isTierGated) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={onClose}
          role="presentation"
        />
        <div className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#6E879B]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8EDF1] flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-[#6E879B]" />
              </div>
              <h2 className="font-sans text-base font-semibold text-[#141418]">
                R&D Scout
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#F6F3EF] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="px-6 py-10 text-center">
            <Lock className="w-10 h-10 mx-auto mb-4 text-[#A97A4C]" />
            <h3 className="font-sans text-lg font-semibold text-[#141418] mb-2">
              Pro+ Required
            </h3>
            <p className="text-sm font-sans text-gray-500 mb-6 max-w-xs mx-auto">
              R&D Scout is available on Pro ($149/mo) and Enterprise ($499/mo)
              plans. Upgrade to access ingredient research, safety profiles, and
              regulatory intelligence.
            </p>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-[#6E879B] text-white font-sans font-medium text-sm hover:bg-[#5A7185] transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6E879B]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8EDF1] flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-[#6E879B]" />
            </div>
            <div>
              <h2 className="font-sans text-base font-semibold text-[#141418]">
                R&D Scout
              </h2>
              <p className="text-xs font-sans text-gray-400">
                Ingredient & technology research
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
            </span>
            <span className="text-[10px] font-semibold bg-[#5F8A72]/10 text-[#5F8A72] px-2 py-0.5 rounded-full">
              PRO+
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#F6F3EF] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-[#6E879B]/10">
          <div className="flex items-center gap-2 text-xs font-sans text-gray-400 mb-3">
            <Bot className="w-3.5 h-3.5" />
            <span>Generated by AI</span>
            <span className="mx-1">|</span>
            <CreditCard className="w-3.5 h-3.5" />
            <span>10 credits</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter an ingredient name (e.g., bakuchiol, niacinamide)..."
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 text-sm font-sans rounded-xl border border-[#6E879B]/20 bg-[#F6F3EF] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={!ingredient.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#141418] text-white text-sm font-sans font-medium hover:bg-[#141418]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Research
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {!hasSearched ? (
            <div className="text-center py-16">
              <FlaskConical className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-sans font-medium text-gray-500">
                Enter an ingredient to research
              </p>
              <p className="text-xs font-sans text-gray-400 mt-1">
                Get safety profiles, regulatory status, and market intelligence
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-sans font-bold text-[#141418]">
                Research: {ingredient}
              </h3>

              {/* Safety Profile */}
              <div className="rounded-xl border border-[#6E879B]/10 p-5">
                <h4 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Safety Profile
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-[#5F8A72]" />
                  <span className="text-sm font-sans font-semibold text-[#5F8A72]">
                    {DEMO_RESULT.safetyProfile.rating}
                  </span>
                  <span className="text-[10px] font-semibold bg-[#5F8A72]/10 text-[#5F8A72] px-2 py-0.5 rounded-full">
                    EWG Score: {DEMO_RESULT.safetyProfile.ewgScore}
                  </span>
                </div>
                <p className="text-xs font-sans text-gray-500 leading-relaxed">
                  {DEMO_RESULT.safetyProfile.summary}
                </p>
              </div>

              {/* Regulatory Status */}
              <div className="rounded-xl border border-[#6E879B]/10 p-5">
                <h4 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Regulatory Status
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      FDA (US)
                    </p>
                    <p className="text-xs font-sans text-gray-500">
                      {DEMO_RESULT.regulatoryStatus.fdaStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      EU
                    </p>
                    <p className="text-xs font-sans text-gray-500">
                      {DEMO_RESULT.regulatoryStatus.euStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      MoCRA Notes
                    </p>
                    <p className="text-xs font-sans text-gray-500">
                      {DEMO_RESULT.regulatoryStatus.mocraNotes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Adoption */}
              <div className="rounded-xl border border-[#6E879B]/10 p-5">
                <h4 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Market Adoption
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6E879B] rounded-full"
                        style={{ width: `${DEMO_RESULT.marketAdoption}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-sans font-bold text-[#141418]">
                    {DEMO_RESULT.marketAdoption}%
                  </span>
                </div>
                <p className="text-xs font-sans text-gray-400 mt-2">
                  Percentage of professional beauty brands with at least one product containing this ingredient
                </p>
              </div>

              {/* Competing Products */}
              <div className="rounded-xl border border-[#6E879B]/10 p-5">
                <h4 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Competing Products
                </h4>
                <div className="space-y-2">
                  {DEMO_RESULT.competingProducts.map((prod, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-[#6E879B]/5 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-sans font-medium text-[#141418]">
                          {prod.name}
                        </p>
                        <p className="text-xs font-sans text-gray-400">
                          {prod.brand}
                        </p>
                      </div>
                      <span className="text-xs font-sans font-medium text-[#6E879B] bg-[#E8EDF1] px-2 py-0.5 rounded-full">
                        {prod.concentration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Studies */}
              <div className="rounded-xl border border-[#6E879B]/10 p-5">
                <h4 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Recent Studies
                </h4>
                <div className="space-y-4">
                  {DEMO_RESULT.recentStudies.map((study, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-sans font-medium text-[#141418] mb-1">
                        {study.title}
                      </p>
                      <p className="text-[10px] font-sans text-gray-400 mb-1">
                        {study.journal} ({study.year})
                      </p>
                      <p className="text-xs font-sans text-gray-500 leading-relaxed">
                        {study.finding}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence & Logic */}
              <div className="border border-[#6E879B]/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowEvidence(!showEvidence)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F6F3EF] transition-colors"
                >
                  <span className="text-xs font-sans font-semibold text-[#6E879B] uppercase tracking-wider">
                    Evidence & Logic
                  </span>
                  {showEvidence ? (
                    <ChevronUp className="w-4 h-4 text-[#6E879B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6E879B]" />
                  )}
                </button>
                {showEvidence && (
                  <div className="px-4 pb-4 space-y-2 border-t border-[#6E879B]/10 pt-3">
                    <p className="text-xs font-sans text-gray-400 mb-2">
                      Research compiled from the following sources:
                    </p>
                    {[
                      'Open Beauty Facts — ingredient database and product listings',
                      'EWG Skin Deep — safety and toxicity scoring',
                      'PubMed / NIH — peer-reviewed dermatology journals',
                      'FDA cosmetic ingredient database — regulatory status',
                      'EU CosIng database — European regulatory data',
                    ].map((source, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs font-sans text-gray-500"
                      >
                        <span className="text-[#6E879B] font-semibold flex-shrink-0">
                          [{idx + 1}]
                        </span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#6E879B]/10 bg-[#F6F3EF] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans text-gray-400">
            <Bot className="w-3.5 h-3.5" />
            <span>Generated by AI — results may not be fully accurate</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#141418] text-white text-sm font-sans font-medium hover:bg-[#141418]/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
