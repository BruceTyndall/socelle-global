import { Search, X } from 'lucide-react';

export type VerticalFilter = 'all' | 'medspa' | 'salon' | 'beauty_brand';
export type SourceTypeFilter = 'all' | 'rss' | 'research' | 'signals';
export type SortOrder = 'recent' | 'signal' | 'relevant';

interface IntelligenceFilterSidebarProps {
  vertical: VerticalFilter;
  onVerticalChange: (v: VerticalFilter) => void;
  sourceTypes: SourceTypeFilter[];
  onSourceTypesChange: (v: SourceTypeFilter[]) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (v: SortOrder) => void;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  liveChannelCount: number;
}

const VERTICALS: { key: VerticalFilter; label: string }[] = [
  { key: 'all', label: 'All verticals' },
  { key: 'medspa', label: 'Medspa' },
  { key: 'salon', label: 'Salon' },
  { key: 'beauty_brand', label: 'Beauty Brand' },
];

const SOURCE_TYPE_OPTIONS: { key: SourceTypeFilter; label: string }[] = [
  { key: 'all', label: 'All Sources' },
  { key: 'rss', label: 'RSS Feeds' },
  { key: 'research', label: 'Research Notes' },
  { key: 'signals', label: 'Market Signals' },
];

const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'recent', label: 'Most Recent' },
  { key: 'signal', label: 'Highest Signal' },
  { key: 'relevant', label: 'Most Relevant' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.16em] text-[#717182] mb-2">{children}</p>
  );
}

export default function IntelligenceFilterSidebar({
  vertical,
  onVerticalChange,
  sourceTypes,
  onSourceTypesChange,
  sortOrder,
  onSortOrderChange,
  searchQuery,
  onSearchQueryChange,
  liveChannelCount,
}: IntelligenceFilterSidebarProps) {
  function handleSourceTypeToggle(key: SourceTypeFilter) {
    if (key === 'all') {
      onSourceTypesChange(['all']);
      return;
    }
    const withoutAll = sourceTypes.filter((t) => t !== 'all');
    if (withoutAll.includes(key)) {
      const next = withoutAll.filter((t) => t !== key);
      onSourceTypesChange(next.length === 0 ? ['all'] : next);
    } else {
      onSourceTypesChange([...withoutAll, key]);
    }
  }

  return (
    <aside className="flex flex-col bg-white border-r border-[#e2e6ea] p-4 space-y-6 h-full min-h-0 overflow-y-auto">
      {/* Search */}
      <div>
        <SectionLabel>Search</SectionLabel>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#717182]" />
          <input
            type="text"
            placeholder="Filter by keyword..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full rounded-lg border border-[#e2e6ea] bg-[#F8F9FB] py-2 pl-8 pr-8 text-sm text-[#1a1a1a] placeholder-[#aeaeba] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 focus:border-[#6E879B]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#aeaeba] hover:text-[#717182]"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Vertical filters */}
      <div>
        <SectionLabel>Vertical</SectionLabel>
        <div className="space-y-1">
          {VERTICALS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onVerticalChange(item.key)}
              className={[
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150',
                vertical === item.key
                  ? 'bg-[#EFF3F6] text-[#6E879B] font-medium'
                  : 'text-[#1a1a1a] hover:bg-[#F8F9FB]',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e2e6ea]" />

      {/* Source type filters */}
      <div>
        <SectionLabel>Source Type</SectionLabel>
        <div className="space-y-1.5">
          {SOURCE_TYPE_OPTIONS.map((item) => {
            const isChecked =
              item.key === 'all' ? sourceTypes.includes('all') : sourceTypes.includes(item.key);
            return (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleSourceTypeToggle(item.key)}
                  className="h-3.5 w-3.5 rounded border-[#c8cfd6] text-[#6E879B] focus:ring-[#6E879B]/30 accent-[#6E879B]"
                />
                <span className="text-sm text-[#1a1a1a]">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e2e6ea]" />

      {/* Sort order */}
      <div>
        <SectionLabel>Sort By</SectionLabel>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
          className="w-full rounded-lg border border-[#e2e6ea] bg-[#F8F9FB] py-2 px-3 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 focus:border-[#6E879B]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e2e6ea]" />

      {/* Active channels summary */}
      <div className="flex items-center gap-2 text-[13px] text-[#717182]">
        <span className="h-2 w-2 rounded-full bg-[#5F8A72] animate-pulse" />
        <span>
          <span className="font-medium text-[#1a1a1a]">{liveChannelCount}</span> live channels
        </span>
      </div>
    </aside>
  );
}
