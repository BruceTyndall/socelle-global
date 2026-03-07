import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, CheckCircle, Lock, Users, TrendingUp, Star, ShoppingCart, GraduationCap, MessageSquare, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/useCart';
import { sendNewOrderEmail } from '../../lib/emailService';
import CartDrawer from '../../components/CartDrawer';
import BlockReveal from '../../components/motion/BlockReveal';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import {
  getBrandProtocols,
} from '../../lib/intelligence/brandIntelligence';
import { useBrandIntelligence } from '../../lib/intelligence/useBrandIntelligence';
import type { BrandPeerData, ProfessionalAlsoBought } from '../../lib/intelligence/brandIntelligence';

// ── MN color constants removed — use Tailwind tokens (text-graphite, bg-mn-bg, text-accent, etc.) ──

// ── Types ────────────────────────────────────────────────────────────────────

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description?: string | null;
  logo_url?: string | null;
  hero_image_url?: string | null;
  verification_status: string | null;
  service_tier: string | null;
  website?: string | null;
  instagram_handle?: string | null;
  contact_email?: string | null;
}

interface ProProduct {
  id: string;
  product_name: string;
  category: string | null;
  msrp_price: number | null;
  wholesale_price: number | null;
  image_url?: string | null;
  is_active: boolean;
}

interface RetailProduct {
  id: string;
  product_name: string;
  category: string | null;
  msrp_price: number | null;
  retail_price: number | null;
  image_url?: string | null;
  is_active: boolean;
}

interface PressMention {
  source: string;
  headline: string;
  url?: string;
  date?: string;
  featured?: boolean;
}

interface TrustBadgeItem {
  label: string;
}

interface InstagramStats {
  followers: string;
  handle?: string;
}

function storeBrandMeta(brandId: string, name: string, slug: string) {
  try { localStorage.setItem(`brand_meta_${brandId}`, JSON.stringify({ name, slug })); } catch { /* ignore */ }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="h-16 bg-mn-dark" />
      <div className="max-w-[1120px] mx-auto px-6 py-10">
        <div className="bg-white rounded-card overflow-hidden shadow-panel">
          <div className="h-12 animate-pulse bg-mn-surface" />
          <div className="p-10 space-y-4">
            <div className="flex gap-9">
              <div className="w-[140px] h-[140px] rounded-2xl animate-pulse bg-mn-surface" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-9 w-64 rounded animate-pulse bg-mn-surface" />
                <div className="h-4 w-40 rounded animate-pulse bg-mn-surface" />
                <div className="flex gap-2 mt-2">
                  {[80, 100, 70, 90].map((w, i) => (
                    <div key={i} className="h-6 rounded-pill animate-pulse bg-mn-surface" style={{ width: w }} />
                  ))}
                </div>
                <div className="h-4 w-full max-w-lg rounded animate-pulse mt-2 bg-mn-surface" />
                <div className="h-4 w-3/4 max-w-lg rounded animate-pulse bg-mn-surface" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 border-t border-b border-graphite/[0.08] bg-mn-surface">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="py-5 flex flex-col items-center gap-2">
                <div className="h-8 w-12 rounded animate-pulse bg-graphite/[0.08]" />
                <div className="h-2.5 w-16 rounded animate-pulse bg-graphite/[0.08]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Trust Banner ──────────────────────────────────────────────────────────────

function TrustBanner({ status, brandSlug }: { status: string | null; brandSlug: string }) {
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-3 px-8 py-3 text-sm bg-signal-up/10 border-b border-signal-up/30 text-signal-up">
        <span className="bg-signal-up text-white text-[10px] font-bold tracking-wider uppercase py-1 px-3 rounded-pill font-sans">
          Verified
        </span>
        <span className="flex-1 font-sans text-signal-up">
          Verified professional brand. Wholesale ordering, education, and implementation support are active.
        </span>
      </div>
    );
  }
  if (status === 'pending_verification') {
    return (
      <div className="flex items-center gap-3 px-8 py-3 text-sm bg-mn-surface border-b border-graphite/[0.08]">
        <span className="bg-signal-warn text-white text-[10px] font-bold tracking-wider uppercase py-1 px-3 rounded-pill font-sans">
          Under Review
        </span>
        <span className="flex-1 font-sans text-graphite/60">
          This brand has applied to join Socelle and is currently being reviewed.
        </span>
      </div>
    );
  }
  // Unverified
  return (
    <div className="flex items-center gap-3 px-8 py-3 text-sm bg-mn-surface border-b border-graphite/[0.08]">
      <span className="bg-signal-warn text-white text-[10px] font-bold tracking-wider uppercase py-1 px-3 rounded-pill font-sans">
        Unverified
      </span>
      <span className="flex-1 font-sans text-graphite/60">
        This page was created from publicly available information. This brand has not yet joined Socelle.
      </span>
      <Link
        to={`/claim/brand/${brandSlug}`}
        className="text-graphite font-semibold whitespace-nowrap font-sans no-underline hover:underline"
      >
        Own this brand? Claim your page
      </Link>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function BrandHero({
  brand,
  isVerified,
  instagramStats,
}: {
  brand: BrandRow;
  isVerified: boolean;
  instagramStats: InstagramStats | null;
}) {
  const logoInitials = brand.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const tagline = brand.long_description
    ? brand.long_description.split('.')[0]
    : brand.description
      ? brand.description.split('.')[0]
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-6 sm:gap-9 py-10 px-8 lg:py-12 lg:px-10">
      {/* Logo */}
      <div className={`w-[140px] h-[140px] rounded-2xl flex-shrink-0 flex items-center justify-center border border-graphite/[0.08] font-sans font-semibold text-4xl font-medium overflow-hidden ${isVerified ? 'bg-mn-dark text-accent' : 'bg-mn-surface text-accent'}`}>
        {brand.logo_url
          ? <img src={brand.logo_url} alt={`${brand.name} brand logo`} className="w-full h-full object-contain p-3" />
          : logoInitials}
      </div>

      {/* Info */}
      <div>
        <h1 className="font-sans font-semibold text-section text-graphite tracking-tight leading-tight m-0">
          {brand.name}
        </h1>

        {tagline && (
          <p className="font-sans text-base italic text-graphite/60 mt-1">
            &ldquo;{tagline}&rdquo;
          </p>
        )}

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-[11px] font-medium font-sans px-3.5 py-1.5 rounded-pill bg-mn-surface text-graphite/60 border border-graphite/[0.04]">
            Professional Grade
          </span>
          {isVerified && (
            <>
              <span className="text-[11px] font-medium font-sans px-3.5 py-1.5 rounded-pill bg-signal-up/10 text-signal-up border border-signal-up/10">
                Verified Brand
              </span>
              <span className="text-[11px] font-medium font-sans px-3.5 py-1.5 rounded-pill bg-signal-up/10 text-signal-up border border-signal-up/10">
                Ships 24-48 hrs
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {(brand.long_description || brand.description) && (
          <p className="font-sans text-sm leading-relaxed text-graphite mt-4 max-w-[640px]">
            {brand.long_description || brand.description}
          </p>
        )}

        {/* Social links */}
        <div className="flex gap-2.5 mt-4 flex-wrap">
          {instagramStats && (
            <SocialPill
              label={`Instagram${instagramStats.followers ? `  ${instagramStats.followers}` : ''}`}
              href={instagramStats.handle ? `https://instagram.com/${instagramStats.handle.replace('@', '')}` : undefined}
              highlight={!!instagramStats.followers}
            />
          )}
          {brand.website && (
            <SocialPill
              label={brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              href={brand.website}
            />
          )}
          {brand.instagram_handle && !instagramStats && (
            <SocialPill
              label={brand.instagram_handle}
              href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SocialPill({ label, href, highlight }: { label: string; href?: string; highlight?: boolean }) {
  const base = "inline-flex items-center gap-1.5 text-xs font-medium font-sans px-3.5 py-1.5 rounded-pill bg-mn-surface border border-graphite/[0.04] transition-all text-graphite/60 no-underline hover:border-graphite/[0.12]";
  const content = highlight
    ? label.split(/\s{2,}/)
      .map((part, i) => i === 1
        ? <strong key={i} className="text-graphite">{part}</strong>
        : <span key={i}>{part}</span>
      )
    : label;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{content}</a>;
  return <span className={base}>{content}</span>;
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: { num: string; label: string }[] }) {
  return (
    <div className={`grid border-t border-b border-graphite/[0.08] bg-mn-surface`} style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
      {stats.map((s, i) => (
        <div key={i} className={`text-center py-5 px-4 relative ${i < stats.length - 1 ? 'border-r border-graphite/[0.08]' : ''}`}>
          <div className="font-sans font-semibold text-[28px] font-medium text-graphite">
            {s.num}
          </div>
          <div className="font-sans text-[10px] font-semibold uppercase tracking-[1.2px] text-graphite/40 mt-1">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function SectionHead({
  title,
  source,
  linkLabel,
  linkHref,
}: {
  title: string;
  source?: string;
  linkLabel?: string;
  linkHref?: string;
}) {
  return (
    <div className="flex justify-between items-baseline mb-4">
      <div className="flex items-center gap-2.5">
        <span className="font-sans font-semibold text-xl font-medium text-graphite">
          {title}
        </span>
        {source && (
          <span className="font-sans text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md tracking-[0.3px]">
            {source}
          </span>
        )}
      </div>
      {linkLabel && linkHref && (
        <a href={linkHref} className="font-sans text-xs font-medium text-accent no-underline tracking-[0.2px] hover:text-accent-hover transition-colors">
          {linkLabel}
        </a>
      )}
    </div>
  );
}

// ── Press Mentions ────────────────────────────────────────────────────────────

function PressMentions({ mentions, isVerified }: { mentions: PressMention[]; isVerified: boolean }) {
  if (mentions.length === 0) return null;
  return (
    <>
      <div className="pt-7 px-8 lg:px-10">
        <SectionHead
          title="In the Press"
          source={isVerified ? undefined : 'Google News'}
          linkLabel="View all"
          linkHref="#"
        />
      </div>
      <div className="flex gap-3.5 px-8 lg:px-10 pb-7 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {mentions.map((m, i) => (
          <a
            key={i}
            href={m.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-shrink-0 w-60 p-5 rounded-2xl border no-underline block transition-all hover:shadow-soft ${m.featured
              ? 'bg-signal-up/10 border-signal-up/15'
              : 'bg-white border-graphite/[0.08]'
              }`}
          >
            <div className={`font-sans text-[10px] font-bold uppercase tracking-[1px] ${m.featured ? 'text-signal-up' : 'text-graphite/40'}`}>
              {m.source}
            </div>
            <div className="font-sans font-semibold text-sm font-medium text-graphite mt-2 mb-2.5 leading-[1.45] line-clamp-3">
              {m.headline}
            </div>
            {m.date && (
              <div className="font-sans text-[11px] text-graphite/30">
                {m.date}
              </div>
            )}
          </a>
        ))}
      </div>
    </>
  );
}

// ── Industry Presence / Trust Badges ─────────────────────────────────────────

function IndustryPresence({ badges, isVerified }: { badges: TrustBadgeItem[]; isVerified: boolean }) {
  if (badges.length === 0) return null;
  return (
    <>
      <div className="pt-7 px-8 lg:px-10">
        <SectionHead title={isVerified ? 'Certifications & Industry Presence' : 'Industry Presence'} />
      </div>
      <div className="flex flex-wrap gap-2 px-8 lg:px-10 pb-7">
        {badges.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 font-sans text-[11px] font-medium tracking-[0.1px] px-4 py-2 rounded-pill bg-mn-surface text-accent border border-accent/[0.12]">
            <span className="text-signal-up font-bold">&#10003;</span>
            {b.label}
          </span>
        ))}
      </div>
    </>
  );
}

// ── Product tile ──────────────────────────────────────────────────────────────

const PRODUCT_GRADIENTS = [
  'linear-gradient(145deg, #F0EDE8, #E8E3DC)',
  'linear-gradient(145deg, #E8EDE8, #D4E0D4)',
  'linear-gradient(145deg, #EDE8DF, #E0D8CC)',
  'linear-gradient(145deg, #E8E5DF, #DDD8CF)',
  'linear-gradient(145deg, #E5E8EE, #D5D9E4)',
];

function ProductTile({
  name,
  category,
  price,
  msrp,
  type,
  showPrice,
  onAddToCart,
  index,
}: {
  name: string;
  category: string | null;
  price: number | null;
  msrp: number | null;
  type: 'pro' | 'retail';
  showPrice: boolean;
  onAddToCart?: () => void;
  index: number;
}) {
  const tierLabel = type === 'pro' ? 'PRO' : 'Retail';

  return (
    <div className="rounded-2xl overflow-hidden border border-graphite/[0.08] bg-white transition-all duration-200 cursor-pointer hover:shadow-soft hover:-translate-y-0.5">
      {/* Image */}
      <div
        className="aspect-square relative overflow-hidden flex items-center justify-center"
        style={{ background: PRODUCT_GRADIENTS[index % PRODUCT_GRADIENTS.length] }}
      >
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`font-sans text-[10px] font-semibold tracking-[0.3px] px-2 py-0.5 rounded-md ${type === 'pro'
            ? 'bg-mn-dark text-mn-bg'
            : 'bg-mn-surface text-accent'
            }`}>
            {tierLabel}
          </span>
        </div>
        {/* Warm swatch placeholder */}
        <div
          className="w-12 h-16 rounded-lg opacity-50"
          style={{ background: PRODUCT_GRADIENTS[(index + 2) % PRODUCT_GRADIENTS.length] }}
        />
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-sans text-[13px] font-semibold text-graphite leading-[1.4] m-0">
          {name}
        </p>
        {category && (
          <p className="font-sans text-[11px] text-graphite/40 mt-1">
            {category}
          </p>
        )}

        {showPrice ? (
          <div className="mt-2.5">
            <div className="font-sans font-semibold text-lg font-semibold text-graphite">
              {price != null ? `$${price.toFixed(2)}` : '\u2014'}
            </div>
            {msrp != null && (
              <div className="font-sans text-[11px] text-graphite/40 mt-0.5">
                MSRP ${msrp.toFixed(2)}
              </div>
            )}
            <span className="inline-block mt-1.5 font-sans text-[10px] font-semibold tracking-[0.3px] px-2 py-0.5 rounded-md bg-signal-up/10 text-signal-up">
              Active Tier
            </span>
            {onAddToCart && (
              <button
                onClick={onAddToCart}
                className="w-full mt-2.5 py-2.5 border-none rounded-lg font-sans text-xs font-semibold tracking-[0.3px] cursor-pointer bg-mn-dark text-mn-bg transition-colors hover:bg-graphite"
              >
                Add to Cart
              </button>
            )}
          </div>
        ) : (
          <div className="mt-2.5 flex items-center gap-1.5">
            <Lock size={10} className="text-graphite/25" />
            <span className="font-sans text-[11px] text-graphite/30">
              Pricing available when brand joins
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Verified Extras ───────────────────────────────────────────────────────────

function VerifiedExtras({ brandName }: { brandName: string }) {
  const cards: { icon: React.ElementType; title: string; desc: string }[] = [
    { icon: GraduationCap, title: 'Education Hub', desc: `Courses, certifications, and protocol-linked training from ${brandName}.` },
    { icon: MessageSquare, title: 'Direct Messaging', desc: 'Message the brand team. Start conversations linked to specific orders.' },
    { icon: Palette, title: 'Marketing Studio', desc: 'Social templates, shelf talkers, and co-branded materials.' },
  ];
  return (
    <>
      <div className="pt-7 px-8 lg:px-10">
        <SectionHead title={`More from ${brandName}`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-8 lg:px-10 pb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <BlockReveal key={i} delay={i * 80}>
              <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6 text-center transition-all hover:shadow-panel">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-accent/10 mx-auto mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="font-sans font-semibold text-[15px] font-medium text-graphite mb-1">
                  {c.title}
                </div>
                <div className="font-sans text-xs text-graphite/60 leading-[1.5]">
                  {c.desc}
                </div>
              </div>
            </BlockReveal>
          );
        })}
      </div>
    </>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function BrandCTA({
  brand,
  isVerified,
  interestCount,
}: {
  brand: BrandRow;
  isVerified: boolean;
  interestCount: number;
}) {
  return (
    <div className="py-11 px-10 bg-mn-surface border-t border-graphite/[0.08] text-center">
      <h3 className="font-sans font-semibold text-2xl font-medium text-graphite m-0">
        {isVerified ? `Ready to Carry ${brand.name}?` : `Interested in Carrying ${brand.name}?`}
      </h3>
      <p className="font-sans text-sm text-graphite/60 mt-2 max-w-[480px] mx-auto leading-relaxed">
        {isVerified
          ? 'Apply to become an authorized reseller. Unlock verified wholesale pricing, education, and implementation support.'
          : `Let us know and we'll notify you when they join Socelle and access wholesale ordering.`
        }
      </p>

      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        {isVerified ? (
          <Link
            to={`/portal/signup?apply=${brand.id}`}
            className="inline-flex items-center py-3.5 px-9 rounded-full font-sans text-sm font-semibold bg-signal-up text-white no-underline transition-all duration-200 hover:opacity-90"
          >
            Apply to Carry This Brand
          </Link>
        ) : (
          <>
            <Link
              to={`/portal/signup?interest=${brand.id}`}
              className="inline-flex items-center bg-mn-dark text-mn-bg rounded-full h-[52px] px-9 font-sans text-sm font-medium no-underline transition-colors hover:bg-graphite"
            >
              Express Interest
            </Link>
            <Link
              to={`/portal/signup?notify=${brand.id}`}
              className="inline-flex items-center rounded-full h-[52px] px-9 bg-white/65 text-graphite border border-graphite/[0.12] font-sans text-sm font-medium no-underline transition-colors hover:border-graphite"
            >
              Notify Me
            </Link>
          </>
        )}
      </div>

      {!isVerified && interestCount > 0 && (
        <p className="font-sans text-[13px] text-graphite/60 mt-4">
          <strong className="text-graphite font-semibold">{interestCount} professionals</strong> have already expressed interest
        </p>
      )}
    </div>
  );
}


// ── Brand Intelligence: Treatment Protocols Section ───────────────────────────

function TreatmentProtocolsSection({ brandSlug, brandName }: { brandSlug: string; brandName: string }) {
  const protocols = getBrandProtocols(brandSlug);
  if (protocols.length === 0) return null;

  // Tailwind class-based color map (avoids hardcoded hex in inline styles)
  const popularityClasses: Record<string, string> = {
    high: 'bg-signal-up/10 text-signal-up',
    medium: 'bg-signal-warn/10 text-signal-warn',
    low: 'bg-accent/10 text-accent',
  };

  return (
    <>
      <div className="pt-7 px-8 lg:px-10">
        <div className="flex items-center gap-2 mb-1">
          <Star size={16} className="text-accent" />
          <h3 className="font-sans font-semibold text-[17px] font-medium text-graphite m-0">
            Used in These Treatment Protocols
          </h3>
        </div>
        <p className="font-sans text-xs text-graphite/40 mb-4">
          Professional protocols featuring {brandName} products across treatment rooms
        </p>
      </div>
      <div className="grid gap-3 px-8 lg:px-10 pb-7" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {protocols.map((protocol, i) => {
          const cls = popularityClasses[protocol.popularity] || popularityClasses.medium;
          return (
            <div key={i} className="border border-graphite/[0.08] rounded-2xl p-4 bg-mn-surface transition-all hover:shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <p className="font-sans text-[13px] font-semibold text-graphite m-0 leading-[1.4]">
                  {protocol.name}
                </p>
                {protocol.popularity === 'high' && (
                  <span
                    className={`flex-shrink-0 inline-flex items-center gap-1 font-sans text-[10px] font-semibold px-2 py-0.5 rounded-pill ${cls}`}
                  >
                    Popular
                  </span>
                )}
              </div>
              <p className="font-sans text-[11px] text-graphite/40 mt-1">
                {protocol.category}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Brand Intelligence: Professionals Also Bought ─────────────────────────────
/* STATUS: LIVE/DEMO — W12-04: wired via useBrandIntelligence hook.
   Shows PREVIEW badge when falling back to mock data (isLive=false). */

function ProfessionalsAlsoBoughtSection({ alsoBought, isLive }: { alsoBought: ProfessionalAlsoBought[]; isLive: boolean }) {
  if (alsoBought.length === 0) return null;

  return (
    <>
      <div className="pt-7 px-8 lg:px-10">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart size={16} className="text-accent" />
          <h3 className="font-sans font-semibold text-[17px] font-medium text-graphite m-0">
            Professionals Also Bought
          </h3>
          {!isLive && (
            <span className="ml-auto inline-flex items-center font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Preview
            </span>
          )}
        </div>
        <p className="font-sans text-xs text-graphite/40 mb-4">
          Products commonly paired by licensed professionals in their treatment rooms
        </p>
      </div>
      <div className="grid gap-3 px-8 lg:px-10 pb-7" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {alsoBought.map((item, i) => (
          <div key={i} className="border border-graphite/[0.08] rounded-2xl p-4 bg-white transition-all hover:shadow-soft">
            <p className="font-sans text-[13px] font-semibold text-graphite m-0 leading-[1.4]">
              {item.productName}
            </p>
            <p className="font-sans text-[11px] text-graphite/40 mt-1">
              {item.brandName} &middot; {item.category}
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <div className="flex-1 h-1 rounded-full bg-graphite/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${item.adoptionPercent}%` }}
                />
              </div>
              <span className="font-sans text-[10px] font-semibold text-graphite/40 flex-shrink-0">
                {item.adoptionPercent}% of buyers
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Brand Intelligence: Peer Adoption Line ────────────────────────────────────
/* STATUS: LIVE/DEMO — W12-04: wired via useBrandIntelligence hook.
   Shows PREVIEW badge when falling back to mock data (isLive=false). */

function PeerAdoptionBanner({ peerData, trending, adoptionCount, isLive }: {
  peerData: BrandPeerData;
  trending: boolean;
  adoptionCount: number;
  isLive: boolean;
}) {
  return (
    <div className="mx-8 lg:mx-10 p-5 bg-mn-surface rounded-2xl flex items-center justify-between flex-wrap gap-4 relative">
      {!isLive && (
        <span className="absolute top-3 right-4 inline-flex items-center font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Preview
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center">
          <Users size={18} className="text-accent" />
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-graphite m-0">
            Trusted by {peerData.professionalCount.toLocaleString()} licensed professionals
          </p>
          <p className="font-sans text-xs text-graphite/40 mt-0.5">
            Most popular with {peerData.primarySegment}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {trending && (
          <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-3 py-1 rounded-pill bg-mn-dark text-mn-bg">
            <TrendingUp size={12} className="text-signal-up" />
            Trending
          </span>
        )}
        {adoptionCount > 0 && (
          <span className="font-sans text-[11px] font-medium text-graphite/40">
            +{adoptionCount} this quarter
          </span>
        )}
      </div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function SectionDivider() {
  return <div className="h-px bg-graphite/[0.08] mx-8 lg:mx-10" />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BrandStorefront() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();

  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [proProducts, setProProducts] = useState<ProProduct[]>([]);
  const [retailProducts, setRetailProducts] = useState<RetailProduct[]>([]);
  const [pressMentions, setPressMentions] = useState<PressMention[]>([]);
  const [trustBadges, setTrustBadges] = useState<TrustBadgeItem[]>([]);
  const [instagramStats, setInstagramStats] = useState<InstagramStats | null>(null);
  const [interestCount, setInterestCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pro' | 'retail'>('all');

  const [cartOpen, setCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // ── W12-04: Brand intelligence live wiring ──────────────────────────
  const brandIntel = useBrandIntelligence(slug ?? '');
  const [successOrderNumber, setSuccessOrderNumber] = useState('');

  const { items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount } = useCart(brand?.id || '');

  const isReseller = !!user && profile?.role === 'business_user';
  const showPrices = isReseller;

  useEffect(() => { if (slug) fetchBrand(); }, [slug]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: brandData, error: brandErr } = await supabase
        .from('brands')
        .select('id, name, slug, description, long_description, logo_url, hero_image_url, verification_status, service_tier, website, instagram_handle, contact_email')
        .eq('slug', slug!)
        .maybeSingle();

      if (brandErr) throw brandErr;
      if (!brandData) { setError('Brand not found.'); setLoading(false); return; }

      setBrand(brandData as BrandRow);
      storeBrandMeta(brandData.id, brandData.name, brandData.slug);

      // Fetch seed content + interest signals for all brands (verified + unverified)
      const [pressRes, badgesRes, igRes, signalsRes] = await Promise.all([
        supabase.from('brand_seed_content')
          .select('content_data, source_url, created_at')
          .eq('brand_id', brandData.id)
          .eq('content_type', 'press_mention')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('brand_seed_content')
          .select('content_type, content_data')
          .eq('brand_id', brandData.id)
          .in('content_type', ['trade_show', 'fda_registration'])
          .eq('status', 'active'),
        supabase.from('brand_seed_content')
          .select('content_data')
          .eq('brand_id', brandData.id)
          .eq('content_type', 'instagram_stats')
          .eq('status', 'active')
          .limit(1),
        supabase.from('brand_interest_signals')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brandData.id)
          .eq('signal_type', 'express_interest'),
      ]);

      // Parse press mentions
      if (pressRes.data) {
        setPressMentions(
          pressRes.data.map(r => r.content_data as PressMention)
        );
      }

      // Parse trust badges
      if (badgesRes.data && badgesRes.data.length > 0) {
        setTrustBadges(
          badgesRes.data.map(r => {
            const d = r.content_data as { name?: string; facility_name?: string; label?: string };
            return { label: d.label || d.name || d.facility_name || 'Verified' };
          })
        );
      }

      // Parse Instagram stats
      if (igRes.data && igRes.data.length > 0) {
        setInstagramStats(igRes.data[0].content_data as InstagramStats);
      }

      // Interest count
      setInterestCount(signalsRes.count ?? 0);

      // Fetch products for verified brands only
      if (brandData.verification_status === 'verified') {
        const [proRes, retailRes] = await Promise.all([
          supabase
            .from('pro_products')
            .select('id, product_name, category, msrp_price, wholesale_price, image_url, is_active')
            .eq('brand_id', brandData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('product_name'),
          supabase
            .from('retail_products')
            .select('id, product_name, category, msrp_price, retail_price, image_url, is_active')
            .eq('brand_id', brandData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('product_name'),
        ]);
        setProProducts((proRes.data || []) as ProProduct[]);
        setRetailProducts((retailRes.data || []) as RetailProduct[]);
      }
    } catch {
      setError('Failed to load brand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProToCart = (p: ProProduct) => {
    addItem({ productId: p.id, productName: p.product_name, productType: 'pro', unitPrice: p.wholesale_price ?? p.msrp_price ?? 0 });
  };
  const handleAddRetailToCart = (p: RetailProduct) => {
    addItem({ productId: p.id, productName: p.product_name, productType: 'retail', unitPrice: p.retail_price ?? p.msrp_price ?? 0 });
  };

  const handleSubmitOrder = async () => {
    if (!user || !brand || items.length === 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          brand_id: brand.id,
          business_id: profile?.business_id,
          created_by: user.id,
          status: 'submitted',
          subtotal,
          notes: orderNotes,
          commission_percent: 8,
          commission_total: subtotal * 0.08,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_type: item.productType,
        product_id: item.productId,
        product_name: item.productName,
        sku: item.sku,
        unit_price: item.unitPrice,
        qty: item.qty,
        line_total: item.unitPrice * item.qty,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      clearCart();
      setCartOpen(false);
      setOrderNotes('');
      setSuccessOrderNumber(order.order_number ?? order.id.slice(0, 8).toUpperCase());
      setShowSuccess(true);

      // Notify brand by email (best-effort)
      if (brand.contact_email) {
        let businessName = 'A retailer';
        if (profile?.business_id) {
          const { data: biz } = await supabase.from('businesses').select('name').eq('id', profile.business_id).maybeSingle();
          if (biz?.name) businessName = biz.name;
        }
        sendNewOrderEmail(brand.contact_email, {
          order_number: order.order_number ?? order.id.slice(0, 8).toUpperCase(),
          business_name: businessName,
          brand_name: brand.name,
          subtotal: order.subtotal,
        });
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived
  const allProducts = useMemo(() => [
    ...proProducts.map(p => ({ ...p, type: 'pro' as const, price: p.wholesale_price ?? p.msrp_price, msrp: p.msrp_price })),
    ...retailProducts.map(p => ({ ...p, type: 'retail' as const, price: p.retail_price ?? p.msrp_price, msrp: p.msrp_price })),
  ], [proProducts, retailProducts]);

  const filtered = useMemo(() => {
    if (activeTab === 'pro') return allProducts.filter(p => p.type === 'pro');
    if (activeTab === 'retail') return allProducts.filter(p => p.type === 'retail');
    return allProducts;
  }, [allProducts, activeTab]);

  // Unverified stats (from seed data)
  const unverifiedStats = [
    { num: String(proProducts.length + retailProducts.length || '\u2014'), label: 'Products Found' },
    { num: instagramStats?.followers || '\u2014', label: 'Instagram Followers' },
    { num: interestCount > 0 ? String(interestCount) : '\u2014', label: 'Pros Interested' },
    { num: pressMentions.length > 0 ? String(pressMentions.length) : '\u2014', label: 'Press Mentions' },
  ];

  const verifiedStats = [
    { num: String(allProducts.length), label: 'Products' },
    { num: '\u2014', label: 'Active Resellers' },
    { num: '\u2014', label: 'Platform Rating' },
    { num: '$0', label: 'Min First Order' },
  ];

  // Guards
  if (loading) return <StorefrontSkeleton />;
  if (error || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-mn-bg">
        <Helmet>
          <title>Brand Not Found | Socelle</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href="https://socelle.com/brands" />
        </Helmet>
        <div className="text-center">
          <p className="font-sans text-graphite font-medium mb-4">
            {error || 'Brand not found.'}
          </p>
          <Link to="/brands" className="inline-flex items-center gap-2 text-graphite font-sans font-medium text-sm no-underline hover:underline">
            <ArrowLeft size={16} />
            Browse all brands
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = brand.verification_status === 'verified';
  const isUnverified = !brand.verification_status || brand.verification_status === 'unverified';

  // ── SEO derived values ────────────────────────────────────────────────────
  const pageTitle = `${brand.name} — Professional Beauty Brand | Socelle`;
  const pageDesc = brand.description
    ? `${brand.name}: ${brand.description.slice(0, 130)}. Wholesale pricing and professional access on Socelle.`
    : `${brand.name} professional-grade beauty products. Wholesale pricing for licensed salons, spas, and medspas on Socelle.`;
  const canonicalUrl = `https://socelle.com/brands/${brand.slug}`;
  const ogImage = brand.logo_url || brand.hero_image_url || 'https://socelle.com/og-image.svg';

  // noindex if the brand has no meaningful content (thin page guard)
  const isThinPage = !brand.description && proProducts.length === 0 && retailProducts.length === 0;

  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    ...(brand.description && { description: brand.description }),
    url: canonicalUrl,
    ...(brand.logo_url && { logo: brand.logo_url }),
    ...(
      (brand.website || brand.instagram_handle) && {
        sameAs: [
          brand.website,
          brand.instagram_handle ? `https://instagram.com/${brand.instagram_handle.replace('@', '')}` : null,
        ].filter(Boolean),
      }
    ),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socelle.com' },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: 'https://socelle.com/brands' },
      { '@type': 'ListItem', position: 3, name: brand.name, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <MainNav />
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        {isThinPage && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${brand.name} | Socelle`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${brand.name} | Socelle`} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(brandSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* ── Nav ── */}
      <nav className="bg-mn-dark px-6 sm:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="font-sans text-[15px] font-semibold tracking-widest text-mn-bg uppercase no-underline">
          Socelle
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/brands" className="inline-flex items-center gap-1.5 text-mn-bg/55 font-sans text-[13px] no-underline hover:text-mn-bg transition-colors">
            <ArrowLeft size={14} />
            All Brands
          </Link>
          {user ? (
            <Link to="/portal/dashboard" className="text-mn-bg/55 font-sans text-[13px] no-underline hover:text-mn-bg transition-colors">
              Go to portal
            </Link>
          ) : (
            <>
              <Link to="/portal/login" className="text-mn-bg/55 font-sans text-[13px] no-underline hover:text-mn-bg transition-colors">
                Sign in
              </Link>
              <Link to="/portal/signup" className="bg-mn-bg text-graphite font-sans text-[13px] font-semibold py-2 px-5 rounded-full no-underline hover:bg-white transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 lg:py-12 pb-24">
        <div className="bg-white rounded-card shadow-panel overflow-hidden">

          {/* Trust banner */}
          <TrustBanner status={brand.verification_status} brandSlug={brand.slug} />

          {/* Hero */}
          <BrandHero brand={brand} isVerified={isVerified} instagramStats={instagramStats} />

          {/* Stats bar */}
          <StatsBar stats={isVerified ? verifiedStats : unverifiedStats} />

          {/* Press mentions */}
          <PressMentions mentions={pressMentions} isVerified={isVerified} />

          {/* Industry presence / trust badges */}
          {trustBadges.length > 0 && <SectionDivider />}
          <IndustryPresence badges={trustBadges} isVerified={isVerified} />

          {/* Products section */}
          <SectionDivider />
          <div className="pt-7 px-8 lg:px-10">
            <SectionHead
              title="Products"
              source={isUnverified ? 'Shopify Catalog' : undefined}
              linkLabel={allProducts.length > 0 ? `All ${allProducts.length} products` : undefined}
              linkHref="#"
            />

            {/* Tab bar — only for verified with products */}
            {isVerified && allProducts.length > 0 && (
              <div className="flex gap-2 mb-5">
                {([
                  { key: 'all', label: `All (${allProducts.length})` },
                  { key: 'pro', label: `PRO (${proProducts.length})` },
                  { key: 'retail', label: `Retail (${retailProducts.length})` },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-2 rounded-pill font-sans text-[13px] font-medium border transition-all duration-200 cursor-pointer ${activeTab === tab.key
                      ? 'bg-mn-dark text-mn-bg border-mn-dark'
                      : 'bg-white text-graphite/60 border-graphite/[0.08] hover:border-graphite hover:text-graphite'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product grid */}
          {(isVerified && filtered.length === 0) || (!isVerified && allProducts.length === 0 && proProducts.length === 0 && retailProducts.length === 0) ? (
            <div className="mx-8 lg:mx-10 mb-9 py-12 border border-dashed border-graphite/[0.12] rounded-2xl text-center">
              <p className="font-sans text-graphite/40">No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-8 lg:px-10 pb-9">
              {(isVerified ? filtered : allProducts.slice(0, 8)).map((p, i) => (
                <ProductTile
                  key={p.id}
                  name={p.product_name}
                  category={p.category}
                  price={p.price ?? null}
                  msrp={p.msrp ?? null}
                  type={p.type}
                  showPrice={showPrices && isVerified}
                  onAddToCart={
                    isReseller && isVerified
                      ? () => p.type === 'pro'
                        ? handleAddProToCart(p as ProProduct)
                        : handleAddRetailToCart(p as RetailProduct)
                      : undefined
                  }
                  index={i}
                />
              ))}
            </div>
          )}

          {/* Sign-up banner for guests on verified brands */}
          {!user && isVerified && allProducts.length > 0 && (
            <div className="mx-8 lg:mx-10 mb-9 bg-mn-dark rounded-card p-8 lg:p-10 text-center">
              <h2 className="font-sans font-semibold text-[22px] font-medium text-mn-bg m-0">
                Ready to order from {brand.name}?
              </h2>
              <p className="font-sans text-mn-bg/55 text-sm mt-2 leading-relaxed">
                Create a free reseller account to access wholesale pricing and place orders.
              </p>
              <Link
                to="/portal/signup"
                className="inline-flex items-center mt-5 bg-mn-bg text-graphite rounded-full h-[48px] px-8 font-sans text-sm font-medium no-underline transition-colors hover:bg-white"
              >
                Create free account
              </Link>
            </div>
          )}

          {/* Verified extras */}
          {isVerified && (
            <>
              <SectionDivider />
              <VerifiedExtras brandName={brand.name} />
            </>
          )}


          {/* ── Intelligence: Peer Adoption ── */}
          {slug && (
            <>
              <SectionDivider />
              <div className="py-6">
                <PeerAdoptionBanner
                  peerData={brandIntel.peerData}
                  trending={brandIntel.trending}
                  adoptionCount={brandIntel.adoptionCount}
                  isLive={brandIntel.isLive}
                />
              </div>
            </>
          )}

          {/* ── Intelligence: Treatment Protocols ── */}
          {slug && (
            <>
              <SectionDivider />
              <TreatmentProtocolsSection brandSlug={slug} brandName={brand.name} />
            </>
          )}

          {/* ── Intelligence: Professionals Also Bought ── */}
          {slug && (
            <>
              <SectionDivider />
              <ProfessionalsAlsoBoughtSection
                alsoBought={brandIntel.alsoBought}
                isLive={brandIntel.isLive}
              />
            </>
          )}

          {/* CTA */}
          <BrandCTA
            brand={brand}
            isVerified={isVerified}
            interestCount={interestCount}
          />
        </div>
      </div>

      {/* ── Floating cart button ── */}
      {itemCount > 0 && isReseller && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-mn-dark text-mn-bg rounded-pill py-3 px-5 border-none flex items-center gap-2 font-sans font-semibold text-sm shadow-panel cursor-pointer transition-colors hover:bg-graphite"
        >
          <ShoppingBag size={20} />
          <span>{itemCount}</span>
        </button>
      )}

      {/* ── Cart drawer ── */}
      {brand && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={items}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onSubmit={handleSubmitOrder}
          brandName={brand.name}
          notes={orderNotes}
          onNotesChange={setOrderNotes}
          submitting={submitting}
          error={submitError}
        />
      )}

      {/* ── Order success modal ── */}
      {showSuccess && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowSuccess(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-card max-w-[420px] w-full p-10 text-center shadow-panel">
              <div className="w-16 h-16 bg-signal-up/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-signal-up" />
              </div>
              <h2 className="font-sans font-semibold text-2xl font-medium text-graphite m-0">
                Order Submitted!
              </h2>
              <p className="font-sans text-graphite/40 text-sm mt-1.5">
                Order #{successOrderNumber}
              </p>
              <p className="font-sans text-graphite/60 text-sm mt-1">
                {brand.name} will be notified and confirm your order shortly.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full mt-6 bg-mn-dark text-mn-bg rounded-full h-[48px] border-none font-sans text-sm font-semibold cursor-pointer transition-colors hover:bg-graphite"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
