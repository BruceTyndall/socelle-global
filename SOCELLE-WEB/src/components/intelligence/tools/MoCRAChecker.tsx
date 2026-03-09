import { useState } from 'react';
import {
  X,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Bot,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
  ClipboardCheck,
  FileWarning,
} from 'lucide-react';

interface MoCRACheckerProps {
  onClose: () => void;
  userTier?: 'free' | 'starter' | 'pro' | 'enterprise';
}

interface ComplianceItem {
  label: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

const DEMO_COMPLIANCE: ComplianceItem[] = [
  {
    label: 'Facility Registration',
    status: 'pass',
    detail:
      'MoCRA requires all cosmetic manufacturing and processing facilities to register with the FDA. Ensure your facility registration is current and renewed biennially.',
  },
  {
    label: 'Product Listing',
    status: 'warning',
    detail:
      'Each cosmetic product must be listed with the FDA, including all ingredients. Verify that the product listing matches the current formulation — ingredient list changes require an updated listing.',
  },
  {
    label: 'Ingredient Safety Substantiation',
    status: 'pass',
    detail:
      'All listed ingredients (niacinamide, hyaluronic acid, vitamin C, peptide complex) have established safety records. No ingredients on the FDA restricted or prohibited list.',
  },
  {
    label: 'Labeling Requirements',
    status: 'warning',
    detail:
      'MoCRA mandates specific labeling including: full ingredient list (INCI names), net quantity, manufacturer/distributor contact info, and any required warnings. Ensure "peptide complex" is expanded to list specific peptide ingredients on the label.',
  },
  {
    label: 'Adverse Event Reporting',
    status: 'pass',
    detail:
      'Responsible persons must report serious adverse events to the FDA within 15 business days. Ensure your adverse event reporting process is documented and staff are trained.',
  },
  {
    label: 'Good Manufacturing Practices (GMP)',
    status: 'pass',
    detail:
      'MoCRA requires compliance with GMP standards. Current manufacturing processes should align with FDA GMP guidelines for cosmetics.',
  },
  {
    label: 'Fragrance Allergen Disclosure',
    status: 'fail',
    detail:
      'MoCRA may require disclosure of fragrance allergens above threshold concentrations. The listed "fragrance" ingredient needs to be evaluated for allergen disclosure requirements under forthcoming FDA rulemaking.',
  },
];

const DEMO_OVERALL = {
  score: 78,
  fdaRegistrationStatus: 'Registration Required — Biennially Renewable',
  mocraSummary:
    'The Peptide Renewal Serum is largely compliant with MoCRA requirements. Two items need attention: the peptide complex ingredient listing should be expanded for labeling precision, and fragrance allergen disclosure requirements should be reviewed ahead of final FDA rulemaking.',
};

const statusConfig = {
  pass: { icon: CheckCircle, color: 'text-[#5F8A72]', bg: 'bg-[#5F8A72]/10', label: 'PASS' },
  warning: { icon: AlertTriangle, color: 'text-[#A97A4C]', bg: 'bg-[#A97A4C]/10', label: 'REVIEW' },
  fail: { icon: XCircle, color: 'text-[#8E6464]', bg: 'bg-[#8E6464]/10', label: 'ACTION NEEDED' },
};

export function MoCRAChecker({ onClose, userTier = 'enterprise' }: MoCRACheckerProps) {
  const [productName, setProductName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const isTierGated = userTier !== 'enterprise';

  const handleCheck = () => {
    if (productName.trim() && ingredients.trim() && !isTierGated) {
      setHasChecked(true);
    }
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
                <ShieldCheck className="w-4 h-4 text-[#6E879B]" />
              </div>
              <h2 className="font-sans text-base font-semibold text-[#141418]">
                MoCRA Checker
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
              Enterprise Only
            </h3>
            <p className="text-sm font-sans text-gray-500 mb-6 max-w-xs mx-auto">
              MoCRA Compliance Checker is available exclusively on the
              Enterprise plan ($499/mo). Get regulatory intelligence, compliance
              reports, and FDA registration guidance.
            </p>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-[#6E879B] text-white font-sans font-medium text-sm hover:bg-[#5A7185] transition-colors"
            >
              Upgrade to Enterprise
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
              <ShieldCheck className="w-4 h-4 text-[#6E879B]" />
            </div>
            <div>
              <h2 className="font-sans text-base font-semibold text-[#141418]">
                MoCRA Compliance Checker
              </h2>
              <p className="text-xs font-sans text-gray-400">
                Cosmetic product regulatory assessment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
            </span>
            <span className="text-[10px] font-semibold bg-[#141418]/10 text-[#141418] px-2 py-0.5 rounded-full">
              ENTERPRISE
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* AI badge */}
          <div className="flex items-center gap-2 text-xs font-sans text-gray-400">
            <Bot className="w-3.5 h-3.5" />
            <span>Generated by AI</span>
            <span className="mx-1">|</span>
            <CreditCard className="w-3.5 h-3.5" />
            <span>15 credits</span>
          </div>

          {!hasChecked ? (
            <>
              {/* Product name */}
              <div>
                <label className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Peptide Renewal Serum"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-sans rounded-xl border border-[#6E879B]/20 bg-[#F6F3EF] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
                />
              </div>

              {/* Ingredient list */}
              <div>
                <label className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Ingredient List
                </label>
                <textarea
                  placeholder="Enter ingredients, separated by commas (e.g., niacinamide, hyaluronic acid, vitamin C, peptide complex, fragrance)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm font-sans rounded-xl border border-[#6E879B]/20 bg-[#F6F3EF] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 resize-none"
                />
              </div>

              {/* Check button */}
              <button
                type="button"
                onClick={handleCheck}
                disabled={!productName.trim() || !ingredients.trim()}
                className="w-full py-3 rounded-xl bg-[#6E879B] text-white font-sans font-medium text-sm hover:bg-[#5A7185] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Run Compliance Check (15 credits)
              </button>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#A97A4C]/5 border border-[#A97A4C]/10">
                <AlertTriangle className="w-4 h-4 text-[#A97A4C] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-sans text-[#A97A4C]">
                  This tool provides informational guidance only and does not
                  constitute legal or regulatory advice. Always consult a
                  regulatory affairs professional for official compliance
                  determinations.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Overall score */}
              <div className="rounded-xl border border-[#6E879B]/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Compliance Score
                    </p>
                    <p className="text-3xl font-sans font-bold text-[#141418]">
                      {DEMO_OVERALL.score}
                      <span className="text-lg text-gray-400">/100</span>
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#A97A4C] flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-[#A97A4C]" />
                  </div>
                </div>
                <p className="text-sm font-sans font-medium text-[#141418] mb-1">
                  {productName || 'Peptide Renewal Serum'}
                </p>
                <p className="text-xs font-sans text-gray-500 leading-relaxed">
                  {DEMO_OVERALL.mocraSummary}
                </p>
              </div>

              {/* FDA Registration */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8EDF1] border border-[#6E879B]/10">
                <FileWarning className="w-4 h-4 text-[#6E879B]" />
                <div>
                  <p className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider">
                    FDA Registration Status
                  </p>
                  <p className="text-sm font-sans font-medium text-[#141418]">
                    {DEMO_OVERALL.fdaRegistrationStatus}
                  </p>
                </div>
              </div>

              {/* Compliance items */}
              <div className="space-y-3">
                {DEMO_COMPLIANCE.map((item, idx) => {
                  const sc = statusConfig[item.status];
                  const StatusIcon = sc.icon;
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border border-[#6E879B]/10 p-4`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-3">
                          <StatusIcon className={`w-5 h-5 ${sc.color} flex-shrink-0 mt-0.5`} />
                          <p className="text-sm font-sans font-semibold text-[#141418]">
                            {item.label}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${sc.bg} ${sc.color} px-2 py-0.5 rounded-full flex-shrink-0`}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-gray-500 leading-relaxed ml-8">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
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
                      Compliance assessment references the following regulatory
                      sources:
                    </p>
                    {[
                      'MoCRA (Modernization of Cosmetics Regulation Act of 2022) — Public Law 117-328',
                      'FDA Cosmetic Facility Registration and Product Listing (21 CFR Part 710/720)',
                      'FDA Voluntary Cosmetic Registration Program (VCRP) transition guidance',
                      'EU Cosmetics Regulation (EC) No 1223/2009 — cross-reference',
                      'PCPC (Personal Care Products Council) — MoCRA implementation guidance',
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

              {/* Legal disclaimer */}
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#A97A4C]/5 border border-[#A97A4C]/10">
                <AlertTriangle className="w-4 h-4 text-[#A97A4C] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-sans text-[#A97A4C]">
                  This is an AI-generated compliance overview for informational
                  purposes only. It does not constitute legal or regulatory
                  advice. Consult a qualified regulatory affairs professional for
                  official compliance determinations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHasChecked(false)}
                className="text-sm font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors"
              >
                &larr; Check another product
              </button>
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
