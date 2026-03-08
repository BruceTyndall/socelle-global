export type AccessType = 'public' | 'business' | 'brand' | 'admin' | 'legacy_redirect';

export interface AppRoute {
  path: string;
  component: string;
  access: AccessType;
  requiredRoles?: string[];
  dependencies: string[];
}

export const routeTable: AppRoute[] = [
  // ── Public pages
  { path: '/', component: 'PrelaunchGuard→PublicHome', access: 'public', dependencies: [] },
  { path: '/intelligence', component: 'Intelligence', access: 'public', dependencies: ['market_signals'] },
  { path: '/brands', component: 'PublicBrands', access: 'public', dependencies: ['brands'] },
  { path: '/education', component: 'Education', access: 'public', dependencies: ['brand_training_modules'] },
  { path: '/events', component: 'Events', access: 'public', dependencies: ['events'] },
  { path: '/jobs', component: 'Jobs', access: 'public', dependencies: ['job_postings'] },
  { path: '/for-buyers', component: 'ForBuyers', access: 'public', dependencies: [] },
  { path: '/for-brands', component: 'ForBrands', access: 'public', dependencies: [] },
  { path: '/professionals', component: 'Professionals', access: 'public', dependencies: [] },
  { path: '/for-medspas', component: 'ForMedspas', access: 'public', dependencies: [] },
  { path: '/for-salons', component: 'ForSalons', access: 'public', dependencies: [] },
  { path: '/pricing', component: 'Pricing', access: 'public', dependencies: [] },
  { path: '/plans', component: 'Plans', access: 'public', dependencies: [] },
  { path: '/how-it-works', component: 'HowItWorks', access: 'public', dependencies: [] },
  { path: '/about', component: 'About', access: 'public', dependencies: [] },
  { path: '/faq', component: 'FAQ', access: 'public', dependencies: [] },
  { path: '/protocols', component: 'Protocols', access: 'public', dependencies: ['canonical_protocols'] },
  { path: '/request-access', component: 'RequestAccess', access: 'public', dependencies: ['access_requests'] },
  { path: '/stories', component: 'StoriesIndex', access: 'public', dependencies: ['stories'] },
  { path: '/privacy', component: 'Privacy', access: 'public', dependencies: [] },
  { path: '/terms', component: 'Terms', access: 'public', dependencies: [] },
  { path: '/forgot-password', component: 'ForgotPassword', access: 'public', dependencies: ['supabase.auth'] },
  { path: '/reset-password', component: 'ResetPassword', access: 'public', dependencies: ['supabase.auth'] },
  { path: '/ingredients', component: 'Ingredients', access: 'public', dependencies: ['ingredients'] },

  // ── Auth login pages (public access)
  { path: '/portal', component: 'PortalHome', access: 'public', dependencies: [] },
  { path: '/portal/login', component: 'BusinessLogin', access: 'public', dependencies: ['supabase.auth'] },
  { path: '/portal/signup', component: 'BusinessSignup', access: 'public', dependencies: ['supabase.auth'] },
  { path: '/brand/login', component: 'BrandLogin', access: 'public', dependencies: ['supabase.auth'] },
  { path: '/admin/login', component: 'AdminLogin', access: 'public', dependencies: ['supabase.auth'] },

  // ── Business portal (auth required)
  { path: '/portal/dashboard', component: 'BusinessDashboard', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['plans', 'orders'] },
  { path: '/portal/plans', component: 'PlansList', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['plans'] },
  { path: '/portal/orders', component: 'BusinessOrders', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['orders'] },
  { path: '/portal/intelligence', component: 'IntelligenceHub', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['market_signals'] },
  { path: '/portal/benchmarks', component: 'BenchmarkDashboard', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: [] },

  // ── Brand portal (auth required)
  { path: '/brand/dashboard', component: 'BrandDashboard', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: [] },
  { path: '/brand/leads', component: 'BrandLeads', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['spa_leads'] },
  { path: '/brand/plans', component: 'BrandPlans', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['plans'] },
  { path: '/brand/intelligence', component: 'BrandIntelligenceHub', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['market_signals'] },

  // ── Admin portal (auth required)
  { path: '/admin/dashboard', component: 'AdminDashboard', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['brands', 'businesses'] },
  { path: '/admin/brands', component: 'AdminBrandList', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['brands'] },
  { path: '/admin/orders', component: 'AdminOrders', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['orders'] },
  { path: '/admin/feeds', component: 'AdminFeedsHub', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['data_feeds'] },
  { path: '/admin/market-signals', component: 'AdminMarketSignals', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['market_signals'] },
  { path: '/admin/blog', component: 'AdminBlogHub', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['stories'] },

  // ── Legacy redirects
  { path: '/spa/login', component: 'RedirectToPortalLogin', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/signup', component: 'RedirectToPortalSignup', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/dashboard', component: 'RedirectToPortalDashboard', access: 'legacy_redirect', dependencies: [] },
];
