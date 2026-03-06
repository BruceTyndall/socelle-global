// ── LocationSwitcher — Portal Header Dropdown ─────────────────────────
// WO-22: Only renders for multi-location operators. Single-location = invisible.

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Building2 } from 'lucide-react';
import { useLocationContext } from '../../lib/locations/useLocationContext';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  medspa: 'MedSpa',
  day_spa: 'Day Spa',
  salon: 'Salon',
  esthetician_studio: 'Studio',
  clinic: 'Clinic',
};

export default function LocationSwitcher() {
  const { isMultiLocation, selectedLocationId, setSelectedLocation, currentLocations, selectedLocation } =
    useLocationContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Single-location operators see nothing
  if (!isMultiLocation) return null;

  const displayName = selectedLocation ? selectedLocation.locationName : 'All Locations';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-pro-stone bg-white hover:bg-pro-cream transition-colors text-sm font-sans"
      >
        <MapPin className="w-4 h-4 text-pro-gold" />
        <span className="text-pro-charcoal font-medium max-w-[180px] truncate">{displayName}</span>
        <ChevronDown className={`w-4 h-4 text-pro-warm-gray transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-pro-stone z-50 overflow-hidden">
          {/* All Locations option */}
          <button
            onClick={() => {
              setSelectedLocation('all');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              selectedLocationId === 'all'
                ? 'bg-pro-cream text-pro-navy font-medium'
                : 'text-pro-charcoal hover:bg-pro-ivory'
            }`}
          >
            <Building2 className="w-4 h-4 text-pro-gold flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-medium">All Locations</div>
              <div className="text-xs text-pro-warm-gray">{currentLocations.length} locations</div>
            </div>
            {selectedLocationId === 'all' && <Check className="w-4 h-4 text-pro-gold flex-shrink-0" />}
          </button>

          <div className="border-t border-pro-stone" />

          {/* Individual locations */}
          {currentLocations.map((loc) => {
            const isSelected = selectedLocationId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isSelected
                    ? 'bg-pro-cream text-pro-navy font-medium'
                    : 'text-pro-charcoal hover:bg-pro-ivory'
                }`}
              >
                <MapPin className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-pro-gold' : 'text-pro-warm-gray'}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{loc.locationName}</div>
                  <div className="text-xs text-pro-warm-gray">
                    {loc.city}, {loc.state} &middot; {BUSINESS_TYPE_LABELS[loc.businessType] ?? loc.businessType}
                  </div>
                </div>
                {loc.isPrimary && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-pro-gold bg-pro-gold/10 px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
                {isSelected && <Check className="w-4 h-4 text-pro-gold flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
