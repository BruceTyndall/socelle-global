import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Sparkles,
  FileDown,
  Save,
  Users,
  MapPin,
  Crown,
  ShoppingBag,
  RefreshCw,
  Rocket,
  TrendingUp,
  AlertCircle,
  Loader2,
  Paintbrush,
  BookOpen,
  Monitor,
  Stethoscope,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/Toast';
import { useCampaigns } from '../../lib/campaigns/useCampaigns';
import type { CampaignStatus, OperatorTier } from '../../lib/campaigns/types';

const STEPS = [
  { id: 1, label: 'Campaign Setup' },
  { id: 2, label: 'Channel Recommendations' },
  { id: 3, label: 'Timeline' },
  { id: 4, label: 'Review & Launch' },
];

const SEGMENT_OPTIONS = [
  { id: 'by_type', label: 'By Business Type', icon: Users, description: 'Medspas, salons, clinics' },
  { id: 'by_region', label: 'By Region', icon: MapPin, description: 'Geographic targeting' },
  { id: 'by_tier', label: 'By Operator Tier', icon: Crown, description: 'Active, Elite, Master' },
  { id: 'by_purchase', label: 'By Purchase History', icon: ShoppingBag, description: 'Order frequency and AOV' },
];

const OBJECTIVE_OPTIONS = [
  { id: 'drive_reorders', label: 'Drive Reorders', icon: RefreshCw },
  { id: 'launch_product', label: 'Launch New Product', icon: Rocket },
  { id: 'increase_aov', label: 'Increase AOV', icon: TrendingUp },
  { id: 'activate_dormant', label: 'Activate Dormant Operators', icon: AlertCircle },
];

interface ChannelRec {
  title: string;
  icon: typeof Stethoscope;
  content: string;
}

const MOCK_CHANNEL_RECOMMENDATIONS: ChannelRec[] = [
  {
    title: 'Treatment Room',
    icon: Stethoscope,
    content: 'Recommended protocols: Hydra-Renew Facial (60 min) paired with Barrier Recovery post-treatment. Position as a hydration-focused signature service. Suggest a 3-session package at $450 retail to drive commitment and rebooking.',
  },
  {
    title: 'Retail Shelf',
    icon: Paintbrush,
    content: 'Feature the Hydra-Renew Serum as endcap hero product with shelf talker. Cross-merchandise with Barrier Recovery Moisturizer for a complete home-care regimen. Recommended retail margin: 55-60%. Include sample sachets with every treatment booking.',
  },
  {
    title: 'Education',
    icon: BookOpen,
    content: 'Priority CE content: "Advanced Hydration Protocols for Mature Skin" (1.5 CE hours). Host a virtual masterclass during launch week — target 40+ attendees. Provide protocol cards and ingredient science one-pagers for treatment room teams.',
  },
  {
    title: 'Digital & Social',
    icon: Monitor,
    content: 'Content themes: Before/after hydration transformations, ingredient spotlights (hyaluronic acid + ceramide complex), practitioner testimonials. Provide operators with a branded social toolkit — 8 posts, 3 Reels templates, 2 email templates. Hashtag: #HydraRenewLaunch.',
  },
];

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addCampaign } = useCampaigns();

  const [step, setStep] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);

  // Step 1 form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [segments, setSegments] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);

  // Step 2 channel recommendations (editable)
  const [channels, setChannels] = useState<ChannelRec[]>(MOCK_CHANNEL_RECOMMENDATIONS);

  // Step 3 timeline activities
  const [activities, setActivities] = useState<string[]>([
    'Distribute pre-launch teaser content to operator network',
    'Host virtual product training and CE session',
    'Activate promotional pricing and launch announcement',
    'Mid-campaign check-in: review engagement and adjust messaging',
    'Send operator testimonial round-up and social proof',
    'Final push: urgency messaging for campaign close',
    'Post-campaign performance review and reorder analysis',
  ]);

  // Step 4
  const [status, setStatus] = useState<CampaignStatus>('draft');

  // Simulate AI loading when moving to step 2
  useEffect(() => {
    if (step === 2) {
      setAiLoading(true);
      // Stub: simulates an AI call — in production this would hit the Claude API
      console.log('[AI STUB] Generating channel recommendations for campaign:', name);
      const timeout = setTimeout(() => {
        setAiLoading(false);
        // Return mock data (already set in initial state)
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [step, name]);

  const toggleSelection = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const updateChannel = (index: number, content: string) => {
    setChannels((prev) =>
      prev.map((ch, i) => (i === index ? { ...ch, content } : ch))
    );
  };

  const canProceed = () => {
    if (step === 1) return name.trim() && startDate && endDate;
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleExportPdf = () => {
    // Stub: PDF export deferred
    console.log('[PDF STUB] Export campaign PDF for:', name);
    addToast('PDF export coming soon', 'info');
  };

  const handleSave = () => {
    const campaign = addCampaign({
      name,
      description,
      startDate,
      endDate,
      discountType: 'percentage',
      discountValue: 0,
      eligibleProducts: [],
      eligibleTiers: (segments.includes('by_tier') ? ['active', 'elite', 'master'] : ['active']) as OperatorTier[],
      status,
      targetOperatorCount: 0,
    });
    addToast(`Campaign "${campaign.name}" saved as ${status}`, 'success');
    navigate('/brand/campaigns');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMidDate = () => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
    return mid.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDurationWeeks = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  };

  return (
    <>
      <Helmet>
        <title>Campaign Builder | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/brand/campaigns')}
            className="p-2 rounded-lg text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl text-pro-navy">Campaign Builder</h1>
            <p className="text-sm text-pro-warm-gray font-sans mt-0.5">
              Build and launch campaigns with intelligence-driven recommendations
            </p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-sans font-semibold transition-colors ${
                    step > s.id
                      ? 'bg-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-pro-navy text-white'
                      : 'bg-pro-stone text-pro-warm-gray'
                  }`}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span
                  className={`text-xs font-sans hidden sm:block ${
                    step >= s.id ? 'text-pro-charcoal font-medium' : 'text-pro-warm-gray'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    step > s.id ? 'bg-emerald-400' : 'bg-pro-stone'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card padding="lg">
            <h2 className="font-sans font-semibold text-pro-charcoal text-lg mb-5">
              Campaign Setup
            </h2>
            <div className="space-y-5">
              <Input
                label="Campaign Name"
                placeholder="e.g. Spring Hydration Protocol Launch"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-pro-stone bg-white font-sans text-sm text-pro-charcoal placeholder:text-pro-warm-gray/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pro-navy/15 focus:border-pro-navy resize-none"
                  rows={3}
                  placeholder="What is this campaign about? What are your goals?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pro-charcoal font-sans mb-2">
                  Target Operator Segment
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SEGMENT_OPTIONS.map((seg) => {
                    const Icon = seg.icon;
                    const selected = segments.includes(seg.id);
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => toggleSelection(segments, seg.id, setSegments)}
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                          selected
                            ? 'border-pro-navy bg-pro-navy/5'
                            : 'border-pro-stone hover:border-pro-navy/30'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 ${selected ? 'text-pro-navy' : 'text-pro-warm-gray'}`} />
                        <div>
                          <p className={`text-sm font-sans ${selected ? 'text-pro-navy font-medium' : 'text-pro-charcoal'}`}>
                            {seg.label}
                          </p>
                          <p className="text-[11px] text-pro-warm-gray font-sans">{seg.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pro-charcoal font-sans mb-2">
                  Campaign Objectives
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {OBJECTIVE_OPTIONS.map((obj) => {
                    const Icon = obj.icon;
                    const selected = objectives.includes(obj.id);
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => toggleSelection(objectives, obj.id, setObjectives)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                          selected
                            ? 'border-pro-navy bg-pro-navy/5'
                            : 'border-pro-stone hover:border-pro-navy/30'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${selected ? 'text-pro-navy' : 'text-pro-warm-gray'}`} />
                        <span className={`text-sm font-sans ${selected ? 'text-pro-navy font-medium' : 'text-pro-charcoal'}`}>
                          {obj.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 px-4 py-3 bg-pro-cream rounded-xl border border-pro-stone">
              <Sparkles className="w-4 h-4 text-pro-gold flex-shrink-0 mt-0.5" />
              <p className="text-xs text-pro-charcoal font-sans">
                AI recommendations powered by Socelle Intelligence (configuring...). Edit any recommendation below to customize for your brand.
              </p>
            </div>

            {aiLoading ? (
              <Card padding="lg" className="text-center">
                <Loader2 className="w-8 h-8 text-pro-navy animate-spin mx-auto mb-3" />
                <p className="text-sm text-pro-warm-gray font-sans">
                  Generating channel recommendations...
                </p>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {channels.map((channel, index) => {
                  const Icon = channel.icon;
                  return (
                    <Card key={channel.title} padding="none" className="overflow-hidden">
                      <div className="flex items-center gap-2.5 px-5 py-3 bg-pro-ivory border-b border-pro-stone/50">
                        <Icon className="w-4 h-4 text-pro-navy" />
                        <h3 className="font-sans font-semibold text-pro-charcoal text-sm">
                          {channel.title}
                        </h3>
                      </div>
                      <div className="p-4">
                        <textarea
                          className="w-full px-3 py-2.5 rounded-lg border border-pro-stone/50 bg-white font-sans text-xs text-pro-charcoal leading-relaxed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pro-navy/15 focus:border-pro-navy resize-none"
                          rows={6}
                          value={channel.content}
                          onChange={(e) => updateChannel(index, e.target.value)}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <Card padding="lg">
            <h2 className="font-sans font-semibold text-pro-charcoal text-lg mb-5">
              Campaign Timeline
            </h2>

            {startDate && endDate ? (
              <div className="space-y-6">
                {/* Horizontal timeline bar */}
                <div className="relative">
                  <div className="h-2 bg-pro-stone/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pro-navy to-pro-gold rounded-full w-full" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-pro-navy mx-auto -mt-[18px] border-2 border-white" />
                      <p className="text-[11px] font-sans text-pro-charcoal font-medium mt-2">
                        {formatDate(startDate)}
                      </p>
                      <p className="text-[10px] font-sans text-pro-warm-gray">Launch</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-pro-gold mx-auto -mt-[18px] border-2 border-white" />
                      <p className="text-[11px] font-sans text-pro-charcoal font-medium mt-2">
                        {getMidDate()}
                      </p>
                      <p className="text-[10px] font-sans text-pro-warm-gray">Mid-Point Check-in</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto -mt-[18px] border-2 border-white" />
                      <p className="text-[11px] font-sans text-pro-charcoal font-medium mt-2">
                        {formatDate(endDate)}
                      </p>
                      <p className="text-[10px] font-sans text-pro-warm-gray">Close</p>
                    </div>
                  </div>
                </div>

                {/* Week-by-week activities */}
                <div>
                  <h3 className="text-sm font-sans font-semibold text-pro-charcoal mb-3">
                    Weekly Activity Plan ({getDurationWeeks()} weeks)
                  </h3>
                  <div className="space-y-2">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl border border-pro-stone/50 bg-white"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pro-ivory flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-sans font-semibold text-pro-navy">
                            W{index + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          className="flex-1 text-sm font-sans text-pro-charcoal bg-transparent focus:outline-none"
                          value={activity}
                          onChange={(e) =>
                            setActivities((prev) =>
                              prev.map((a, i) => (i === index ? e.target.value : a))
                            )
                          }
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setActivities((prev) => [...prev, ''])}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans text-pro-warm-gray hover:text-pro-navy transition-colors"
                    >
                      + Add activity
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-pro-warm-gray mx-auto mb-3" />
                <p className="text-sm text-pro-warm-gray font-sans">
                  Set start and end dates in Step 1 to generate the timeline.
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setStep(1)}>
                  Go to Step 1
                </Button>
              </div>
            )}
          </Card>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Card padding="lg">
              <h2 className="font-sans font-semibold text-pro-charcoal text-lg mb-5">
                Campaign Summary
              </h2>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-sans text-pro-warm-gray uppercase tracking-wider mb-1">
                      Campaign Name
                    </p>
                    <p className="text-sm font-sans text-pro-charcoal font-medium">
                      {name || 'Untitled Campaign'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-sans text-pro-warm-gray uppercase tracking-wider mb-1">
                      Date Range
                    </p>
                    <p className="text-sm font-sans text-pro-charcoal">
                      {startDate && endDate
                        ? `${formatDate(startDate)} — ${formatDate(endDate)}`
                        : 'Not set'}
                    </p>
                  </div>
                </div>

                {description && (
                  <div>
                    <p className="text-[11px] font-sans text-pro-warm-gray uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm font-sans text-pro-charcoal">{description}</p>
                  </div>
                )}

                {segments.length > 0 && (
                  <div>
                    <p className="text-[11px] font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                      Target Segments
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {segments.map((s) => {
                        const seg = SEGMENT_OPTIONS.find((o) => o.id === s);
                        return (
                          <Badge key={s} variant="default">
                            {seg?.label ?? s}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {objectives.length > 0 && (
                  <div>
                    <p className="text-[11px] font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                      Objectives
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {objectives.map((o) => {
                        const obj = OBJECTIVE_OPTIONS.find((opt) => opt.id === o);
                        return (
                          <Badge key={o} variant="gold">
                            {obj?.label ?? o}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-sans text-pro-warm-gray uppercase tracking-wider mb-1.5">
                    Channel Recommendations
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {channels.map((ch) => {
                      const Icon = ch.icon;
                      return (
                        <div
                          key={ch.title}
                          className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-pro-ivory border border-pro-stone/30"
                        >
                          <Icon className="w-3.5 h-3.5 text-pro-navy flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-sans text-pro-charcoal font-medium">{ch.title}</p>
                            <p className="text-[11px] font-sans text-pro-warm-gray line-clamp-2">
                              {ch.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <label className="block text-sm font-medium text-pro-charcoal font-sans mb-2">
                    Campaign Status
                  </label>
                  <div className="flex gap-2">
                    {(['draft', 'scheduled', 'active'] as CampaignStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`px-4 py-2 rounded-lg border text-sm font-sans capitalize transition-colors ${
                          status === s
                            ? 'border-pro-navy bg-pro-navy text-white'
                            : 'border-pro-stone text-pro-warm-gray hover:border-pro-navy/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={<FileDown className="w-4 h-4" />}
                    onClick={handleExportPdf}
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    iconLeft={<Save className="w-4 h-4" />}
                    onClick={handleSave}
                  >
                    Save Campaign
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 4 && (
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight className="w-4 h-4" />}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
