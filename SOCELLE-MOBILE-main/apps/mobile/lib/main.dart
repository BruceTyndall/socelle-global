import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/supabase/supabase_client.dart';
import 'core/theme/socelle_theme.dart';
import 'core/router/app_router.dart';
import 'core/shared/offline_banner.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style for Pearl Mineral V2 look.
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarBrightness: Brightness.light,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: SocelleTheme.mnBg,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

  // Initialize Supabase — non-fatal if env vars not set.
  await SocelleSupabaseClient.initialize();

  runApp(const ProviderScope(child: SocelleApp()));
}

/// Root application widget.
///
/// Uses GoRouter for navigation, Riverpod for state management,
/// and Pearl Mineral V2 design system throughout.
class SocelleApp extends ConsumerWidget {
  const SocelleApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'SOCELLE',
      debugShowCheckedModeBanner: false,
      theme: SocelleTheme.light,
      routerConfig: router,
      builder: (context, child) {
        return Stack(
          children: [
            if (child != null) child,
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: OfflineBanner(),
            ),
          ],
        );
      },
    );
  }
}
