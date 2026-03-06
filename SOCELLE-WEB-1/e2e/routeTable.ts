export type AccessType = 'public' | 'business' | 'brand' | 'admin' | 'legacy_redirect';

export interface AppRoute {
  path: string;
  component: string;
  access: AccessType;
  requiredRoles?: string[];
  dependencies: string[];
}

export const routeTable: AppRoute[] = [
  { path: '/', component: 'PublicHome', access: 'public', dependencies: [] },
  { path: '/brands', component: 'PublicBrands', access: 'public', dependencies: ['brands'] },
  { path: '/forgot-password', component: 'ForgotPassword', access: 'public', dependencies: ['supabase.auth'] },
  { path: '/reset-password', component: 'ResetPassword', access: 'public', dependencies: ['supabase.auth'] },

  { path: '/portal', component: 'PortalHome', access: 'public', dependencies: ['brands', 'canonical_protocols', 'pro_products', 'brand_assets'] },
  { path: '/portal/login', component: 'BusinessLogin', access: 'public', dependencies: ['supabase.auth', 'user_profiles'] },
  { path: '/portal/signup', component: 'BusinessSignup', access: 'public', dependencies: ['supabase.auth', 'user_profiles'] },
  { path: '/portal/dashboard', component: 'BusinessDashboard', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['plans', 'orders'] },
  { path: '/portal/plans', component: 'PlansList', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['plans'] },
  { path: '/portal/plans/new', component: 'PlanWizard', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['brands', 'plans', 'menu_uploads'] },
  { path: '/portal/plans/00000000-0000-0000-0000-000000000000', component: 'PlanResults', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['plans', 'menu_uploads', 'business_plan_outputs'] },
  { path: '/portal/brands/naturopathica', component: 'BrandDetail', access: 'public', dependencies: ['brands', 'brand_assets', 'brand_page_modules'] },
  { path: '/portal/orders', component: 'BusinessOrders', access: 'business', requiredRoles: ['business_user', 'admin', 'platform_admin'], dependencies: ['orders', 'order_items'] },

  { path: '/brand/login', component: 'BrandLogin', access: 'public', dependencies: ['supabase.auth', 'user_profiles'] },
  { path: '/brand', component: 'BrandLayoutIndexRedirect', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['user_profiles'] },
  { path: '/brand/dashboard', component: 'BrandDashboard', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['plans', 'plan_outputs', 'spa_leads'] },
  { path: '/brand/plans', component: 'BrandPlans', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['plans'] },
  { path: '/brand/leads', component: 'BrandLeads', access: 'brand', requiredRoles: ['brand_admin', 'admin', 'platform_admin'], dependencies: ['spa_leads'] },

  { path: '/admin/login', component: 'AdminLogin', access: 'public', dependencies: ['supabase.auth', 'user_profiles'] },
  { path: '/admin/debug-auth', component: 'AdminAuthDebug', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['supabase.auth', 'user_profiles'] },
  { path: '/admin', component: 'AdminIndexRedirect', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['user_profiles'] },
  { path: '/admin/dashboard', component: 'AdminDashboard', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['brands', 'businesses', 'user_profiles', 'orders'] },
  { path: '/admin/brands', component: 'AdminBrandList', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['brands'] },
  { path: '/admin/brands/new', component: 'BrandAdminEditor', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['brands', 'brand_page_modules', 'brand_assets', 'brand_training_modules', 'brand_commercial_assets'] },
  { path: '/admin/brands/00000000-0000-0000-0000-000000000000', component: 'BrandAdminEditor', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['brands', 'brand_page_modules', 'brand_assets'] },
  { path: '/admin/orders', component: 'AdminOrders', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['orders', 'order_items'] },
  { path: '/admin/orders/00000000-0000-0000-0000-000000000000', component: 'AdminOrderDetail', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['orders', 'order_items'] },
  { path: '/admin/inbox', component: 'AdminInbox', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['plan_submissions'] },
  { path: '/admin/debug', component: 'AdminDebugPanel', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['supabase.auth', 'brands'] },
  { path: '/admin/submissions/00000000-0000-0000-0000-000000000000', component: 'SubmissionDetailsPlaceholder', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: [] },
  { path: '/admin/ingestion', component: 'IngestionView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['ingestion_jobs'] },
  { path: '/admin/protocols', component: 'ProtocolsView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['canonical_protocols'] },
  { path: '/admin/products', component: 'ProductsCompositeView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['pro_products', 'retail_products'] },
  { path: '/admin/mixing', component: 'MixingRulesView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['mixing_rules'] },
  { path: '/admin/costs', component: 'CostsView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['cost_structure'] },
  { path: '/admin/calendar', component: 'MarketingCalendarView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['marketing_calendar'] },
  { path: '/admin/rules', component: 'BusinessRulesView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['business_rules'] },
  { path: '/admin/health', component: 'SchemaHealthView', access: 'admin', requiredRoles: ['admin', 'platform_admin'], dependencies: ['schema_health'] },

  { path: '/spa/login', component: 'RedirectToPortalLogin', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/signup', component: 'RedirectToPortalSignup', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/dashboard', component: 'RedirectToPortalDashboard', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/plans', component: 'RedirectToPortalPlans', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/plan/new', component: 'RedirectToPortalPlanNew', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/plan/00000000-0000-0000-0000-000000000000', component: 'RedirectToPortalPlanById', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/plans/new', component: 'RedirectToPortalPlanNew', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/plans/00000000-0000-0000-0000-000000000000', component: 'RedirectToPortalPlanById', access: 'legacy_redirect', dependencies: [] },
  { path: '/spa/anything', component: 'RedirectToPortalRoot', access: 'legacy_redirect', dependencies: [] },
];
