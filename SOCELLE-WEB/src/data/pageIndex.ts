/**
 * SOCELLE Master Page Index
 * ─────────────────────────
 * Single source of truth for every route in the app.
 * Agents: read this file to understand what exists, its status, and owner notes.
 * Owner: edit `notes` fields here OR use the /dev-index UI (notes saved to localStorage,
 *        then click "Export → Update File" to sync back here).
 *
 * Status values:
 *   live    – wired to real Supabase data
 *   demo    – renders with hardcoded/mock data (must be labeled DEMO in UI)
 *   shell   – route exists but page is a placeholder / no real content
 *   admin   – admin-only surface
 *   auth    – login / auth flow page
 *
 * Access values:
 *   public        – no login required
 *   auth-required – requires any logged-in user
 *   admin-only    – requires admin or platform_admin role
 */

export type PageStatus = 'live' | 'demo' | 'shell' | 'admin' | 'auth';
export type PageAccess = 'public' | 'auth-required' | 'admin-only';

export interface PageEntry {
  path: string;
  label: string;
  status: PageStatus;
  access: PageAccess;
  /** Agent + owner notes. Edit here or via /dev-index UI. */
  notes: string;
}

export interface PageGroup {
  id: string;
  group: string;
  description: string;
  color: string; // Tailwind bg color class for badge
  pages: PageEntry[];
}

export const PAGE_INDEX: PageGroup[] = [
  // ─────────────────────────────────────────────
  // PUBLIC MARKETING
  // ─────────────────────────────────────────────
  {
    id: 'public',
    group: 'Public / Marketing',
    description: 'Publicly accessible pages — no login required.',
    color: 'bg-[#5F8A72]',
    pages: [
      { path: '/', label: 'Prelaunch Quiz / Home', status: 'live', access: 'public', notes: '' },
      { path: '/home', label: 'Public Home', status: 'demo', access: 'public', notes: '' },
      { path: '/about', label: 'About', status: 'live', access: 'public', notes: '' },
      { path: '/intelligence', label: 'Intelligence (public)', status: 'live', access: 'public', notes: '' },
      { path: '/intelligence/briefs', label: 'Intelligence Briefs', status: 'demo', access: 'public', notes: '' },
      { path: '/intelligence/briefs/:slug', label: 'Brief Detail', status: 'demo', access: 'public', notes: '' },
      { path: '/brands', label: 'Brands Directory', status: 'live', access: 'public', notes: '' },
      { path: '/brands/:slug', label: 'Brand Storefront', status: 'live', access: 'public', notes: '' },
      { path: '/pricing', label: 'Pricing', status: 'demo', access: 'public', notes: '' },
      { path: '/plans', label: 'Plans', status: 'demo', access: 'public', notes: '' },
      { path: '/how-it-works', label: 'How It Works', status: 'live', access: 'public', notes: '' },
      { path: '/professionals', label: 'For Professionals', status: 'demo', access: 'public', notes: 'Stats array is hardcoded — needs DEMO label.' },
      { path: '/for-brands', label: 'For Brands', status: 'demo', access: 'public', notes: 'Stats array is hardcoded — needs DEMO label.' },
      { path: '/for-medspas', label: 'For Medspas', status: 'demo', access: 'public', notes: '' },
      { path: '/for-salons', label: 'For Salons', status: 'demo', access: 'public', notes: '' },
      { path: '/stories', label: 'Stories Index', status: 'demo', access: 'public', notes: '' },
      { path: '/stories/:slug', label: 'Story Detail', status: 'demo', access: 'public', notes: '' },
      { path: '/blog', label: 'Blog', status: 'demo', access: 'public', notes: '' },
      { path: '/blog/:slug', label: 'Blog Post', status: 'demo', access: 'public', notes: '' },
      { path: '/events', label: 'Events', status: 'demo', access: 'public', notes: 'W10-05: events table not yet created.' },
      { path: '/jobs', label: 'Jobs Board', status: 'demo', access: 'public', notes: 'W10-06: job_postings table not yet created.' },
      { path: '/jobs/:slug', label: 'Job Detail', status: 'demo', access: 'public', notes: '' },
      { path: '/education', label: 'Education Hub', status: 'live', access: 'public', notes: '' },
      { path: '/education/courses', label: 'Course Catalog', status: 'live', access: 'public', notes: '' },
      { path: '/education/courses/:slug', label: 'Course Detail', status: 'live', access: 'public', notes: '' },
      { path: '/education/articles', label: 'Education Articles', status: 'demo', access: 'public', notes: '' },
      { path: '/education/learn/:slug', label: 'Course Player', status: 'live', access: 'auth-required', notes: '' },
      { path: '/education/certificates', label: 'My Certificates', status: 'live', access: 'auth-required', notes: '' },
      { path: '/education/ce-credits', label: 'CE Credit Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/education/staff', label: 'Staff Training', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/protocols', label: 'Protocols', status: 'live', access: 'public', notes: '' },
      { path: '/protocols/:slug', label: 'Protocol Detail', status: 'live', access: 'public', notes: '' },
      { path: '/ingredients', label: 'Ingredients', status: 'live', access: 'public', notes: '' },
      { path: '/ingredients/:slug', label: 'Ingredient Detail', status: 'live', access: 'public', notes: '' },
      { path: '/ingredients/collections/:slug', label: 'Ingredient Collection', status: 'live', access: 'public', notes: '' },
      { path: '/case-studies', label: 'Case Studies', status: 'demo', access: 'public', notes: '' },
      { path: '/faq', label: 'FAQ', status: 'live', access: 'public', notes: '' },
      { path: '/help', label: 'Help Center', status: 'demo', access: 'public', notes: '' },
      { path: '/help/:slug', label: 'Help Article (CMS)', status: 'demo', access: 'public', notes: '' },
      { path: '/pages/:slug', label: 'CMS Page', status: 'demo', access: 'public', notes: '' },
      { path: '/api/docs', label: 'API Docs', status: 'demo', access: 'public', notes: '' },
      { path: '/api/pricing', label: 'API Pricing', status: 'demo', access: 'public', notes: '' },
      { path: '/request-access', label: 'Request Access', status: 'live', access: 'public', notes: '' },
      { path: '/privacy', label: 'Privacy Policy', status: 'live', access: 'public', notes: '' },
      { path: '/terms', label: 'Terms of Service', status: 'live', access: 'public', notes: '' },
      { path: '/book/:slug', label: 'Booking Widget', status: 'demo', access: 'public', notes: '' },
      { path: '/claim/brand/:slug', label: 'Claim Brand', status: 'live', access: 'public', notes: '' },
      { path: '/claim/business/:slug', label: 'Claim Business', status: 'live', access: 'public', notes: '' },
      { path: '/certificates/verify/:token', label: 'Certificate Verify', status: 'live', access: 'public', notes: '' },
      { path: '/education/certificates/verify/:token', label: 'Education Cert Verify', status: 'live', access: 'public', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // AUTH FLOWS
  // ─────────────────────────────────────────────
  {
    id: 'auth',
    group: 'Auth Flows',
    description: 'Login, signup, password reset pages.',
    color: 'bg-[#A97A4C]',
    pages: [
      { path: '/forgot-password', label: 'Forgot Password', status: 'auth', access: 'public', notes: 'W10-01: pro-* tokens need cleanup.' },
      { path: '/reset-password', label: 'Reset Password', status: 'auth', access: 'public', notes: 'W10-01: pro-* tokens need cleanup.' },
      { path: '/portal/login', label: 'Business Portal Login', status: 'auth', access: 'public', notes: '' },
      { path: '/portal/signup', label: 'Business Portal Signup', status: 'auth', access: 'public', notes: '' },
      { path: '/brand/login', label: 'Brand Portal Login', status: 'auth', access: 'public', notes: '' },
      { path: '/brand/apply', label: 'Brand Apply', status: 'live', access: 'public', notes: '' },
      { path: '/brand/apply/received', label: 'Brand Apply Received', status: 'live', access: 'public', notes: '' },
      { path: '/spa/login', label: 'Spa Login (legacy)', status: 'auth', access: 'public', notes: '' },
      { path: '/spa/signup', label: 'Spa Signup (legacy)', status: 'auth', access: 'public', notes: '' },
      { path: '/admin/login', label: 'Admin Login', status: 'auth', access: 'public', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // SALES PLATFORM (top-level)
  // ─────────────────────────────────────────────
  {
    id: 'sales',
    group: 'Sales Platform',
    description: 'Top-level sales routes (MODULE_SALES gated).',
    color: 'bg-[#6E879B]',
    pages: [
      { path: '/sales', label: 'Sales Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/pipeline', label: 'Pipeline Board', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/deals/new', label: 'New Deal', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/deals/:id', label: 'Deal Detail', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/deals/:id/edit', label: 'Edit Deal', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/proposals/new', label: 'New Proposal', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/proposals/:id/view', label: 'Proposal View', status: 'demo', access: 'public', notes: '' },
      { path: '/sales/commissions', label: 'Commission Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/opportunities', label: 'Opportunity Finder', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/sales/analytics', label: 'Revenue Analytics', status: 'demo', access: 'auth-required', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // SHOP (top-level)
  // ─────────────────────────────────────────────
  {
    id: 'shop',
    group: 'Shop / Commerce',
    description: 'Commerce routes (MODULE_SHOP gated). Not in MainNav.',
    color: 'bg-[#8E6464]',
    pages: [
      { path: '/shop', label: 'Shop Home', status: 'demo', access: 'public', notes: '' },
      { path: '/shop/intelligence', label: 'Intelligence Commerce', status: 'demo', access: 'public', notes: '' },
      { path: '/shop/category/:slug', label: 'Shop Category', status: 'demo', access: 'public', notes: '' },
      { path: '/shop/product/:slug', label: 'Shop Product', status: 'demo', access: 'public', notes: '' },
      { path: '/shop/cart', label: 'Shop Cart', status: 'demo', access: 'public', notes: '' },
      { path: '/shop/checkout', label: 'Shop Checkout', status: 'demo', access: 'public', notes: '' },
      { path: '/shop/orders', label: 'Shop Orders', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/shop/orders/:id', label: 'Shop Order Detail', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/shop/wishlist', label: 'Shop Wishlist', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/shop/:slug', label: 'Product Detail (legacy)', status: 'demo', access: 'public', notes: '' },
      { path: '/cart', label: 'Cart (legacy)', status: 'demo', access: 'public', notes: '' },
      { path: '/checkout', label: 'Checkout (legacy)', status: 'demo', access: 'public', notes: '' },
      { path: '/account/orders', label: 'Order History', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/account/orders/:id', label: 'Order Detail', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/account/wishlist', label: 'Wishlist', status: 'demo', access: 'auth-required', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // BUSINESS PORTAL (/portal/*)
  // ─────────────────────────────────────────────
  {
    id: 'portal',
    group: 'Business Portal (/portal)',
    description: 'Portal for spa/salon/medspa operators. DO NOT MODIFY without explicit WO.',
    color: 'bg-[#5F8A72]',
    pages: [
      { path: '/portal', label: 'Portal Home', status: 'live', access: 'public', notes: '' },
      { path: '/portal/login', label: 'Portal Login', status: 'auth', access: 'public', notes: '' },
      { path: '/portal/signup', label: 'Portal Signup', status: 'auth', access: 'public', notes: '' },
      { path: '/portal/dashboard', label: 'Business Dashboard', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/intelligence', label: 'Business Intelligence Hub', status: 'demo', access: 'auth-required', notes: 'Heavy mock data — Phase 4 target.' },
      { path: '/portal/advisor', label: 'AI Advisor', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/plans', label: 'Plans List', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/plans/new', label: 'Plan Wizard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/plans/compare', label: 'Plan Comparison', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/plans/:id', label: 'Plan Results', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/brands/:slug', label: 'Brand Detail (portal)', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/orders', label: 'Business Orders', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/orders/:id', label: 'Business Order Detail', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/account', label: 'Business Account', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/subscription', label: 'Subscription Management', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/messages', label: 'Business Messages', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/calendar', label: 'Marketing Calendar', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/apply', label: 'Reseller Apply', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/claim/review', label: 'Claim Review', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/ce-credits', label: 'CE Credits', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/locations', label: 'Locations Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/benchmarks', label: 'Benchmark Dashboard', status: 'demo', access: 'auth-required', notes: 'All mock peer data.' },
      { path: '/portal/notifications', label: 'Notification Preferences', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/reseller', label: 'Reseller Dashboard', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/portal/reseller/clients', label: 'Reseller Clients', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/portal/reseller/revenue', label: 'Reseller Revenue', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/portal/reseller/white-label', label: 'White Label Config', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/portal/sales', label: 'Portal Sales Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/sales/pipeline', label: 'Portal Pipeline Board', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/marketing', label: 'Portal Marketing Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/marketing/campaigns/:id', label: 'Campaign Detail', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/marketing/campaigns/new', label: 'New Campaign', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/marketing/segments', label: 'Audience Segments', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/marketing/templates', label: 'Content Templates', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/marketing/analytics', label: 'Marketing Analytics', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/crm', label: 'CRM Dashboard', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/crm/contacts', label: 'Contact List', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/crm/contacts/new', label: 'Add Contact', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/crm/contacts/:id', label: 'Contact Detail', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/crm/companies', label: 'Company List', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/crm/companies/:id', label: 'Company Detail', status: 'live', access: 'auth-required', notes: '' },
      { path: '/portal/crm/tasks', label: 'CRM Tasks', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/portal/crm/segments', label: 'CRM Segments', status: 'demo', access: 'auth-required', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // BRAND PORTAL (/brand/*)
  // ─────────────────────────────────────────────
  {
    id: 'brand',
    group: 'Brand Portal (/brand)',
    description: 'Portal for beauty brands. DO NOT MODIFY without explicit WO.',
    color: 'bg-[#6E879B]',
    pages: [
      { path: '/brand/login', label: 'Brand Login', status: 'auth', access: 'public', notes: '' },
      { path: '/brand/apply', label: 'Brand Apply', status: 'live', access: 'public', notes: '' },
      { path: '/brand/apply/received', label: 'Brand Apply Received', status: 'live', access: 'public', notes: '' },
      { path: '/brand/dashboard', label: 'Brand Dashboard', status: 'live', access: 'auth-required', notes: '' },
      { path: '/brand/intelligence', label: 'Brand Intelligence Hub', status: 'demo', access: 'auth-required', notes: 'Heavy mock data — Phase 4 target.' },
      { path: '/brand/intelligence-report', label: 'Brand Intelligence Report', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/products', label: 'Brand Products', status: 'live', access: 'auth-required', notes: '' },
      { path: '/brand/products/new', label: 'New Product', status: 'live', access: 'auth-required', notes: '' },
      { path: '/brand/products/:id/edit', label: 'Edit Product', status: 'live', access: 'auth-required', notes: '' },
      { path: '/brand/analytics', label: 'Brand Analytics', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/campaigns', label: 'Brand Campaigns', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/campaigns/new', label: 'New Campaign', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/campaigns/:id', label: 'Campaign Detail', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/storefront', label: 'Brand Storefront Editor', status: 'live', access: 'auth-required', notes: '' },
      { path: '/brand/orders', label: 'Brand Orders', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/leads', label: 'Brand Leads', status: 'demo', access: 'auth-required', notes: '' },
      { path: '/brand/profile', label: 'Brand Profile', status: 'live', access: 'auth-required', notes: '' },
      { path: '/brand/settings', label: 'Brand Settings', status: 'live', access: 'auth-required', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // ADMIN PORTAL (/admin/*)
  // ─────────────────────────────────────────────
  {
    id: 'admin',
    group: 'Admin Portal (/admin)',
    description: 'Platform admin. ADD ONLY — do not modify existing routes.',
    color: 'bg-[#8E6464]',
    pages: [
      { path: '/admin/login', label: 'Admin Login', status: 'auth', access: 'public', notes: '' },
      { path: '/admin/debug-auth', label: 'Auth Debug', status: 'admin', access: 'admin-only', notes: '' },
      { path: '/admin/inbox', label: 'Admin Inbox', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/dashboard', label: 'Admin Dashboard', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/users', label: 'User Management', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/brands', label: 'Brand List', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/brands/:id', label: 'Brand Editor', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/brands/new', label: 'New Brand', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/orders', label: 'Admin Orders', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/orders/:id', label: 'Admin Order Detail', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/signals', label: 'Admin Signals', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/market-signals', label: 'Market Signals', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/intelligence', label: 'Intelligence Dashboard', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/reports', label: 'Reports Library', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/api', label: 'API Dashboard', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/regions', label: 'Region Management', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/approvals', label: 'Approval Queue', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/seeding', label: 'Data Seeding', status: 'admin', access: 'admin-only', notes: '' },
      { path: '/admin/debug', label: 'Debug Panel', status: 'admin', access: 'admin-only', notes: '' },
      { path: '/admin/protocols/import', label: 'Protocol Bulk Import', status: 'admin', access: 'admin-only', notes: '' },
      { path: '/admin/submissions/:id', label: 'Submission Detail', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/crm', label: 'Admin CRM Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/social', label: 'Social Hub', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/sales', label: 'Admin Sales Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/editorial', label: 'Editorial Hub', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/affiliates', label: 'Affiliates Hub', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/events', label: 'Events Hub', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/jobs', label: 'Jobs Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/recruitment', label: 'Recruitment Hub', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/feeds', label: 'Feeds Hub', status: 'live', access: 'admin-only', notes: '' },
      { path: '/admin/blog', label: 'Blog Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/reseller', label: 'Reseller Hub', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/shop', label: 'Admin Shop Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/shop/products', label: 'Shop Products', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/shop/categories', label: 'Shop Categories', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/shop/orders', label: 'Shop Orders', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/shop/discounts', label: 'Shop Discounts', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/shop/shipping', label: 'Shop Shipping', status: 'shell', access: 'admin-only', notes: '' },
      { path: '/admin/shop/reviews', label: 'Shop Reviews', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/subscriptions', label: 'Subscriptions Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/subscriptions/plans', label: 'Subscription Plans', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/subscriptions/accounts', label: 'Subscription Accounts', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/subscriptions/metrics', label: 'Subscription Metrics', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms', label: 'CMS Hub', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms/pages', label: 'CMS Pages', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms/posts', label: 'CMS Posts', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms/media', label: 'CMS Media', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms/blocks', label: 'CMS Blocks', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms/templates', label: 'CMS Templates', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/admin/cms/spaces', label: 'CMS Spaces', status: 'demo', access: 'admin-only', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // LEGACY / SPA PORTAL
  // ─────────────────────────────────────────────
  {
    id: 'spa',
    group: 'Spa Portal (legacy /spa)',
    description: 'Legacy spa portal routes — may be deprecated.',
    color: 'bg-[#A97A4C]',
    pages: [
      { path: '/spa', label: 'Spa Root', status: 'shell', access: 'public', notes: '' },
      { path: '/spa/login', label: 'Spa Login', status: 'auth', access: 'public', notes: '' },
      { path: '/spa/signup', label: 'Spa Signup', status: 'auth', access: 'public', notes: '' },
      { path: '/spa/dashboard', label: 'Spa Dashboard', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/spa/plans', label: 'Spa Plans', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/spa/plans/new', label: 'New Spa Plan', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/spa/plans/:id', label: 'Spa Plan Detail', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/spa/plan/new', label: 'Spa Plan (alt new)', status: 'shell', access: 'auth-required', notes: '' },
      { path: '/spa/plan/:id', label: 'Spa Plan (alt detail)', status: 'shell', access: 'auth-required', notes: '' },
    ],
  },

  // ─────────────────────────────────────────────
  // EDUCATION AUTHORING
  // ─────────────────────────────────────────────
  {
    id: 'education-admin',
    group: 'Education Authoring (admin)',
    description: 'Course authoring tools — admin/platform_admin only.',
    color: 'bg-[#5F8A72]',
    pages: [
      { path: '/education/author', label: 'Author Dashboard', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/education/author/courses/new', label: 'New Course', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/education/author/courses/:id/edit', label: 'Edit Course', status: 'demo', access: 'admin-only', notes: '' },
      { path: '/courses', label: 'Courses Catalog (alt)', status: 'live', access: 'public', notes: '' },
      { path: '/courses/:slug', label: 'Course Detail (alt)', status: 'live', access: 'public', notes: '' },
      { path: '/courses/:slug/learn', label: 'Course Player (alt)', status: 'live', access: 'auth-required', notes: '' },
      { path: '/my-certificates', label: 'My Certificates (alt)', status: 'live', access: 'auth-required', notes: '' },
    ],
  },
];

/** Flat list of all page entries — useful for agents doing path lookups. */
export const ALL_PAGES: (PageEntry & { group: string })[] = PAGE_INDEX.flatMap((g) =>
  g.pages.map((p) => ({ ...p, group: g.group }))
);
