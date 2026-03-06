import { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import type { SearchFilters } from '../lib/searchService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilterGroupProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (updated: Partial<SearchFilters>) => void;
  onClear: () => void;
  /** Mobile: controlled drawer open state */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterGroup({ title, defaultOpen = true, children }: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-pro-stone last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-sans font-semibold text-sm text-pro-charcoal">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-pro-warm-gray" />
        ) : (
          <ChevronDown className="w-4 h-4 text-pro-warm-gray" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

const CATEGORIES = [
  'Skincare', 'Haircare', 'Body', 'Wellness', 'Makeup',
  'Nails', 'MedSpa', 'Fragrance',
];

const PRODUCT_TYPES = [
  { key: 'all', label: 'All products' },
  { key: 'pro', label: 'Pro only' },
  { key: 'retail', label: 'Retail only' },
] as const;

const SORT_OPTIONS = [
  { key: 'relevance',   label: 'Most relevant' },
  { key: 'name',        label: 'Name A–Z' },
  { key: 'price_asc',   label: 'Price: low to high' },
  { key: 'price_desc',  label: 'Price: high to low' },
] as const;

// ── Active filter chips (shown above results) ─────────────────────────────────

export function ActiveFilterChips({
  filters,
  onChange,
  onClear,
}: Pick<SearchFiltersProps, 'filters' | 'onChange' | 'onClear'>) {
  const chips: Array<{ label: string; onRemove: () => void }> = [];

  if (filters.category) {
    chips.push({ label: filters.category, onRemove: () => onChange({ category: undefined }) });
  }
  if (filters.productType && filters.productType !== 'all') {
    chips.push({
      label: filters.productType === 'pro' ? 'Pro only' : 'Retail only',
      onRemove: () => onChange({ productType: 'all' }),
    });
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    const label = [
      filters.minPrice != null ? `$${filters.minPrice}` : null,
      filters.maxPrice != null ? `$${filters.maxPrice}` : null,
    ]
      .filter(Boolean)
      .join(' – ');
    chips.push({
      label: `Price: ${label}`,
      onRemove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-pro-gold-pale text-pro-navy text-xs font-medium font-sans rounded-full border border-pro-gold/30"
        >
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-pro-gold transition-colors ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClear}
        className="text-xs font-medium font-sans text-pro-warm-gray hover:text-pro-navy transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SearchFilters({
  filters,
  onChange,
  onClear,
  mobileOpen = false,
  onMobileClose,
  className = '',
}: SearchFiltersProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [minPriceInput, setMinPriceInput] = useState(
    filters.minPrice != null ? String(filters.minPrice) : '',
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.maxPrice != null ? String(filters.maxPrice) : '',
  );

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.productType && filters.productType !== 'all' ? 1 : 0) +
    (filters.minPrice != null || filters.maxPrice != null ? 1 : 0);

  const panel = (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 pt-4 lg:px-0 lg:pt-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-pro-warm-gray" />
          <span className="font-sans font-semibold text-sm text-pro-charcoal">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-pro-navy text-white text-[10px] rounded-full flex items-center justify-center font-sans font-medium">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs font-medium font-sans text-pro-warm-gray hover:text-pro-navy transition-colors"
            >
              Clear all
            </button>
          )}
          {onMobileClose && (
            <button onClick={onMobileClose} className="lg:hidden text-pro-warm-gray hover:text-pro-charcoal">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-0 space-y-0">
        {/* Sort */}
        <FilterGroup title="Sort by">
          <div className="space-y-1.5">
            {SORT_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  value={opt.key}
                  checked={(filters.sort ?? 'relevance') === opt.key}
                  onChange={() => onChange({ sort: opt.key })}
                  className="accent-pro-navy w-4 h-4"
                />
                <span className="text-sm font-sans text-pro-charcoal group-hover:text-pro-navy transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        {/* Category */}
        <FilterGroup title="Category">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => onChange({ category: undefined })}
                className="accent-pro-navy w-4 h-4"
              />
              <span className="text-sm font-sans text-pro-charcoal group-hover:text-pro-navy transition-colors">
                All categories
              </span>
            </label>
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat}
                  onChange={() => onChange({ category: cat })}
                  className="accent-pro-navy w-4 h-4"
                />
                <span className="text-sm font-sans text-pro-charcoal group-hover:text-pro-navy transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        {/* Product type */}
        <FilterGroup title="Product type">
          <div className="space-y-1.5">
            {PRODUCT_TYPES.map((pt) => (
              <label key={pt.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="productType"
                  checked={(filters.productType ?? 'all') === pt.key}
                  onChange={() => onChange({ productType: pt.key as SearchFilters['productType'] })}
                  className="accent-pro-navy w-4 h-4"
                />
                <span className="text-sm font-sans text-pro-charcoal group-hover:text-pro-navy transition-colors">
                  {pt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        {/* Price range */}
        <FilterGroup title="Price range" defaultOpen={false}>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-pro-warm-gray font-sans mb-1 block">Min ($)</label>
              <input
                type="number"
                min={0}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(minPriceInput);
                  onChange({ minPrice: isNaN(val) ? undefined : val });
                }}
                placeholder="0"
                className="input text-sm py-2 px-3"
              />
            </div>
            <span className="text-pro-stone mt-5">–</span>
            <div className="flex-1">
              <label className="text-xs text-pro-warm-gray font-sans mb-1 block">Max ($)</label>
              <input
                type="number"
                min={0}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(maxPriceInput);
                  onChange({ maxPrice: isNaN(val) ? undefined : val });
                }}
                placeholder="999"
                className="input text-sm py-2 px-3"
              />
            </div>
          </div>
        </FilterGroup>

        {/* Brand search (within filter) */}
        <FilterGroup title="Brand" defaultOpen={false}>
          <input
            type="text"
            placeholder="Search brands…"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="input text-sm py-2 px-3 mb-2"
          />
          {brandSearch && (
            <p className="text-xs text-pro-warm-gray font-sans">
              Use the search bar above to filter by brand name.
            </p>
          )}
        </FilterGroup>
      </div>
    </div>
  );

  // ── Mobile drawer ──────────────────────────────────────────────
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{panel}</div>

      {/* Mobile slide-in drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white z-50 overflow-y-auto shadow-modal lg:hidden animate-slide-up">
            {panel}
          </div>
        </>
      )}
    </>
  );
}
