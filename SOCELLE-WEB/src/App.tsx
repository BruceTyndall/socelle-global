import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import { PrelaunchGuard } from './components/PrelaunchGuard';
import { ConfigCheck } from './components/ConfigCheck';
import { StagingBanner } from './components/StagingBanner';
import { ModuleAccessProvider } from './modules/_core/context/ModuleAccessContext';
import ModuleRoute from './modules/_core/components/ModuleRoute';

import BusinessLayout from './layouts/BusinessLayout';
import AdminLayout from './layouts/AdminLayout';
import BrandLayout from './layouts/BrandLayout';
import MarketingLayout from './layouts/MarketingLayout';
import { PageRenderer } from './components/cms/PageRenderer';

// ── Dev Tools
const DevMasterIndex = lazy(() => import('./pages/dev/MasterIndex'));

// ── Pre-launch quiz (primary / route during pre-launch phase — W14-01)
const PrelaunchQuiz = lazy(() => import('./pages/public/PrelaunchQuiz'));

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
const StoriesIndex = lazy(() => import('./pages/public/StoriesIndex'));
const StoryDetail = lazy(() => import('./pages/public/StoryDetail'));
const Professionals = lazy(() => import('./pages/public/Professionals'));
const ProfessionalDetail = lazy(() => import('./pages/public/ProfessionalDetail'));
const ForBrands = lazy(() => import('./pages/public/ForBrands'));
const ForMedspas = lazy(() => import('./pages/public/ForMedspas'));
const ForSalons = lazy(() => import('./pages/public/ForSalons'));
const HowItWorks = lazy(() => import('./pages/public/HowItWorks'));
const RequestAccess = lazy(() => import('./pages/public/RequestAccess'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const Education = lazy(() => import('./pages/public/Education'));
const Ingredients = lazy(() => import('./pages/public/Ingredients'));
const IngredientDetail = lazy(() => import('./pages/public/IngredientDetail'));
const IngredientCollection = lazy(() => import('./pages/public/IngredientCollection'));
const Protocols = lazy(() => import('./pages/public/Protocols'));
const ProtocolDetail = lazy(() => import('./pages/public/ProtocolDetail'));

// ── Shop (WO-OVERHAUL-11)
const Shop = lazy(() => import('./pages/public/Shop'));
const ShopCategory = lazy(() => import('./pages/public/ShopCategory'));
const ShopProduct = lazy(() => import('./pages/public/ShopProduct'));
const ShopCart = lazy(() => import('./pages/public/ShopCart'));
const ShopCheckout = lazy(() => import('./pages/public/ShopCheckout'));
const ShopOrders = lazy(() => import('./pages/public/ShopOrders'));
const ShopOrderDetailPage = lazy(() => import('./pages/public/ShopOrderDetail'));
const ShopWishlist = lazy(() => import('./pages/public/ShopWishlist'));
const IntelligenceCommerce = lazy(() => import('./pages/public/IntelligenceCommerce'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const CartPage = lazy(() => import('./pages/public/Cart'));
const CheckoutPage = lazy(() => import('./pages/public/Checkout'));
const OrderHistory = lazy(() => import('./pages/public/OrderHistory'));
const ShopOrderDetail = lazy(() => import('./pages/public/OrderDetail'));
const WishlistPage = lazy(() => import('./pages/public/WishlistPage'));

// ── Admin Shop (WO-OVERHAUL-11)
const AdminShopHub = lazy(() => import('./pages/admin/AdminShopHub'));
const AdminShopProducts = lazy(() => import('./pages/admin/AdminShopProducts'));
const AdminShopCategories = lazy(() => import('./pages/admin/AdminShopCategories'));
const AdminShopOrders = lazy(() => import('./pages/admin/AdminShopOrders'));
const AdminShopDiscounts = lazy(() => import('./pages/admin/AdminShopDiscounts'));
const AdminShopShipping = lazy(() => import('./pages/admin/AdminShopShipping'));
const AdminShopReviews = lazy(() => import('./pages/admin/AdminShopReviews'));

// ── Subscription Gating
const Pricing = lazy(() => import('./pages/public/Pricing'));
const SubscriptionManagement = lazy(() => import('./pages/business/SubscriptionManagement'));
const AdminSubscriptionPlans = lazy(() => import('./pages/admin/AdminSubscriptionPlans'));
const AdminSubscriptionAccounts = lazy(() => import('./pages/admin/AdminSubscriptionAccounts'));
const AdminSubscriptionMetrics = lazy(() => import('./pages/admin/AdminSubscriptionMetrics'));

// ── Enterprise API (WO-21)
const ApiDocs = lazy(() => import('./pages/public/ApiDocs'));
const ApiPricing = lazy(() => import('./pages/public/ApiPricing'));

// ── Authoring Studio (WO-CMS-05)
const StudioHome = lazy(() => import('./pages/business/studio/StudioHome'));
const StudioEditor = lazy(() => import('./pages/business/studio/StudioEditor'));
const CourseBuilder = lazy(() => import('./pages/business/studio/CourseBuilder'));

// ── Credit Economy (V2-HUBS-12)
const CreditDashboard = lazy(() => import('./pages/business/credits/CreditDashboard'));
const CreditPurchase = lazy(() => import('./pages/business/credits/CreditPurchase'));

// ── Affiliate Engine (V2-HUBS-13)
const AffiliateDashboard = lazy(() => import('./pages/business/affiliates/AffiliateDashboard'));
const AffiliateLinks = lazy(() => import('./pages/business/affiliates/AffiliateLinks'));

// ── Onboarding (V2-PLAT-04)
const OnboardingFlow = lazy(() => import('./pages/business/onboarding/OnboardingFlow'));

// ── Marketing Hub (V2-HUBS-08)
const BizMarketingDashboard = lazy(() => import('./pages/business/marketing/MarketingDashboard'));
const BizCampaignList = lazy(() => import('./pages/business/marketing/CampaignList'));
const BizCampaignBuilder = lazy(() => import('./pages/business/marketing/CampaignBuilder'));
const BizMarketingTemplates = lazy(() => import('./pages/business/marketing/MarketingTemplates'));

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

// ── CRM + Booking + Prospecting
const CrmDashboard = lazy(() => import('./pages/business/CrmDashboard'));
const ContactList = lazy(() => import('./pages/business/ContactList'));
const AddContact = lazy(() => import('./pages/business/AddContact'));
const ContactDetail = lazy(() => import('./pages/business/ContactDetail'));
const CompanyList = lazy(() => import('./pages/business/CompanyList'));
const CompanyDetail = lazy(() => import('./pages/business/CompanyDetail'));
const EditContact = lazy(() => import('./pages/business/EditContact'));
const AddCompany = lazy(() => import('./pages/business/AddCompany'));
const EditCompany = lazy(() => import('./pages/business/EditCompany'));
const CrmTasks = lazy(() => import('./pages/business/CrmTasks'));
const CrmSegments = lazy(() => import('./pages/business/CrmSegments'));
const BookingDashboard = lazy(() => import('./pages/business/BookingDashboard'));
const AppointmentCalendar = lazy(() => import('./pages/business/AppointmentCalendar'));
const AppointmentDetail = lazy(() => import('./pages/business/AppointmentDetail'));
const ServiceManager = lazy(() => import('./pages/business/ServiceManager'));
const StaffManager = lazy(() => import('./pages/business/StaffManager'));
const ClientRecords = lazy(() => import('./pages/business/ClientRecords'));
const AddServiceRecord = lazy(() => import('./pages/business/AddServiceRecord'));
const ProspectList = lazy(() => import('./pages/business/ProspectList'));
const ProspectDetail = lazy(() => import('./pages/business/ProspectDetail'));
const BookingWidget = lazy(() => import('./pages/public/BookingWidget'));

// ── B2B Reseller Portal
const ResellerDashboard = lazy(() => import('./pages/business/ResellerDashboard'));
const ResellerClients = lazy(() => import('./pages/business/ResellerClients'));
const ResellerRevenue = lazy(() => import('./pages/business/ResellerRevenue'));
const WhiteLabelConfig = lazy(() => import('./pages/business/WhiteLabelConfig'));

// ── Wave 9 — new public pages
const Events = lazy(() => import('./pages/public/Events'));
const Jobs = lazy(() => import('./pages/public/Jobs'));
const JobDetail = lazy(() => import('./pages/public/JobDetail'));

// ── CMS public pages (WO-CMS-04)
const BlogListPage = lazy(() => import('./pages/public/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));

// ── CMS content surfaces (V2-HUBS-14)
const IntelligenceBriefs = lazy(() => import('./pages/public/IntelligenceBriefs'));
const IntelligenceBriefDetail = lazy(() => import('./pages/public/IntelligenceBriefDetail'));
const EducationArticles = lazy(() => import('./pages/public/EducationArticles'));
const HelpCenter = lazy(() => import('./pages/public/HelpCenter'));
const CaseStudies = lazy(() => import('./pages/public/Stories'));

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
const AdminRecovery = lazy(() => import('./pages/admin/AdminRecovery'));
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

// ── Admin Hubs (W12-11)
const AdminCrmHub = lazy(() => import('./pages/admin/CrmHub'));
const AdminSocialHub = lazy(() => import('./pages/admin/SocialHub'));
const AdminSalesHub = lazy(() => import('./pages/admin/SalesHub'));
const AdminEditorialHub = lazy(() => import('./pages/admin/EditorialHub'));
const AdminAffiliatesHub = lazy(() => import('./pages/admin/AffiliatesHub'));
const AdminEventsHub = lazy(() => import('./pages/admin/EventsHub'));
const AdminJobsHub = lazy(() => import('./pages/admin/JobsHub'));
const AdminRecruitmentHub = lazy(() => import('./pages/admin/RecruitmentHub'));
const AdminFeedsHub = lazy(() => import('./pages/admin/AdminFeedsHub'));
const AdminBlogHub = lazy(() => import('./pages/admin/AdminBlogHub'));
const AdminResellerHub = lazy(() => import('./pages/admin/AdminResellerHub'));

// ── Admin Hub completion (V2-HUBS-05)
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminFeatureFlags = lazy(() => import('./pages/admin/AdminFeatureFlags'));
const AdminShellDetection = lazy(() => import('./pages/admin/AdminShellDetection'));
const AdminInventoryReport = lazy(() => import('./pages/admin/AdminInventoryReport'));
const AdminApiControls = lazy(() => import('./pages/admin/AdminApiControls'));
const AdminPlatformSettings = lazy(() => import('./pages/admin/AdminPlatformSettings'));

// ── Sales Platform (WO-OVERHAUL-14)
const SalesDashboard = lazy(() => import('./pages/sales/SalesDashboard'));
const PipelineBoard = lazy(() => import('./pages/sales/PipelineBoard'));
const DealDetail = lazy(() => import('./pages/sales/DealDetail'));
const ProposalBuilder = lazy(() => import('./pages/sales/ProposalBuilder'));
const ProposalView = lazy(() => import('./pages/sales/ProposalView'));
const CommissionDashboard = lazy(() => import('./pages/sales/CommissionDashboard'));
const OpportunityFinder = lazy(() => import('./pages/sales/OpportunityFinder'));
const RevenueAnalytics = lazy(() => import('./pages/sales/RevenueAnalytics'));
const DealEditor = lazy(() => import('./pages/sales/DealEditor'));

// ── Sales Platform — Business Portal pages (WO-OVERHAUL-14)
const BusinessSalesDashboard = lazy(() => import('./pages/business/SalesDashboard'));
const BusinessPipelineBoard = lazy(() => import('./pages/business/PipelineBoard'));
const BusinessDealDetail = lazy(() => import('./pages/business/DealDetail'));
const BusinessProposalEditor = lazy(() => import('./pages/business/ProposalEditor'));
const BusinessCommissionsDashboard = lazy(() => import('./pages/business/CommissionsDashboard'));
const AdminSalesPlatformHub = lazy(() => import('./pages/admin/AdminSalesPlatformHub'));

// ── Business Portal Marketing (WO-OVERHAUL-15)
const BusinessMarketingDashboard = lazy(() => import('./pages/business/MarketingDashboard'));
const BusinessCampaignDetail = lazy(() => import('./pages/business/CampaignDetail'));
const BusinessCampaignEditor = lazy(() => import('./pages/business/CampaignEditor'));
const BusinessAudienceSegments = lazy(() => import('./pages/business/AudienceSegments'));
const BusinessContentTemplates = lazy(() => import('./pages/business/ContentTemplates'));
const BusinessMarketingAnalytics = lazy(() => import('./pages/business/MarketingAnalytics'));

// ── Marketing Platform (WO-OVERHAUL-15)
const MarketingDashboard = lazy(() => import('./pages/marketing/MarketingDashboard'));
const CampaignList = lazy(() => import('./pages/marketing/CampaignList'));
const CampaignBuilder = lazy(() => import('./pages/marketing/CampaignBuilder'));
const CampaignDetail = lazy(() => import('./pages/marketing/CampaignDetail'));
const SegmentList = lazy(() => import('./pages/marketing/SegmentList'));
const TemplateGallery = lazy(() => import('./pages/marketing/TemplateGallery'));
const LandingPageList = lazy(() => import('./pages/marketing/LandingPageList'));
const MktgCalendar = lazy(() => import('./pages/marketing/MarketingCalendar'));
const AdminMarketingHub = lazy(() => import('./pages/admin/AdminMarketingHub'));

// ── eLearning platform (WO-OVERHAUL-13)
const EduCourseCatalog = lazy(() => import('./pages/education/CourseCatalog'));
const EduCourseDetail = lazy(() => import('./pages/education/CourseDetail'));
const EduCoursePlayer = lazy(() => import('./pages/education/CoursePlayer'));
const EduMyCertificates = lazy(() => import('./pages/education/MyCertificates'));
const EduCertificateVerify = lazy(() => import('./pages/education/CertificateVerify'));
const EduCECreditDashboard = lazy(() => import('./pages/education/CECreditDashboard'));
const EduStaffTraining = lazy(() => import('./pages/education/StaffTraining'));
const EduAuthorDashboard = lazy(() => import('./pages/education/author/AuthorDashboard'));
const EduCourseBuilder = lazy(() => import('./pages/education/author/CourseBuilder'));
const AdminEducationHub = lazy(() => import('./pages/admin/AdminEducationHub'));

// ── Admin CMS + API Hubs (WO-OVERHAUL-04)
const AdminPagesHub = lazy(() => import('./pages/admin/AdminPagesHub'));
const AdminMediaHub = lazy(() => import('./pages/admin/AdminMediaHub'));
const AdminSeoHub = lazy(() => import('./pages/admin/AdminSeoHub'));
const AdminLiveDataHub = lazy(() => import('./pages/admin/AdminLiveDataHub'));
const AdminApiControlHub = lazy(() => import('./pages/admin/AdminApiControlHub'));
const AdminApiSitemapHub = lazy(() => import('./pages/admin/AdminApiSitemapHub'));
const AdminSettingsHub = lazy(() => import('./pages/admin/AdminSettingsHub'));

// ── Admin CMS Hub (WO-CMS-01..03)
const CmsDashboard = lazy(() => import('./pages/admin/cms/CmsDashboard'));
const CmsPagesList = lazy(() => import('./pages/admin/cms/CmsPagesList'));
const CmsPostsList = lazy(() => import('./pages/admin/cms/CmsPostsList'));
const CmsBlockLibrary = lazy(() => import('./pages/admin/cms/CmsBlockLibrary'));
const CmsMediaLibrary = lazy(() => import('./pages/admin/cms/CmsMediaLibrary'));
const CmsTemplatesList = lazy(() => import('./pages/admin/cms/CmsTemplatesList'));
const CmsSpacesConfig = lazy(() => import('./pages/admin/cms/CmsSpacesConfig'));

// ── Brand Hub (brand-centric admin)
const BrandHub = lazy(() => import('./pages/admin/BrandHub'));
const HubProducts = lazy(() => import('./pages/admin/brand-hub/HubProducts'));
const HubProtocols = lazy(() => import('./pages/admin/brand-hub/HubProtocols'));
const HubEducation = lazy(() => import('./pages/admin/brand-hub/HubEducation'));
const HubOrders = lazy(() => import('./pages/admin/brand-hub/HubOrders'));
const HubRetailers = lazy(() => import('./pages/admin/brand-hub/HubRetailers'));
const HubAnalytics = lazy(() => import('./pages/admin/brand-hub/HubAnalytics'));
const HubSettings = lazy(() => import('./pages/admin/brand-hub/HubSettings'));

// ── Admin Ingredients (WO-OVERHAUL-12)
const AdminIngredientsHub = lazy(() => import('./pages/admin/AdminIngredientsHub'));
const AdminIngredientCollections = lazy(() => import('./pages/admin/AdminIngredientCollections'));
const AdminIngredientInteractions = lazy(() => import('./pages/admin/AdminIngredientInteractions'));

// ── eLearning Courses (public + admin)
const CoursesCatalog = lazy(() => import('./pages/public/CoursesCatalog'));
const CourseDetailPage = lazy(() => import('./pages/public/CourseDetail'));
const CoursePlayer = lazy(() => import('./pages/public/CoursePlayer'));
const CertificateVerify = lazy(() => import('./pages/public/CertificateVerify'));
const MyCertificates = lazy(() => import('./pages/public/MyCertificates'));
const AdminCoursesHub = lazy(() => import('./pages/admin/AdminCoursesHub'));
const AdminCourseEditor = lazy(() => import('./pages/admin/AdminCourseEditor'));

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

// ── CMS page route wrappers (WO-CMS-04) ──────────────────────────────
// Thin wrappers that extract :slug from URL params and pass to PageRenderer.

function CmsPageRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <PageRenderer slug={slug ?? ''} />;
}

function CmsHelpRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <PageRenderer slug={slug ?? ''} spaceSlug="help" />;
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
            <ModuleAccessProvider>
            <BrowserRouter>
              <Suspense fallback={Fallback}>
                <Routes>
                  {/* ── Public ─────────────────────────────────── */}
                  {/* Pre-launch quiz — primary landing during build phase (W14-01) */}
                  <Route path="/" element={<PrelaunchQuiz />} />
                  {/* Always accessible — auth, legal, and access form bypass prelaunch gate */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/request-access" element={<RequestAccess />} />
                  {/* Public certificate verification — not module-gated, not prelaunch-gated */}
                  <Route path="/education/certificates/verify/:token" element={<EduCertificateVerify />} />
                  <Route path="/certificates/verify/:token" element={<CertificateVerify />} />

                  {/* ── Prelaunch-gated public routes ───────────
                      VITE_PRELAUNCH_MODE=true (Cloudflare Pages production env) →
                      all routes below redirect to "/" for public visitors.
                      Local dev (env var unset) → full access for development agents. */}
                  <Route element={<PrelaunchGuard />}>
                  {/* Full cinematic home kept accessible for internal preview */}
                  <Route path="/home" element={<PublicHome />} />
                  <Route path="/brands" element={<PublicBrands />} />
                  <Route path="/brands/:slug" element={<PublicBrandStorefront />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/intelligence" element={<Intelligence />} />
                  <Route path="/insights" element={<Navigate to="/intelligence" replace />} />
                  <Route path="/stories" element={<StoriesIndex />} />
                  <Route path="/stories/:slug" element={<StoryDetail />} />
                  <Route path="/professionals" element={<Professionals />} />
                  <Route path="/professionals/:id" element={<ProfessionalDetail />} />
                  <Route path="/for-brands" element={<ForBrands />} />
                  <Route path="/for-medspas" element={<ForMedspas />} />
                  <Route path="/for-salons" element={<ForSalons />} />
                  <Route path="/for-buyers" element={<Navigate to="/professionals" replace />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/education/courses" element={<ModuleRoute moduleKey="MODULE_EDUCATION"><EduCourseCatalog /></ModuleRoute>} />
                  <Route path="/education/courses/:slug" element={<ModuleRoute moduleKey="MODULE_EDUCATION"><EduCourseDetail /></ModuleRoute>} />
                  <Route path="/education/learn/:slug" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_EDUCATION"><EduCoursePlayer /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/education/certificates" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_EDUCATION"><EduMyCertificates /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/education/author" element={
                    <ProtectedRoute requireRole={['admin', 'platform_admin']}>
                      <EduAuthorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/education/author/courses/new" element={
                    <ProtectedRoute requireRole={['admin', 'platform_admin']}>
                      <EduCourseBuilder />
                    </ProtectedRoute>
                  } />
                  <Route path="/education/author/courses/:id/edit" element={
                    <ProtectedRoute requireRole={['admin', 'platform_admin']}>
                      <EduCourseBuilder />
                    </ProtectedRoute>
                  } />
                  <Route path="/education/ce-credits" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_EDUCATION"><EduCECreditDashboard /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/education/staff" element={
                    <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_EDUCATION"><EduStaffTraining /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  {/* MODULE_INGREDIENTS gated */}
                  <Route path="/ingredients" element={<ModuleRoute moduleKey="MODULE_INGREDIENTS"><Ingredients /></ModuleRoute>} />
                  <Route path="/ingredients/collections/:slug" element={<ModuleRoute moduleKey="MODULE_INGREDIENTS"><IngredientCollection /></ModuleRoute>} />
                  <Route path="/ingredients/:slug" element={<ModuleRoute moduleKey="MODULE_INGREDIENTS"><IngredientDetail /></ModuleRoute>} />
                  <Route path="/protocols" element={<Protocols />} />
                  <Route path="/protocols/:slug" element={<ProtocolDetail />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/api/docs" element={<ApiDocs />} />
                  <Route path="/api/pricing" element={<ApiPricing />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:slug" element={<JobDetail />} />

                  {/* ── Blog + CMS pages (WO-CMS-04) ── */}
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/pages/:slug" element={<CmsPageRoute />} />
                  <Route path="/help/:slug" element={<CmsHelpRoute />} />

                  {/* ── CMS content surfaces (V2-HUBS-14) ── */}
                  <Route path="/intelligence/briefs" element={<IntelligenceBriefs />} />
                  <Route path="/intelligence/briefs/:slug" element={<IntelligenceBriefDetail />} />
                  <Route path="/education/articles" element={<EducationArticles />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/case-studies" element={<CaseStudies />} />

                  {/* MODULE_EDUCATION gated */}
                  <Route path="/courses" element={<ModuleRoute moduleKey="MODULE_EDUCATION"><CoursesCatalog /></ModuleRoute>} />
                  <Route path="/courses/:slug" element={<ModuleRoute moduleKey="MODULE_EDUCATION"><CourseDetailPage /></ModuleRoute>} />
                  <Route path="/courses/:slug/learn" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_EDUCATION"><CoursePlayer /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/my-certificates" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_EDUCATION"><MyCertificates /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/claim/brand/:slug" element={<ClaimBrand />} />
                  <Route path="/claim/business/:slug" element={<ClaimBusiness />} />
                  <Route path="/book/:slug" element={<BookingWidget />} />

                  {/* ── Shop (WO-OVERHAUL-11) — MODULE_SHOP gated ── */}
                  <Route path="/shop" element={<ModuleRoute moduleKey="MODULE_SHOP"><Shop /></ModuleRoute>} />
                  <Route path="/shop/intelligence" element={<ModuleRoute moduleKey="MODULE_SHOP"><IntelligenceCommerce /></ModuleRoute>} />
                  <Route path="/shop/category/:slug" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopCategory /></ModuleRoute>} />
                  <Route path="/shop/product/:slug" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopProduct /></ModuleRoute>} />
                  <Route path="/shop/cart" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopCart /></ModuleRoute>} />
                  <Route path="/shop/checkout" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopCheckout /></ModuleRoute>} />
                  <Route path="/shop/orders" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SHOP"><ShopOrders /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/shop/orders/:id" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SHOP"><ShopOrderDetailPage /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/shop/wishlist" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SHOP"><ShopWishlist /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  {/* Legacy shop routes */}
                  <Route path="/shop/:slug" element={<ModuleRoute moduleKey="MODULE_SHOP"><ProductDetail /></ModuleRoute>} />
                  <Route path="/cart" element={<ModuleRoute moduleKey="MODULE_SHOP"><CartPage /></ModuleRoute>} />
                  <Route path="/checkout" element={<ModuleRoute moduleKey="MODULE_SHOP"><CheckoutPage /></ModuleRoute>} />
                  <Route path="/account/orders" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SHOP"><OrderHistory /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/account/orders/:id" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SHOP"><ShopOrderDetail /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/account/wishlist" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SHOP"><WishlistPage /></ModuleRoute>
                    </ProtectedRoute>
                  } />

                  {/* ── Sales Platform (WO-OVERHAUL-14) — MODULE_SALES gated ── */}
                  <Route path="/sales" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><SalesDashboard /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/pipeline" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><PipelineBoard /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/deals/:id" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><DealDetail /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/proposals/new" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><ProposalBuilder /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/proposals/:id/view" element={<ModuleRoute moduleKey="MODULE_SALES"><ProposalView /></ModuleRoute>} />
                  <Route path="/sales/commissions" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><CommissionDashboard /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/opportunities" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><OpportunityFinder /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/analytics" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><RevenueAnalytics /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/deals/new" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><DealEditor /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales/deals/:id/edit" element={
                    <ProtectedRoute requireRole={['business_user', 'brand_admin', 'admin', 'platform_admin']}>
                      <ModuleRoute moduleKey="MODULE_SALES"><DealEditor /></ModuleRoute>
                    </ProtectedRoute>
                  } />
                  </Route>{/* end PrelaunchGuard */}

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
                        <ModuleRoute moduleKey="MODULE_CRM"><NotificationPreferences /></ModuleRoute>
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
                    <Route path="brands/:slug" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_SHOP"><BrandDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
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
                    <Route path="subscription" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <SubscriptionManagement />
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
                    {/* ── B2B Reseller — MODULE_RESELLER gated ── */}
                    <Route path="reseller" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_RESELLER"><ResellerDashboard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="reseller/clients" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_RESELLER"><ResellerClients /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="reseller/revenue" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_RESELLER"><ResellerRevenue /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="reseller/white-label" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_RESELLER"><WhiteLabelConfig /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    {/* ── Sales Platform (WO-OVERHAUL-14) — MODULE_SALES gated ── */}
                    <Route path="sales" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_SALES"><BusinessSalesDashboard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="sales/pipeline" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_SALES"><BusinessPipelineBoard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="sales/deals/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_SALES"><BusinessDealDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="sales/proposals/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_SALES"><BusinessProposalEditor /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="sales/commissions" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_SALES"><BusinessCommissionsDashboard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    {/* ── Marketing Platform (WO-OVERHAUL-15) — MODULE_MARKETING gated ── */}
                    <Route path="marketing" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_MARKETING"><BusinessMarketingDashboard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="marketing/campaigns/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_MARKETING"><BusinessCampaignDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="marketing/campaigns/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_MARKETING"><BusinessCampaignEditor /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="marketing/segments" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_MARKETING"><BusinessAudienceSegments /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="marketing/templates" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_MARKETING"><BusinessContentTemplates /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="marketing/analytics" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_MARKETING"><BusinessMarketingAnalytics /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    {/* ── CRM + Booking + Prospecting — MODULE_CRM gated ── */}
                    <Route path="crm" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><CrmDashboard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/contacts" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><ContactList /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/contacts/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><AddContact /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/contacts/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><ContactDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/companies" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><CompanyList /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/companies/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><CompanyDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/contacts/:id/edit" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><EditContact /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/companies/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><AddCompany /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/companies/:id/edit" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><EditCompany /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/tasks" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><CrmTasks /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/segments" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><CrmSegments /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="booking" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><BookingDashboard /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="booking/calendar" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><AppointmentCalendar /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="booking/appointments/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><AppointmentDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="booking/services" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><ServiceManager /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="booking/staff" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><StaffManager /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/contacts/:id/records" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><ClientRecords /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="crm/contacts/:id/records/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><AddServiceRecord /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="prospects" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><ProspectList /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="prospects/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_CRM"><ProspectDetail /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    {/* ── Onboarding (V2-PLAT-04) ── */}
                    <Route path="onboarding" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <OnboardingFlow />
                      </ProtectedRoute>
                    } />

                    {/* ── Authoring Studio (WO-CMS-05) ── */}
                    <Route path="studio" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_STUDIO"><StudioHome /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="studio/editor/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_STUDIO"><StudioEditor /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="studio/editor" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_STUDIO"><StudioEditor /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="studio/course/:id" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_STUDIO"><CourseBuilder /></ModuleRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="studio/course" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <ModuleRoute moduleKey="MODULE_STUDIO"><CourseBuilder /></ModuleRoute>
                      </ProtectedRoute>
                    } />

                    {/* ── Credit Economy (V2-HUBS-12) ── */}
                    <Route path="credits" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <CreditDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="credits/purchase" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <CreditPurchase />
                      </ProtectedRoute>
                    } />

                    {/* ── Affiliate Engine (V2-HUBS-13) ── */}
                    <Route path="affiliates" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <AffiliateDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="affiliates/links" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <AffiliateLinks />
                      </ProtectedRoute>
                    } />

                    {/* ── Marketing Hub (V2-HUBS-08) ── */}
                    <Route path="marketing-hub" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BizMarketingDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="marketing-hub/campaigns" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BizCampaignList />
                      </ProtectedRoute>
                    } />
                    <Route path="marketing-hub/campaigns/new" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BizCampaignBuilder />
                      </ProtectedRoute>
                    } />
                    <Route path="marketing-hub/templates" element={
                      <ProtectedRoute requireRole={['business_user', 'admin', 'platform_admin']}>
                        <BizMarketingTemplates />
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
                    <Route path="crm" element={<BrandCustomers />} />
                    <Route path="crm/leads" element={<BrandLeads />} />
                    <Route path="crm/pipeline" element={<BrandPipeline />} />
                    <Route path="crm/messages" element={<BrandMessages />} />
                    <Route path="storefront" element={<BrandStorefront />} />
                    <Route path="intelligence" element={<BrandIntelligenceHub />} />
                    <Route path="advisor" element={<BrandAIAdvisor />} />
                    <Route path="notifications" element={<ModuleRoute moduleKey="MODULE_MARKETING"><BrandNotificationPreferences /></ModuleRoute>} />
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

                  {/* ── Marketing Platform (WO-OVERHAUL-15) — MODULE_MARKETING gated ── */}
                  <Route
                    path="/marketing"
                    element={
                      <ProtectedRoute
                        requireRole={['admin', 'platform_admin', 'brand_admin', 'business_user']}
                        redirectTo="/portal/login"
                      >
                        <ModuleRoute moduleKey="MODULE_MARKETING">
                          <MarketingLayout />
                        </ModuleRoute>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<MarketingDashboard />} />
                    <Route path="campaigns" element={<CampaignList />} />
                    <Route path="campaigns/new" element={<CampaignBuilder />} />
                    <Route path="campaigns/:id" element={<CampaignDetail />} />
                    <Route path="segments" element={<SegmentList />} />
                    <Route path="templates" element={<TemplateGallery />} />
                    <Route path="landing-pages" element={<LandingPageList />} />
                    <Route path="calendar" element={<MktgCalendar />} />
                  </Route>

                  {/* ── Dev Tools ──────────────────────────────────── */}
                  <Route path="/dev-index" element={<DevMasterIndex />} />

                  {/* ── Admin ─────────────────────────────────────── */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/recovery" element={<AdminRecovery />} />
                  <Route path="/admin/debug-auth" element={<AdminAuthDebug />} />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute
                        requireRole={['admin', 'platform_admin']}
                        redirectTo="/admin/login"
                      >
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
                          <h2 className="text-2xl font-sans text-graphite mb-2">Products</h2>
                          <p className="text-graphite/60 font-sans">Manage PRO and Retail products</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-graphite font-sans mb-4">PRO Products</h3>
                            <ProProductsView />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-graphite font-sans mb-4">Retail Products</h3>
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

                    {/* ── Marketing Hub (WO-OVERHAUL-15) ── */}
                    <Route path="marketing" element={<AdminMarketingHub />} />
                    <Route path="marketing-platform" element={<AdminMarketingHub />} />

                    {/* ── Admin Hubs (W12-11) ── */}
                    <Route path="crm" element={<AdminCrmHub />} />
                    <Route path="social" element={<AdminSocialHub />} />
                    <Route path="sales" element={<AdminSalesHub />} />
                    <Route path="editorial" element={<AdminEditorialHub />} />
                    <Route path="affiliates" element={<AdminAffiliatesHub />} />
                    <Route path="events" element={<AdminEventsHub />} />
                    <Route path="jobs" element={<AdminJobsHub />} />
                    <Route path="recruitment" element={<AdminRecruitmentHub />} />
                    <Route path="feeds" element={<AdminFeedsHub />} />
                    <Route path="blog" element={<AdminBlogHub />} />
                    <Route path="sales-platform" element={<AdminSalesPlatformHub />} />
                    <Route path="reseller" element={<AdminResellerHub />} />

                    {/* ── Admin Hub completion (V2-HUBS-05) ── */}
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="audit-log" element={<AdminAuditLog />} />
                    <Route path="feature-flags" element={<AdminFeatureFlags />} />
                    <Route path="shell-detection" element={<AdminShellDetection />} />
                    <Route path="inventory-report" element={<AdminInventoryReport />} />
                    <Route path="api-controls" element={<AdminApiControls />} />
                    <Route path="platform-settings" element={<AdminPlatformSettings />} />

                    {/* ── Education (WO-OVERHAUL-13) ── */}
                    <Route path="education" element={<AdminEducationHub />} />

                    {/* ── Courses (eLearning CRUD) ── */}
                    <Route path="courses" element={<AdminCoursesHub />} />
                    <Route path="courses/:id/edit" element={<AdminCourseEditor />} />

                    {/* ── Ingredients (WO-OVERHAUL-12) ── */}
                    <Route path="ingredients" element={<AdminIngredientsHub />} />
                    <Route path="ingredients/collections" element={<AdminIngredientCollections />} />
                    <Route path="ingredients/interactions" element={<AdminIngredientInteractions />} />

                    {/* ── CMS + API Hubs (WO-OVERHAUL-04) ── */}
                    <Route path="pages" element={<AdminPagesHub />} />
                    <Route path="media" element={<AdminMediaHub />} />
                    <Route path="seo" element={<AdminSeoHub />} />
                    <Route path="live-data" element={<AdminLiveDataHub />} />
                    <Route path="api-control" element={<AdminApiControlHub />} />
                    <Route path="api-sitemap" element={<AdminApiSitemapHub />} />
                    <Route path="settings" element={<AdminSettingsHub />} />

                    {/* ── CMS Hub (WO-CMS-01..03) ── */}
                    <Route path="cms" element={<CmsDashboard />} />
                    <Route path="cms/pages" element={<CmsPagesList />} />
                    <Route path="cms/posts" element={<CmsPostsList />} />
                    <Route path="cms/blocks" element={<CmsBlockLibrary />} />
                    <Route path="cms/media" element={<CmsMediaLibrary />} />
                    <Route path="cms/templates" element={<CmsTemplatesList />} />
                    <Route path="cms/spaces" element={<CmsSpacesConfig />} />

                    {/* ── Shop Admin (WO-OVERHAUL-11) ── */}
                    <Route path="shop" element={<AdminShopHub />} />
                    <Route path="shop/products" element={<AdminShopProducts />} />
                    <Route path="shop/categories" element={<AdminShopCategories />} />
                    <Route path="shop/orders" element={<AdminShopOrders />} />
                    <Route path="shop/discounts" element={<AdminShopDiscounts />} />
                    <Route path="shop/shipping" element={<AdminShopShipping />} />
                    <Route path="shop/reviews" element={<AdminShopReviews />} />

                    {/* ── Subscriptions ── */}
                    <Route path="subscriptions" element={<AdminSubscriptionPlans />} />
                    <Route path="subscriptions/accounts" element={<AdminSubscriptionAccounts />} />
                    <Route path="subscriptions/metrics" element={<AdminSubscriptionMetrics />} />

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
            </ModuleAccessProvider>
          </AuthProvider>
        </ConfigCheck>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
