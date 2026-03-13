import { Clock } from 'lucide-react';

export interface FeedArticle {
  id: string;
  title: string;
  excerpt: string | null;
  hero_image_url: string | null;
  source_url: string | null;
  tags: string[] | null;
  vertical: string | null;
  category: string | null;
  created_at: string;
  published_at?: string | null;
  reading_time_minutes?: number | null;
  signal_score?: number | null;
}

interface IntelligenceFeedCardProps {
  article: FeedArticle;
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'Just now';
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(dateStr),
  );
}

function humanizeVertical(value?: string | null): string {
  if (!value) return '';
  const map: Record<string, string> = {
    medspa: 'Medspa',
    salon: 'Salon',
    beauty_brand: 'Beauty Brand',
  };
  return map[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function tryGetFaviconUrl(sourceUrl?: string | null): string | null {
  if (!sourceUrl) return null;
  try {
    const { hostname } = new URL(sourceUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`;
  } catch {
    return null;
  }
}

function getSourceLabel(sourceUrl?: string | null): string {
  if (!sourceUrl) return '';
  try {
    const { hostname } = new URL(sourceUrl);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function IntelligenceFeedCard({ article }: IntelligenceFeedCardProps) {
  const displayDate = article.published_at ?? article.created_at;
  const faviconUrl = tryGetFaviconUrl(article.source_url);
  const sourceLabel = getSourceLabel(article.source_url);
  const tags = (article.tags ?? []).slice(0, 3);
  const verticalLabel = humanizeVertical(article.vertical);
  const hasImage = Boolean(article.hero_image_url);
  const signalScore = article.signal_score;

  return (
    <article className="group overflow-hidden rounded-xl border border-[#e2e6ea] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]">
      {/* Hero image */}
      <div className="relative h-44 w-full overflow-hidden">
        {hasImage ? (
          <img
            src={article.hero_image_url!}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#EFF3F6] to-[#d4dde6]" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 text-[11px] text-[#717182]">
          {faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              className="h-3.5 w-3.5 rounded-sm object-contain"
              loading="lazy"
            />
          )}
          {sourceLabel && <span className="truncate max-w-[120px]">{sourceLabel}</span>}
          {sourceLabel && displayDate && <span className="text-[#aeaeba]">•</span>}
          {displayDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(displayDate)}
            </span>
          )}
          {article.reading_time_minutes && (
            <>
              <span className="text-[#aeaeba]">•</span>
              <span>{article.reading_time_minutes} min</span>
            </>
          )}
        </div>

        {/* Headline */}
        <h3 className="mt-2 line-clamp-2 text-base font-medium leading-snug text-[#1a1a1a]">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#717182]">{article.excerpt}</p>
        )}

        {/* Pills row */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {verticalLabel && (
            <span className="rounded-full bg-[#EFF3F6] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#6E879B]">
              {verticalLabel}
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-600"
            >
              {tag}
            </span>
          ))}
          {signalScore !== null && signalScore !== undefined && (
            <span className="ml-auto rounded-full border border-[#5F8A72]/20 bg-[#5F8A72]/8 px-2.5 py-0.5 text-[10px] text-[#5F8A72]">
              &#9650; {signalScore}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
