import { useEffect, useState } from 'react';
import {
  Search, Plus, Package, Star, Edit2, AlertCircle,
  RefreshCw, DollarSign, Layers,
} from 'lucide-react';
import {
  StatCard, Badge, Input, Button, EmptyState,
  Modal, ModalBody, ModalFooter,
} from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductType = 'PRO' | 'Retail';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  type: ProductType;
  category: string | null;
  size: string | null;
  keyIngredients: string[];
  msrp: number | null;
  wholesale: number | null;
  stock: number | null;
  active: boolean;
  bestseller: boolean;
  function: string | null;
}

interface TieredPricing {
  activeTierPrice: string;
  activeTierMinQty: string;
  eliteTierPrice: string;
  eliteTierMinQty: string;
  masterTierPrice: string;
  masterTierMinQty: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Cleansers', 'Toners', 'Serums', 'Moisturizers', 'Sunscreen',
  'Treatments', 'Masks', 'Exfoliants', 'Eye Care', 'Body Care',
  'Hair Care', 'Scalp Care', 'Color', 'Tools & Accessories', 'Other',
];

const EMPTY_TIERED: TieredPricing = {
  activeTierPrice: '', activeTierMinQty: '1',
  eliteTierPrice: '',  eliteTierMinQty: '1',
  masterTierPrice: '', masterTierMinQty: '1',
};

const TIER_COLORS: Record<string, string> = {
  active: 'bg-blue-400',
  elite:  'bg-pro-gold',
  master: 'bg-purple-400',
};

const FIELD_CLS =
  'w-full px-4 py-2.5 rounded-xl border border-pro-stone bg-white font-sans text-sm ' +
  'text-pro-charcoal placeholder:text-pro-warm-gray/60 focus:outline-none focus:ring-2 ' +
  'focus:ring-pro-navy/15 focus:border-pro-navy transition-colors disabled:opacity-50';

// ─── ProductFormModal ─────────────────────────────────────────────────────────

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editProduct: Product | null;
  brandId: string;
}

function ProductFormModal({ open, onClose, onSaved, editProduct, brandId }: ProductFormModalProps) {
  const isEdit = !!editProduct;

  // Form fields
  const [type, setType]                   = useState<ProductType>('PRO');
  const [name, setName]                   = useState('');
  const [sku, setSku]                     = useState('');
  const [category, setCategory]           = useState('');
  const [size, setSize]                   = useState('');
  const [productFn, setProductFn]         = useState('');
  const [ingredients, setIngredients]     = useState('');
  const [msrpPrice, setMsrpPrice]         = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [stockCount, setStockCount]       = useState('0');
  const [isActive, setIsActive]           = useState(true);
  const [isBestseller, setIsBestseller]   = useState(false);
  const [tiered, setTiered]               = useState<TieredPricing>(EMPTY_TIERED);

  // UI state
  const [saving, setSaving]               = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Populate / reset form when modal opens
  useEffect(() => {
    if (!open) return;
    setError(null);

    if (editProduct) {
      setType(editProduct.type);
      setName(editProduct.name);
      setSku(editProduct.sku ?? '');
      setCategory(editProduct.category ?? '');
      setSize(editProduct.size ?? '');
      setProductFn(editProduct.function ?? '');
      setIngredients(editProduct.keyIngredients?.join(', ') ?? '');
      setMsrpPrice(editProduct.msrp?.toString() ?? '');
      setWholesalePrice(editProduct.wholesale?.toString() ?? '');
      setStockCount(editProduct.stock?.toString() ?? '0');
      setIsActive(editProduct.active);
      setIsBestseller(editProduct.bestseller);
      fetchTieredPricing(editProduct.id, editProduct.type);
    } else {
      setType('PRO');
      setName(''); setSku(''); setCategory(''); setSize('');
      setProductFn(''); setIngredients('');
      setMsrpPrice(''); setWholesalePrice('');
      setStockCount('0'); setIsActive(true); setIsBestseller(false);
      setTiered(EMPTY_TIERED);
    }
  }, [open, editProduct]);

  const fetchTieredPricing = async (productId: string, productType: ProductType) => {
    setLoadingPricing(true);
    setTiered(EMPTY_TIERED);
    try {
      const { data } = await supabase
        .from('product_pricing')
        .select('tier, price, min_qty')
        .eq('product_id', productId)
        .eq('product_type', productType === 'PRO' ? 'pro' : 'retail')
        .eq('is_active', true);

      if (data) {
        const map: Record<string, { price: number; min_qty: number }> = {};
        data.forEach(r => { map[r.tier] = { price: r.price, min_qty: r.min_qty }; });
        setTiered({
          activeTierPrice: map['active']?.price?.toString()   ?? '',
          activeTierMinQty: map['active']?.min_qty?.toString() ?? '1',
          eliteTierPrice:  map['elite']?.price?.toString()    ?? '',
          eliteTierMinQty: map['elite']?.min_qty?.toString()  ?? '1',
          masterTierPrice: map['master']?.price?.toString()   ?? '',
          masterTierMinQty: map['master']?.min_qty?.toString() ?? '1',
        });
      }
    } finally {
      setLoadingPricing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim())    { setError('Product name is required.');                return; }
    if (!productFn.trim()) { setError('Product function / description is required.'); return; }
    setSaving(true);
    setError(null);

    try {
      const table = type === 'PRO' ? 'pro_products' : 'retail_products';
      const productData = {
        brand_id:        brandId,
        product_name:    name.trim(),
        product_function: productFn.trim(),
        sku:             sku.trim()       || null,
        category:        category         || null,
        size:            size.trim()      || null,
        key_ingredients: ingredients
          ? ingredients.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        msrp_price:      msrpPrice     ? parseFloat(msrpPrice)     : null,
        wholesale_price: wholesalePrice ? parseFloat(wholesalePrice) : null,
        stock_count:     parseInt(stockCount) || 0,
        is_active:       isActive,
        is_bestseller:   isBestseller,
      };

      let productId: string;

      if (isEdit) {
        const { error: err } = await supabase.from(table).update(productData).eq('id', editProduct!.id);
        if (err) throw err;
        productId = editProduct!.id;
      } else {
        const { data, error: err } = await supabase.from(table).insert(productData).select('id').single();
        if (err) throw err;
        productId = data.id;
      }

      // Upsert tiered pricing rows
      const productTypeStr = type === 'PRO' ? 'pro' : 'retail';
      const pricingRows: Array<{
        product_id: string; product_type: string; brand_id: string;
        tier: string; price: number; min_qty: number; is_active: boolean; currency: string;
      }> = [];

      const addRow = (tier: string, priceStr: string, minQtyStr: string) => {
        if (!priceStr) return;
        pricingRows.push({
          product_id:   productId,
          product_type: productTypeStr,
          brand_id:     brandId,
          tier,
          price:   parseFloat(priceStr),
          min_qty: parseInt(minQtyStr) || 1,
          is_active: true,
          currency: 'usd',
        });
      };

      addRow('msrp',   msrpPrice,              '1');
      addRow('active', tiered.activeTierPrice,  tiered.activeTierMinQty);
      addRow('elite',  tiered.eliteTierPrice,   tiered.eliteTierMinQty);
      addRow('master', tiered.masterTierPrice,  tiered.masterTierMinQty);

      if (pricingRows.length > 0) {
        const { error: pricingErr } = await supabase
          .from('product_pricing')
          .upsert(pricingRows, { onConflict: 'product_id,product_type,tier' });
        if (pricingErr) throw pricingErr;
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="xl">
      <ModalBody className="space-y-6">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-sans text-sm">{error}</p>
          </div>
        )}

        {/* ── Product Details ─────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-pro-warm-gray uppercase tracking-wider font-sans mb-4">
            Product Details
          </h3>

          {/* Type toggle */}
          <div className="flex gap-2 mb-5">
            {(['PRO', 'Retail'] as ProductType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
                  type === t
                    ? 'bg-pro-navy text-white'
                    : 'border border-pro-stone text-pro-warm-gray hover:text-pro-charcoal'
                }`}
              >
                {t === 'PRO' ? 'PRO (Professional Use)' : 'Retail (Resale)'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              label="Product Name"
              placeholder="e.g. Hydrating Peptide Serum"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SKU"
                placeholder="e.g. HPS-50ML"
                value={sku}
                onChange={e => setSku(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={FIELD_CLS}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <Input
              label="Size / Volume"
              placeholder="e.g. 50ml, 4 oz, 1.7 fl oz"
              value={size}
              onChange={e => setSize(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Product Function / Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe what this product does, who it's for, and how it's used…"
                value={productFn}
                onChange={e => setProductFn(e.target.value)}
                rows={3}
                className={`${FIELD_CLS} resize-none`}
              />
            </div>

            <Input
              label="Key Ingredients"
              placeholder="Hyaluronic Acid, Niacinamide, Peptides"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              hint="Separate ingredients with commas"
            />
          </div>
        </section>

        <hr className="border-pro-stone" />

        {/* ── Pricing ────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-pro-warm-gray uppercase tracking-wider font-sans mb-4">
            Pricing
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input
              label="MSRP (Consumer Price)"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={msrpPrice}
              onChange={e => setMsrpPrice(e.target.value)}
              iconLeft={<DollarSign className="w-4 h-4" />}
              hint="Suggested retail price shown to consumers"
            />
            <Input
              label="Base Wholesale Price"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={wholesalePrice}
              onChange={e => setWholesalePrice(e.target.value)}
              iconLeft={<DollarSign className="w-4 h-4" />}
              hint="Fallback if no tier pricing is set"
            />
          </div>

          {/* Tiered pricing grid */}
          <div className="bg-pro-ivory/60 rounded-xl border border-pro-stone/50 p-4">
            <p className="text-xs font-semibold text-pro-charcoal font-sans mb-0.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pro-warm-gray" />
              Tiered Wholesale Pricing
            </p>
            <p className="text-xs text-pro-warm-gray font-sans mb-4">
              Set prices for each reseller tier. Leave blank to fall back to base wholesale.
            </p>

            {loadingPricing ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-10 bg-pro-stone/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Column headers */}
                <div className="grid grid-cols-[100px_1fr_1fr] gap-3">
                  <div />
                  <p className="text-xs font-medium text-pro-warm-gray font-sans text-center">
                    Price / Unit
                  </p>
                  <p className="text-xs font-medium text-pro-warm-gray font-sans text-center">
                    Min. Order Qty
                  </p>
                </div>

                {/* Active */}
                <div className="grid grid-cols-[100px_1fr_1fr] gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${TIER_COLORS.active}`} />
                    <span className="text-sm font-medium text-pro-charcoal font-sans">Active</span>
                  </div>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={tiered.activeTierPrice}
                    onChange={e => setTiered(t => ({ ...t, activeTierPrice: e.target.value }))}
                    className={FIELD_CLS}
                  />
                  <input
                    type="number" min="1" placeholder="1"
                    value={tiered.activeTierMinQty}
                    onChange={e => setTiered(t => ({ ...t, activeTierMinQty: e.target.value }))}
                    className={FIELD_CLS}
                  />
                </div>

                {/* Elite */}
                <div className="grid grid-cols-[100px_1fr_1fr] gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${TIER_COLORS.elite}`} />
                    <span className="text-sm font-medium text-pro-charcoal font-sans">Elite</span>
                  </div>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={tiered.eliteTierPrice}
                    onChange={e => setTiered(t => ({ ...t, eliteTierPrice: e.target.value }))}
                    className={FIELD_CLS}
                  />
                  <input
                    type="number" min="1" placeholder="1"
                    value={tiered.eliteTierMinQty}
                    onChange={e => setTiered(t => ({ ...t, eliteTierMinQty: e.target.value }))}
                    className={FIELD_CLS}
                  />
                </div>

                {/* Master */}
                <div className="grid grid-cols-[100px_1fr_1fr] gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${TIER_COLORS.master}`} />
                    <span className="text-sm font-medium text-pro-charcoal font-sans">Master</span>
                  </div>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={tiered.masterTierPrice}
                    onChange={e => setTiered(t => ({ ...t, masterTierPrice: e.target.value }))}
                    className={FIELD_CLS}
                  />
                  <input
                    type="number" min="1" placeholder="1"
                    value={tiered.masterTierMinQty}
                    onChange={e => setTiered(t => ({ ...t, masterTierMinQty: e.target.value }))}
                    className={FIELD_CLS}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <hr className="border-pro-stone" />

        {/* ── Inventory ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-pro-warm-gray uppercase tracking-wider font-sans mb-4">
            Inventory
          </h3>
          <div className="space-y-4">
            <Input
              label="Stock Count"
              type="number"
              min="0"
              placeholder="0"
              value={stockCount}
              onChange={e => setStockCount(e.target.value)}
            />
            <div className="flex items-center gap-6">
              <Toggle
                enabled={isActive}
                onToggle={() => setIsActive(v => !v)}
                activeColor="bg-green-500"
                label="Active"
                sub="Visible to resellers"
              />
              <Toggle
                enabled={isBestseller}
                onToggle={() => setIsBestseller(v => !v)}
                activeColor="bg-pro-gold"
                label="Bestseller"
                sub="Shows badge on storefront"
              />
            </div>
          </div>
        </section>

      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          {isEdit ? 'Save Changes' : 'Add Product'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Toggle helper ────────────────────────────────────────────────────────────

function Toggle({
  enabled, onToggle, activeColor, label, sub,
}: {
  enabled: boolean;
  onToggle: () => void;
  activeColor: string;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2.5 select-none"
    >
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${
          enabled ? activeColor : 'bg-pro-stone'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-sm font-medium font-sans text-pro-charcoal">{label}</span>
      <span className="text-xs text-pro-warm-gray font-sans">{sub}</span>
    </button>
  );
}

// ─── BrandProducts page ───────────────────────────────────────────────────────

export default function BrandProducts() {
  const { brandId } = useAuth();
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState<'all' | ProductType>('all');
  const [showInactive, setShowInactive]   = useState(false);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editProduct, setEditProduct]     = useState<Product | null>(null);

  useEffect(() => {
    if (brandId) fetchProducts();
    else setLoading(false);
  }, [brandId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [proRes, retailRes] = await Promise.all([
        supabase
          .from('pro_products')
          .select(
            'id, product_name, product_function, sku, category, size, key_ingredients, ' +
            'msrp_price, wholesale_price, stock_count, is_active, is_bestseller'
          )
          .eq('brand_id', brandId!)
          .order('sort_order')
          .order('product_name'),

        supabase
          .from('retail_products')
          .select(
            'id, product_name, product_function, sku, category, size, key_ingredients, ' +
            'msrp_price, wholesale_price, stock_count, is_active, is_bestseller'
          )
          .eq('brand_id', brandId!)
          .order('sort_order')
          .order('product_name'),
      ]);

      if (proRes.error)    throw proRes.error;
      if (retailRes.error) throw retailRes.error;

      const mapProduct = (p: any, type: ProductType): Product => ({
        id:             p.id,
        name:           p.product_name,
        sku:            p.sku ?? null,
        type,
        category:       p.category ?? null,
        size:           p.size ?? null,
        keyIngredients: p.key_ingredients ?? [],
        msrp:           p.msrp_price ?? null,
        wholesale:      p.wholesale_price ?? null,
        stock:          p.stock_count ?? null,
        active:         p.is_active ?? true,
        bestseller:     p.is_bestseller ?? false,
        function:       p.product_function ?? null,
      });

      setProducts([
        ...(proRes.data ?? []).map(p => mapProduct(p, 'PRO')),
        ...(retailRes.data ?? []).map(p => mapProduct(p, 'Retail')),
      ]);
    } catch (err: any) {
      console.warn('Products fetch error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleSaved = () => {
    fetchProducts();
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q);
    const matchesType   = typeFilter === 'all' || p.type === typeFilter;
    const matchesActive = showInactive || p.active;
    return matchesSearch && matchesType && matchesActive;
  });

  const activeCount    = products.filter(p => p.active).length;
  const outOfStock     = products.filter(p => p.active && p.stock === 0).length;
  const bestsellers    = products.filter(p => p.bestseller).length;
  const avgMsrp        = (() => {
    const priced = products.filter(p => p.msrp != null);
    return priced.length > 0
      ? Math.round(priced.reduce((s, p) => s + (p.msrp ?? 0), 0) / priced.length)
      : 0;
  })();

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-pro-warm-gray font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-pro-navy">Products</h1>
          <p className="text-sm text-pro-warm-gray font-sans mt-0.5">
            {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} in catalog`}
          </p>
        </div>
        <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={openAdd}>
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Products" value={activeCount} />
        <StatCard label="Out of Stock"    value={outOfStock} />
        <StatCard label="Bestsellers"     value={bestsellers} />
        <StatCard label="Avg MSRP"        value={avgMsrp > 0 ? `$${avgMsrp}` : '—'} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-sans text-sm flex-1">{error}</p>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Filters + Grid */}
      <div className="bg-white rounded-xl border border-pro-stone">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-pro-stone">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name, SKU, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              iconLeft={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'PRO', 'Retail'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-colors ${
                  typeFilter === t
                    ? 'bg-pro-navy text-white'
                    : 'bg-pro-stone/50 text-pro-warm-gray hover:text-pro-charcoal'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 ml-auto cursor-pointer text-xs font-sans text-pro-warm-gray select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Show inactive
          </label>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-pro-stone/50">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 animate-pulse space-y-3">
                <div className="aspect-square rounded-lg bg-pro-stone/30" />
                <div className="h-4 bg-pro-stone/30 rounded" />
                <div className="h-3 bg-pro-stone/30 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={products.length === 0 ? 'No products yet' : 'No products found'}
            description={
              products.length === 0
                ? 'Click "Add Product" to add your first product to the catalog.'
                : 'Try adjusting your search or filters.'
            }
            action={
              products.length === 0
                ? { label: 'Add Product', onClick: openAdd }
                : undefined
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-pro-stone/50">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {brandId && (
        <ProductFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
          editProduct={editProduct}
          brandId={brandId}
        />
      )}
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit }: { product: Product; onEdit: (p: Product) => void }) {
  return (
    <div className="p-4 group hover:bg-pro-ivory/50 transition-colors">
      {/* Image placeholder */}
      <div className="aspect-square rounded-lg bg-pro-cream mb-3 flex items-center justify-center relative overflow-hidden">
        <Package className="w-8 h-8 text-pro-stone" />

        {product.bestseller && (
          <div className="absolute top-2 left-2">
            <Badge variant="gold">
              <Star className="w-2.5 h-2.5 inline mr-0.5" />Bestseller
            </Badge>
          </div>
        )}
        {!product.active && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Badge variant="gray">Inactive</Badge>
          </div>
        )}
        {product.stock === 0 && product.active && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="red">Out of Stock</Badge>
          </div>
        )}

        {/* Hover: Edit button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-pro-warm-gray hover:text-pro-navy"
            title="Edit product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium text-pro-charcoal text-sm leading-snug font-sans">{product.name}</p>
          <Badge variant={product.type === 'PRO' ? 'navy' : 'gold'} className="flex-shrink-0">
            {product.type}
          </Badge>
        </div>
        <p className="text-xs text-pro-warm-gray font-sans">
          {[product.sku, product.category].filter(Boolean).join(' · ') ||
           product.function?.slice(0, 50) || '—'}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-pro-warm-gray font-sans">
              {product.msrp != null ? 'MSRP / Wholesale' : 'Function'}
            </p>
            {product.msrp != null ? (
              <p className="text-sm font-semibold text-pro-charcoal font-sans">
                ${product.msrp}
                {product.wholesale != null && (
                  <span className="text-pro-warm-gray font-normal"> / ${product.wholesale}</span>
                )}
              </p>
            ) : (
              <p className="text-xs text-pro-warm-gray font-sans truncate max-w-[120px]">
                {product.function?.slice(0, 40) ?? '—'}
              </p>
            )}
          </div>
          {product.stock != null && (
            <div className="text-right">
              <p className="text-xs text-pro-warm-gray font-sans">Stock</p>
              <p className={`text-sm font-semibold font-sans ${product.stock === 0 ? 'text-red-500' : 'text-pro-charcoal'}`}>
                {product.stock}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
