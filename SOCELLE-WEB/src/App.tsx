import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigCheck } from './components/ConfigCheck';
import { StagingBanner } from './components/StagingBanner';

import BusinessLayout from './layouts/BusinessLayout';
import AdminLayout from './layouts/AdminLayout';
import BrandLayout from './layouts/BrandLayout';

// ── Public
const PublicHome = lazy(() => import('./pages/public/Home'));
const PublicBrands = lazy(() => import('./pages/public/Brands'));
const PublicBrandStorefront = lazy(() => import('./pages/public/BrandStorefront'));
const ClaimBrand = lazy(() => import('./pages/claim/ClaimBrand'));
const ClaimBusiness = lazy(() => import('./pages/claim/ClaimBusiness'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Plans = lazy(() => import('./pages/public/Plans'));
const About = lazy(() => import('./pages/public/About'));
const Intelligence = lazy(() => import('./pages/public/Intelligence'));
const Professionals = lazy(() => import('./pages/public/Professionals'));
const ForBrands = lazy(() => import('./pages/public/ForBrands'));
const ForMedspas = lazy(() => import('./pages/public/ForMedspas'));
const ForSalons = lazy(() => import('./pages/public/ForSalons'));
const HowItWorks = lazy(() => import('./pages/public/HowItWorks'));
const RequestAccess = lazy(() => import('./pages/public/RequestAccess'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const Education = lazy(() => import('./pages/public/Education'));
const Ingredients = lazy(() => import('./pages/public/Ingredients'));
const Protocols = lazy(() => import('./pages/public/Protocols'));
const ProtocolDetail = lazy(() => import('./pages/public/ProtocolDetail'));

// ── Enterprise API (WO-21)
const ApiDocs = lazy(() => import('./pages/public/ApiDocs'));
const ApiPricing = lazy(() => import('./pages/public/ApiPricing'));

// ── Business portal
const PortalHome = lazy(() => import('./pages/business/PortalHome'));
const BusinessLogin = lazy(() => import('./pages/business/Login'));
const BusinessSignup = lazy(() => import('./pages/business/Signup'));
const BusinessDashboard = lazy(() => import('./pages/business/Dashboard'));
const PlanWizard = lazy(() => import('./pages/business/PlanWizard'));
const PlanResults = lazy(() => import('./pages/business/PlanResults'));
const PlansList = lazy(() => import('./pages/business/PlansList'));
const BrandDetail = lazy(() => import('./pages/business/BrandDetail'));
const BusinessOrders = lazy(() => import('./pages/business/Orders'));
const BusinessOrderDetail = lazy(() => import('./pages/business/OrderDetail'));
const BusinessAccount = lazy(() => import('./pages/business/Account'));
const BusinessMarketingCalendar = lazy(() => import('./pages/business/MarketingCalendar'));
const BusinessMessages = lazy(() => import('./pages/business/Messages'));
const PlanComparison = lazy(() => import('./pages/business/PlanComparison'));
const ResellerApply = lazy(() => import('./pages/business/Apply'));
const BusinessClaimReview = lazy(() => import('./pages/business/ClaimReview'));
const BusinessIntelligenceHub = lazy(() => import('./pages/business/IntelligenceHub'));
const AIAdvisor = lazy(() => import('./pages/business/AIAdvisor'));
const NotificationPreferences = lazy(() => import('./pages/business/NotificationPreferences'));
const BusinessCECredits = lazy(() => import('./pages/business/CECredits'));
const LocationsDashboard = lazy(() => import('./pages/business/LocationsDashboard'));
const BenchmarkDashboard = lazy(() => import('./pages/business/BenchmarkDashboard'));

// ── Wave 9 — new public pages
const Events = lazy(() => import('./pages/public/Events'));
const Jobs = lazy(() => import('./pages/public/Jobs'));
const JobDetail = lazy(() => import('./pages/public/JobDetail'));

// ── Brand portal
const BrandLogin = lazy(() => import('./pages/brand/Login'));
const BrandApply = lazy(() => import('./pages/brand/Apply'));
const BrandApplicationReceived = lazy(() => import('./pages/brand/ApplicationReceived'));
const BrandOnboarding = lazy(() => import('./pages/brand/Onboarding'));
const BrandDashboard = lazy(() => import('./pages/brand/Dashboard'));
const BrandPlans = lazy(() => import('./pages/brand/Plans'));
const BrandLeads = lazy(() => import('./pages/brand/Leads'));
const BrandOrders = lazy(() => import('./pages/brand/Orders'));
const BrandOrderDetail = lazy(() => import('./pages/brand/OrderDetail'));
const BrandProducts = lazy(() => import('./pages/brand/Products'));
const BrandPerformance = lazy(() => import('./pages/brand/Performance'));
const BrandMessages = lazy(() => import('./pages/brand/Messages'));
const BrandCampaigns = lazy(() => import('./pages/brand/Campaigns'));
const BrandAutomations = lazy(() => import('./pages/brand/Automations'));
const BrandPromotions = lazy(() => import('./pages/brand/Promotions'));
const BrandCampaignBuilder = lazy(() => import('./pages/brand/CampaignBuilder'));
const BrandCustomers = lazy(() => import('./pages/brand/Customers'));
const BrandPipeline = lazy(() => import('./pages/brand/Pipeline'));
const BrandStorefront = lazy(() => import('./pages/brand/Storefront'));
const BrandClaimReview = lazy(() => import('./pages/brand/ClaimReview'));
const BrandIntelligenceHub = lazy(() => import('./pages/brand/BrandIntelligenceHub'));
const BrandAIAdvisor = lazy(() => import('./pages/brand/BrandAIAdvisor'));
const BrandNotificationPreferences = lazy(() => import('./pages/brand/BrandNotificationPreferences'));
const IntelligencePricing = lazy(() => import('./pages/brand/IntelligencePricing'));
const IntelligenceReport = lazy(() => import('./pages/brand/IntelligenceReport'));

// ── Admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminAuthDebug = lazy(() => import('./pages/admin/AuthDebug'));
const AdminInbox = lazy(() => import('./pages/admin/AdminInbox'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDebugPanel = lazy(() => import('./pages/admin/DebugPanel'));
const AdminBrandList = lazy(() => import('./pages/admin/AdminBrandList'));
const BrandAdminEditor = lazy(() => import('./pages/admin/BrandAdminEditor'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const SubmissionDetail = lazy(() => import('./pages/admin/SubmissionDetail'));
const BulkProtocolImport = lazy(() => import('./pages/admin/BulkProtocolImport'));
const AdminApprovalQueue = lazy(() => import('./pages/admin/AdminApprovalQueue'));
const AdminSeeding = lazy(() => import('./pages/admin/AdminSeeding'));
const AdminSignals = lazy(() => import('./pages/admin/AdminSignals'));
const AdminMarketSignals = lazy(() => import('./pages/admin/AdminMarketSignals'));
const AdminIntelligenceDashboard = lazy(() => import('./pages/admin/IntelligenceDashboard'));
const AdminReportsLibrary = lazy(() => import('./pages/admin/ReportsLibrary'));
const AdminApiDashboard = lazy(() => import('./pages/admin/ApiDashboard'));
const AdminRegionManagement = lazy(() => import('./pages/admin/RegionManagement'));

// ── Brand Hub (brand-centric admin)
const BrandHub = lazy(() => import('./pages/admin/BrandHub'));
const HubProducts = lazy(() => import('./pages/admin/brand-hub/HubProducts'));
const HubProtocols = lazy(() => import('./pages/admin/brand-hub/HubProtocols'));
const HubEducation = lazy(() => import('./pages/admin/brand-hub/HubEducation'));
const HubOrders = lazy(() => import('./pages/admin/brand-hub/HubOrders'));
const HubRetailers = lazy(() => import('./pages/admin/brand-hub/HubRetailers'));
const HubAnalytics = lazy(() => import('./pages/admin/brand-hub/HubAnalytics'));
const HubSettings = lazy(() => import('./pages/admin/brand-hub/HubSettings'));

// ── Data views
const IngestionView = lazy(() => import('./components/IngestionView'));
const ProtocolsView = lazy(() => import('./components/ProtocolsView'));
const ProProductsView = lazy(() => import('./components/ProProductsView'));
const RetailProductsView = lazy(() => import('./components/RetailProductsView'));
const MixingRulesView = lazy(() => import('./components/MixingRulesView'));
const CostsView = lazy(() => import('./components/CostsView'));
const MarketingCalendarView = lazy(() => import('./components/MarketingCalendarView'));
const BusinessRulesView = lazy(() => import('./components/BusinessRulesView'));
const SchemaHealthView = lazy(() => import('./components/SchemaHealthView'));

function SpaPlanIdRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/portal/plans/${id || ''}`} replace />;
}

const Fallback = (
  <div className="min-h-screen bg-mn-bg flex items-center justify-center">
    <div className="space-y-3 w-40">
      <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse" />
      <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-3/4" />
      <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-1/2" />
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <StagingBanner />
      <ToastProvider>
        <ConfigCheck>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={Fallback}>
                <Routes>
                  {/* ── Public ─────────────────────────────────── */}
                  <Route path="/" element={<PublicHome />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/brands" element={<PublicBrands />} />
                  <Route path="/brands/:slug" element={<PublicBrandStorefront />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/intelligence" element={<Intelligence />} />
                  <Route path="/insights" element={<Navigate to="/intelligence" replace />} />
                  <Route path="/professionals" element={<Professionals />} />
                  <Route path="/for-brands" element={<ForBrands />} />
                  <Route path="/for-medspas" element={<ForMedspas />} />
                  <Route path="/for-salons" element={<ForSalons />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/request-access" element={<RequestAccess />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/ingredients" element={<Ingredients />} />
                  <Route path="/protocols" element={<Protocols />} />
                  <Route path="/protocols/:slug" element={<ProtocolDetail />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/api/docs" element={<ApiDocs />} />
                  <Route path="/api/pricing" element={<ApiPricing />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:slug" element={<JobDetail />} />
                  <Route path="/claim/brand/:slug" element={<ClaimBrand />} />
                  <Route path="/claim/business/:slug" element={<ClaimBusiness />} />

                  {/* ── Business Portal ─────────────────────────── */}
                  <Route path="/portal" element={<BusinessLayout />}>
                    <Route index element={<PortalHome />} />
                    <Route path="login" element={<BusinessLogin />} />
                    <Route path="signup" element={<BusinessSignup />} />
                    <Route path="dashboard" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="intelligence" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessIntelligenceHub />
                      </ProtectedRoute>
                    } />
                    <Route path="advisor" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <AIAdvisor />
                      </ProtectedRoute>
                    } />
                    <Route path="notifications" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <NotificationPreferences />
                      </ProtectedRoute>
                    } />
                    <Route path="plans" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <PlansList />
                      </ProtectedRoute>
                    } />
                    <Route path="plans/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <PlanWizard />
                      </ProtectedRoute>
                    } />
                    <Route path="plans/compare" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <PlanComparison />
                      </ProtectedRoute>
                    } />
                    <Route path="plans/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <PlanResults />
                      </ProtectedRoute>
                    } />
                    <Route path="brands/:slug" element={<BrandDetail />} />
                    <Route path="orders" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="orders/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessOrderDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="account" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessAccount />
                      </ProtectedRoute>
                    } />
                    <Route path="messages" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessMessages />
                      </ProtectedRoute>
                    } />
                    <Route path="calendar" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessMarketingCalendar />
                      </ProtectedRoute>
                    } />
                    <Route path="apply" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ResellerApply />
                      </ProtectedRoute>
                    } />
                    <Route path="claim/review" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessClaimReview />
                      </ProtectedRoute>
                    } />
                    <Route path="ce-credits" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BusinessCECredits />
                      </ProtectedRoute>
                    } />
                    <Route path="locations" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <LocationsDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="benchmarks" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BenchmarkDashboard />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* ── Brand Portal ─────────────────────────────── */}
                  <Route path="/brand/login" element={<BrandLogin />} />
                  <Route path="/brand/apply" element={<BrandApply />} />
                  <Route path="/brand/apply/received" element={<BrandApplicationReceived />} />
                  <Route
                    path="/brand"
                    element={
                      <ProtectedRoute
                        requireRole={['brand_admin', 'admin', 'platform_admin']}
                        redirectTo="/brand/login"
                      >
                        <BrandLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/brand/dashboard" replace />} />
                    <Route path="dashboard" element={<BrandDashboard />} />
                    <Route path="claim/review" element={<BrandClaimReview />} />
                    <Route path="onboarding" element={<BrandOnboarding />} />
                    <Route path="orders" element={<BrandOrders />} />
                    <Route path="orders/:id" element={<BrandOrderDetail />} />
                    <Route path="products" element={<BrandProducts />} />
                    <Route path="performance" element={<BrandPerformance />} />
                    <Route path="messages" element={<BrandMessages />} />
                    <Route path="campaigns" element={<BrandCampaigns />} />
                    <Route path="campaigns/new" element={<BrandCampaignBuilder />} />
                    <Route path="automations" element={<BrandAutomations />} />
                    <Route path="promotions" element={<BrandPromotions />} />
                    <Route path="customers" element={<BrandCustomers />} />
                    <Route path="pipeline" element={<BrandPipeline />} />
                    <Route path="storefront" element={<BrandStorefront />} />
                    <Route path="intelligence" element={<BrandIntelligenceHub />} />
                    <Route path="advisor" element={<BrandAIAdvisor />} />
                    <Route path="notifications" element={<BrandNotificationPreferences />} />
                    <Route path="intelligence-pricing" element={<IntelligencePricing />} />
                    <Route path="intelligence-report" element={<IntelligenceReport />} />
                    {/* Keep legacy routes */}
                    <Route path="plans" element={<BrandPlans />} />
                    <Route path="leads" element={<BrandLeads />} />
                  </Route>

                  {/* ── Spa redirects (legacy) ─────────────────── */}
                  <Route path="/spa/login" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/spa/signup" element={<Navigate to="/portal/signup" replace />} />
                  <Route path="/spa/dashboard" element={<Navigate to="/portal/dashboard" replace />} />
                  <Route path="/spa/plans" element={<Navigate to="/portal/plans" replace />} />
                  <Route path="/spa/plan/new" element={<Navigate to="/portal/plans/new" replace />} />
                  <Route path="/spa/plan/:id" element={<SpaPlanIdRedirect />} />
                  <Route path="/spa/plans/new" element={<Navigate to="/portal/plans/new" replace />} />
                  <Route path="/spa/plans/:id" element={<SpaPlanIdRedirect />} />
                  <Route path="/spa/*" element={<Navigate to="/portal" replace />} />

                  {/* ── Admin ─────────────────────────────────────── */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/debug-auth" element={
                    <ProtectedRoute requireAdmin redirectTo="/admin/login">
                      <AdminAuthDebug />
                    </ProtectedRoute>
                  } />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin redirectTo="/admin/login">
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/brands" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="inbox" element={<AdminInbox />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                    <Route path="debug" element={<AdminDebugPanel />} />
                    <Route path="submissions/:id" element={<SubmissionDetail />} />
                    <Route path="protocols/import" element={<BulkProtocolImport />} />
                    <Route path="ingestion" element={<IngestionView />} />
                    <Route path="protocols" element={<ProtocolsView />} />
                    <Route path="mixing" element={<MixingRulesView />} />
                    <Route path="costs" element={<CostsView />} />
                    <Route path="calendar" element={<MarketingCalendarView />} />
                    <Route path="rules" element={<BusinessRulesView />} />
                    <Route path="health" element={<SchemaHealthView />} />
                    <Route path="products" element={
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-serif text-pro-navy mb-2">Products</h2>
                          <p className="text-pro-warm-gray font-sans">Manage PRO and Retail products</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-pro-charcoal font-sans mb-4">PRO Products</h3>
                            <ProProductsView />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-pro-charcoal font-sans mb-4">Retail Products</h3>
                            <RetailProductsView />
                          </div>
                        </div>
                      </div>
                    } />

                    {/* ── Operations ── */}
                    <Route path="approvals" element={<AdminApprovalQueue />} />
                    <Route path="seeding" element={<AdminSeeding />} />
                    <Route path="signals" element={<AdminSignals />} />
                    <Route path="market-signals" element={<AdminMarketSignals />} />
                    <Route path="intelligence" element={<AdminIntelligenceDashboard />} />
                    <Route path="reports" element={<AdminReportsLibrary />} />
                    <Route path="api" element={<AdminApiDashboard />} />
                    <Route path="regions" element={<AdminRegionManagement />} />

                    {/* ── Brand list ── */}
                    <Route path="brands" element={<AdminBrandList />} />
                    {/* ── New brand (legacy editor) ── */}
                    <Route path="brands/new" element={<BrandAdminEditor />} />
                    {/* ── Brand hub (brand-centric) ── */}
                    <Route path="brands/:id" element={<BrandHub />}>
                      <Route index element={<Navigate to="profile" replace />} />
                      <Route path="profile" element={<BrandAdminEditor />} />
                      <Route path="products" element={<HubProducts />} />
                      <Route path="protocols" element={<HubProtocols />} />
                      <Route path="education" element={<HubEducation />} />
                      <Route path="orders" element={<HubOrders />} />
                      <Route path="retailers" element={<HubRetailers />} />
                      <Route path="analytics" element={<HubAnalytics />} />
                      <Route path="settings" element={<HubSettings />} />
                    </Route>
                  </Route>

                  {/* ── 404 ─────────────────────────────────────── */}
                  <Route path="*" element={
                    <div className="min-h-screen bg-mn-bg flex items-center justify-center px-4">
                      <div className="text-center">
                        <p className="font-mono text-[0.75rem] tracking-[0.18em] uppercase text-graphite/40 mb-4">404</p>
                        <h1 className="text-4xl font-sans font-semibold text-graphite mb-3">
                          Page not found
                        </h1>
                        <p className="text-graphite/60 font-sans mb-8">The page you're looking for doesn't exist or has moved.</p>
                        <a href="/" className="inline-flex items-center justify-center h-[44px] px-6 bg-[#1F2428] text-[#F7F5F2] text-sm font-sans font-semibold rounded-full transition-all hover:bg-[#2a3038]">
                          Back to Socelle
                        </a>
                      </div>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ConfigCheck>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
