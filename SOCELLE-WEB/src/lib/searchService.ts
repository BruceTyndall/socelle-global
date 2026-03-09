/**
 * searchService — full-text + faceted product/brand search via Supabase.
 *
 * Uses PostgreSQL full-text search (to_tsvector / plainto_tsquery) for
 * relevance ranking, combined with column-level filters for facets.
 * All queries are logged to the search_analytics table.
 */

import { supabase } from './supabase';
import { createScopedLogger } from './logger';

const log = createScopedLogger('SearchService');

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchFilters {
  query?: string;
  category?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  productType?: 'pro' | 'retail' | 'all';
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'name';
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResult {
  id: string;
  product_name: string;
  category: string | null;
  brand_id: string;
  brand_name: string;
  image_url: string | null;
  price: number | null;
  product_type: 'pro' | 'retail';
}

export interface BrandSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  category: string | null;
}

interface BrandSearchRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  category_tags: string[] | null;
}

export interface SearchResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Brand search ──────────────────────────────────────────────────────────────

export async function searchBrands(
  filters: SearchFilters,
): Promise<SearchResponse<BrandSearchResult>> {
  const { query = '', category, page = 1, pageSize = 20, sort = 'relevance' } = filters;
  const offset = (page - 1) * pageSize;

  let qb = supabase
    .from('brands')
    .select('id, name, slug, description, logo_url, hero_image_url, category_tags', { count: 'exact' })
    .or('is_published.eq.true,status.eq.active');

  if (category && category !== 'all') {
    qb = qb.contains('category_tags', [category]);
  }

  if (query.trim()) {
    // Full-text search on name + description
    qb = qb.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  switch (sort) {
    case 'name':
      qb = qb.order('name');
      break;
    default:
      qb = qb.order('name');
  }

  qb = qb.range(offset, offset + pageSize - 1);

  const { data, error, count } = await qb;

  if (error) {
    log.warn('Brand search query failed', { error: error.message });
    return { data: [], totalCount: 0, page, pageSize, hasMore: false };
  }

  const totalCount = count ?? 0;
  await logSearchAnalytics('brand', query, filters, totalCount);

  return {
    data:
      ((data as BrandSearchRow[]) ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        logo_url: row.logo_url,
        hero_image_url: row.hero_image_url,
        category:
          Array.isArray(row.category_tags) && row.category_tags.length > 0
            ? row.category_tags[0]
            : null,
      })) ?? [],
    totalCount,
    page,
    pageSize,
    hasMore: offset + pageSize < totalCount,
  };
}

// ── Product search ────────────────────────────────────────────────────────────

export async function searchProducts(
  filters: SearchFilters,
): Promise<SearchResponse<ProductSearchResult>> {
  const {
    query = '',
    category,
    brandId,
    minPrice,
    maxPrice,
    productType = 'all',
    page = 1,
    pageSize = 40,
    sort = 'relevance',
  } = filters;
  const offset = (page - 1) * pageSize;

  const tables: Array<'pro_products' | 'retail_products'> =
    productType === 'pro'
      ? ['pro_products']
      : productType === 'retail'
      ? ['retail_products']
      : ['pro_products', 'retail_products'];

  const allResults: ProductSearchResult[] = [];
  let totalCount = 0;

  for (const table of tables) {
    const priceCol = table === 'pro_products' ? 'unit_cost' : 'retail_price';
    const type = table === 'pro_products' ? 'pro' : 'retail';

    let qb = supabase
      .from(table)
      .select(
        `id, product_name, category, brand_id, image_url, ${priceCol}, brands!inner(name)`,
        { count: 'exact' },
      );

    if (brandId) qb = qb.eq('brand_id', brandId);
    if (category) qb = qb.ilike('category', `%${category}%`);
    if (query.trim()) {
      qb = qb.textSearch('search_vector', query.trim(), {
        type: 'plain',
        config: 'english',
      });
    }
    if (minPrice != null) qb = qb.gte(priceCol, minPrice);
    if (maxPrice != null) qb = qb.lte(priceCol, maxPrice);

    switch (sort) {
      case 'price_asc':  qb = qb.order(priceCol, { ascending: true }); break;
      case 'price_desc': qb = qb.order(priceCol, { ascending: false }); break;
      case 'name':       qb = qb.order('product_name'); break;
      default:           qb = qb.order('product_name');
    }

    qb = qb.range(offset, offset + pageSize - 1);

    const { data, error, count } = await qb;

    if (error) {
      log.warn(`${table} search failed`, { error: error.message });
      continue;
    }

    totalCount += count ?? 0;

    const mapped = ((data as unknown[]) ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      const brandRow = r.brands as Record<string, unknown> | null;
      return {
        id: r.id as string,
        product_name: r.product_name as string,
        category: r.category as string | null,
        brand_id: r.brand_id as string,
        brand_name: brandRow?.name as string ?? '',
        image_url: r.image_url as string | null,
        price: (r[priceCol] as number | null) ?? null,
        product_type: type,
      } satisfies ProductSearchResult;
    });

    allResults.push(...mapped);
  }

  // Sort merged results if needed
  if (sort === 'name') {
    allResults.sort((a, b) => a.product_name.localeCompare(b.product_name));
  }

  await logSearchAnalytics('product', query, filters, totalCount);

  return {
    data: allResults,
    totalCount,
    page,
    pageSize,
    hasMore: offset + pageSize < totalCount,
  };
}

// ── Search suggestions ────────────────────────────────────────────────────────

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim() || query.length < 2) return [];

  const [brandsRes, productsRes] = await Promise.all([
    supabase
      .from('brands')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(5),

    supabase
      .from('retail_products')
      .select('product_name')
      .ilike('product_name', `%${query}%`)
      .limit(5),
  ]);

  const brandNames = (brandsRes.data ?? []).map((r: { name: string }) => r.name);
  const productNames = (productsRes.data ?? []).map(
    (r: { product_name: string }) => r.product_name,
  );

  return [...new Set([...brandNames, ...productNames])].slice(0, 8);
}

// ── Analytics logging ─────────────────────────────────────────────────────────

async function logSearchAnalytics(
  searchType: string,
  query: string,
  filters: SearchFilters,
  resultCount: number,
) {
  try {
    await supabase.from('search_analytics').insert({
      search_type: searchType,
      query: query || null,
      filters: JSON.stringify(filters),
      result_count: resultCount,
      searched_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical — don't block search on analytics failure
  }
}
