// useShopProducts — re-export wrapper for shop/useProducts + shop/useCategories + shop/useProduct
// Provides a unified import point for shop product hooks.
export { useProducts as useShopProducts } from './shop/useProducts';
export { useCategories as useShopCategories } from './shop/useCategories';
export { useProduct as useShopProduct } from './shop/useProduct';
export type { Product, ProductCategory, ProductVariant, ProductFilters } from './shop/types';
export { formatCents } from './shop/types';
