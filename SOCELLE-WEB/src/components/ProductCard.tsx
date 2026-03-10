import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import { useAuth } from '../lib/auth';
import AffiliateBadge from './commerce/AffiliateBadge';

export interface ProductCardProps {
  id: string;
  name: string;
  brandName?: string;
  imageUrl?: string | null;
  price?: number | null;
  rating?: number;
  reviewCount?: number;
  isBestseller?: boolean;
  isNew?: boolean;
  isProtocolMatch?: boolean;
  /** FTC compliance: true when SOCELLE earns a commission on this product */
  isAffiliated?: boolean;
  href?: string;
  onAddToCart?: () => void;
}

export default function ProductCard({
  name,
  brandName,
  imageUrl,
  price,
  rating = 0,
  reviewCount = 0,
  isBestseller = false,
  isNew = false,
  isProtocolMatch = false,
  isAffiliated = false,
  href,
  onAddToCart,
}: ProductCardProps) {
  const { user } = useAuth();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const inner = (
    <div className="product-card">
      {/* Image */}
      <div className="product-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="w-full h-full bg-accent-soft flex items-center justify-center">
            <span className="text-accent-soft font-sans text-4xl select-none">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Badges — top-left stack */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {isBestseller && (
            <span className="badge-bestseller">Bestseller</span>
          )}
          {isNew && !isBestseller && (
            <span className="badge-new">New</span>
          )}
          {isProtocolMatch && (
            <span className="badge badge-navy">Protocol Match</span>
          )}
        </div>

        {/* Add to cart overlay — appears on hover */}
        {onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart();
            }}
            aria-label={`Add ${name} to cart`}
            className="
              absolute bottom-0 inset-x-0
              bg-graphite/90 text-white text-xs font-medium font-sans
              py-2 flex items-center justify-center gap-1.5
              opacity-0 group-hover:opacity-100
              translate-y-full group-hover:translate-y-0
              transition-all duration-300
            "
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to cart
          </button>
        )}
      </div>

      {/* Body */}
      <div className="product-card-body">
        {brandName && (
          <p className="text-xs font-sans font-medium text-graphite/60 uppercase tracking-wide mb-1 truncate">
            {brandName}
          </p>
        )}

        <h3 className="text-sm font-sans font-medium text-graphite line-clamp-2 leading-snug mb-1">
          {name}
        </h3>

        {/* FTC affiliate disclosure badge */}
        {isAffiliated && (
          <div className="mb-1.5">
            <AffiliateBadge size="sm" />
          </div>
        )}

        {/* Star rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= Math.round(rating)
                    ? 'text-accent fill-accent'
                    : 'text-accent-soft fill-accent-soft'
                }`}
              />
            ))}
            <span className="text-xs text-graphite/60 ml-1">({reviewCount})</span>
          </div>
        )}

        {/* Gated price */}
        {user ? (
          price != null ? (
            <p className="text-sm font-semibold text-graphite font-sans">
              {formatCurrency(price)}
            </p>
          ) : (
            <p className="text-xs text-graphite/60 font-sans">Price on request</p>
          )
        ) : (
          <Link
            to="/portal/login"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium font-sans text-accent hover:text-accent-light transition-colors"
          >
            View price →
          </Link>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {inner}
      </Link>
    );
  }

  if (onAddToCart) {
    return (
      <button onClick={onAddToCart} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return inner;
}
