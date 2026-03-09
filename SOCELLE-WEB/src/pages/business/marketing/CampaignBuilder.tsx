import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Users,
  FileText,
  Calendar,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Share2,
} from 'lucide-react';
import { useMarketingCampaigns } from '../../../lib/marketing/useMarketingCampaigns';
import { useAudienceSegments } from '../../../lib/useAudienceSegments';
import { useContentTemplates } from '../../../lib/useContentTemplates';
import ErrorState from '../../../components/ErrorState';

// ── V2-HUBS-08: Campaign Builder (4-step wizard) ───────────────────
// Steps: Details > Audience > Content > Review+Schedule
// Pearl Mineral V2 tokens. ZERO cold email — all campaigns opt-in.

const STEPS = [
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'audience', label: 'Audience', icon: Users },
  { key: 'content', label: 'Content', icon: Mail },
  { key: 'review', label: 'Review', icon: Eye },
] as const;

type CampaignType = 'email' | 'sms' | 'push' | 'in_app' | 'social';

const TYPE_OPTIONS: { type: CampaignType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: 'email', label: 'Email', desc: 'Opt-in email to subscribed audience', icon: Mail },
  { type: 'sms', label: 'SMS', desc: 'Text message to opted-in contacts', icon: MessageSquare },
  { type: 'push', label: 'Push', desc: 'App push to opted-in users', icon: Bell },
  { type: 'in_app', label: 'In-App', desc: 'Message within the platform', icon: Smartphone },
  { type: 'social', label: 'Social', desc: 'Social media content distribution', icon: Share2 },
];

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const { createCampaign, isLive } = useMarketingCampaigns();
  const { segments, loading: segmentsLoading, error: segmentsError } = useAudienceSegments();
  const { templates, loading: templatesLoading, error: templatesError } = useContentTemplates();
  const blockingError = segmentsError ?? templatesError;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Details
  const [name, setName] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('email');
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2: Audience
  const [segmentId, setSegmentId] = useState('');

  // Step 3: Content
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Step 4: Review + Schedule
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return true; // segment optional
    if (step === 2) return true; // content optional in draft
    return true;
  };

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.subject ?? '');
      if (tpl.body && typeof tpl.body === 'object' && 'content' in tpl.body) {
        setBody(String(tpl.body.content));
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const scheduledAt =
      scheduleType === 'later' && scheduledDate
        ? `${scheduledDate}T${scheduledTime}:00Z`
        : null;

    const result = await createCampaign({
      name: name.trim(),
      type: campaignType,
      status: scheduleType === 'now' ? 'active' : 'scheduled',
      subject: subject || null,
      preview_text: objective || null,
      body: body ? { blocks: [{ type: 'text', content: body }] } : null,
      audience_segment_id: segmentId || null,
      scheduled_at: scheduledAt,
      sent_at: null,
    });

    setSubmitting(false);
    if (result) {
      navigate(`/portal/marketing/campaigns/${result.id}`);
    } else {
      navigate('/portal/marketing');
    }
  };

  const selectedSegment = segments.find((s) => s.id === segmentId);

  return (
    <>
      <Helmet>
        <title>New Campaign | Marketing | Socelle</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        {/* ── Back + Header ───────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-sans font-semibold text-graphite">Create Campaign</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
        </div>

        {/* ── Step Indicator ──────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-sans transition-colors ${
                  i === step
                    ? 'bg-accent text-white'
                    : i < step
                      ? 'bg-signal-up/10 text-signal-up cursor-pointer'
                      : 'bg-graphite/5 text-graphite/30'
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : null}
                {s.label}
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-graphite/10" />}
            </div>
          ))}
        </div>

        {blockingError && (
          <ErrorState
            title="Campaign builder data unavailable"
            message={blockingError}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* ── Step Content ────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-graphite/8 p-6">
          {/* Step 0: Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-sans font-semibold text-graphite mb-1">Campaign Details</h2>
                <p className="text-sm text-graphite/50 font-sans">Name, type, and dates</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Spring Intelligence Digest"
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">
                  Objective
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g. Drive engagement with Q2 signals"
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-3">
                  Campaign Type
                </label>
                <div className="grid gap-3">
                  {TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = campaignType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => setCampaignType(opt.type)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-colors ${
                          selected ? 'border-accent bg-accent/5' : 'border-graphite/8 hover:border-graphite/20'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-accent/10' : 'bg-graphite/5'}`}>
                          <Icon className={`w-5 h-5 ${selected ? 'text-accent' : 'text-graphite/30'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-graphite font-sans">{opt.label}</p>
                          <p className="text-xs text-graphite/40 font-sans">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Audience */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-sans font-semibold text-graphite">Select Audience</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans">
                Choose a CRM segment or send to all opted-in subscribers
              </p>

              {segmentsLoading ? (
                <div className="flex items-center gap-2 py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-graphite/30" />
                  <span className="text-sm text-graphite/40 font-sans">Loading segments...</span>
                </div>
              ) : (
                <select
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">All Subscribers (opt-in)</option>
                  {segments.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} ({seg.estimated_size.toLocaleString()} contacts)
                    </option>
                  ))}
                </select>
              )}

              {selectedSegment && (
                <div className="p-4 bg-accent-soft/50 rounded-lg border border-accent/10">
                  <p className="text-sm font-sans font-medium text-graphite">{selectedSegment.name}</p>
                  <p className="text-xs text-graphite/50 font-sans mt-1">
                    {selectedSegment.estimated_size.toLocaleString()} contacts
                    {selectedSegment.description ? ` -- ${selectedSegment.description}` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-sans font-semibold text-graphite">Campaign Content</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans">
                Pick a template or write content from scratch
              </p>

              {/* Template picker */}
              {templatesLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-graphite/30" />
                  <span className="text-sm text-graphite/40 font-sans">Loading templates...</span>
                </div>
              ) : templates.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-2">
                    Start from template (optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {templates.slice(0, 6).map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => applyTemplate(tpl.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          templateId === tpl.id
                            ? 'border-accent bg-accent/5'
                            : 'border-graphite/8 hover:border-graphite/20'
                        }`}
                      >
                        <div className="w-full h-12 bg-accent-soft/50 rounded mb-2 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-graphite/20" />
                        </div>
                        <p className="text-xs font-sans font-medium text-graphite truncate">{tpl.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Subject line (email only) */}
              {campaignType === 'email' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject line"
                    className="w-full h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              )}

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="Write your campaign content..."
                  className="w-full px-3 py-2 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent resize-y transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review + Schedule */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-sans font-semibold text-graphite">Review &amp; Schedule</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans">Confirm everything and choose when to send</p>

              {/* Summary */}
              <div className="space-y-3">
                {[
                  { label: 'Name', value: name },
                  { label: 'Type', value: campaignType.replace('_', ' ').toUpperCase() },
                  { label: 'Audience', value: selectedSegment ? selectedSegment.name : 'All Subscribers' },
                  { label: 'Subject', value: subject || '(none)' },
                  { label: 'Objective', value: objective || '(none)' },
                  { label: 'Dates', value: startDate && endDate ? `${startDate} to ${endDate}` : startDate || '(not set)' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-2 border-b border-graphite/5 last:border-0">
                    <span className="text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans">{row.label}</span>
                    <span className="text-sm text-graphite font-sans text-right max-w-[60%]">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Schedule */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Schedule
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    scheduleType === 'now' ? 'border-accent bg-accent/5' : 'border-graphite/8'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleType === 'now'}
                    onChange={() => setScheduleType('now')}
                    className="accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-graphite font-sans">Send Now</p>
                    <p className="text-xs text-graphite/40 font-sans">Campaign activates immediately</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    scheduleType === 'later' ? 'border-accent bg-accent/5' : 'border-graphite/8'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleType === 'later'}
                    onChange={() => setScheduleType('later')}
                    className="accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-graphite font-sans">Schedule for Later</p>
                    <p className="text-xs text-graphite/40 font-sans">Pick a date and time</p>
                  </div>
                </label>
                {scheduleType === 'later' && (
                  <div className="flex gap-3 pl-10">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="h-10 px-3 text-sm font-sans text-graphite bg-background border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-signal-up/5 border border-signal-up/20 rounded-lg">
                <p className="text-xs text-signal-up font-sans font-medium">
                  This campaign will only reach opted-in subscribers. No cold outreach.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : navigate('/portal/marketing'))}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-sans font-medium text-graphite/60 hover:text-graphite transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="inline-flex items-center gap-2 h-10 px-5 bg-accent text-white text-sm font-sans font-medium rounded-full hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !name.trim()}
              className="inline-flex items-center gap-2 h-10 px-6 bg-signal-up text-white text-sm font-sans font-semibold rounded-full hover:bg-signal-up/90 transition-colors disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Launching...
                </>
              ) : (
                'Launch Campaign'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
