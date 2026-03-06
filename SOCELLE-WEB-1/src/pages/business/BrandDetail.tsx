import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, TrendingUp, CheckCircle,
  MapPin, Clock, Star, ChevronDown, ChevronUp, Lock, Users, BarChart3, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { createScopedLogger } from '../../lib/logger';
import { mapSupabaseError } from '../../lib/errors';
import BusinessNav from '../../components/BusinessNav';
import BrandPageRenderer from '../../components/BrandPageRenderer';
import BrandShop from '../../components/BrandShop';
import CartDrawer from '../../components/CartDrawer';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../lib/useCart';
import { sendNewOrderEmail } from '../../lib/emailService';
import {
  getBrandPeerData,
  getBrandReorderFrequency,
  isBrandTrending,
  getBrandAdoptionCount,
  getBrandProtocolNames,
} from '../../lib/intelligence/brandIntelligence';

const log = createScopedLogger('BrandDetail');

// ─── Local types (more specific than global) ─────────────────────────────────

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description?: string | null;
  logo_url?: string | null;
  hero_image_url?: string | null;
  contact_email?: string | null;
  status: string;
  theme?: {
    colors: { primary: string; secondary: string; accent: string; surface: string; text: string };
    typography: 'luxury' | 'modern' | 'clinical';
    density: 'spacious' | 'balanced' | 'dense';
    hero_variant: 'full_bleed' | 'split' | 'video' | 'minimal' | 'editorial';
  };
}

interface ProtocolRow {
  id: string;
  protocol_name: string;
  duration_minutes: number | null;
  description: string | null;
}

interface ProProductRow {
  id: string;
  product_name: string;
  size: string | null;
  unit_cost: number | null;
  category: string | null;
  image_url?: string | null;
}

interface RetailProductRow {
  id: string;
  product_name: string;
  size: string | null;
  retail_price: number | null;
  category: string | null;
  image_url?: string | null;
}

interface MarketingItem {
  id: string;
  event_name: string;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BrandDetailSkeleton() {
  return (
    <>
      <BusinessNav />
      {/* Hero skeleton */}
      <div className="w-full h-72 skeleton" />

      <div className="section-container py-8">
        {/* Brand header skeleton */}
        <div className="flex items-start gap-4 mb-8">
          <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-8 w-64 rounded" />
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton h-4 w-96 rounded" />
          </div>
        </div>

        {/* Tab skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton aspect-square rounded-lg" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [protocols, setProtocols] = useState<ProtocolRow[]>([]);
  const [proProducts, setProProducts] = useState<ProProductRow[]>([]);
  const [retailProducts, setRetailProducts] = useState<RetailProductRow[]>([]);
  const [marketingItems, setMarketingItems] = useState<MarketingItem[]>([]);
  const [modules, setModules] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const [cartOpen, setCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState('');

  const { items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount } = useCart(
    brand?.id || ''
  );

  useEffect(() => {
    if (slug) fetchBrandData();
  }, [slug]);

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();

      if (brandError) throw mapSupabaseError(brandError);
      if (!brandData) {
        setError('Brand not found or not active');
        setLoading(false);
        return;
      }

      setBrand(brandData as BrandRow);

      const [protocolsRes, proProductsRes, retailProductsRes, marketingRes, modulesRes] =
        await Promise.all([
          supabase
            .from('canonical_protocols')
            .select('id, protocol_name, duration_minutes, description')
            .eq('brand_id', brandData.id)
            .in('completion_status', ['steps_complete', 'fully_complete'])
            .order('protocol_name'),

          supabase
            .from('pro_products')
            .select('id, product_name, size, unit_cost, category, image_url')
            .eq('brand_id', brandData.id)
            .order('product_name'),

          supabase
            .from('retail_products')
            .select('id, product_name, size, retail_price, category, image_url')
            .eq('brand_id', brandData.id)
            .order('product_name'),

          supabase
            .from('marketing_calendar')
            .select('id, event_name, event_type, start_date, end_date, description')
            .order('start_date', { ascending: false })
            .limit(12),

          supabase
            .from('brand_page_modules')
            .select('*')
            .eq('brand_id', brandData.id)
            .eq('is_enabled', true)
            .order('sort_order', { ascending: true }),
        ]);

      if (protocolsRes.error) log.warn('Protocols query error', { error: protocolsRes.error });
      if (proProductsRes.error) log.warn('PRO products query error', { error: proProductsRes.error });
      if (retailProductsRes.error) log.warn('Retail products query error', { error: retailProductsRes.error });
      if (marketingRes.error) log.warn('Marketing query error', { error: marketingRes.error });
      if (modulesRes.error) log.warn('Modules query error', { error: modulesRes.error });

      setProtocols(protocolsRes.data || []);
      setProProducts((proProductsRes.data || []) as ProProductRow[]);
      setRetailProducts((retailProductsRes.data || []) as RetailProductRow[]);
      setMarketingItems(marketingRes.data || []);
      setModules(modulesRes.data || []);
    } catch (err) {
      log.error('Error fetching brand data', { err });
      setError('Failed to load brand details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user || !brand || items.length === 0) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const orderData = {
        brand_id: brand.id,
        business_id: profile?.business_id,
        created_by: user.id,
        status: 'submitted',
        subtotal,
        notes: orderNotes,
        commission_percent: 8,
        commission_total: subtotal * 0.08,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_type: item.productType,
        product_id: item.productId,
        product_name: item.productName,
        sku: item.sku,
        unit_price: item.unitPrice,
        qty: item.qty,
        line_total: item.unitPrice * item.qty,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setCartOpen(false);
      setOrderNotes('');
      setSuccessOrderNumber(order.order_number ?? order.id.slice(0, 8).toUpperCase());
      setShowSuccessModal(true);

      // Notify brand by email (best-effort)
      const brandEmail = (brand as BrandRow).contact_email;
      if (brandEmail) {
        let businessName = 'A retailer';
        if (profile?.business_id) {
          const { data: biz } = await supabase.from('businesses').select('name').eq('id', profile.business_id).maybeSingle();
          if (biz?.name) businessName = biz.name;
        }
        sendNewOrderEmail(brandEmail, {
          order_number: order.order_number ?? order.id.slice(0, 8).toUpperCase(),
          business_name: businessName,
          brand_name: brand.name,
          subtotal: order.subtotal,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit order. Please try again.';
      log.error('Error submitting order', { err });
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived state ──────────────────────────────────────────────

  const allProducts = useMemo(() => {
    const pro = proProducts.map((p) => ({
      id: p.id,
      name: p.product_name,
      imageUrl: p.image_url,
      price: p.unit_cost,
      category: p.category,
      type: 'pro' as const,
    }));
    const retail = retailProducts.map((p) => ({
      id: p.id,
      name: p.product_name,
      imageUrl: p.image_url,
      price: p.retail_price,
      category: p.category,
      type: 'retail' as const,
    }));
    return [...pro, ...retail];
  }, [proProducts, retailProducts]);

  const categories = useMemo(() => {
    const cats = new Set(allProducts.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return allProducts;
    if (activeTab === 'pro') return allProducts.filter((p) => p.type === 'pro');
    if (activeTab === 'retail') return allProducts.filter((p) => p.type === 'retail');
    return allProducts.filter((p) => p.category === activeTab);
  }, [allProducts, activeTab]);

  // ── Render guards ──────────────────────────────────────────────

  if (loading) return <BrandDetailSkeleton />;

  if (error || !brand) {
    return (
      <>
        <BusinessNav />
        <div className="section-container py-16">
          <div className="max-w-md mx-auto text-center">
            <p className="text-pro-charcoal font-medium mb-2">{error || 'Brand not found'}</p>
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 text-pro-gold hover:text-pro-gold-light font-medium font-sans text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Brands
            </Link>
          </div>
        </div>
      </>
    );
  }

  const defaultTheme = {
    colors: { primary: '#1E3A5F', secondary: '#6B6560', accent: '#C5A572', surface: '#F5F1EC', text: '#2D2D2D' },
    typography: 'luxury' as const,
    density: 'spacious' as const,
    hero_variant: 'full_bleed' as const,
  };

  const hasCustomPage = modules.length > 0;
  const longDesc = brand.long_description ?? brand.description ?? '';
  const ABOUT_CLAMP = 280;
  const showReadMore = longDesc.length > ABOUT_CLAMP;

  // ── Tabs ──
  const tabs: Array<{ key: string; label: string }> = [
    { key: 'all', label: `All (${allProducts.length})` },
    { key: 'pro', label: `Pro (${proProducts.length})` },
    { key: 'retail', label: `Retail (${retailProducts.length})` },
    ...categories.map((c) => ({ key: c, label: c })),
  ];

  return (
    <>
      <BusinessNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative w-full h-64 sm:h-80 bg-pro-navy overflow-hidden">
        {brand.hero_image_url ? (
          <img
            src={brand.hero_image_url}
            alt={`${brand.name} hero`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pro-navy via-pro-navy-dark to-pro-navy" />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

        {/* Back link */}
        <div className="absolute top-4 left-4">
          <Link
            to="/portal"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium font-sans bg-black/20 hover:bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All brands
          </Link>
        </div>

        {/* Brand identity — bottom of hero */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-4">
          {brand.logo_url && (
            <div className="w-16 h-16 rounded-xl bg-white shadow-modal overflow-hidden flex-shrink-0 border-2 border-white/20">
              <img
                src={brand.logo_url}
                alt={`${brand.name} logo`}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl text-white leading-tight">
                {brand.name}
              </h1>
              <span className="badge badge-gold inline-flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-current" />
                Verified Pro
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs font-sans">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Professional Grade
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Ships in 2–5 days
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                {allProducts.length} products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Unlock pricing bar (guests only) ──────────────────────── */}
      {!user && (
        <div className="bg-pro-navy-dark text-white py-3 px-4 text-center font-sans text-sm">
          <Lock className="w-4 h-4 inline-block mr-1.5 text-pro-gold" />
          <span className="text-white/80">Unlock wholesale pricing and ordering — </span>
          <Link
            to="/portal/login"
            className="text-pro-gold font-semibold hover:text-pro-gold-light transition-colors underline underline-offset-2"
          >
            Sign in free
          </Link>
        </div>
      )}

      {/* ── Main layout ───────────────────────────────────────────── */}
      <div className="section-container py-8">

        {/* About section */}
        {longDesc && (
          <div className="mb-8 max-w-3xl">
            <h2 className="font-serif text-xl text-pro-navy mb-3">About {brand.name}</h2>
            <p className="font-sans text-pro-warm-gray text-sm leading-relaxed">
              {showReadMore && !aboutExpanded
                ? longDesc.slice(0, ABOUT_CLAMP) + '…'
                : longDesc}
            </p>
            {showReadMore && (
              <button
                onClick={() => setAboutExpanded((x) => !x)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium font-sans text-pro-navy hover:text-pro-gold transition-colors"
              >
                {aboutExpanded ? (
                  <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Read more <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Custom brand page modules */}
        {hasCustomPage && (
          <div className="mb-10">
            <BrandPageRenderer
              brand={{
                name: brand.name,
                slug: brand.slug,
                description: brand.description || '',
                long_description: brand.long_description,
                logo_url: brand.logo_url,
                hero_image_url: brand.hero_image_url,
                theme: brand.theme ?? defaultTheme,
              }}
              modules={modules as Parameters<typeof BrandPageRenderer>[0]['modules']}
              protocols={
                protocols.map((p) => ({
                  ...p,
                  name: p.protocol_name,
                  duration: p.duration_minutes ? `${p.duration_minutes} min` : undefined,
                })) as any
              }
              products={{
                pro: proProducts as any,
                retail: retailProducts as any,
              }}
            />
          </div>
        )}

        {/* ── Product section ───────────────────────────────────── */}
        <div>
          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150
                  ${activeTab === tab.key
                    ? 'bg-pro-navy text-white border-pro-navy'
                    : 'bg-white text-pro-warm-gray border-pro-stone hover:border-pro-navy hover:text-pro-navy'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-pro-stone rounded-xl">
              <ShoppingBag className="w-12 h-12 text-pro-stone mx-auto mb-3" />
              <p className="font-sans text-pro-warm-gray">No products in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  brandName={brand.name}
                  imageUrl={product.imageUrl}
                  price={product.price}
                  onAddToCart={
                    user
                      ? () =>
                          addItem({
                            productId: product.id,
                            productName: product.name,
                            productType: product.type,
                            unitPrice: product.price ?? 0,
                            sku: undefined,
                          })
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ── CTA Banner ────────────────────────────────────────── */}
        <div className="mt-16 bg-pro-navy rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3">
            See how {brand.name} fits your service menu
          </h2>
          <p className="font-sans text-white/70 mb-6 max-w-2xl mx-auto text-sm leading-relaxed">
            Upload your service menu and get personalized protocol-to-product matching, gap analysis,
            and implementation support tailored to your business.
          </p>
          <button
            onClick={() => navigate(`/portal/plans/new?brand=${brand.id}`)}
            className="btn-gold inline-flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Upload menu &amp; see brand fit
          </button>
        </div>

        {/* ── Full Shop (BrandShop component) ──────────────────── */}
        <div className="mt-16 border-t border-pro-stone pt-12">
          <h2 className="font-serif text-2xl text-pro-navy mb-6">
            Shop {brand.name}
          </h2>
          <BrandShop
            brandId={brand.id}
            brandName={brand.name}
            brandTheme={brand.theme}
            userRole={profile?.role || 'anon'}
            onAddToCart={addItem}
          />
        </div>

        {/* Protocols panel (condensed) */}
        {protocols.length > 0 && (
          <div className="mt-12 border-t border-pro-stone pt-10">
            <h2 className="font-serif text-xl text-pro-navy mb-4">
              {protocols.length} Supported Protocols
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {protocols.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 p-4 bg-pro-cream rounded-lg border border-pro-stone"
                >
                  <div className="w-1 h-full bg-pro-gold rounded-full flex-shrink-0 self-stretch" />
                  <div className="min-w-0">
                    <p className="font-sans font-medium text-pro-charcoal text-sm leading-snug">
                      {p.protocol_name}
                    </p>
                    {p.duration_minutes && (
                      <p className="text-xs text-pro-warm-gray mt-0.5">{p.duration_minutes} min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketing events (condensed) */}
        {marketingItems.length > 0 && (
          <div className="mt-12 border-t border-pro-stone pt-10 mb-16">
            <h2 className="font-serif text-xl text-pro-navy mb-4">Upcoming Events &amp; Education</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {marketingItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-pro-cream rounded-lg border border-pro-stone"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-sans font-medium text-pro-charcoal text-sm leading-snug">
                      {item.event_name}
                    </p>
                    {item.event_type && (
                      <span className="badge badge-navy text-xs flex-shrink-0">{item.event_type}</span>
                    )}
                  </div>
                  {item.start_date && (
                    <p className="text-xs text-pro-warm-gray font-sans">
                      {new Date(item.start_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Intelligence for This Brand ──────────────────────────── */}
        {slug && (
          <div className="mt-12 border-t border-pro-stone pt-10 mb-16">
            <div className="bg-pro-charcoal text-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-pro-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-white m-0">Intelligence for This Brand</h2>
                  <p className="text-xs text-white/50 font-sans mt-0.5">Powered by Socelle Market Intelligence</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Peer comparison */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-pro-gold" />
                    <span className="text-xs font-sans font-semibold text-white/70 uppercase tracking-wide">Peer Comparison</span>
                  </div>
                  <p className="text-sm font-sans text-white leading-relaxed">
                    {getBrandPeerData(slug).peerRecommendation}
                  </p>
                  <p className="text-xs font-sans text-white/40 mt-2">
                    Based on {getBrandPeerData(slug).professionalCount.toLocaleString()} professional accounts
                  </p>
                </div>

                {/* Reorder frequency */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-pro-gold" />
                    <span className="text-xs font-sans font-semibold text-white/70 uppercase tracking-wide">Reorder Cadence</span>
                  </div>
                  <p className="text-2xl font-serif text-white mb-1">
                    {getBrandReorderFrequency(slug).frequencyLabel}
                  </p>
                  <p className="text-xs font-sans text-white/50 leading-relaxed">
                    Avg every {getBrandReorderFrequency(slug).avgDaysBetweenOrders} days &middot; Top reorder: {getBrandReorderFrequency(slug).topReorderCategory}
                  </p>
                  <p className="text-xs font-sans text-white/30 mt-1">
                    {getBrandReorderFrequency(slug).autoReorderPercent}% of accounts auto-reorder
                  </p>
                </div>

                {/* Trending + Adoption */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-pro-gold" />
                    <span className="text-xs font-sans font-semibold text-white/70 uppercase tracking-wide">Market Momentum</span>
                  </div>
                  {isBrandTrending(slug) ? (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-intel-up/20 text-intel-up text-xs font-sans font-bold rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-sans text-white/70 mb-2">Stable demand</p>
                  )}
                  <p className="text-sm font-sans text-white leading-relaxed">
                    +{getBrandAdoptionCount(slug)} spas added this quarter
                  </p>
                  <p className="text-xs font-sans text-white/40 mt-1">
                    {getBrandPeerData(slug).peerAdoptionPercent}% of {getBrandPeerData(slug).primarySegment.toLowerCase()} stock this brand
                  </p>
                </div>
              </div>

              {/* Protocol names preview */}
              {getBrandProtocolNames(slug).length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-sans font-semibold text-white/50 uppercase tracking-wide mb-2">
                    Supported Treatment Protocols
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getBrandProtocolNames(slug).map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/8 text-white/80 text-xs font-sans rounded-full border border-white/10"
                      >
                        <Star className="w-3 h-3 text-pro-gold" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating cart button ───────────────────────────────────── */}
      {itemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-pro-navy text-white rounded-full px-5 py-3 shadow-navy hover:bg-pro-navy-dark transition-colors flex items-center gap-2 z-40"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-sans font-semibold text-sm">{itemCount}</span>
        </button>
      )}

      {/* ── Cart drawer ───────────────────────────────────────────── */}
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

      {/* ── Order success modal ───────────────────────────────────── */}
      {showSuccessModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-pro-gold-pale rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-pro-gold" />
              </div>
              <h2 className="font-serif text-2xl text-pro-navy mb-2">Order Submitted!</h2>
              <p className="font-sans text-pro-warm-gray text-sm mb-1">
                Order #{successOrderNumber}
              </p>
              <p className="font-sans text-pro-warm-gray text-sm mb-6">
                Our team will review and confirm your order shortly.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="btn-primary w-full"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
