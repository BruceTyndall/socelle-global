import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, AlertCircle, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { exportToCSV } from '../../lib/csvExport';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
  is_published?: boolean;
  description: string | null;
  short_description?: string | null;
  category_tags?: string[];
  theme?: {
    colors?: {
      accent?: string;
      primary?: string;
    };
  } | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminBrandList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: brands = [], isLoading: loading, error: queryError, refetch: loadBrands } = useQuery({
    queryKey: ['admin-brand-list'],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .order('updated_at', { ascending: false });
      if (fetchError) throw fetchError;
      return (data || []) as Brand[];
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  const filteredBrands = useMemo(() => {
    let filtered = brands;

    // Apply status filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(b => b.status === 'active' || b.is_published);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(b => b.status !== 'active' && !b.is_published);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.slug.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [searchTerm, brands, activeFilter]);

  function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  function getStatusBadge(brand: Brand) {
    if (brand.status === 'active' || brand.is_published) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Draft
        </span>
      );
    }
  }

  if (error) {
    return (
      <ErrorState
        icon={AlertCircle}
        title="Failed to Load Brands"
        message={error}
        action={{
          label: 'Retry',
          onClick: loadBrands,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-graphite">Brand Management</h1>
          <p className="text-graphite/60 mt-1">Manage brand content and publishing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              exportToCSV(
                filteredBrands.map(b => ({
                  name: b.name,
                  slug: b.slug,
                  status: b.status,
                  description: b.description || '',
                  tags: (b.category_tags || []).join(', '),
                  created_at: new Date(b.created_at).toLocaleDateString(),
                })),
                `brands_export_${new Date().toISOString().split('T')[0]}.csv`,
                [
                  { key: 'name', label: 'Brand Name' },
                  { key: 'slug', label: 'Slug' },
                  { key: 'status', label: 'Status' },
                  { key: 'description', label: 'Description' },
                  { key: 'tags', label: 'Tags' },
                  { key: 'created_at', label: 'Created' },
                ]
              )
            }
            disabled={filteredBrands.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-accent-soft text-graphite rounded-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            to="/admin/brands/new"
            className="flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Brand
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-accent-soft p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite/60" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-graphite text-white'
                  : 'bg-accent-soft text-graphite hover:bg-accent-soft'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'active'
                  ? 'bg-graphite text-white'
                  : 'bg-accent-soft text-graphite hover:bg-accent-soft'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'inactive'
                  ? 'bg-graphite text-white'
                  : 'bg-accent-soft text-graphite hover:bg-accent-soft'
              }`}
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Brand Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-accent-soft rounded-xl p-5 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent-soft animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-accent-soft rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-accent-soft rounded animate-pulse w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-accent-soft rounded animate-pulse w-full"></div>
                <div className="h-3 bg-accent-soft rounded animate-pulse w-5/6"></div>
              </div>
              <div className="h-9 bg-accent-soft rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-accent-soft">
          <Package className="w-16 h-16 text-accent-soft mb-4" />
          <p className="text-graphite/60 mb-4">
            {searchTerm || activeFilter !== 'all'
              ? 'No brands match your filters.'
              : 'No brands yet. Create your first brand to get started.'}
          </p>
          {!searchTerm && activeFilter === 'all' && (
            <Link
              to="/admin/brands/new"
              className="flex items-center gap-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Brand
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="border border-accent-soft rounded-xl hover:shadow-md transition-shadow bg-white overflow-hidden"
            >
              <div
                className="h-1.5"
                style={{ backgroundColor: brand.theme?.colors?.accent || brand.theme?.colors?.primary || '#475569' }}
              />

              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{ backgroundColor: brand.theme?.colors?.primary || '#475569' }}
                  >
                    {getInitial(brand.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-graphite truncate">
                      {brand.name}
                    </h3>
                    <div className="mt-1">
                      {getStatusBadge(brand)}
                    </div>
                  </div>
                </div>

                {(brand.short_description || brand.description) && (
                  <p className="text-graphite/60 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {brand.short_description || brand.description}
                  </p>
                )}

                {!!brand.category_tags?.length && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {brand.category_tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-accent-soft text-graphite rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {brand.category_tags.length > 3 && (
                      <span className="px-2.5 py-1 bg-accent-soft text-graphite rounded-full text-xs font-medium">
                        +{brand.category_tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <Link
                  to={`/admin/brands/${brand.id}`}
                  className="block w-full text-center px-4 py-2 bg-accent-soft text-graphite rounded-lg hover:bg-accent-soft transition-colors font-medium text-sm"
                >
                  Edit
                </Link>
                <p className="text-xs text-graphite/60 mt-3 truncate">/{brand.slug}</p>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
