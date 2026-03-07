import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/signup_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/home/screens/app_shell.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/shop/screens/shop_home_screen.dart';
import '../../features/shop/screens/product_detail_screen.dart';
import '../../features/shop/screens/cart_screen.dart';
import '../../features/shop/screens/checkout_screen.dart';
import '../../features/shop/screens/order_history_screen.dart';
import '../../features/shop/screens/wishlist_screen.dart';
import '../../features/education/screens/education_home_screen.dart';
import '../../features/education/screens/course_detail_screen.dart';
import '../../features/education/screens/course_player_screen.dart';
import '../../features/education/screens/certificates_screen.dart';
import '../../features/crm/screens/crm_dashboard_screen.dart';
import '../../features/crm/screens/contact_list_screen.dart';
import '../../features/crm/screens/contact_detail_screen.dart';
import '../../features/crm/screens/service_record_screen.dart';
import '../../features/booking/screens/booking_home_screen.dart';
import '../../features/booking/screens/appointment_calendar_screen.dart';
import '../../features/booking/screens/appointment_detail_screen.dart';
import '../../features/sales/screens/sales_dashboard_screen.dart';
import '../../features/sales/screens/pipeline_screen.dart';
import '../../features/sales/screens/deal_detail_screen.dart';
import '../../features/marketing/screens/marketing_dashboard_screen.dart';
import '../../features/marketing/screens/campaign_detail_screen.dart';
import '../../features/ingredients/screens/ingredient_home_screen.dart';
import '../../features/ingredients/screens/ingredient_search_screen.dart';
import '../../features/ingredients/screens/ingredient_detail_screen.dart';
import '../../features/reseller/screens/reseller_dashboard_screen.dart';
import '../../features/reseller/screens/prospect_map_screen.dart';
import '../../features/reseller/screens/revenue_screen.dart';
import '../../features/settings/screens/profile_screen.dart';
import '../../features/settings/screens/notifications_screen.dart';
import '../../features/subscription/screens/subscription_screen.dart';
import '../../features/subscription/screens/plans_screen.dart';
import '../../features/subscription/screens/upgrade_screen.dart';
import '../../features/_core/widgets/module_gate.dart';

/// Global navigator key for GoRouter.
final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

/// GoRouter configuration provider.
final routerProvider = Provider<GoRouter>((ref) {
  final isAuthenticated = ref.watch(isAuthenticatedProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup' ||
          state.matchedLocation == '/forgot-password' ||
          state.matchedLocation == '/splash';

      // If not authenticated, redirect to login (unless already on auth route).
      if (!isAuthenticated && !isAuthRoute) {
        return '/login';
      }

      // If authenticated and on an auth route, redirect to home.
      if (isAuthenticated && isAuthRoute) {
        return '/';
      }

      return null;
    },
    routes: [
      // ── Auth routes (no shell) ──────────────────────────────────────────
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // ── App shell with bottom nav ──────────────────────────────────────
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          // Home tab
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          // Learn tab (gated)
          GoRoute(
            path: '/learn',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ModuleGate(
                moduleKey: 'MODULE_EDUCATION',
                child: EducationHomeScreen(),
              ),
            ),
          ),
          // Shop tab (gated)
          GoRoute(
            path: '/shop',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ModuleGate(
                moduleKey: 'MODULE_SHOP',
                child: ShopHomeScreen(),
              ),
            ),
          ),
          // Book tab
          GoRoute(
            path: '/book',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: BookingHomeScreen(),
            ),
          ),
          // More tab (settings/profile)
          GoRoute(
            path: '/more',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // ── Detail routes (pushed on top of shell) ─────────────────────────

      // Shop
      GoRoute(
        path: '/shop/product/:id',
        builder: (context, state) => ProductDetailScreen(
          productId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/shop/cart',
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: '/shop/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/shop/orders',
        builder: (context, state) => const OrderHistoryScreen(),
      ),
      GoRoute(
        path: '/shop/wishlist',
        builder: (context, state) => const WishlistScreen(),
      ),

      // Education
      GoRoute(
        path: '/learn/course/:id',
        builder: (context, state) => CourseDetailScreen(
          courseId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/learn/player/:id',
        builder: (context, state) => CoursePlayerScreen(
          courseId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/learn/certificates',
        builder: (context, state) => const CertificatesScreen(),
      ),

      // CRM (gated)
      GoRoute(
        path: '/crm',
        builder: (context, state) => const ModuleGate(
          moduleKey: 'MODULE_CRM',
          child: CrmDashboardScreen(),
        ),
      ),
      GoRoute(
        path: '/crm/contacts',
        builder: (context, state) => const ContactListScreen(),
      ),
      GoRoute(
        path: '/crm/contact/:id',
        builder: (context, state) => ContactDetailScreen(
          contactId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/crm/service-record/:id',
        builder: (context, state) => ServiceRecordScreen(
          recordId: state.pathParameters['id']!,
        ),
      ),

      // Booking
      GoRoute(
        path: '/book/calendar',
        builder: (context, state) => const AppointmentCalendarScreen(),
      ),
      GoRoute(
        path: '/book/appointment/:id',
        builder: (context, state) => AppointmentDetailScreen(
          appointmentId: state.pathParameters['id']!,
        ),
      ),

      // Sales (gated)
      GoRoute(
        path: '/sales',
        builder: (context, state) => const ModuleGate(
          moduleKey: 'MODULE_SALES',
          child: SalesDashboardScreen(),
        ),
      ),
      GoRoute(
        path: '/sales/pipeline',
        builder: (context, state) => const PipelineScreen(),
      ),
      GoRoute(
        path: '/sales/deal/:id',
        builder: (context, state) => DealDetailScreen(
          dealId: state.pathParameters['id']!,
        ),
      ),

      // Marketing (gated)
      GoRoute(
        path: '/marketing',
        builder: (context, state) => const ModuleGate(
          moduleKey: 'MODULE_MARKETING',
          child: MarketingDashboardScreen(),
        ),
      ),
      GoRoute(
        path: '/marketing/campaign/:id',
        builder: (context, state) => CampaignDetailScreen(
          campaignId: state.pathParameters['id']!,
        ),
      ),

      // Ingredients (gated)
      GoRoute(
        path: '/ingredients',
        builder: (context, state) => const ModuleGate(
          moduleKey: 'MODULE_INGREDIENTS',
          child: IngredientHomeScreen(),
        ),
      ),
      GoRoute(
        path: '/ingredients/search',
        builder: (context, state) => const IngredientSearchScreen(),
      ),
      GoRoute(
        path: '/ingredients/:id',
        builder: (context, state) => IngredientDetailScreen(
          ingredientId: state.pathParameters['id']!,
        ),
      ),

      // Reseller (gated)
      GoRoute(
        path: '/reseller',
        builder: (context, state) => const ModuleGate(
          moduleKey: 'MODULE_RESELLER',
          child: ResellerDashboardScreen(),
        ),
      ),
      GoRoute(
        path: '/reseller/prospects',
        builder: (context, state) => const ProspectMapScreen(),
      ),
      GoRoute(
        path: '/reseller/revenue',
        builder: (context, state) => const RevenueScreen(),
      ),

      // Settings
      GoRoute(
        path: '/settings/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),

      // ── Subscription routes ──────────────────────────────────────────────
      GoRoute(
        path: '/subscription',
        builder: (context, state) => const SubscriptionScreen(),
      ),
      GoRoute(
        path: '/subscription/plans',
        builder: (context, state) => const PlansScreen(),
      ),
      GoRoute(
        path: '/subscription/upgrade',
        builder: (context, state) {
          final moduleKey = state.extra as String? ?? 'MODULE_MOBILE';
          return UpgradeScreen(moduleKey: moduleKey);
        },
      ),
    ],
  );
});
