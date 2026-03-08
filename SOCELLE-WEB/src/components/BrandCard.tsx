import { Link } from 'react-router-dom';
import { Star, Award, Truck } from 'lucide-react';

export interface BrandCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  category?: string;
  rating?: number;
  reviewCount?: number;
  isTopShop?: boolean;
  keyStat?: string;
  href: string;
}

export default function BrandCard({
  name,
  description,
  logoUrl,
  heroImageUrl,
  category,
  rating = 0,
  reviewCount = 0,
  isTopShop = false,
  keyStat,
  href,
}: BrandCardProps) {
  return (
    <Link
      to={href}
      className="
        group block bg-white rounded-xl border border-mn-surface overflow-hidden
        shadow-soft hover:shadow-panel hover:-translate-y-0.5
        transition-all duration-200
      "
    >
      {/* Hero thumbnail */}
      <div className="relative h-36 bg-mn-surface overflow-hidden">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={`${name} hero`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/10 to-signal-warn/10 flex items-center justify-center">
            <span className="font-sans text-5xl text-accent/20 select-none">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay for logo legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Top Shop badge */}
        {isTopShop && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-gold inline-flex items-center gap-1">
              <Award className="w-3 h-3" />
              Top Shop
            </span>
          </div>
        )}

        {/* Brand logo — bottom left of hero */}
        {logoUrl && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-white shadow-soft overflow-hidden border border-white/50">
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="w-full h-full object-contain p-1"
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-sans font-semibold text-lg text-graphite leading-tight group-hover:text-accent transition-colors">
            {name}
          </h3>
        </div>

        {category && (
          <p className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wide mb-2">
            {category}
          </p>
        )}

        {description && (
          <p className="text-sm font-sans text-graphite/60 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Rating row */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(rating)
                    ? 'text-signal-warn fill-signal-warn'
                    : 'text-mn-surface fill-mn-surface'
                }`}
              />
            ))}
            <span className="text-xs text-graphite/50 ml-1 font-sans">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {/* Key stat */}
        {keyStat && (
          <div className="flex items-center gap-1.5 text-xs font-sans text-graphite/50 border-t border-mn-surface pt-3 mt-1">
            <Truck className="w-3.5 h-3.5 text-signal-warn flex-shrink-0" />
            <span>{keyStat}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
