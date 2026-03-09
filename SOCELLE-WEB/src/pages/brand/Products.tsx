import { useEffect, useState } from 'react';
import {
  Search, Plus, Package, Star, Edit2, AlertCircle,
  RefreshCw, DollarSign, Layers,
} from 'lucide-react';
import { useQuery, useQueryClient, skipToken } from '@tanstack/react-query';
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
  elite:  'bg-accent',
  master: 'bg-purple-400',
};

const FIELD_CLS =
  'w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm ' +
  'text-graphite placeholder:text-graphite/60/60 focus:outline-none focus:ring-2 ' +
  'focus:ring-graphite/15 focus:border-graphite transition-colors disabled:opacity-50';

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
  const [error, setError]                 = useState<string | null>(null);

  // Tiered pricing via TanStack Query — enabled only when editing an existing product
  const pricingQueryKey = editProduct
    ? ['product-tiered-pricing', editProduct.id, editProduct.type === 'PRO' ? 'pro' : 'retail'] as const
    : null;

  const { data: tieredPricingData, isLoading: loadingPricing } = useQuery({
    queryKey: pricingQueryKey ?? ['product-tiered-pricing-disabled'],
    queryFn: pricingQueryKey
      ? async () => {
          const { data, error: qErr } = await supabase
            .from('product_pricing')
            .select('tier, price, min_qty')
            .eq('product_id', editProduct!.id)
            .eq('product_type', editProduct!.type === 'PRO' ? 'pro' : 'retail')
            .eq('is_active', true);
          if (qErr) throw qErr;
          return data ?? [];
        }
      : skipToken,
    enabled: !!editProduct?.id && open,
    staleTime: 60_000,
  });

  // Sync tiered form state when query data arrives
  useEffect(() => {
    if (!tieredPricingData) return;
    const map: Record<string, { price: number; min_qty: number }> = {};
    tieredPricingData.forEach(r => { map[r.tier] = { price: r.price, min_qty: r.min_qty }; });
    setTiered({
      activeTierPrice:  map['active']?.price?.toString()   ?? '',
      activeTierMinQty: map['active']?.min_qty?.toString() ?? '1',
      eliteTierPrice:   map['elite']?.price?.toString()    ?? '',
      eliteTierMinQty:  map['elite']?.min_qty?.toString()  ?? '1',
      masterTierPrice:  map['master']?.price?.toString()   ?? '',
      masterTierMinQty: map['master']?.min_qty?.toString() ?? '1',
    });
  }, [tieredPricingData]);

  // Populate / reset form fields when modal opens
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
      setTiered(EMPTY_TIERED); // Reset until query populates
    } else {
      setType('PRO');
      setName(''); setSku(''); setCategory(''); setSize('');
      setProductFn(''); setIngredients('');
      setMsrpPrice(''); setWholesalePrice('');
      setStockCount('0'); setIsActive(true); setIsBestseller(false);
      setTiered(EMPTY_TIERED);
    }
  }, [open, editProduct]);

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
          <h3 className="text-xs font-semibold text-graphite/60 uppercase tracking-wider font-sans mb-4">
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
                    ? 'bg-graphite text-white'
                    : 'border border-accent-soft text-graphite/60 hover:text-graphite'
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
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
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
              <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
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

        <hr className="border-accent-soft" />

        {/* ── Pricing ────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-graphite/60 uppercase tracking-wider font-sans mb-4">
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
          <div className="bg-background/60 rounded-xl border border-accent-soft/50 p-4">
            <p className="text-xs font-semibold text-graphite font-sans mb-0.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-graphite/60" />
              Tiered Wholesale Pricing
            </p>
            <p className="text-xs text-graphite/60 font-sans mb-4">
              Set prices for each reseller tier. Leave blank to fall back to base wholesale.
            </p>

            {loadingPricing ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-10 bg-accent-soft/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Column headers */}
                <div className="grid grid-cols-[100px_1fr_1fr] gap-3">
                  <div />
                  <p className="text-xs font-medium text-graphite/60 font-sans text-center">
                    Price / Unit
                  </p>
                  <p className="text-xs font-medium text-graphite/60 font-sans text-center">
                    Min. Order Qty
                  </p>
                </div>

                {/* Active */}
                <div className="grid grid-cols-[100px_1fr_1fr] gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${TIER_COLORS.active}`} />
                    <span className="text-sm font-medium text-graphite font-sans">Active</span>
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
                    <span className="text-sm font-medium text-graphite font-sans">Elite</span>
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
                    <span className="text-sm font-medium text-graphite font-sans">Master</span>
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

        <hr className="border-accent-soft" />

        {/* ── Inventory ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-graphite/60 uppercase tracking-wider font-sans mb-4">
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
                activeColor="bg-accent"
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
          enabled ? activeColor : 'bg-accent-soft'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-sm font-medium font-sans text-graphite">{label}</span>
      <span className="text-xs text-graphite/60 font-sans">{sub}</span>
    </button>
  );
}

// ─── BrandProducts page ───────────────────────────────────────────────────────

export default function BrandProducts() {
  const { brandId } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState<'all' | ProductType>('all');
  const [showInactive, setShowInactive]   = useState(false);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editProduct, setEditProduct]     = useState<Product | null>(null);

  const { data: products = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['brand-products', brandId],
    queryFn: async () => {
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

      return [
        ...(proRes.data ?? []).map(p => mapProduct(p, 'PRO')),
        ...(retailRes.data ?? []).map(p => mapProduct(p, 'Retail')),
      ];
    },
    enabled: !!brandId,
  });

  const error = queryError ? 'Unable to load products. Please try again.' : null;

  const openAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['brand-products', brandId] });
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
        <p className="text-graphite/60 font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl text-graphite">Products</h1>
          <p className="text-sm text-graphite/60 font-sans mt-0.5">
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
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Filters + Grid */}
      <div className="bg-white rounded-xl border border-accent-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-accent-soft">
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
                    ? 'bg-graphite text-white'
                    : 'bg-accent-soft/50 text-graphite/60 hover:text-graphite'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 ml-auto cursor-pointer text-xs font-sans text-graphite/60 select-none">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-accent-soft/50">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 animate-pulse space-y-3">
                <div className="aspect-square rounded-lg bg-accent-soft/30" />
                <div className="h-4 bg-accent-soft/30 rounded" />
                <div className="h-3 bg-accent-soft/30 rounded w-2/3" />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-accent-soft/50">
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
    <div className="p-4 group hover:bg-background/50 transition-colors">
      {/* Image placeholder */}
      <div className="aspect-square rounded-lg bg-accent-soft mb-3 flex items-center justify-center relative overflow-hidden">
        <Package className="w-8 h-8 text-accent-soft" />

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
            className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-graphite/60 hover:text-graphite"
            title="Edit product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium text-graphite text-sm leading-snug font-sans">{product.name}</p>
          <Badge variant={product.type === 'PRO' ? 'navy' : 'gold'} className="flex-shrink-0">
            {product.type}
          </Badge>
        </div>
        <p className="text-xs text-graphite/60 font-sans">
          {[product.sku, product.category].filter(Boolean).join(' · ') ||
           product.function?.slice(0, 50) || '—'}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-graphite/60 font-sans">
              {product.msrp != null ? 'MSRP / Wholesale' : 'Function'}
            </p>
            {product.msrp != null ? (
              <p className="text-sm font-semibold text-graphite font-sans">
                ${product.msrp}
                {product.wholesale != null && (
                  <span className="text-graphite/60 font-normal"> / ${product.wholesale}</span>
                )}
              </p>
            ) : (
              <p className="text-xs text-graphite/60 font-sans truncate max-w-[120px]">
                {product.function?.slice(0, 40) ?? '—'}
              </p>
            )}
          </div>
          {product.stock != null && (
            <div className="text-right">
              <p className="text-xs text-graphite/60 font-sans">Stock</p>
              <p className={`text-sm font-semibold font-sans ${product.stock === 0 ? 'text-red-500' : 'text-graphite'}`}>
                {product.stock}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
