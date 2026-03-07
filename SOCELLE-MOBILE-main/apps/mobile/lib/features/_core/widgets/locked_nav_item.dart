// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — LockedNavItem Widget
// ═══════════════════════════════════════════════════════════════════════════
//
// Bottom nav / More screen item with lock badge overlay.
// If hasAccess: normal navigation.
// If !hasAccess: shows lock icon overlay, tapping opens upgrade bottom sheet.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_design_system.dart';
import '../models/module_access.dart';
import '../providers/module_access_provider.dart';

/// Navigation item that shows a lock badge when the module is not accessible.
///
/// When locked, tapping opens an upgrade bottom sheet instead of navigating.
/// When unlocked, behaves as a normal navigation item.
class LockedNavItem extends ConsumerWidget {
  const LockedNavItem({
    super.key,
    required this.moduleKey,
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.activeColor,
    this.inactiveColor,
  });

  /// The canonical module key (e.g., 'MODULE_SHOP').
  final String moduleKey;

  /// Icon when not selected.
  final IconData icon;

  /// Icon when selected.
  final IconData activeIcon;

  /// Label text.
  final String label;

  /// Whether this item is currently selected.
  final bool isSelected;

  /// Callback when the item is tapped (only fires if unlocked).
  final VoidCallback onTap;

  /// Color when selected (defaults to SocelleColors.primaryCocoa).
  final Color? activeColor;

  /// Color when not selected (defaults to SocelleColors.neutralBeige).
  final Color? inactiveColor;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accessAsync = ref.watch(moduleAccessProvider(moduleKey));

    final hasAccess = accessAsync.whenOrNull(
          data: (a) => a.hasAccess && !a.isExpired,
        ) ??
        true; // Default to unlocked while loading

    final effectiveActiveColor =
        activeColor ?? SocelleColors.primaryCocoa;
    final effectiveInactiveColor =
        inactiveColor ?? SocelleColors.neutralBeige;
    final color = isSelected ? effectiveActiveColor : effectiveInactiveColor;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () {
          if (hasAccess) {
            onTap();
          } else {
            HapticFeedback.mediumImpact();
            _showUpgradeSheet(context, moduleKey);
          }
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    isSelected ? activeIcon : icon,
                    size: 22,
                    color: hasAccess
                        ? color
                        : SocelleColors.neutralBeige.withValues(alpha: 0.5),
                  ),
                  if (!hasAccess)
                    Positioned(
                      right: -6,
                      top: -4,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: SocelleColors.bgMain,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: SocelleColors.borderLight,
                            width: 1,
                          ),
                        ),
                        child: const Icon(
                          Icons.lock_rounded,
                          size: 9,
                          color: SocelleColors.neutralBeige,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  fontWeight:
                      isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: hasAccess
                      ? color
                      : SocelleColors.neutralBeige.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showUpgradeSheet(BuildContext context, String moduleKey) {
    final moduleInfo = ModuleInfo.forKey(moduleKey);

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: SocelleColors.bgMain,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Drag handle
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: SocelleColors.borderLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 24),

                // Module icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: SocelleColors.accentSurface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    _iconForModuleKey(moduleInfo.iconName),
                    size: 32,
                    color: SocelleColors.accent,
                  ),
                ),
                const SizedBox(height: 16),

                Text(
                  '${moduleInfo.name} is locked',
                  style: SocelleText.headlineLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  moduleInfo.description,
                  style: SocelleText.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                SocellePillButton(
                  label: 'View Plans',
                  variant: PillVariant.primary,
                  tone: PillTone.light,
                  size: PillSize.large,
                  expand: true,
                  icon: Icons.arrow_forward_rounded,
                  onTap: () {
                    Navigator.of(sheetContext).pop();
                    context.push('/subscription/plans');
                  },
                ),
                const SizedBox(height: 12),

                SocellePillButton(
                  label: 'Upgrade Now',
                  variant: PillVariant.secondary,
                  tone: PillTone.light,
                  size: PillSize.large,
                  expand: true,
                  onTap: () {
                    Navigator.of(sheetContext).pop();
                    context.push(
                      '/subscription/upgrade',
                      extra: moduleKey,
                    );
                  },
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }
}

IconData _iconForModuleKey(String iconName) {
  return switch (iconName) {
    'shopping_bag' => Icons.shopping_bag_outlined,
    'science' => Icons.science_outlined,
    'school' => Icons.school_outlined,
    'trending_up' => Icons.trending_up_rounded,
    'campaign' => Icons.campaign_outlined,
    'storefront' => Icons.storefront_outlined,
    'contacts' => Icons.contacts_outlined,
    'phone_iphone' => Icons.phone_iphone_rounded,
    _ => Icons.extension_outlined,
  };
}
