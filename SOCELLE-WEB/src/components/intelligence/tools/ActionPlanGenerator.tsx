import { useState } from 'react';
import {
  X,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Bot,
  CreditCard,
  Target,
  Clock,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';

interface ActionPlanGeneratorProps {
  onClose: () => void;
}

const BUSINESS_CONTEXTS = ['Spa', 'Medspa', 'Salon', 'Clinic'] as const;
const TIMEFRAMES = ['30 days', '60 days', '90 days'] as const;

const DEMO_SIGNALS_LIST = [
  'Peptide Facial Demand Surge',
  'LED Light Therapy Adoption',
  'Retinol Alternative Interest',
  'Scalp Treatment Market Growth',
  'Clean Beauty Certification Demand',
];

interface ActionStep {
  title: string;
  description: string;
  expectedImpact: string;
  priority: 'High' | 'Medium' | 'Low';
}

const DEMO_ACTION_PLAN: ActionStep[] = [
  {
    title: 'Add Peptide Facial to Treatment Menu',
    description:
      'Source a professional-grade peptide serum line (top 3 brands ranked on SOCELLE). Train 2+ providers on the protocol. Price at $185-$225 for a 60-minute session based on market positioning data.',
    expectedImpact:
      'Capture early demand in a +34% growth category. Projected $3,200-$4,800/month incremental revenue based on 4-6 bookings/week.',
    priority: 'High',
  },
  {
    title: 'Launch Provider Certification Program',
    description:
      'Enroll lead esthetician in SOCELLE peptide protocol certification. Complete within 14 days. Use certification badge on booking profiles and marketing materials.',
    expectedImpact:
      'Certified providers see 18% higher booking rates on average. Builds consumer trust for a newer treatment modality.',
    priority: 'High',
  },
  {
    title: 'Create Social Media Education Content',
    description:
      'Produce 3 short-form videos (60-90 seconds) explaining peptide benefits for skin. Post across Instagram Reels and TikTok. Reference trending consumer search terms identified in signal data.',
    expectedImpact:
      'Peptide education content shows 2.1x higher engagement than category average. Expected reach: 5,000-15,000 views in first 30 days.',
    priority: 'Medium',
  },
  {
    title: 'Set Up Local Market Monitoring',
    description:
      'Enable SOCELLE Local Market View alerts for your zip code. Track competitor adoption of peptide services. Set weekly digest for the signal category.',
    expectedImpact:
      'Early awareness of competitive moves. Average 3-week lead time on competitor intelligence vs manual research.',
    priority: 'Medium',
  },
  {
    title: 'Plan Q2 LED Therapy Device Evaluation',
    description:
      'Schedule device demos from top 3 LED manufacturers on SOCELLE marketplace. Evaluate ROI based on treatment volume projections and device financing options.',
    expectedImpact:
      'LED therapy adds a complementary revenue stream. Devices typically achieve ROI within 4-6 months at 8+ treatments/week.',
    priority: 'Low',
  },
];

const priorityConfig = {
  High: { bg: 'bg-[#8E6464]/10', text: 'text-[#8E6464]', border: 'border-[#8E6464]/20' },
  Medium: { bg: 'bg-[#A97A4C]/10', text: 'text-[#A97A4C]', border: 'border-[#A97A4C]/20' },
  Low: { bg: 'bg-[#5F8A72]/10', text: 'text-[#5F8A72]', border: 'border-[#5F8A72]/20' },
};

export function ActionPlanGenerator({ onClose }: ActionPlanGeneratorProps) {
  const [selectedSignal, setSelectedSignal] = useState('');
  const [businessContext, setBusinessContext] = useState<(typeof BUSINESS_CONTEXTS)[number]>('Spa');
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('30 days');
  const [generated, setGenerated] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const handleGenerate = () => {
    if (selectedSignal) {
      setGenerated(true);
    }
  };

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
              <ClipboardList className="w-4 h-4 text-[#6E879B]" />
            </div>
            <div>
              <h2 className="font-sans text-base font-semibold text-[#141418]">
                Action Plan Generator
              </h2>
              <p className="text-xs font-sans text-gray-400">
                Turn signals into actionable business plans
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
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
            <span>25 credits</span>
          </div>

          {!generated ? (
            <>
              {/* Signal selection */}
              <div>
                <label className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Select a Signal
                </label>
                <select
                  value={selectedSignal}
                  onChange={(e) => setSelectedSignal(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-sans rounded-xl border border-[#6E879B]/20 bg-[#F6F3EF] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
                >
                  <option value="">Choose a signal...</option>
                  {DEMO_SIGNALS_LIST.map((sig) => (
                    <option key={sig} value={sig}>
                      {sig}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business context */}
              <div>
                <label className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Business Context
                </label>
                <div className="flex gap-2">
                  {BUSINESS_CONTEXTS.map((ctx) => (
                    <button
                      key={ctx}
                      type="button"
                      onClick={() => setBusinessContext(ctx)}
                      className={`px-4 py-2 rounded-xl text-sm font-sans font-medium transition-colors ${
                        businessContext === ctx
                          ? 'bg-[#141418] text-white'
                          : 'bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1]'
                      }`}
                    >
                      {ctx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <label className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Timeframe
                </label>
                <div className="flex gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`px-4 py-2 rounded-xl text-sm font-sans font-medium transition-colors ${
                        timeframe === tf
                          ? 'bg-[#141418] text-white'
                          : 'bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1]'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!selectedSignal}
                className="w-full py-3 rounded-xl bg-[#6E879B] text-white font-sans font-medium text-sm hover:bg-[#5A7185] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Action Plan (25 credits)
              </button>
            </>
          ) : (
            <>
              {/* Context bar */}
              <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#F6F3EF] border border-[#6E879B]/10">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-[#6E879B]" />
                  <span className="text-xs font-sans font-medium text-[#141418]">
                    {selectedSignal}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-sans text-gray-500">
                  {businessContext}
                </span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-sans text-gray-500">
                    {timeframe}
                  </span>
                </div>
              </div>

              {/* Action steps */}
              <div className="space-y-4">
                {DEMO_ACTION_PLAN.map((step, idx) => {
                  const pc = priorityConfig[step.priority];
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border ${pc.border} p-5`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#141418] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-sans font-bold text-white">
                              {idx + 1}
                            </span>
                          </div>
                          <p className="text-sm font-sans font-semibold text-[#141418]">
                            {step.title}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${pc.bg} ${pc.text} px-2 py-0.5 rounded-full flex-shrink-0`}
                        >
                          {step.priority}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-gray-500 leading-relaxed mb-3 ml-10">
                        {step.description}
                      </p>
                      <div className="ml-10 flex items-start gap-2 px-3 py-2 rounded-lg bg-[#5F8A72]/5 border border-[#5F8A72]/10">
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#5F8A72] flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-sans text-[#5F8A72]">
                          {step.expectedImpact}
                        </p>
                      </div>
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
                      Action plan was generated using signal data and the
                      following inputs:
                    </p>
                    {[
                      'SOCELLE market_signals — signal magnitude, direction, confidence',
                      'Historical adoption curve — 18-month treatment revenue data',
                      'SOCELLE provider analytics — certification and booking correlations',
                      'Competitive intelligence — local market operator analysis',
                      `Business context: ${businessContext} | Timeframe: ${timeframe}`,
                    ].map((source, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs font-sans text-gray-500"
                      >
                        <span className="text-[#6E879B] font-semibold flex-shrink-0">
                          [{i + 1}]
                        </span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#A97A4C]/5 border border-[#A97A4C]/10">
                <AlertTriangle className="w-4 h-4 text-[#A97A4C] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-sans text-[#A97A4C]">
                  Revenue projections are estimates based on market averages.
                  Actual results depend on location, pricing, and execution.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGenerated(false)}
                className="text-sm font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors"
              >
                &larr; Generate another plan
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
