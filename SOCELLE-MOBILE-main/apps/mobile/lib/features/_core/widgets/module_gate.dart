// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — ModuleGate Widget
// ═══════════════════════════════════════════════════════════════════════════
//
// Gates content by module access. Renders child if the user has access,
// shows UpgradePrompt if locked, shows shimmer skeleton while loading.
//
// Usage:
//   ModuleGate(
//     moduleKey: 'MODULE_SHOP',
//     child: ShopHomeScreen(),
//   )

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/socelle_design_system.dart';
import '../providers/module_access_provider.dart';
import 'upgrade_prompt.dart';

/// Widget that gates content behind module access checks.
///
/// If the user has access to [moduleKey], renders [child].
/// If not, renders [UpgradePrompt] for the locked module.
/// While loading, renders a shimmer skeleton placeholder.
class ModuleGate extends ConsumerWidget {
  const ModuleGate({
    super.key,
    required this.moduleKey,
    required this.child,
    this.showInline = false,
  });

  /// The canonical module key (e.g., 'MODULE_SHOP').
  final String moduleKey;

  /// The child widget to show when access is granted.
  final Widget child;

  /// If true, shows a compact inline lock instead of full-screen prompt.
  final bool showInline;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accessAsync = ref.watch(moduleAccessProvider(moduleKey));

    return accessAsync.when(
      data: (access) {
        if (access.hasAccess && !access.isExpired) {
          return child;
        }
        return UpgradePrompt(
          moduleKey: moduleKey,
          isInline: showInline,
        );
      },
      loading: () => _ShimmerSkeleton(showInline: showInline),
      error: (error, stack) => _ErrorState(
        error: error,
        onRetry: () => ref.invalidate(moduleAccessProvider(moduleKey)),
      ),
    );
  }
}

// ─── SHIMMER SKELETON ────────────────────────────────────────────────────────

class _ShimmerSkeleton extends StatelessWidget {
  const _ShimmerSkeleton({this.showInline = false});

  final bool showInline;

  @override
  Widget build(BuildContext context) {
    if (showInline) {
      return Container(
        height: 120,
        decoration: BoxDecoration(
          color: SocelleColors.surfaceMuted,
          borderRadius: SocelleRadius.small(context),
        ),
      );
    }

    return Scaffold(
      backgroundColor: SocelleColors.bgMain,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 80),
              // Icon placeholder
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: SocelleColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              const SizedBox(height: 24),
              // Title placeholder
              Container(
                width: 200,
                height: 24,
                decoration: BoxDecoration(
                  color: SocelleColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              const SizedBox(height: 12),
              // Description placeholder
              Container(
                width: 280,
                height: 16,
                decoration: BoxDecoration(
                  color: SocelleColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: 240,
                height: 16,
                decoration: BoxDecoration(
                  color: SocelleColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── ERROR STATE ─────────────────────────────────────────────────────────────

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: SocelleColors.leakage,
            ),
            const SizedBox(height: 16),
            Text(
              'Unable to check access',
              style: SocelleText.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Please check your connection and try again.',
              style: SocelleText.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SocellePillButton(
              label: 'Retry',
              variant: PillVariant.primary,
              tone: PillTone.light,
              size: PillSize.medium,
              onTap: onRetry,
            ),
          ],
        ),
      ),
    );
  }
}
