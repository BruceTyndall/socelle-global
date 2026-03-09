import {
  BarChart3,
  TrendingUp,
  FlaskConical,
  Building2,
  MapPin,
  Layers,
} from 'lucide-react';
import type { SignalFilterKey } from '../../lib/intelligence/types';

interface FilterOption {
  key: SignalFilterKey;
  label: string;
  icon: React.ElementType;
}

const FILTERS: FilterOption[] = [
  { key: 'all', label: 'All Signals', icon: Layers },
  { key: 'product_velocity', label: 'Product Velocity', icon: BarChart3 },
  { key: 'treatment_trend', label: 'Treatments', icon: TrendingUp },
  { key: 'ingredient_momentum', label: 'Ingredients', icon: FlaskConical },
  { key: 'brand_adoption', label: 'Brand Adoption', icon: Building2 },
  { key: 'regional', label: 'Regional', icon: MapPin },
];

interface SignalFilterProps {
  active: SignalFilterKey;
  onChange: (key: SignalFilterKey) => void;
}

export default function SignalFilter({ active, onChange }: SignalFilterProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max">
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-150 whitespace-nowrap min-h-touch ${
                isActive
                  ? 'bg-graphite text-white shadow-navy'
                  : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.10] hover:text-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
