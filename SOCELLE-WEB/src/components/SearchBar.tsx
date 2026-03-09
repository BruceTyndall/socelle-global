import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { getSearchSuggestions } from '../lib/searchService';

interface SearchBarProps {
  /** Initial value — useful when the bar lives on a search results page */
  defaultValue?: string;
  onSearch?: (query: string) => void;
  /** If true, navigate to /brands?q= on submit instead of calling onSearch */
  navigateOnSubmit?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SearchBar({
  defaultValue = '',
  onSearch,
  navigateOnSubmit = false,
  placeholder = 'Search brands and products…',
  className = '',
  size = 'md',
}: SearchBarProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update value if defaultValue changes (e.g. URL-driven)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Debounced suggestion fetch
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    const results = await getSearchSuggestions(q);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setLoadingSuggestions(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    setActiveSuggestion(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 280);
  };

  const handleSubmit = (query: string) => {
    setShowSuggestions(false);
    setValue(query);
    if (navigateOnSubmit) {
      navigate(`/brands?q=${encodeURIComponent(query)}`);
    } else {
      onSearch?.(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSubmit(value);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        handleSubmit(suggestions[activeSuggestion]);
      } else {
        handleSubmit(value);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm py-2 pl-9 pr-9',
    md: 'text-sm py-3 pl-10 pr-10',
    lg: 'text-base py-4 pl-12 pr-12',
  }[size];

  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const iconOffset = size === 'lg' ? 'left-3.5' : 'left-3';

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className={`absolute ${iconOffset} top-1/2 -translate-y-1/2 pointer-events-none`}>
        {loadingSuggestions ? (
          <Loader2 className={`${iconSize} text-graphite/60 animate-spin`} />
        ) : (
          <Search className={`${iconSize} text-graphite/60`} />
        )}
      </div>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className={`
          input ${sizeClasses}
          focus:ring-2 focus:ring-graphite/10 focus:border-graphite
        `}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => { setValue(''); onSearch?.(''); setSuggestions([]); inputRef.current?.focus(); }}
          className={`absolute ${size === 'lg' ? 'right-3.5' : 'right-3'} top-1/2 -translate-y-1/2 text-graphite/60 hover:text-graphite transition-colors`}
          aria-label="Clear search"
        >
          <X className={iconSize} />
        </button>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-accent-soft rounded-lg shadow-dropdown overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={s}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSubmit(s)}
                className={`
                  w-full text-left px-4 py-2.5 text-sm font-sans flex items-center gap-2.5
                  hover:bg-accent-soft transition-colors
                  ${i === activeSuggestion ? 'bg-accent-soft text-graphite' : 'text-graphite'}
                `}
              >
                <Search className="w-3.5 h-3.5 text-graphite/60 flex-shrink-0" />
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
