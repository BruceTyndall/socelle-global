import { useState, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Loader2,
  X,
  Palette,
  Upload,
  Search,
  FileText,
  Film,
  Star,
  Image as ImageIcon,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trash2,
  Grid as GridIcon,
  Clipboard,
  Package,
  Type,
  Award,
  BookOpen,
  BarChart,
  Megaphone,
  Layout,
  GraduationCap,
  Briefcase,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BrandPageRenderer from '../../components/BrandPageRenderer';
import { useToast } from '../../components/Toast';
import ErrorState from '../../components/ErrorState';

interface BrandTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    text: string;
  };
  typography: 'luxury' | 'modern' | 'clinical';
  density: 'spacious' | 'balanced' | 'dense';
  hero_variant: 'full_bleed' | 'split' | 'video' | 'minimal' | 'editorial';
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  category_tags: string[];
  contact_email: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  website_url: string | null;
  theme: BrandTheme | null;
  is_published: boolean;
  published_at: string | null;
}

interface BrandAsset {
  id: string;
  brand_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  title: string | null;
  alt_text: string | null;
  caption: string | null;
  collection: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

interface PageModule {
  id: string;
  brand_id: string;
  module_type: string;
  title: string;
  sort_order: number;
  is_enabled: boolean;
  layout_variant: string;
  config: any;
}

interface ShopSettings {
  brand_id: string;
  rep_email: string | null;
  allow_retail_orders: boolean;
  allow_pro_orders: boolean;
  min_order_amount: number | null;
  lead_time_days: number | null;
  ordering_notes: string | null;
  updated_at?: string;
}

interface TrainingModule {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  format: 'pdf' | 'video' | 'link' | 'slide_deck';
  duration: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  resource_url: string | null;
  sort_order: number;
  is_published: boolean;
}

interface CommercialAsset {
  id: string;
  brand_id: string;
  title: string;
  asset_type: 'sell_sheet' | 'price_list' | 'margin_guide' | 'terms' | 'moq_info';
  resource_url: string | null;
  notes: string | null;
  is_internal_only: boolean;
  sort_order: number;
}

interface PublishCheck {
  key: string;
  label: string;
  passed: boolean;
}

type TabKey = 'overview' | 'media' | 'builder' | 'education' | 'commercial' | 'shop' | 'preview';
type CollectionFilter = 'all' | 'hero' | 'protocols' | 'retail' | 'education' | 'press' | 'general';

const DEFAULT_THEME: BrandTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    surface: '#F9FAFB',
    text: '#111827',
  },
  typography: 'modern',
  density: 'balanced',
  hero_variant: 'full_bleed',
};

const MODULE_TYPES = [
  { type: 'hero', label: 'Hero', icon: ImageIcon },
  { type: 'gallery', label: 'Gallery', icon: GridIcon },
  { type: 'featured_protocols', label: 'Featured Protocols', icon: Clipboard },
  { type: 'featured_products', label: 'Featured Products', icon: Package },
  { type: 'rich_text', label: 'Rich Text', icon: Type },
  { type: 'downloads', label: 'Downloads', icon: Download },
  { type: 'proof_press', label: 'Proof & Press', icon: Award },
  { type: 'brand_story', label: 'Brand Story', icon: BookOpen },
  { type: 'stats_bar', label: 'Stats Bar', icon: BarChart },
  { type: 'cta', label: 'Call to Action', icon: Megaphone },
];

export default function BrandAdminEditor() {
  const { id } = useParams<{ id: string }>();
  const isCreateMode = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [brand, setBrand] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pageModules, setPageModules] = useState<PageModule[]>([]);
  const showToast = (type: 'success' | 'error', message: string) => {
    addToast(message, type);
  };

  // ── Load brand data ──
  const { isLoading: loading, refetch: loadBrand } = useQuery({
    queryKey: ['admin', 'brand-editor', id],
    queryFn: async () => {
      if (isCreateMode) {
        setBrand({
          id: '',
          name: '',
          slug: '',
          status: 'inactive',
          description: null,
          short_description: null,
          long_description: null,
          category_tags: [],
          contact_email: null,
          logo_url: null,
          hero_image_url: null,
          hero_video_url: null,
          website_url: null,
          theme: DEFAULT_THEME,
          is_published: false,
          published_at: null,
        });
        return null;
      }

      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Brand not found');
        return null;
      }

      setBrand({
        ...data,
        category_tags: data.category_tags || [],
        theme: data.theme || DEFAULT_THEME,
      });
      return data;
    },
    meta: {
      onError: (err: any) => {
        console.error('Error loading brand:', err);
        setError(err.message || 'Failed to load brand');
      },
    },
  });

  // ── Load page modules ──
  const { isLoading: pageModulesLoading } = useQuery({
    queryKey: ['admin', 'brand-page-modules', brand?.id, activeTab],
    queryFn: async () => {
      const { data, error: fetchErr } = await supabase
        .from('brand_page_modules')
        .select('*')
        .eq('brand_id', brand!.id)
        .order('sort_order', { ascending: true });

      if (fetchErr) {
        console.error('Failed to load page modules:', fetchErr);
        return [];
      }

      setPageModules(data || []);
      return data || [];
    },
    enabled: !!brand?.id,
  });

  // ── Load publish stats ──
  const { data: publishStats = { enabledModules: 0, totalModules: 0, mediaAssets: 0, loading: false } } = useQuery({
    queryKey: ['admin', 'brand-publish-stats', brand?.id, activeTab],
    queryFn: async () => {
      const [enabledModulesRes, totalModulesRes, mediaAssetsRes] = await Promise.all([
        supabase
          .from('brand_page_modules')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brand!.id)
          .eq('is_enabled', true),
        supabase
          .from('brand_page_modules')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brand!.id),
        supabase
          .from('brand_assets')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brand!.id),
      ]);

      return {
        enabledModules: enabledModulesRes.count || 0,
        totalModules: totalModulesRes.count || 0,
        mediaAssets: mediaAssetsRes.count || 0,
        loading: false,
      };
    },
    enabled: !!brand?.id,
  });

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateHexColor(color: string): string {
    let cleaned = color.trim();
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      return cleaned;
    }
    return color;
  }

  async function validateForm(): Promise<boolean> {
    const errors: Record<string, string> = {};

    if (!brand) return false;

    if (!brand.name.trim()) {
      errors.name = 'Brand name is required';
    }

    if (!brand.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(brand.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    } else {
      // Check uniqueness on both create AND edit — exclude self only on edit
      const { data } = await (
        isCreateMode
          ? supabase.from('brands').select('id').eq('slug', brand.slug)
          : supabase.from('brands').select('id').eq('slug', brand.slug).neq('id', id)
      ).maybeSingle();

      if (data) {
        errors.slug = 'This slug is already in use';
      }
    }

    if (brand.contact_email && !validateEmail(brand.contact_email)) {
      errors.contact_email = 'Invalid email format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function updateBrandField<K extends keyof Brand>(field: K, value: Brand[K]) {
    if (!brand) return;

    if (
      field === 'name' &&
      (
        !brand.slug ||
        brand.slug === generateSlug(brand.name)
      )
    ) {
      setBrand({ ...brand, name: value as string, slug: generateSlug(value as string) });
    } else {
      setBrand({ ...brand, [field]: value });
    }
  }

  function updateThemeField<K extends keyof BrandTheme>(field: K, value: BrandTheme[K]) {
    if (!brand?.theme) return;
    setBrand({ ...brand, theme: { ...brand.theme, [field]: value } });
  }

  function updateThemeColor(colorKey: keyof BrandTheme['colors'], value: string) {
    if (!brand?.theme) return;
    const validatedColor = validateHexColor(value);
    setBrand({
      ...brand,
      theme: {
        ...brand.theme,
        colors: { ...brand.theme.colors, [colorKey]: validatedColor },
      },
    });
  }

  function addTag() {
    if (!brand || !tagInput.trim()) return;
    if (brand.category_tags.includes(tagInput.trim())) return;
    updateBrandField('category_tags', [...brand.category_tags, tagInput.trim()]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    if (!brand) return;
    updateBrandField(
      'category_tags',
      brand.category_tags.filter((t) => t !== tag)
    );
  }

  async function saveBrand(publish?: boolean) {
    if (!brand) return;

    const isValid = await validateForm();
    if (!isValid) {
      addToast('Please fix the errors before saving', 'error');
      setActiveTab('overview');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: brand.name,
        slug: brand.slug,
        status: publish === true ? 'active' : publish === false ? 'inactive' : brand.status,
        description: brand.description,
        short_description: brand.short_description,
        long_description: brand.long_description,
        category_tags: brand.category_tags,
        contact_email: brand.contact_email,
        logo_url: brand.logo_url,
        hero_image_url: brand.hero_image_url,
        hero_video_url: brand.hero_video_url,
        website_url: brand.website_url,
        theme: brand.theme,
        is_published: publish !== undefined ? publish : brand.is_published,
        published_at:
          publish === true
            ? (brand.published_at || new Date().toISOString())
            : publish === false
            ? null
            : brand.published_at,
      };

      if (isCreateMode) {
        const { data, error: insertError } = await supabase
          .from('brands')
          .insert([payload])
          .select()
          .single();

        if (insertError) throw insertError;

        addToast(publish ? 'Brand created and published' : 'Brand created successfully', 'success');
        navigate(`/admin/brands/${data.id}`);
      } else {
        const { error: updateError } = await supabase
          .from('brands')
          .update(payload)
          .eq('id', id);

        if (updateError) throw updateError;

        addToast(publish ? 'Brand published successfully' : 'Brand saved successfully', 'success');
        setBrand({ ...brand, ...payload });
      }
    } catch (err: any) {
      console.error('Error saving brand:', err);
      addToast(err.message || 'Failed to save brand', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <ErrorState
          icon={Package}
          title="Failed to Load Brand"
          message={error}
          action={{
            label: 'Retry',
            onClick: loadBrand,
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-12 bg-accent-soft rounded animate-pulse w-64"></div>
          <div className="bg-white rounded-lg border border-accent-soft p-8 space-y-6">
            <div className="space-y-4">
              <div className="h-6 bg-accent-soft rounded animate-pulse w-32"></div>
              <div className="h-10 bg-accent-soft rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-accent-soft rounded animate-pulse w-32"></div>
              <div className="h-10 bg-accent-soft rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-6 bg-accent-soft rounded animate-pulse w-24"></div>
                <div className="h-10 bg-accent-soft rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-accent-soft rounded animate-pulse w-24"></div>
                <div className="h-10 bg-accent-soft rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <ErrorState
          icon={Package}
          title="Brand Not Found"
          message="The requested brand could not be found"
          action={{
            label: 'Back to Brands',
            onClick: () => navigate('/admin/brands'),
          }}
        />
      </div>
    );
  }

  const shortDescCharCount = brand.short_description?.length || 0;
  const shortDescLimit = 200;
  const publishChecks: PublishCheck[] = [
    { key: 'name', label: 'Brand name', passed: !!brand.name.trim() },
    { key: 'slug', label: 'URL slug', passed: !!brand.slug.trim() },
    {
      key: 'description',
      label: 'Short or long description',
      passed: !!((brand.short_description || '').trim() || (brand.long_description || '').trim()),
    },
    {
      key: 'hero',
      label: 'Hero image or video',
      passed: !!((brand.hero_image_url || '').trim() || (brand.hero_video_url || '').trim()),
    },
    { key: 'theme', label: 'Theme settings', passed: !!brand.theme },
    { key: 'modules', label: 'At least 3 enabled page sections', passed: publishStats.enabledModules >= 3 },
  ];
  const publishReadyCount = publishChecks.filter((c) => c.passed).length;
  const publishReady = publishChecks.every((c) => c.passed);
  const missingPublishItems = publishChecks.filter((c) => !c.passed).map((c) => c.label);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-white border-b border-accent-soft">
        <div className="py-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link
              to="/admin/brands"
              className="p-2 text-graphite/60 hover:text-graphite hover:bg-accent-soft rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <input
              type="text"
              value={brand.name}
              onChange={(e) => updateBrandField('name', e.target.value)}
              placeholder="Brand Name"
              className="text-2xl font-bold text-graphite bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1 min-w-0"
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {saving && (
              <span className="text-sm text-graphite/60 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            )}

            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${brand.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {brand.is_published ? 'Published' : 'Draft'}
            </div>

            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-soft text-graphite">
              Publish Readiness {publishReadyCount}/{publishChecks.length}
            </div>

            <button
              onClick={() => setActiveTab('preview')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background transition-colors font-medium"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>

            <a
              href={brand.slug ? `/portal/brands/${brand.slug}` : '#'}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium ${
                brand.slug
                  ? 'border-accent-soft text-graphite hover:bg-background'
                  : 'border-accent-soft text-graphite/60 pointer-events-none'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              Open Public Page
            </a>

            <button
              onClick={() => saveBrand()}
              disabled={saving}
              className="px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save Draft
            </button>

            {brand.is_published ? (
              <button
                onClick={() => saveBrand(false)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => saveBrand(true)}
                disabled={saving || !publishReady}
                className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:bg-accent-soft disabled:cursor-not-allowed transition-colors font-medium"
                title={!publishReady ? `Complete before publish: ${missingPublishItems.join(', ')}` : undefined}
              >
                Publish
              </button>
            )}
          </div>
        </div>
        {(!publishReady || publishStats.loading) && (
          <div className="px-6 pb-3 text-xs text-graphite/60">
            {publishStats.loading
              ? 'Checking publish readiness...'
              : `To publish, complete: ${missingPublishItems.join(', ')}`}
          </div>
        )}

        <div className="border-t border-accent-soft bg-white">
          <div className="px-6 flex gap-6 overflow-x-auto">
            {[
              { key: 'overview' as TabKey, label: 'Overview' },
              { key: 'media' as TabKey, label: 'Media Library' },
              { key: 'builder' as TabKey, label: 'Page Builder' },
              { key: 'education' as TabKey, label: 'Education' },
              { key: 'commercial' as TabKey, label: 'Commercial' },
              { key: 'shop' as TabKey, label: 'Shop Settings' },
              { key: 'preview' as TabKey, label: 'Preview' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-graphite text-graphite'
                    : 'border-transparent text-graphite/60 hover:text-graphite hover:border-accent-soft'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' ? (
          <OverviewTab
            brand={brand}
            updateBrandField={updateBrandField}
            updateThemeField={updateThemeField}
            updateThemeColor={updateThemeColor}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={addTag}
            removeTag={removeTag}
            shortDescCharCount={shortDescCharCount}
            shortDescLimit={shortDescLimit}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        ) : activeTab === 'media' ? (
          <MediaLibraryTab brandId={brand.id} showToast={showToast} />
        ) : activeTab === 'builder' ? (
          <PageBuilderTab
            brandId={brand.id}
            showToast={showToast}
            onModulesChange={setPageModules}
          />
        ) : activeTab === 'education' ? (
          <EducationTab brandId={brand.id} showToast={showToast} />
        ) : activeTab === 'commercial' ? (
          <CommercialTab brandId={brand.id} showToast={showToast} />
        ) : activeTab === 'shop' ? (
          <ShopSettingsTab
            brand={brand}
            updateBrandField={updateBrandField}
            showToast={showToast}
          />
        ) : activeTab === 'preview' ? (
          <PreviewTab
            brand={brand}
            modules={pageModules}
            loading={pageModulesLoading}
          />
        ) : (
          <div className="bg-white rounded-lg border border-accent-soft p-12 text-center">
            <h3 className="text-lg font-semibold text-graphite mb-2">{activeTab}</h3>
            <p className="text-graphite/60">Coming in next session</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  brand,
  updateBrandField,
  updateThemeField,
  updateThemeColor,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  shortDescCharCount,
  shortDescLimit,
  validationErrors,
  setValidationErrors,
}: {
  brand: Brand;
  updateBrandField: <K extends keyof Brand>(field: K, value: Brand[K]) => void;
  updateThemeField: <K extends keyof BrandTheme>(field: K, value: BrandTheme[K]) => void;
  updateThemeColor: (colorKey: keyof BrandTheme['colors'], value: string) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  shortDescCharCount: number;
  shortDescLimit: number;
  validationErrors: Record<string, string>;
  setValidationErrors: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-white rounded-lg border border-accent-soft p-6">
          <h2 className="text-lg font-semibold text-graphite mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Brand Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={brand.name}
                onChange={(e) => {
                  updateBrandField('name', e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                required
                className={`w-full px-4 py-2 text-lg border rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite ${
                  validationErrors.name ? 'border-red-500' : 'border-accent-soft'
                }`}
                placeholder="Enter brand name"
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Slug <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={brand.slug}
                onChange={(e) => {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  updateBrandField('slug', slug);
                  if (validationErrors.slug) {
                    setValidationErrors((prev) => ({ ...prev, slug: '' }));
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite font-mono text-sm ${
                  validationErrors.slug ? 'border-red-500' : 'border-accent-soft'
                }`}
              />
              <p className="text-xs text-graphite/60 mt-1">
                yoursite.com/brands/{brand.slug || 'brand-slug'}
              </p>
              {validationErrors.slug && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.slug}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Short Description
              </label>
              <textarea
                value={brand.short_description || ''}
                onChange={(e) => updateBrandField('short_description', e.target.value)}
                maxLength={shortDescLimit}
                rows={2}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                placeholder="Brief tagline or description"
              />
              <p
                className={`text-xs mt-1 text-right ${
                  shortDescCharCount > 180 ? 'text-red-600' : 'text-graphite/60'
                }`}
              >
                {shortDescCharCount}/{shortDescLimit}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Long Description
              </label>
              <textarea
                value={brand.long_description || ''}
                onChange={(e) => updateBrandField('long_description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                placeholder="Detailed brand story and information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Category Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {brand.category_tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent-soft text-graphite rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-graphite"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                  placeholder="Type a tag and press Enter"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={brand.contact_email || ''}
                onChange={(e) => {
                  updateBrandField('contact_email', e.target.value);
                  if (validationErrors.contact_email) {
                    setValidationErrors((prev) => ({ ...prev, contact_email: '' }));
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite ${
                  validationErrors.contact_email ? 'border-red-500' : 'border-accent-soft'
                }`}
                placeholder="contact@brand.com"
              />
              {validationErrors.contact_email && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.contact_email}</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-accent-soft p-6">
          <h2 className="text-lg font-semibold text-graphite mb-4">Brand Identity</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={brand.logo_url || ''}
                onChange={(e) => updateBrandField('logo_url', e.target.value)}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Hero Image URL
              </label>
              <input
                type="url"
                value={brand.hero_image_url || ''}
                onChange={(e) => updateBrandField('hero_image_url', e.target.value)}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Hero Video URL
              </label>
              <input
                type="url"
                value={brand.hero_video_url || ''}
                onChange={(e) => updateBrandField('hero_video_url', e.target.value)}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                placeholder="YouTube or direct video URL"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-accent-soft p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-graphite" />
            <h2 className="text-lg font-semibold text-graphite">Brand Theme</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-graphite mb-3">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(brand.theme?.colors || DEFAULT_THEME.colors).map(
                ([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-graphite/60 mb-2 capitalize">
                      {key}
                    </label>
                    <div className="relative">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          updateThemeColor(
                            key as keyof BrandTheme['colors'],
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id={`color-${key}`}
                      />
                      <label
                        htmlFor={`color-${key}`}
                        className="block w-full h-10 rounded-lg border-2 border-accent-soft cursor-pointer hover:border-graphite transition-colors"
                        style={{ backgroundColor: value }}
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          updateThemeColor(
                            key as keyof BrandTheme['colors'],
                            e.target.value
                          )
                        }
                        className="mt-1 w-full px-2 py-1 text-xs font-mono border border-accent-soft rounded focus:ring-1 focus:ring-graphite focus:border-graphite"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-graphite mb-3">Typography Mood</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'luxury' as const, name: 'Luxury', headlineClass: 'font-sans', bodyClass: 'font-light' },
                { key: 'modern' as const, name: 'Modern', headlineClass: 'font-sans tracking-tight font-bold', bodyClass: 'font-normal' },
                { key: 'clinical' as const, name: 'Clinical', headlineClass: 'font-sans font-semibold', bodyClass: 'text-sm leading-tight' },
              ].map((typo) => (
                <button
                  key={typo.key}
                  type="button"
                  onClick={() => updateThemeField('typography', typo.key)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    brand.theme?.typography === typo.key
                      ? 'border-graphite bg-accent-soft ring-2 ring-graphite'
                      : 'border-accent-soft hover:border-accent-soft'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-graphite">{typo.name}</span>
                    {brand.theme?.typography === typo.key && (
                      <Check className="w-4 h-4 text-graphite" />
                    )}
                  </div>
                  <div className={`${typo.headlineClass} text-graphite mb-1`}>
                    Headline
                  </div>
                  <div className={`${typo.bodyClass} text-graphite/60 text-sm`}>
                    Body text preview
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-graphite mb-3">Visual Density</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'spacious' as const, name: 'Spacious', desc: 'Luxury feel, large images, generous whitespace' },
                { key: 'balanced' as const, name: 'Balanced', desc: 'Standard spacing, versatile' },
                { key: 'dense' as const, name: 'Dense', desc: 'Information-rich, compact, clinical feel' },
              ].map((density) => (
                <button
                  key={density.key}
                  type="button"
                  onClick={() => updateThemeField('density', density.key)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    brand.theme?.density === density.key
                      ? 'border-graphite bg-accent-soft ring-2 ring-graphite'
                      : 'border-accent-soft hover:border-accent-soft'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-graphite">{density.name}</span>
                    {brand.theme?.density === density.key && (
                      <Check className="w-4 h-4 text-graphite" />
                    )}
                  </div>
                  <p className="text-xs text-graphite/60">{density.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-graphite mb-3">Hero Variant</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: 'full_bleed' as const, name: 'Full Bleed', icon: '▭' },
                { key: 'split' as const, name: 'Split', icon: '▯' },
                { key: 'video' as const, name: 'Video', icon: '▶' },
                { key: 'minimal' as const, name: 'Minimal', icon: '□' },
                { key: 'editorial' as const, name: 'Editorial', icon: '▥' },
              ].map((hero) => (
                <button
                  key={hero.key}
                  type="button"
                  onClick={() => updateThemeField('hero_variant', hero.key)}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    brand.theme?.hero_variant === hero.key
                      ? 'border-graphite bg-accent-soft ring-2 ring-graphite'
                      : 'border-accent-soft hover:border-accent-soft'
                  }`}
                >
                  <div className="text-2xl mb-1">{hero.icon}</div>
                  <div className="text-xs font-medium text-graphite">{hero.name}</div>
                  {brand.theme?.hero_variant === hero.key && (
                    <Check className="w-3 h-3 text-graphite mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <ThemePreview theme={brand.theme || DEFAULT_THEME} brandName={brand.name} />
        </div>
      </div>
    </div>
  );
}

function PageBuilderTab({
  brandId,
  showToast,
  onModulesChange,
}: {
  brandId: string;
  showToast: (type: 'success' | 'error', message: string) => void;
  onModulesChange: (modules: PageModule[]) => void;
}) {
  const [modules, setModules] = useState<PageModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showModuleMenu, setShowModuleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isLoading: loading, refetch: loadModules } = useQuery({
    queryKey: ['admin', 'brand-builder-modules', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_page_modules')
        .select('*')
        .eq('brand_id', brandId)
        .order('sort_order', { ascending: true });

      if (error) {
        showToast('error', error.message);
        return [];
      }

      const nextModules = data || [];
      setModules(nextModules);
      onModulesChange(nextModules);
      return nextModules;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModuleMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function addModule(moduleType: string) {
    const moduleConfig = MODULE_TYPES.find(m => m.type === moduleType);
    if (!moduleConfig || !brandId) return;

    const newModule = {
      brand_id: brandId,
      module_type: moduleType,
      title: moduleConfig.label,
      sort_order: modules.length,
      is_enabled: true,
      layout_variant: 'default',
      config: {},
    };

    const { data, error } = await supabase
      .from('brand_page_modules')
      .insert([newModule])
      .select()
      .single();

    if (error) {
      showToast('error', error.message);
    } else {
      await loadModules();
      setExpandedModules(new Set([data.id]));
      showToast('success', 'Module added');
    }
    setShowModuleMenu(false);
  }

  async function updateModule(id: string, updates: Partial<PageModule>) {
    const { error } = await supabase
      .from('brand_page_modules')
      .update(updates)
      .eq('id', id);

    if (error) {
      showToast('error', error.message);
    } else {
      const nextModules = modules.map(m => m.id === id ? { ...m, ...updates } : m);
      setModules(nextModules);
      onModulesChange(nextModules);
    }
  }

  async function deleteModule(id: string) {
    if (!confirm('Delete this module? This cannot be undone.')) return;

    const { error } = await supabase
      .from('brand_page_modules')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('error', error.message);
    } else {
      await loadModules();
      showToast('success', 'Module deleted');
    }
  }

  async function moveModule(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const newModules = [...modules];
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];

    newModules.forEach((module, idx) => {
      module.sort_order = idx;
    });

    setModules(newModules);
    onModulesChange(newModules);

    const updates = newModules.map(m => ({
      id: m.id,
      sort_order: m.sort_order,
    }));

    for (const update of updates) {
      await supabase
        .from('brand_page_modules')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }
  }

  function toggleExpanded(id: string) {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedModules(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-graphite animate-spin" />
      </div>
    );
  }

  if (!brandId) {
    return (
      <div className="bg-white rounded-lg border border-amber-200 p-8">
        <h3 className="text-lg font-semibold text-graphite mb-2">Save Brand First</h3>
        <p className="text-graphite/60">
          Create the brand record first using <span className="font-medium">Save Draft</span>. Then you can build page sections here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-graphite">Page Builder</h2>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowModuleMenu(!showModuleMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>

          {showModuleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-accent-soft py-2 z-10">
              {MODULE_TYPES.map((moduleType) => {
                const Icon = moduleType.icon;
                return (
                  <button
                    key={moduleType.type}
                    onClick={() => addModule(moduleType.type)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-background transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-graphite/60" />
                    <span className="text-sm font-medium text-graphite">{moduleType.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="bg-white rounded-lg border border-accent-soft p-16 text-center">
          <Layout className="w-16 h-16 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60">No sections yet. Click &apos;Add Section&apos; to start building your brand page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              isExpanded={expandedModules.has(module.id)}
              onToggleExpanded={() => toggleExpanded(module.id)}
              onUpdate={updateModule}
              onDelete={deleteModule}
              onMove={moveModule}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({
  module,
  index,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpanded,
  onUpdate,
  onDelete,
  onMove,
}: {
  module: PageModule;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (id: string, updates: Partial<PageModule>) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}) {
  const moduleConfig = MODULE_TYPES.find(m => m.type === module.module_type);
  const Icon = moduleConfig?.icon || Layout;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(module.title);

  function saveTitle() {
    if (titleValue.trim() !== module.title) {
      onUpdate(module.id, { title: titleValue.trim() });
    }
    setEditingTitle(false);
  }

  return (
    <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMove(index, 'up')}
            disabled={isFirst}
            className="p-1 hover:bg-accent-soft rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-graphite/60" />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={isLast}
            className="p-1 hover:bg-accent-soft rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-graphite/60" />
          </button>
        </div>

        <Icon className="w-5 h-5 text-graphite/60 flex-shrink-0" />

        {editingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
            autoFocus
            className="flex-1 px-2 py-1 border border-graphite rounded focus:outline-none focus:ring-2 focus:ring-graphite"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-left font-medium text-graphite hover:text-graphite transition-colors"
          >
            {module.title}
          </button>
        )}

        <span className="px-2 py-1 text-xs bg-accent-soft text-graphite rounded capitalize">
          {module.layout_variant}
        </span>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={module.is_enabled}
            onChange={(e) => onUpdate(module.id, { is_enabled: e.target.checked })}
            className="sr-only"
          />
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              module.is_enabled ? 'bg-green-500' : 'bg-accent-soft'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${
                module.is_enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </label>

        <button
          onClick={onToggleExpanded}
          className="p-2 hover:bg-accent-soft rounded transition-colors"
        >
          <ChevronRight
            className={`w-5 h-5 text-graphite/60 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>

        <button
          onClick={() => onDelete(module.id)}
          className="p-2 hover:bg-red-50 rounded transition-colors group"
        >
          <Trash2 className="w-5 h-5 text-graphite/60 group-hover:text-red-600 transition-colors" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-accent-soft p-6 bg-background">
          <ModuleEditor
            module={module}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
}

function ModuleEditor({
  module,
  onUpdate,
}: {
  module: PageModule;
  onUpdate: (id: string, updates: Partial<PageModule>) => void;
}) {
  const config = module.config || {};

  function updateConfig(updates: any) {
    onUpdate(module.id, { config: { ...config, ...updates } });
  }

  function updateLayoutVariant(variant: string) {
    onUpdate(module.id, { layout_variant: variant });
  }

  switch (module.module_type) {
    case 'hero':
      return <HeroModuleEditor config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'gallery':
      return <GalleryModuleEditor config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'featured_protocols':
      return <FeaturedProtocolsModuleEditor brandId={module.brand_id} config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'featured_products':
      return <FeaturedProductsModuleEditor brandId={module.brand_id} config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'rich_text':
      return <RichTextModuleEditor config={config} updateConfig={updateConfig} />;
    case 'downloads':
      return <DownloadsModuleEditor config={config} updateConfig={updateConfig} />;
    case 'proof_press':
      return <ProofPressModuleEditor config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'brand_story':
      return <BrandStoryModuleEditor config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'stats_bar':
      return <StatsBarModuleEditor config={config} updateConfig={updateConfig} layoutVariant={module.layout_variant} updateLayoutVariant={updateLayoutVariant} />;
    case 'cta':
      return <CTAModuleEditor config={config} updateConfig={updateConfig} />;
    default:
      return <div className="text-graphite/60">Unknown module type</div>;
  }
}

function HeroModuleEditor({
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const variants = ['full_bleed', 'split', 'video', 'minimal', 'editorial'];
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Headline</label>
        <input
          type="text"
          value={config.headline || ''}
          onChange={(e) => updateConfig({ headline: e.target.value })}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="Hero headline"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Subheadline</label>
        <textarea
          value={config.subheadline || ''}
          onChange={(e) => updateConfig({ subheadline: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="Supporting text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Background Image URL</label>
        <input
          type="url"
          value={config.background_image || ''}
          onChange={(e) => updateConfig({ background_image: e.target.value })}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">CTA Button Label</label>
          <input
            type="text"
            value={config.cta_label || ''}
            onChange={(e) => updateConfig({ cta_label: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="Learn More"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">CTA Button Link</label>
          <input
            type="url"
            value={config.cta_url || ''}
            onChange={(e) => updateConfig({ cta_url: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="https://..."
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryModuleEditor({
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const images = config.images || [];
  const [newImageUrl, setNewImageUrl] = useState('');

  function addImage() {
    if (!newImageUrl.trim()) return;
    updateConfig({ images: [...images, newImageUrl.trim()] });
    setNewImageUrl('');
  }

  function removeImage(index: number) {
    updateConfig({ images: images.filter((_: any, i: number) => i !== index) });
  }

  const variants = ['grid', 'carousel', 'masonry'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Image URLs</label>
        <div className="space-y-2">
          {images.map((url: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newImages = [...images];
                  newImages[index] = e.target.value;
                  updateConfig({ images: newImages });
                }}
                className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              />
              <button
                onClick={() => removeImage(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="https://..."
            />
            <button
              onClick={addImage}
              className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedProtocolsModuleEditor({
  brandId,
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  brandId: string;
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const selectedIds = config.selected_protocol_ids || [];

  const { data: protocols = [], isLoading: loading } = useQuery({
    queryKey: ['admin', 'brand-protocols-config', brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from('canonical_protocols')
        .select('id, protocol_name')
        .eq('brand_id', brandId)
        .order('protocol_name');
      return data || [];
    },
    enabled: !!brandId,
  });

  function toggleProtocol(id: string) {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((pid: string) => pid !== id)
      : [...selectedIds, id];
    updateConfig({ selected_protocol_ids: newIds });
  }

  const variants = ['cards', 'list', 'detailed'];

  if (loading) return <div>Loading protocols...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Select Protocols</label>
        <div className="space-y-2 max-h-64 overflow-y-auto border border-accent-soft rounded-lg p-3">
          {protocols.length === 0 ? (
            <p className="text-sm text-graphite/60">No protocols available for this brand</p>
          ) : (
            protocols.map((protocol) => (
              <label key={protocol.id} className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(protocol.id)}
                  onChange={() => toggleProtocol(protocol.id)}
                  className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
                />
                <span className="text-sm text-graphite">{protocol.protocol_name}</span>
              </label>
            ))
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedProductsModuleEditor({
  brandId,
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  brandId: string;
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const selectedProIds = config.selected_pro_ids || [];
  const selectedRetailIds = config.selected_retail_ids || [];

  const { data: productsData, isLoading: loading } = useQuery({
    queryKey: ['admin', 'brand-products-config', brandId],
    queryFn: async () => {
      const [pro, retail] = await Promise.all([
        supabase.from('pro_products').select('id, product_name').eq('brand_id', brandId).order('product_name'),
        supabase.from('retail_products').select('id, product_name').eq('brand_id', brandId).order('product_name'),
      ]);
      return { proProducts: pro.data || [], retailProducts: retail.data || [] };
    },
    enabled: !!brandId,
  });

  const proProducts = productsData?.proProducts ?? [];
  const retailProducts = productsData?.retailProducts ?? [];

  function toggleProProduct(id: string) {
    const newIds = selectedProIds.includes(id)
      ? selectedProIds.filter((pid: string) => pid !== id)
      : [...selectedProIds, id];
    updateConfig({ selected_pro_ids: newIds });
  }

  function toggleRetailProduct(id: string) {
    const newIds = selectedRetailIds.includes(id)
      ? selectedRetailIds.filter((pid: string) => pid !== id)
      : [...selectedRetailIds, id];
    updateConfig({ selected_retail_ids: newIds });
  }

  const variants = ['grid', 'editorial', 'carousel', 'compact'];

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Pro Products</label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-accent-soft rounded-lg p-3">
          {proProducts.length === 0 ? (
            <p className="text-sm text-graphite/60">No pro products available</p>
          ) : (
            proProducts.map((product) => (
              <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedProIds.includes(product.id)}
                  onChange={() => toggleProProduct(product.id)}
                  className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
                />
                <span className="text-sm text-graphite">{product.product_name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Retail Products</label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-accent-soft rounded-lg p-3">
          {retailProducts.length === 0 ? (
            <p className="text-sm text-graphite/60">No retail products available</p>
          ) : (
            retailProducts.map((product) => (
              <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedRetailIds.includes(product.id)}
                  onChange={() => toggleRetailProduct(product.id)}
                  className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
                />
                <span className="text-sm text-graphite">{product.product_name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RichTextModuleEditor({
  config,
  updateConfig,
}: {
  config: any;
  updateConfig: (updates: any) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const content = config.content || '';

  function renderPreview(text: string) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map((para, i) => {
      const formatted = para
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return <p key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => updateConfig({ content: e.target.value })}
          rows={10}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite font-mono text-sm"
          placeholder="Enter your content here. Use **bold** and *italic* for formatting."
        />
      </div>
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background transition-colors"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>
      {showPreview && content && (
        <div className="p-4 border border-accent-soft rounded-lg bg-white">
          <h4 className="text-sm font-medium text-graphite mb-3">Preview</h4>
          <div className="prose max-w-none text-graphite">
            {renderPreview(content)}
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadsModuleEditor({
  config,
  updateConfig,
}: {
  config: any;
  updateConfig: (updates: any) => void;
}) {
  const downloads = config.downloads || [];

  function addDownload() {
    updateConfig({ downloads: [...downloads, { title: '', url: '' }] });
  }

  function updateDownload(index: number, field: 'title' | 'url', value: string) {
    const newDownloads = [...downloads];
    newDownloads[index][field] = value;
    updateConfig({ downloads: newDownloads });
  }

  function removeDownload(index: number) {
    updateConfig({ downloads: downloads.filter((_: any, i: number) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-graphite">Downloads</label>
      {downloads.map((download: any, index: number) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={download.title}
            onChange={(e) => updateDownload(index, 'title', e.target.value)}
            placeholder="Title"
            className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          />
          <input
            type="url"
            value={download.url}
            onChange={(e) => updateDownload(index, 'url', e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          />
          <button
            onClick={() => removeDownload(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        onClick={addDownload}
        className="flex items-center gap-2 px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Download
      </button>
    </div>
  );
}

function ProofPressModuleEditor({
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const testimonials = config.testimonials || [];

  function addTestimonial() {
    updateConfig({ testimonials: [...testimonials, { quote: '', author_name: '', author_title: '' }] });
  }

  function updateTestimonial(index: number, field: string, value: string) {
    const newTestimonials = [...testimonials];
    newTestimonials[index][field] = value;
    updateConfig({ testimonials: newTestimonials });
  }

  function removeTestimonial(index: number) {
    updateConfig({ testimonials: testimonials.filter((_: any, i: number) => i !== index) });
  }

  const variants = ['logo_strip', 'cards', 'full_width_quotes'];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-graphite">Testimonials</label>
      {testimonials.map((testimonial: any, index: number) => (
        <div key={index} className="p-4 border border-accent-soft rounded-lg space-y-3">
          <textarea
            value={testimonial.quote}
            onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
            placeholder="Quote"
            rows={2}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={testimonial.author_name}
              onChange={(e) => updateTestimonial(index, 'author_name', e.target.value)}
              placeholder="Author Name"
              className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
            <input
              type="text"
              value={testimonial.author_title}
              onChange={(e) => updateTestimonial(index, 'author_title', e.target.value)}
              placeholder="Author Title"
              className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
            <button
              onClick={() => removeTestimonial(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addTestimonial}
        className="flex items-center gap-2 px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Testimonial
      </button>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandStoryModuleEditor({
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const variants = ['narrative', 'timeline', 'split'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Origin Story</label>
        <textarea
          value={config.origin_story || ''}
          onChange={(e) => updateConfig({ origin_story: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="Tell your brand's origin story..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Founder Quote</label>
        <input
          type="text"
          value={config.founder_quote || ''}
          onChange={(e) => updateConfig({ founder_quote: e.target.value })}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="A memorable quote from the founder"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Founder Name</label>
        <input
          type="text"
          value={config.founder_name || ''}
          onChange={(e) => updateConfig({ founder_name: e.target.value })}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="Founder's name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBarModuleEditor({
  config,
  updateConfig,
  layoutVariant,
  updateLayoutVariant,
}: {
  config: any;
  updateConfig: (updates: any) => void;
  layoutVariant: string;
  updateLayoutVariant: (variant: string) => void;
}) {
  const stats = config.stats || [];

  function addStat() {
    updateConfig({ stats: [...stats, { label: '', value: '' }] });
  }

  function updateStat(index: number, field: 'label' | 'value', value: string) {
    const newStats = [...stats];
    newStats[index][field] = value;
    updateConfig({ stats: newStats });
  }

  function removeStat(index: number) {
    updateConfig({ stats: stats.filter((_: any, i: number) => i !== index) });
  }

  const variants = ['horizontal', 'cards', 'centered'];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-graphite">Stats</label>
      {stats.map((stat: any, index: number) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={stat.label}
            onChange={(e) => updateStat(index, 'label', e.target.value)}
            placeholder="Label (e.g., Years in Business)"
            className="flex-1 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          />
          <input
            type="text"
            value={stat.value}
            onChange={(e) => updateStat(index, 'value', e.target.value)}
            placeholder="Value (e.g., 25+)"
            className="w-32 px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          />
          <button
            onClick={() => removeStat(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        onClick={addStat}
        className="flex items-center gap-2 px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Stat
      </button>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Layout Variant</label>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => updateLayoutVariant(variant)}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                layoutVariant === variant
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTAModuleEditor({
  config,
  updateConfig,
}: {
  config: any;
  updateConfig: (updates: any) => void;
}) {
  const backgroundStyles = ['solid_color', 'gradient', 'image'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Headline</label>
        <input
          type="text"
          value={config.headline || ''}
          onChange={(e) => updateConfig({ headline: e.target.value })}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="Call to action headline"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Body Text</label>
        <textarea
          value={config.body || ''}
          onChange={(e) => updateConfig({ body: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
          placeholder="Supporting text"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">Button Label</label>
          <input
            type="text"
            value={config.button_label || ''}
            onChange={(e) => updateConfig({ button_label: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="Get Started"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">Button URL</label>
          <input
            type="url"
            value={config.button_url || ''}
            onChange={(e) => updateConfig({ button_url: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="https://..."
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Background Style</label>
        <div className="flex gap-2">
          {backgroundStyles.map((style) => (
            <button
              key={style}
              onClick={() => updateConfig({ background_style: style })}
              className={`px-3 py-2 text-sm rounded border capitalize ${
                (config.background_style || 'solid_color') === style
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite border-accent-soft hover:border-accent-soft'
              }`}
            >
              {style.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      {config.background_style === 'image' && (
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">Background Image URL</label>
          <input
            type="url"
            value={config.background_image || ''}
            onChange={(e) => updateConfig({ background_image: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}

function MediaLibraryTab({
  brandId,
  showToast,
}: {
  brandId: string;
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFailures, setUploadFailures] = useState<string[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading: loading, refetch: loadAssets } = useQuery({
    queryKey: ['admin', 'brand-media-assets', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) {
        showToast('error', error.message);
        return [];
      }

      setAssets(data || []);
      return data || [];
    },
    enabled: !!brandId,
  });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      await uploadFiles(Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  }

  async function uploadFiles(files: File[]) {
    if (!files.length || !brandId) return;

    setUploading(true);
    setUploadError(null);
    setUploadFailures([]);
    setUploadProgress(0);

    const maxSize = 10 * 1024 * 1024;
    const failures: string[] = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) {
        const reason = `${file.name}: exceeds 10MB limit`;
        setUploadError(reason);
        failures.push(reason);
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${brandId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('brand-assets')
          .upload(filePath, file);

        if (uploadError) {
          const reason = `${file.name}: upload failed (${uploadError.message})`;
          setUploadError(reason);
          failures.push(reason);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('brand_assets')
          .insert([{
            brand_id: brandId,
            file_url: publicUrlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            collection: 'general',
          }]);

        if (insertError) {
          const reason = `${file.name}: metadata save failed (${insertError.message})`;
          setUploadError(reason);
          failures.push(reason);
        } else {
          successCount += 1;
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (err: any) {
        const reason = `${file.name}: unexpected upload error (${err.message})`;
        setUploadError(reason);
        failures.push(reason);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    setUploadFailures(failures);
    await loadAssets();
    if (successCount > 0) {
      showToast('success', `Uploaded ${successCount} file(s)`);
    }
    if (failures.length > 0) {
      showToast('error', `${failures.length} file(s) failed to upload`);
    }
  }

  async function toggleFeatured(asset: BrandAsset) {
    const { error } = await supabase
      .from('brand_assets')
      .update({ is_featured: !asset.is_featured })
      .eq('id', asset.id);

    if (error) {
      showToast('error', error.message);
    } else {
      setAssets(assets.map(a => a.id === asset.id ? { ...a, is_featured: !a.is_featured } : a));
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const collectionMatch = collectionFilter === 'all' || asset.collection === collectionFilter;
    const typeMatch =
      typeFilter === 'all' ||
      (typeFilter === 'image' && asset.file_type.startsWith('image/')) ||
      (typeFilter === 'video' && asset.file_type.startsWith('video/')) ||
      (typeFilter === 'document' && asset.file_type === 'application/pdf');
    const featuredMatch = !featuredOnly || asset.is_featured;
    const query = searchTerm.trim().toLowerCase();
    const searchMatch =
      !query ||
      (asset.file_name || '').toLowerCase().includes(query) ||
      (asset.title || '').toLowerCase().includes(query) ||
      (asset.caption || '').toLowerCase().includes(query) ||
      (asset.collection || '').toLowerCase().includes(query) ||
      (asset.tags || []).some((tag) => tag.toLowerCase().includes(query));

    return collectionMatch && typeMatch && featuredMatch && searchMatch;
  });

  const featuredCount = assets.filter((a) => a.is_featured).length;
  const imageCount = assets.filter((a) => a.file_type.startsWith('image/')).length;
  const videoCount = assets.filter((a) => a.file_type.startsWith('video/')).length;
  const documentCount = assets.filter((a) => a.file_type === 'application/pdf').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-accent-soft rounded-lg p-3">
          <p className="text-xs text-graphite/60">Total Assets</p>
          <p className="text-xl font-semibold text-graphite">{assets.length}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-lg p-3">
          <p className="text-xs text-graphite/60">Featured</p>
          <p className="text-xl font-semibold text-graphite">{featuredCount}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-lg p-3">
          <p className="text-xs text-graphite/60">Images</p>
          <p className="text-xl font-semibold text-graphite">{imageCount}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-lg p-3">
          <p className="text-xs text-graphite/60">Videos</p>
          <p className="text-xl font-semibold text-graphite">{videoCount}</p>
        </div>
        <div className="bg-white border border-accent-soft rounded-lg p-3">
          <p className="text-xs text-graphite/60">Documents</p>
          <p className="text-xl font-semibold text-graphite">{documentCount}</p>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          uploading
            ? 'border-graphite bg-accent-soft'
            : 'border-accent-soft hover:border-accent-soft hover:bg-accent-soft/50 cursor-pointer'
        }`}
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-graphite/60 mx-auto mb-4" />
        <p className="text-lg font-medium text-graphite mb-2">
          {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
        </p>
        <p className="text-sm text-graphite/60">
          Images (JPG, PNG, WebP), Videos (MP4), Documents (PDF) — Max 10MB
        </p>

        {uploading && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="h-2 bg-accent-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-graphite transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadError && (
          <p className="mt-4 text-sm text-red-600">{uploadError}</p>
        )}
        {uploadFailures.length > 0 && (
          <div className="mt-4 text-left max-w-xl mx-auto bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-800 mb-2">Upload Issues</p>
            <ul className="space-y-1">
              {uploadFailures.slice(0, 4).map((failure) => (
                <li key={failure} className="text-xs text-red-700">
                  {failure}
                </li>
              ))}
            </ul>
            {uploadFailures.length > 4 && (
              <p className="text-xs text-red-700 mt-2">+{uploadFailures.length - 4} more</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-accent-soft rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets by name, tags, title, caption..."
              className="w-full pl-9 pr-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'image' | 'video' | 'document')}
            className="px-3 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite text-sm"
          >
            <option value="all">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-graphite px-3 py-2 border border-accent-soft rounded-lg">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
            />
            Featured only
          </label>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'hero', 'protocols', 'retail', 'education', 'press', 'general'] as CollectionFilter[]).map((collection) => (
          <button
            key={collection}
            onClick={() => setCollectionFilter(collection)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              collectionFilter === collection
                ? 'bg-graphite text-white'
                : 'bg-accent-soft text-graphite hover:bg-accent-soft'
            }`}
          >
            {collection}
          </button>
        ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-graphite animate-spin" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60">No media uploaded yet. Drag files above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onToggleFeatured={toggleFeatured}
              onSelect={setSelectedAsset}
            />
          ))}
        </div>
      )}

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onSave={async () => {
            await loadAssets();
            setSelectedAsset(null);
            showToast('success', 'Asset updated');
          }}
          onDelete={async () => {
            await loadAssets();
            setSelectedAsset(null);
            showToast('success', 'Asset deleted');
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function AssetCard({
  asset,
  onToggleFeatured,
  onSelect,
}: {
  asset: BrandAsset;
  onToggleFeatured: (asset: BrandAsset) => void;
  onSelect: (asset: BrandAsset) => void;
}) {
  const isImage = asset.file_type.startsWith('image/');
  const isVideo = asset.file_type.startsWith('video/');
  const isPDF = asset.file_type === 'application/pdf';

  return (
    <div
      className="group relative rounded-lg overflow-hidden border border-accent-soft hover:shadow-md transition-all cursor-pointer aspect-square"
      onClick={() => onSelect(asset)}
    >
      {isImage ? (
        <img
          src={asset.file_url}
          alt={asset.alt_text || asset.file_name}
          className="w-full h-full object-cover"
        />
      ) : isPDF ? (
        <div className="w-full h-full bg-accent-soft flex items-center justify-center">
          <FileText className="w-12 h-12 text-graphite/60" />
        </div>
      ) : isVideo ? (
        <div className="w-full h-full bg-accent-soft flex items-center justify-center">
          <Film className="w-12 h-12 text-graphite/60" />
        </div>
      ) : (
        <div className="w-full h-full bg-accent-soft" />
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
        <p className="text-xs text-white truncate">{asset.file_name}</p>
        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded">
          {asset.collection}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFeatured(asset);
        }}
        className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
      >
        <Star
          className={`w-4 h-4 ${
            asset.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-graphite/60'
          }`}
        />
      </button>
    </div>
  );
}

function AssetDetailModal({
  asset,
  onClose,
  onSave,
  onDelete,
  showToast,
}: {
  asset: BrandAsset;
  onClose: () => void;
  onSave: (asset: BrandAsset) => void;
  onDelete: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [formData, setFormData] = useState({
    title: asset.title || '',
    alt_text: asset.alt_text || '',
    caption: asset.caption || '',
    collection: asset.collection,
    tags: asset.tags || [],
    is_featured: asset.is_featured,
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isImage = asset.file_type.startsWith('image/');

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('brand_assets')
      .update(formData)
      .eq('id', asset.id);

    if (error) {
      showToast('error', error.message);
      setSaving(false);
    } else {
      onSave({ ...asset, ...formData });
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this asset? This cannot be undone.')) return;

    setDeleting(true);

    const filePath = asset.file_url.split('/brand-assets/')[1];

    const { error: storageError } = await supabase.storage
      .from('brand-assets')
      .remove([filePath]);

    if (storageError) {
      showToast('error', storageError.message);
      setDeleting(false);
      return;
    }

    const { error: dbError } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', asset.id);

    if (dbError) {
      showToast('error', dbError.message);
      setDeleting(false);
    } else {
      onDelete();
    }
  }

  function addTag() {
    if (!tagInput.trim() || formData.tags.includes(tagInput.trim())) return;
    setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    setTagInput('');
  }

  function removeTag(tag: string) {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(asset.file_url);
      showToast('success', 'Asset URL copied');
    } catch (err) {
      console.error('Failed to copy asset URL', err);
      showToast('error', 'Could not copy asset URL');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-accent-soft">
          <h2 className="text-xl font-semibold text-graphite">Asset Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent-soft rounded-lg transition-colors">
            <X className="w-5 h-5 text-graphite/60" />
          </button>
        </div>

        <div className="p-6 border-b border-accent-soft bg-background">
          {isImage ? (
            <img
              src={asset.file_url}
              alt={asset.alt_text || asset.file_name}
              className="max-h-96 w-auto mx-auto object-contain rounded-lg"
            />
          ) : (
            <div className="text-center py-8">
              {asset.file_type.startsWith('video/') ? (
                <Film className="w-16 h-16 text-graphite/60 mx-auto mb-4" />
              ) : (
                <FileText className="w-16 h-16 text-graphite/60 mx-auto mb-4" />
              )}
              <p className="font-medium text-graphite mb-1">{asset.file_name}</p>
              <p className="text-sm text-graphite/60 mb-4">
                {asset.file_type} • {formatFileSize(asset.file_size)}
              </p>
              <a
                href={asset.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          )}
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            <a
              href={asset.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm border border-accent-soft rounded-lg hover:bg-background transition-colors"
            >
              Open File
            </a>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-3 py-2 text-sm border border-accent-soft rounded-lg hover:bg-background transition-colors"
            >
              Copy URL
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="Asset title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Alt Text
              <span className="text-xs text-graphite/60 ml-2">Describe the image for accessibility</span>
            </label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="Descriptive text for screen readers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Caption</label>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="Image caption"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Collection</label>
            <select
              value={formData.collection}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            >
              <option value="general">General</option>
              <option value="hero">Hero</option>
              <option value="protocols">Protocols</option>
              <option value="retail">Retail</option>
              <option value="education">Education</option>
              <option value="press">Press</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent-soft text-graphite rounded-full text-sm"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-graphite">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="Type a tag and press Enter"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
              />
              <span className="text-sm font-medium text-graphite">Featured</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-accent-soft bg-background">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemePreview({ theme, brandName }: { theme: BrandTheme; brandName: string }) {
  const { colors, typography, density, hero_variant } = theme;

  const spacingClass = {
    spacious: 'p-8 space-y-6',
    balanced: 'p-6 space-y-4',
    dense: 'p-4 space-y-3',
  }[density];

  const typographyHeadingClass = {
    luxury: 'font-sans font-light',
    modern: 'font-sans font-bold tracking-tight',
    clinical: 'font-sans font-semibold',
  }[typography];

  const typographyBodyClass = {
    luxury: 'font-light',
    modern: 'font-normal',
    clinical: 'text-sm leading-tight',
  }[typography];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-accent-soft">
      <div className="bg-graphite px-4 py-2 text-white text-xs font-medium">
        Live Preview
      </div>

      <div className={spacingClass} style={{ backgroundColor: colors.surface }}>
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: colors.primary,
            height: hero_variant === 'full_bleed' ? '120px' : hero_variant === 'minimal' ? '80px' : '100px',
          }}
        >
          {hero_variant === 'full_bleed' && (
            <div className="h-full flex items-center justify-center text-white p-4">
              <span className={`${typographyHeadingClass} text-lg`}>
                {brandName || 'Brand Name'}
              </span>
            </div>
          )}
          {hero_variant === 'split' && (
            <div className="h-full flex">
              <div className="w-1/2" style={{ backgroundColor: colors.primary }} />
              <div className="w-1/2 flex items-center justify-center p-2" style={{ backgroundColor: colors.surface }}>
                <span className={`${typographyHeadingClass} text-xs`} style={{ color: colors.text }}>
                  {brandName || 'Brand'}
                </span>
              </div>
            </div>
          )}
          {hero_variant === 'video' && (
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-0 h-0 border-t-6 border-b-6 border-l-8 border-transparent border-l-white ml-1" />
              </div>
            </div>
          )}
          {hero_variant === 'minimal' && (
            <div className="h-full flex items-center justify-center" style={{ backgroundColor: colors.surface }}>
              <span className={`${typographyHeadingClass} text-sm`} style={{ color: colors.text }}>
                {brandName || 'Brand Name'}
              </span>
            </div>
          )}
          {hero_variant === 'editorial' && (
            <div className="h-full flex items-end p-4" style={{ backgroundColor: colors.primary }}>
              <span className={`${typographyHeadingClass} text-xl text-white`}>
                {brandName || 'Brand'}
              </span>
            </div>
          )}
        </div>

        <div>
          <h3
            className={`${typographyHeadingClass} text-base mb-2`}
            style={{ color: colors.text }}
          >
            Headline Text
          </h3>
          <p
            className={`${typographyBodyClass} text-xs leading-relaxed`}
            style={{ color: colors.text, opacity: 0.7 }}
          >
            Body text appears in this style with the selected typography mood and visual density.
          </p>
        </div>

        <button
          className="w-full py-2 px-4 rounded-lg font-medium text-white text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.accent }}
        >
          Call to Action
        </button>

        <div className="flex gap-2">
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: colors.primary }}
            title="Primary"
          />
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: colors.secondary }}
            title="Secondary"
          />
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: colors.accent }}
            title="Accent"
          />
        </div>
      </div>
    </div>
  );
}

function EducationTab({
  brandId,
  showToast,
}: {
  brandId: string;
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { isLoading: loading, refetch: loadModules } = useQuery({
    queryKey: ['admin', 'brand-training-modules', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_training_modules')
        .select('*')
        .eq('brand_id', brandId)
        .order('sort_order', { ascending: true });

      if (error) {
        showToast('error', error.message);
        return [];
      }

      setModules(data || []);
      return data || [];
    },
    enabled: !!brandId,
  });

  async function addModule() {
    if (!brandId) return;

    const newModule = {
      brand_id: brandId,
      title: 'New Training Module',
      description: '',
      format: 'pdf' as const,
      duration: '',
      level: 'beginner' as const,
      resource_url: '',
      sort_order: modules.length,
      is_published: false,
    };

    const { data, error } = await supabase
      .from('brand_training_modules')
      .insert([newModule])
      .select()
      .single();

    if (error) {
      showToast('error', error.message);
    } else {
      await loadModules();
      setExpandedModules(new Set([data.id]));
      showToast('success', 'Training module added');
    }
  }

  async function updateModule(id: string, updates: Partial<TrainingModule>) {
    const { error } = await supabase
      .from('brand_training_modules')
      .update(updates)
      .eq('id', id);

    if (error) {
      showToast('error', error.message);
    } else {
      setModules(modules.map(m => m.id === id ? { ...m, ...updates } : m));
    }
  }

  async function deleteModule(id: string) {
    if (!confirm('Delete this training module? This cannot be undone.')) return;

    const { error } = await supabase
      .from('brand_training_modules')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('error', error.message);
    } else {
      await loadModules();
      showToast('success', 'Training module deleted');
    }
  }

  async function moveModule(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const newModules = [...modules];
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];

    newModules.forEach((module, idx) => {
      module.sort_order = idx;
    });

    setModules(newModules);

    for (const module of newModules) {
      await supabase
        .from('brand_training_modules')
        .update({ sort_order: module.sort_order })
        .eq('id', module.id);
    }
  }

  function toggleExpanded(id: string) {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedModules(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-graphite animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-graphite">Education</h2>
        <button
          onClick={addModule}
          className="flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Training Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="bg-white rounded-lg border border-accent-soft p-16 text-center">
          <GraduationCap className="w-16 h-16 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60">No training modules yet. Add educational content for spa partners.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <TrainingModuleCard
              key={module.id}
              module={module}
              index={index}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              isExpanded={expandedModules.has(module.id)}
              onToggleExpanded={() => toggleExpanded(module.id)}
              onUpdate={updateModule}
              onDelete={deleteModule}
              onMove={moveModule}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TrainingModuleCard({
  module,
  index,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpanded,
  onUpdate,
  onDelete,
  onMove,
}: {
  module: TrainingModule;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (id: string, updates: Partial<TrainingModule>) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}) {
  const formatColors = {
    pdf: 'bg-red-100 text-red-800',
    video: 'bg-accent-soft text-graphite',
    link: 'bg-green-100 text-green-800',
    slide_deck: 'bg-purple-100 text-purple-800',
  };

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMove(index, 'up')}
            disabled={isFirst}
            className="p-1 hover:bg-accent-soft rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-graphite/60" />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={isLast}
            className="p-1 hover:bg-accent-soft rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-graphite/60" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="font-medium text-graphite">{module.title}</span>
          <span className={`px-2 py-1 text-xs rounded capitalize ${formatColors[module.format]}`}>
            {module.format.replace('_', ' ')}
          </span>
          {module.duration && (
            <span className="text-sm text-graphite/60">{module.duration}</span>
          )}
          <span className={`px-2 py-1 text-xs rounded capitalize ${levelColors[module.level]}`}>
            {module.level}
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={module.is_published}
            onChange={(e) => onUpdate(module.id, { is_published: e.target.checked })}
            className="sr-only"
          />
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              module.is_published ? 'bg-green-500' : 'bg-accent-soft'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${
                module.is_published ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </label>

        <button
          onClick={onToggleExpanded}
          className="p-2 hover:bg-accent-soft rounded transition-colors"
        >
          <ChevronRight
            className={`w-5 h-5 text-graphite/60 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>

        <button
          onClick={() => onDelete(module.id)}
          className="p-2 hover:bg-red-50 rounded transition-colors group"
        >
          <Trash2 className="w-5 h-5 text-graphite/60 group-hover:text-red-600 transition-colors" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-accent-soft p-6 bg-background space-y-4">
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Title *</label>
            <input
              type="text"
              value={module.title}
              onChange={(e) => onUpdate(module.id, { title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Description</label>
            <textarea
              value={module.description || ''}
              onChange={(e) => onUpdate(module.id, { description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Format *</label>
              <select
                value={module.format}
                onChange={(e) => onUpdate(module.id, { format: e.target.value as TrainingModule['format'] })}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="slide_deck">Slide Deck</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Duration</label>
              <input
                type="text"
                value={module.duration || ''}
                onChange={(e) => onUpdate(module.id, { duration: e.target.value })}
                placeholder="e.g., 15 min"
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Level *</label>
              <select
                value={module.level}
                onChange={(e) => onUpdate(module.id, { level: e.target.value as TrainingModule['level'] })}
                className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Resource URL</label>
            <input
              type="url"
              value={module.resource_url || ''}
              onChange={(e) => onUpdate(module.id, { resource_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CommercialTab({
  brandId,
  showToast,
}: {
  brandId: string;
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [assets, setAssets] = useState<CommercialAsset[]>([]);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  const { isLoading: loading, refetch: loadAssets } = useQuery({
    queryKey: ['admin', 'brand-commercial-assets', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_commercial_assets')
        .select('*')
        .eq('brand_id', brandId)
        .order('sort_order', { ascending: true });

      if (error) {
        showToast('error', error.message);
        return [];
      }

      setAssets(data || []);
      return data || [];
    },
    enabled: !!brandId,
  });

  async function addAsset() {
    if (!brandId) return;

    const newAsset = {
      brand_id: brandId,
      title: 'New Commercial Asset',
      asset_type: 'sell_sheet' as const,
      resource_url: '',
      notes: '',
      is_internal_only: false,
      sort_order: assets.length,
    };

    const { data, error } = await supabase
      .from('brand_commercial_assets')
      .insert([newAsset])
      .select()
      .single();

    if (error) {
      showToast('error', error.message);
    } else {
      await loadAssets();
      setExpandedAssets(new Set([data.id]));
      showToast('success', 'Commercial asset added');
    }
  }

  async function updateAsset(id: string, updates: Partial<CommercialAsset>) {
    const { error } = await supabase
      .from('brand_commercial_assets')
      .update(updates)
      .eq('id', id);

    if (error) {
      showToast('error', error.message);
    } else {
      setAssets(assets.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  }

  async function deleteAsset(id: string) {
    if (!confirm('Delete this commercial asset? This cannot be undone.')) return;

    const { error } = await supabase
      .from('brand_commercial_assets')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('error', error.message);
    } else {
      await loadAssets();
      showToast('success', 'Commercial asset deleted');
    }
  }

  async function moveAsset(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= assets.length) return;

    const newAssets = [...assets];
    [newAssets[index], newAssets[targetIndex]] = [newAssets[targetIndex], newAssets[index]];

    newAssets.forEach((asset, idx) => {
      asset.sort_order = idx;
    });

    setAssets(newAssets);

    for (const asset of newAssets) {
      await supabase
        .from('brand_commercial_assets')
        .update({ sort_order: asset.sort_order })
        .eq('id', asset.id);
    }
  }

  function toggleExpanded(id: string) {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAssets(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-graphite animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-graphite">Commercial</h2>
        <button
          onClick={addAsset}
          className="flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Commercial Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white rounded-lg border border-accent-soft p-16 text-center">
          <Briefcase className="w-16 h-16 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60">No commercial assets yet. Add sell sheets, price lists, and partnership terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset, index) => (
            <CommercialAssetCard
              key={asset.id}
              asset={asset}
              index={index}
              isFirst={index === 0}
              isLast={index === assets.length - 1}
              isExpanded={expandedAssets.has(asset.id)}
              onToggleExpanded={() => toggleExpanded(asset.id)}
              onUpdate={updateAsset}
              onDelete={deleteAsset}
              onMove={moveAsset}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommercialAssetCard({
  asset,
  index,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpanded,
  onUpdate,
  onDelete,
  onMove,
}: {
  asset: CommercialAsset;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (id: string, updates: Partial<CommercialAsset>) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}) {
  const typeColors = {
    sell_sheet: 'bg-accent-soft text-graphite',
    price_list: 'bg-green-100 text-green-800',
    margin_guide: 'bg-purple-100 text-purple-800',
    terms: 'bg-accent-soft text-graphite',
    moq_info: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMove(index, 'up')}
            disabled={isFirst}
            className="p-1 hover:bg-accent-soft rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-graphite/60" />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={isLast}
            className="p-1 hover:bg-accent-soft rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-graphite/60" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="font-medium text-graphite">{asset.title}</span>
          <span className={`px-2 py-1 text-xs rounded capitalize ${typeColors[asset.asset_type]}`}>
            {asset.asset_type.replace('_', ' ')}
          </span>
          {asset.is_internal_only && (
            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
              Internal Only
            </span>
          )}
        </div>

        <button
          onClick={onToggleExpanded}
          className="p-2 hover:bg-accent-soft rounded transition-colors"
        >
          <ChevronRight
            className={`w-5 h-5 text-graphite/60 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>

        <button
          onClick={() => onDelete(asset.id)}
          className="p-2 hover:bg-red-50 rounded transition-colors group"
        >
          <Trash2 className="w-5 h-5 text-graphite/60 group-hover:text-red-600 transition-colors" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-accent-soft p-6 bg-background space-y-4">
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Title *</label>
            <input
              type="text"
              value={asset.title}
              onChange={(e) => onUpdate(asset.id, { title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Asset Type *</label>
            <select
              value={asset.asset_type}
              onChange={(e) => onUpdate(asset.id, { asset_type: e.target.value as CommercialAsset['asset_type'] })}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            >
              <option value="sell_sheet">Sell Sheet</option>
              <option value="price_list">Price List</option>
              <option value="margin_guide">Margin Guide</option>
              <option value="terms">Terms</option>
              <option value="moq_info">MOQ Info</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Resource URL</label>
            <input
              type="url"
              value={asset.resource_url || ''}
              onChange={(e) => onUpdate(asset.id, { resource_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Notes</label>
            <textarea
              value={asset.notes || ''}
              onChange={(e) => onUpdate(asset.id, { notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={asset.is_internal_only}
                onChange={(e) => onUpdate(asset.id, { is_internal_only: e.target.checked })}
                className="mt-1 w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
              />
              <div>
                <span className="block text-sm font-medium text-graphite">Internal Only</span>
                <span className="block text-xs text-graphite/60 mt-1">
                  Internal assets are only visible to platform admins, not to businesses or brand partners
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopSettingsTab({
  brand,
  updateBrandField,
  showToast,
}: {
  brand: Brand;
  updateBrandField: <K extends keyof Brand>(field: K, value: Brand[K]) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [settings, setSettings] = useState<ShopSettings>({
    brand_id: brand.id,
    rep_email: brand.contact_email || '',
    allow_retail_orders: true,
    allow_pro_orders: true,
    min_order_amount: null,
    lead_time_days: null,
    ordering_notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const { isLoading: loading } = useQuery({
    queryKey: ['admin', 'brand-shop-settings', brand.id],
    queryFn: async () => {
      setSchemaMissing(false);

      const { data, error } = await supabase
        .from('brand_shop_settings')
        .select('*')
        .eq('brand_id', brand.id)
        .maybeSingle();

      if (error) {
        const message = error.message?.toLowerCase() || '';
        const isMissingRelation = message.includes('does not exist') || message.includes('relation') || error.code === '42P01';
        if (isMissingRelation) {
          setSchemaMissing(true);
          return null;
        }
        showToast('error', error.message);
        return null;
      }

      if (data) {
        setSettings(data);
      } else {
        setSettings((prev) => ({
          ...prev,
          brand_id: brand.id,
          rep_email: brand.contact_email || prev.rep_email,
        }));
      }

      return data;
    },
    enabled: !!brand.id,
  });

  async function saveSettings() {
    if (!brand.id) {
      showToast('error', 'Save the brand first');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...settings,
        brand_id: brand.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('brand_shop_settings')
        .upsert(payload, { onConflict: 'brand_id' });

      if (error) {
        const message = error.message?.toLowerCase() || '';
        const isMissingRelation = message.includes('does not exist') || message.includes('relation') || error.code === '42P01';
        if (isMissingRelation) {
          setSchemaMissing(true);
          showToast('error', 'Shop settings schema is missing. See SUPABASE_MIGRATIONS_REQUIRED.md');
        } else {
          showToast('error', error.message);
        }
        return;
      }

      if (settings.rep_email !== brand.contact_email) {
        updateBrandField('contact_email', settings.rep_email);
      }

      showToast('success', 'Shop settings saved');
    } catch (err) {
      console.error('Failed to save shop settings', err);
      showToast('error', 'Failed to save shop settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-graphite animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-graphite">Shop Settings</h2>
        <button
          onClick={saveSettings}
          disabled={saving || schemaMissing}
          className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:bg-accent-soft disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {schemaMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-900 font-medium mb-1">Shop settings table not found</p>
          <p className="text-sm text-amber-800">
            Apply the SQL in <span className="font-mono">SUPABASE_MIGRATIONS_REQUIRED.md</span> to enable this tab.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-accent-soft p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">Brand Rep Email</label>
          <input
            type="email"
            value={settings.rep_email || ''}
            onChange={(e) => setSettings({ ...settings, rep_email: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="rep@brand.com"
            disabled={schemaMissing}
          />
          <p className="text-xs text-graphite/60 mt-1">Used for order handoff and admin communication.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 border border-accent-soft rounded-lg">
            <span className="text-sm font-medium text-graphite">Allow Retail Orders</span>
            <input
              type="checkbox"
              checked={settings.allow_retail_orders}
              onChange={(e) => setSettings({ ...settings, allow_retail_orders: e.target.checked })}
              className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
              disabled={schemaMissing}
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-accent-soft rounded-lg">
            <span className="text-sm font-medium text-graphite">Allow PRO Orders</span>
            <input
              type="checkbox"
              checked={settings.allow_pro_orders}
              onChange={(e) => setSettings({ ...settings, allow_pro_orders: e.target.checked })}
              className="w-4 h-4 text-graphite border-accent-soft rounded focus:ring-graphite"
              disabled={schemaMissing}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Minimum Order Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.min_order_amount ?? ''}
              onChange={(e) => setSettings({ ...settings, min_order_amount: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="0.00"
              disabled={schemaMissing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Lead Time (days)</label>
            <input
              type="number"
              min="0"
              value={settings.lead_time_days ?? ''}
              onChange={(e) => setSettings({ ...settings, lead_time_days: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
              placeholder="7"
              disabled={schemaMissing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite mb-2">Ordering Notes</label>
          <textarea
            rows={4}
            value={settings.ordering_notes || ''}
            onChange={(e) => setSettings({ ...settings, ordering_notes: e.target.value })}
            className="w-full px-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            placeholder="Special ordering instructions, cutoff times, or terms"
            disabled={schemaMissing}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewTab({
  brand,
  modules,
  loading,
}: {
  brand: Brand;
  modules: PageModule[];
  loading: boolean;
}) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const containerClass =
    deviceMode === 'desktop'
      ? 'max-w-full'
      : deviceMode === 'tablet'
      ? 'max-w-3xl mx-auto'
      : 'max-w-sm mx-auto';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-lg border border-accent-soft p-4">
        <h2 className="text-2xl font-bold text-graphite">Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-graphite text-white'
                : 'bg-accent-soft text-graphite hover:bg-accent-soft'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              deviceMode === 'tablet'
                ? 'bg-graphite text-white'
                : 'bg-accent-soft text-graphite hover:bg-accent-soft'
            }`}
          >
            <Tablet className="w-4 h-4" />
            Tablet
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-graphite text-white'
                : 'bg-accent-soft text-graphite hover:bg-accent-soft'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-graphite animate-spin" />
        </div>
      ) : (
        <div className="bg-accent-soft p-6 rounded-lg border border-accent-soft">
          <div className={`${containerClass} transition-all duration-300`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <BrandPageRenderer
                brand={{
                  name: brand.name,
                  slug: brand.slug,
                  description: brand.description || '',
                  long_description: brand.long_description || undefined,
                  logo_url: brand.logo_url || undefined,
                  hero_image_url: brand.hero_image_url || undefined,
                  theme: brand.theme || {
                    colors: {
                      primary: '#1e293b',
                      secondary: '#475569',
                      accent: '#3b82f6',
                      surface: '#f8fafc',
                      text: '#0f172a',
                    },
                    typography: 'modern',
                    density: 'balanced',
                    hero_variant: 'full_bleed',
                  },
                }}
                modules={modules}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
