import {
  Layers,
  Beaker,
  FlaskConical,
  BarChart3,
  Shield,
  Cpu,
  ShoppingBag,
  FileText,
  BookOpen,
  Video,
  Radio,
  Award,
  GraduationCap,
} from 'lucide-react';
import type {
  EducationFilterKey,
  ContentTypeFilter,
  DifficultyFilter,
  SortKey,
} from '../../lib/education/types';

// ── Category filter options ─────────────────────────────────────────

interface CategoryOption {
  key: EducationFilterKey;
  label: string;
  icon: React.ElementType;
}

const CATEGORY_FILTERS: CategoryOption[] = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'treatment_protocols', label: 'Treatment Protocols', icon: Beaker },
  { key: 'ingredient_science', label: 'Ingredient Science', icon: FlaskConical },
  { key: 'business_operations', label: 'Business Ops', icon: BarChart3 },
  { key: 'compliance_regulatory', label: 'Compliance', icon: Shield },
  { key: 'device_training', label: 'Device Training', icon: Cpu },
  { key: 'retail_strategy', label: 'Retail Strategy', icon: ShoppingBag },
];

// ── Content type filter options ─────────────────────────────────────

interface TypeOption {
  key: ContentTypeFilter;
  label: string;
  icon: React.ElementType;
}

const TYPE_FILTERS: TypeOption[] = [
  { key: 'all', label: 'All Types', icon: Layers },
  { key: 'protocol', label: 'Protocols', icon: FileText },
  { key: 'article', label: 'Articles', icon: BookOpen },
  { key: 'video', label: 'Videos', icon: Video },
  { key: 'webinar', label: 'Webinars', icon: Radio },
  { key: 'ce_course', label: 'Courses', icon: Award },
];

// ── Props ───────────────────────────────────────────────────────────

interface EducationFilterProps {
  categoryFilter: EducationFilterKey;
  onCategoryChange: (key: EducationFilterKey) => void;
  contentTypeFilter: ContentTypeFilter;
  onContentTypeChange: (key: ContentTypeFilter) => void;
  difficultyFilter: DifficultyFilter;
  onDifficultyChange: (key: DifficultyFilter) => void;
  ceOnlyFilter: boolean;
  onCeOnlyChange: (v: boolean) => void;
  sortKey: SortKey;
  onSortChange: (k: SortKey) => void;
}

// ── Component ───────────────────────────────────────────────────────

export default function EducationFilter({
  categoryFilter,
  onCategoryChange,
  contentTypeFilter,
  onContentTypeChange,
  difficultyFilter,
  onDifficultyChange,
  ceOnlyFilter,
  onCeOnlyChange,
  sortKey,
  onSortChange,
}: EducationFilterProps) {
  return (
    <div className="space-y-4">
      {/* ── Category pills ── */}
      <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORY_FILTERS.map(({ key, label, icon: Icon }) => {
            const isActive = categoryFilter === key;
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-150 whitespace-nowrap min-h-touch ${
                  isActive
                    ? 'bg-pro-navy text-white shadow-navy'
                    : 'bg-pro-cream text-pro-warm-gray hover:bg-pro-stone/60 hover:text-pro-charcoal'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Secondary filters row ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Content type */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 min-w-max">
            {TYPE_FILTERS.map(({ key, label, icon: Icon }) => {
              const isActive = contentTypeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => onContentTypeChange(key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 whitespace-nowrap min-h-touch ${
                    isActive
                      ? 'bg-pro-charcoal text-white'
                      : 'bg-pro-ivory text-pro-warm-gray hover:bg-pro-cream hover:text-pro-charcoal'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer on desktop */}
        <div className="hidden sm:block w-px h-6 bg-pro-stone/60" />

        {/* Difficulty selector */}
        <select
          value={difficultyFilter}
          onChange={(e) => onDifficultyChange(e.target.value as DifficultyFilter)}
          className="min-h-touch px-3 py-1.5 rounded-lg border border-pro-stone/60 bg-white text-xs font-sans font-medium text-pro-charcoal focus:outline-none focus:ring-1 focus:ring-pro-navy/30"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* CE Eligible toggle */}
        <button
          onClick={() => onCeOnlyChange(!ceOnlyFilter)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 min-h-touch ${
            ceOnlyFilter
              ? 'bg-pro-gold text-pro-charcoal'
              : 'bg-pro-ivory text-pro-warm-gray hover:bg-pro-cream hover:text-pro-charcoal border border-pro-stone/40'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          CE Eligible Only
        </button>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="min-h-touch px-3 py-1.5 rounded-lg border border-pro-stone/60 bg-white text-xs font-sans font-medium text-pro-charcoal focus:outline-none focus:ring-1 focus:ring-pro-navy/30 ml-auto"
        >
          <option value="newest">Sort: Newest</option>
          <option value="ce_credits">Sort: CE Credits</option>
          <option value="difficulty">Sort: Difficulty</option>
        </select>
      </div>
    </div>
  );
}
