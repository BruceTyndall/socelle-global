import {
  Clock,
  GraduationCap,
  FileText,
  Video,
  Radio,
  BookOpen,
  Award,
} from 'lucide-react';
import type { EducationContent, ContentType, ContentCategory } from '../../lib/education/types';

// ── Gradient map per category (thumbnail placeholder) ───────────────
// Pearl Mineral V2 tokens only — no pro-*, no font-serif

const CATEGORY_GRADIENT: Record<ContentCategory, string> = {
  treatment_protocols: 'from-accent/80 to-accent/40',
  ingredient_science: 'from-signal-up/70 to-signal-up/30',
  business_operations: 'from-signal-warn/70 to-signal-warn/30',
  compliance_regulatory: 'from-graphite/60 to-graphite/30',
  device_training: 'from-accent/70 to-accent/30',
  retail_strategy: 'from-signal-down/60 to-signal-down/25',
};

// ── Content type badge info ─────────────────────────────────────────

const TYPE_META: Record<ContentType, { label: string; icon: React.ElementType }> = {
  protocol: { label: 'Protocol', icon: FileText },
  article: { label: 'Article', icon: BookOpen },
  video: { label: 'Video', icon: Video },
  webinar: { label: 'Webinar', icon: Radio },
  ce_course: { label: 'Course', icon: Award },
};

// ── Difficulty badge colors ─────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, string> = {
  beginner: 'bg-signal-up/10 text-signal-up',
  intermediate: 'bg-signal-warn/10 text-signal-warn',
  advanced: 'bg-signal-down/10 text-signal-down',
};

// ── Component ───────────────────────────────────────────────────────

interface EducationCardProps {
  item: EducationContent;
}

export default function EducationCard({ item }: EducationCardProps) {
  const gradient = CATEGORY_GRADIENT[item.category];
  const typeMeta = TYPE_META[item.content_type];
  const TypeIcon = typeMeta.icon;
  const diffStyle = DIFFICULTY_STYLE[item.difficulty] ?? 'bg-mn-surface text-graphite';

  return (
    <article className="group relative bg-white rounded-xl border border-mn-surface overflow-hidden transition-all duration-200 hover:border-accent/30 hover:shadow-panel hover:-translate-y-0.5">
      {/* ── Thumbnail placeholder ── */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient}`}>
        {/* Content type badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-sans font-semibold text-graphite">
          <TypeIcon className="w-3 h-3" />
          {typeMeta.label}
        </span>

        {/* Brand attribution */}
        {item.brand_name && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/30 text-white text-[10px] font-sans font-medium backdrop-blur">
            {item.brand_name}
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-sans font-semibold text-lg text-graphite leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Summary (2-line truncated) */}
        <p className="text-sm text-graphite/60 font-sans font-light leading-relaxed mb-3 line-clamp-2">
          {item.summary}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 mb-4">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-mn-surface text-graphite/60 text-[10px] font-sans font-medium"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] text-graphite/40 font-sans">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ── Bottom row ── */}
        <div className="flex items-center justify-between pt-3 border-t border-mn-surface">
          <div className="flex items-center gap-3">
            {/* Duration */}
            {item.duration_minutes && (
              <span className="inline-flex items-center gap-1 text-[11px] text-graphite/60 font-sans">
                <Clock className="w-3 h-3" />
                {item.duration_minutes} min
              </span>
            )}

            {/* Difficulty */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold capitalize ${diffStyle}`}>
              {item.difficulty}
            </span>
          </div>

          {/* CE credit indicator */}
          {item.ce_eligible && item.ce_credits && (
            <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-signal-warn">
              <GraduationCap className="w-3.5 h-3.5" />
              {item.ce_credits} CE Credit{item.ce_credits !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
