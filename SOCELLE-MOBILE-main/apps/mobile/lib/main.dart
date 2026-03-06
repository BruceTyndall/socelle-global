import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import 'core/constants.dart';
import 'core/feature_flags.dart';
import 'core/theme/socelle_colors.dart';
import 'core/theme/socelle_theme.dart';
import 'features/auth/auth_gate_page.dart';
import 'features/onboarding/onboarding_page.dart';
import 'features/shell/app_shell.dart';
import 'firebase_options.dart';
import 'providers/supabase_auth_provider.dart';
import 'providers/user_settings_provider.dart';
import 'services/analytics_service.dart';
import 'services/ab_test_service.dart';
import 'services/notification_service.dart';
import 'services/supabase_client.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: SocelleApp()));
}

class SocelleApp extends StatelessWidget {
  const SocelleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Socelle',
      debugShowCheckedModeBanner: false,
      theme: SocelleTheme.light,
      home: const _AppBootstrap(),
    );
  }
}

class _AppBootstrap extends StatefulWidget {
  const _AppBootstrap();

  @override
  State<_AppBootstrap> createState() => _AppBootstrapState();
}

class _AppBootstrapState extends State<_AppBootstrap> {
  late final Future<void> _initFuture = _init();

  Future<void> _init() async {
    try {
      // 1. Initialize Supabase first as the primary Identity provider.
      await SocelleSupabaseClient.initialize();
      
      if (SocelleSupabaseClient.isInitialized) {
        final session = SocelleSupabaseClient.client.auth.currentSession;
        if (session == null) {
          // Fallback to anonymous auth if no user exists so RevenueCat and other services have an ID.
          await SocelleSupabaseClient.client.auth.signInAnonymously();
        }
      }

      // 2. Initialize Firebase (still needed for Push Notifications / Analytics)
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      // Initialize optional services — non-fatal if they fail
      final futures = [
        NotificationService.initialize().catchError((_) {}),
        _initRevenueCat().catchError((_) {}),
      ];
      if (FeatureFlags.kEnableAbTest) {
        futures.add(AbTestService.initialize().catchError((_) {}));
      }
      await Future.wait(futures);
    } on UnsupportedError {
      // Services not configured for this platform.
      debugPrint('Core services not configured for this platform. Running in UI-only mode.');
    } catch (e) {
      debugPrint('Initialization error: $e');
    }
  }

  /// Configures the RevenueCat SDK with the current Supabase user ID.
  /// Must be called after Supabase Auth is ready.
  Future<void> _initRevenueCat() async {
    final configuration =
        PurchasesConfiguration(SocelleConstants.revenueCatApiKeyIos);
    await Purchases.configure(configuration);

    // Identify the user so RevenueCat ties purchases to this Supabase UID.
    if (SocelleSupabaseClient.isInitialized) {
      final uid = SocelleSupabaseClient.client.auth.currentUser?.id;
      if (uid != null) {
        await Purchases.logIn(uid);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _initFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const _SplashScreen();
        }

        if (snapshot.hasError) {
          return Scaffold(
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Firebase init failed. Add Firebase platform config '
                  '(GoogleService-Info.plist / google-services.json) and rerun.\n\n'
                  '${snapshot.error}',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          );
        }

        return const _RootFlow();
      },
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleColors.background,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Socelle',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.5,
                    color: SocelleColors.ink,
                  ),
            ),
            const SizedBox(height: 24),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ],
        ),
      ),
    );
  }
}

class _RootFlow extends ConsumerStatefulWidget {
  const _RootFlow();

  @override
  ConsumerState<_RootFlow> createState() => _RootFlowState();
}

class _RootFlowState extends ConsumerState<_RootFlow>
    with WidgetsBindingObserver {

  StreamSubscription<RemoteMessage>? _pushSubscription;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Fire on cold start (initial foreground)
    _onAppForegrounded(isInitial: true);
    // Subscribe to foreground push notifications and show in-app banner.
    _pushSubscription = NotificationService.foregroundMessages.listen(
      _showForegroundBanner,
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pushSubscription?.cancel();
    super.dispose();
  }

  /// Shows a floating SnackBar when a push notification arrives while the
  /// app is in the foreground.  Uses [ScaffoldMessenger] which is provided
  /// by the root [MaterialApp] — no Scaffold ancestor required.
  void _showForegroundBanner(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(
              Icons.notifications_active_rounded,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (notification.title != null)
                    Text(
                      notification.title!,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        fontSize: 13,
                      ),
                    ),
                  if (notification.body != null)
                    Text(
                      notification.body!,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: SocelleColors.ink,
        duration: const Duration(seconds: 4),
        action: const SnackBarAction(
          label: 'Open',
          textColor: SocelleColors.background,
          onPressed: NotificationService.onNotificationDismissed,
        ),
      ),
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _onAppForegrounded(isInitial: false);
    }
  }

  /// Called on every foreground event — cold start and resume.
  void _onAppForegrounded({required bool isInitial}) {
    // Fire analytics event (non-blocking)
    AnalyticsService.appOpened(source: isInitial ? 'cold_start' : 'resume');

    // Call the trackAppOpen Cloud Function to reset inactivity tier.
    // Fire-and-forget — failures are non-fatal.
    unawaited(AnalyticsService.trackAppOpenRemote(
      source: isInitial ? 'cold_start' : 'resume',
    ));
  }

  @override
  Widget build(BuildContext context) {
    // ── Tier 1: Wait for Supabase auth state to emit ──────────────────────────
    final authState = ref.watch(authStateProvider);
    if (authState.isLoading) return const _SplashScreen();

    // ── Tier 2: Not logged in → show the Auth Gate (Google / Apple / Email) ──
    // Anonymous sessions are treated as "not logged in" here so users always
    // have the option to link a permanent identity.
    final user = ref.watch(currentUserProvider);
    final isAnonymous = user?.isAnonymous ?? true;
    if (user == null || isAnonymous) return const AuthGatePage();

    // ── Tier 3: Logged in → check if onboarding is done ──────────────────────
    final onboardingComplete = ref.watch(onboardingCompleteProvider);
    return onboardingComplete.when(
      data: (complete) {
        if (!complete) return const OnboardingPage();
        return const AppShell();
      },
      loading: () => const _SplashScreen(),
      error: (_, __) => const AppShell(),
    );
  }
}
