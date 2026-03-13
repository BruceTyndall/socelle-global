import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Gem,
  Globe2,
  GraduationCap,
  Layers3,
  Lock,
  Megaphone,
  ShieldCheck,
  Sparkles,
  SwatchBook,
  Waves,
} from 'lucide-react';
import type { IntelligenceChannel, IntelligenceSignal } from '../../lib/intelligence/types';

interface IntelligenceChannelRailProps {
  title: string;
  subtitle: string;
  channels: IntelligenceChannel[];
  loading?: boolean;
  lockedCtaHref: string;
  lockedCtaLabel: string;
  onOpenSignal?: (signal: IntelligenceSignal) => void;
  signalHrefBuilder?: (signal: IntelligenceSignal) => string;
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, IconComponent> = {
  activity: Activity,
  briefcase: BriefcaseBusiness,
  chart: Activity,
  flask: Sparkles,
  gem: Gem,
  globe: Globe2,
  graduation: GraduationCap,
  layers: Layers3,
  megaphone: Megaphone,
  pulse: Activity,
  shield: ShieldCheck,
  sparkles: Sparkles,
  swatchbook: SwatchBook,
  waves: Waves,
};

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function timeAgo(value?: string | null): string {
  if (!value) return 'Awaiting signal flow';
  const diffHours = (Date.now() - new Date(value).getTime()) / 3_600_000;
  if (!Number.isFinite(diffHours) || diffHours < 1) return 'Just refreshed';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function accentClasses(accentToken: string): string {
  switch (accentToken) {
    case 'signal-up':
      return 'border-signal-up/20 bg-signal-up/8 text-signal-up';
    case 'signal-warn':
      return 'border-signal-warn/20 bg-signal-warn/8 text-signal-warn';
    case 'signal-down':
      return 'border-signal-down/20 bg-signal-down/8 text-signal-down';
    default:
      return 'border-accent/20 bg-accent-soft text-accent';
  }
}

export default function IntelligenceChannelRail({
  title,
  subtitle,
  channels,
  loading = false,
  lockedCtaHref,
  lockedCtaLabel,
  onOpenSignal,
  signalHrefBuilder,
}: IntelligenceChannelRailProps) {
  const [manualSelectedSlug, setManualSelectedSlug] = useState<string | null>(null);

  const selectedChannel = useMemo(() => {
    if (channels.length === 0) return null;
    return channels.find((channel) => channel.slug === manualSelectedSlug) ?? channels[0];
  }, [channels, manualSelectedSlug]);

  if (loading) {
    return (
      <section className="mb-8 rounded-section border border-graphite/10 bg-white/72 p-5 shadow-soft backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-28 rounded bg-graphite/8" />
          <div className="h-8 w-72 rounded bg-graphite/10" />
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 rounded-2xl bg-graphite/6" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (channels.length === 0 || !selectedChannel) return null;

  const SelectedIcon = ICONS[selectedChannel.icon_key] ?? Activity;

  return (
    <section className="mb-8 rounded-section border border-graphite/10 bg-white/76 p-5 shadow-soft backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">{title}</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-graphite">{subtitle}</h2>
        </div>
        <div className="rounded-pill border border-graphite/10 bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-graphite/48">
          {channels.length} live channels
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((channel) => {
            const Icon = ICONS[channel.icon_key] ?? Activity;
            const isActive = channel.slug === selectedChannel.slug;
            return (
              <button
                key={channel.slug}
                type="button"
                onClick={() => setManualSelectedSlug(channel.slug)}
                className={`rounded-[24px] border p-4 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-accent/40 bg-white shadow-md ring-1 ring-accent/10'
                    : 'border-graphite/10 bg-background text-graphite hover:border-graphite/20 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentClasses(channel.accent_token)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-pill border border-graphite/10 bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-graphite/55">
                      {channel.audience === 'brand' ? 'Brand' : channel.audience === 'provider' ? 'Provider' : 'Cross-market'}
                    </span>
                    {channel.is_locked && (
                      <span className="inline-flex items-center gap-1 rounded-pill border border-signal-warn/20 bg-signal-warn/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-signal-warn">
                        <Lock className="h-3 w-3" />
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-graphite/40">
                  {channel.eyebrow ?? 'Live channel'}
                </p>
                <h3 className="mt-2 text-lg font-medium leading-tight text-graphite">{channel.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-graphite/62">
                  {channel.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {channel.top_tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${channel.slug}-${tag.tag_code}`}
                      className="rounded-pill border border-graphite/10 bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-graphite/55"
                    >
                      {tag.display_label}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <article className="rounded-[28px] border border-graphite/10 bg-background p-5 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accentClasses(selectedChannel.accent_token)}`}>
                <SelectedIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-graphite/42">{selectedChannel.eyebrow ?? 'Live channel'}</p>
                <h3 className="mt-2 text-xl font-medium tracking-[-0.03em] text-graphite">{selectedChannel.name}</h3>
              </div>
            </div>
            <span className="rounded-pill border border-graphite/10 bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-graphite/48">
              {timeAgo(selectedChannel.last_event_at ?? selectedChannel.last_published_at)}
            </span>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-graphite/64">{selectedChannel.summary}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-graphite/10 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-graphite/42">Weighted signal volume</p>
              <p className="mt-2 font-mono text-2xl text-graphite">{formatCompactNumber(selectedChannel.weighted_signal_count)}</p>
            </div>
            <div className="rounded-2xl border border-graphite/10 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-graphite/42">Engagement index</p>
              <p className="mt-2 font-mono text-2xl text-graphite">{selectedChannel.weighted_engagement_score.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-graphite/10 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-graphite/42">Persona fit</p>
              <p className="mt-2 font-mono text-2xl text-graphite">{formatCompactNumber(selectedChannel.personalization_score || selectedChannel.rank_score)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedChannel.top_tags.slice(0, 4).map((tag) => (
              <span
                key={`${selectedChannel.slug}-top-${tag.tag_code}`}
                className="rounded-pill border border-graphite/10 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-graphite/55"
              >
                {tag.display_label}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-graphite/42">Signals shaping this channel</p>
              {selectedChannel.is_locked && (
                <Link
                  to={lockedCtaHref}
                  className="inline-flex items-center gap-2 rounded-pill border border-signal-warn/20 bg-signal-warn/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-signal-warn"
                >
                  {lockedCtaLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {selectedChannel.top_signals.length > 0 ? (
                selectedChannel.top_signals.map((signal) => {
                  const content = (
                    <div className="rounded-2xl border border-graphite/10 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium leading-6 text-graphite">{signal.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-graphite/45">
                            {signal.source_name ?? signal.source ?? 'Market signal'}
                          </p>
                        </div>
                        <span className="rounded-pill border border-graphite/10 bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-graphite/48">
                          {Math.round(signal.score_importance ?? signal.impact_score ?? 0)}
                        </span>
                      </div>
                    </div>
                  );

                  if (onOpenSignal) {
                    return (
                      <button
                        key={signal.id}
                        type="button"
                        onClick={() => onOpenSignal(signal)}
                        className="block w-full text-left"
                      >
                        {content}
                      </button>
                    );
                  }

                  if (signalHrefBuilder) {
                    return (
                      <Link key={signal.id} to={signalHrefBuilder(signal)} className="block">
                        {content}
                      </Link>
                    );
                  }

                  return <div key={signal.id}>{content}</div>;
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-graphite/14 bg-white px-4 py-6 text-sm leading-6 text-graphite/58">
                  Channel scoring is live, but this surface is waiting on more matching tagged signals to populate the spotlight.
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
