import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Mail, MessageSquare, Bell, Smartphone, Share2, AlertCircle, Users, FileText, Calendar, Eye } from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { CampaignType } from '../../lib/useCampaigns';
import { useAudienceSegments } from '../../lib/useAudienceSegments';

// ── WO-OVERHAUL-15: Campaign Builder (/marketing/campaigns/new) ──────
// Multi-step builder: Type > Audience > Content > Schedule > Review
// ZERO cold email — all campaigns opt-in only.

const STEPS = ['Type', 'Audience', 'Content', 'Schedule', 'Review'];

const TYPE_OPTIONS: { type: CampaignType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: 'email', label: 'Email', desc: 'Opt-in email to subscribed audience', icon: Mail },
  { type: 'sms', label: 'SMS', desc: 'Text message to opted-in contacts', icon: MessageSquare },
  { type: 'push', label: 'Push Notification', desc: 'App push to opted-in users', icon: Bell },
  { type: 'in_app', label: 'In-App Message', desc: 'Message displayed within the platform', icon: Smartphone },
  { type: 'social', label: 'Social', desc: 'Social media content distribution', icon: Share2 },
];

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const { createCampaign, isLive } = useCampaigns();
  const { segments } = useAudienceSegments();

  const [step, setStep] = useState(0);
  const [campaignType, setCampaignType] = useState<CampaignType>('email');
  const [segmentId, setSegmentId] = useState<string>('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [body, setBody] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [submitting, setSubmitting] = useState(false);

  const canAdvance = () => {
    if (step === 0) return !!campaignType;
    if (step === 1) return true; // segment optional
    if (step === 2) return name.trim().length > 0;
    if (step === 3) return scheduleType === 'now' || (scheduledDate && scheduledTime);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const scheduledAt = scheduleType === 'later' && scheduledDate
      ? `${scheduledDate}T${scheduledTime}:00Z`
      : null;

    const result = await createCampaign({
      name: name.trim(),
      type: campaignType,
      status: scheduleType === 'now' ? 'active' : 'scheduled',
      subject: subject || null,
      preview_text: previewText || null,
      body: body ? { blocks: [{ type: 'text', content: body }] } : null,
      audience_segment_id: segmentId || null,
      scheduled_at: scheduledAt,
      sent_at: null,
    });

    setSubmitting(false);
    if (result) {
      navigate(`/marketing/campaigns/${result.id}`);
    } else {
      navigate('/marketing/campaigns');
    }
  };

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/marketing/campaigns')} className="p-2 rounded-lg text-graphite/40 hover:text-graphite hover:bg-mn-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
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
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-sans transition-colors ${
                  i === step ? 'bg-mn-dark text-white' :
                  i < step ? 'bg-signal-up/10 text-signal-up cursor-pointer' :
                  'bg-graphite/5 text-graphite/30'
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : null}
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-graphite/10" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-mn-card border border-graphite/8 rounded-xl p-6">
          {/* Step 0: Type */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-graphite font-sans mb-1">Campaign Type</h2>
              <p className="text-sm text-graphite/50 font-sans mb-5">Select how you want to reach your opted-in audience</p>
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
          )}

          {/* Step 1: Audience */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-graphite font-sans">Select Audience</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans mb-5">Choose an existing segment or send to all subscribers</p>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
              >
                <option value="">All Subscribers (opt-in)</option>
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>{seg.name} ({seg.estimated_size.toLocaleString()})</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-graphite font-sans">Campaign Content</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans mb-5">Compose your campaign message</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Campaign Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Spring Intelligence Digest"
                    className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                {(campaignType === 'email') && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Subject Line</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject line"
                        className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Preview Text</label>
                      <input
                        type="text"
                        value={previewText}
                        onChange={(e) => setPreviewText(e.target.value)}
                        placeholder="Preview text shown in inbox"
                        className="w-full h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans mb-1.5">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    placeholder="Campaign content..."
                    className="w-full px-3 py-2 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-graphite font-sans">Schedule</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans mb-5">Choose when to send this campaign</p>
              <div className="space-y-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${scheduleType === 'now' ? 'border-accent bg-accent/5' : 'border-graphite/8'}`}>
                  <input type="radio" name="schedule" checked={scheduleType === 'now'} onChange={() => setScheduleType('now')} className="accent-accent" />
                  <div>
                    <p className="text-sm font-medium text-graphite font-sans">Send Now</p>
                    <p className="text-xs text-graphite/40 font-sans">Campaign will be sent immediately upon launch</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${scheduleType === 'later' ? 'border-accent bg-accent/5' : 'border-graphite/8'}`}>
                  <input type="radio" name="schedule" checked={scheduleType === 'later'} onChange={() => setScheduleType('later')} className="accent-accent" />
                  <div>
                    <p className="text-sm font-medium text-graphite font-sans">Schedule for Later</p>
                    <p className="text-xs text-graphite/40 font-sans">Pick a specific date and time</p>
                  </div>
                </label>
                {scheduleType === 'later' && (
                  <div className="flex gap-3 pl-10">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="h-10 px-3 text-sm font-sans text-graphite bg-mn-bg border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-graphite font-sans">Review Campaign</h2>
              </div>
              <p className="text-sm text-graphite/50 font-sans mb-5">Confirm everything looks correct before launching</p>
              <div className="space-y-3">
                {[
                  { label: 'Name', value: name },
                  { label: 'Type', value: campaignType.replace('_', ' ').toUpperCase() },
                  { label: 'Audience', value: segmentId ? segments.find((s) => s.id === segmentId)?.name || segmentId : 'All Subscribers' },
                  { label: 'Subject', value: subject || '(none)' },
                  { label: 'Schedule', value: scheduleType === 'now' ? 'Send immediately' : `${scheduledDate} at ${scheduledTime}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-2 border-b border-graphite/5 last:border-0">
                    <span className="text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans">{row.label}</span>
                    <span className="text-sm text-graphite font-sans text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-signal-up/5 border border-signal-up/20 rounded-lg">
                <p className="text-xs text-signal-up font-sans font-medium">
                  This campaign will only reach opted-in subscribers. No cold outreach.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/marketing/campaigns')}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-sans font-medium text-graphite/60 hover:text-graphite transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 h-10 px-6 bg-signal-up text-white text-sm font-sans font-semibold rounded-full hover:bg-signal-up/90 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Launching...' : 'Launch Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
