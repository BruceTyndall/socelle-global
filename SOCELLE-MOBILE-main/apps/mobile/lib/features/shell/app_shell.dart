import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/socelle_design_system.dart';
import '../../core/theme/socelle_colors.dart';
import '../../providers/navigation_provider.dart';
import '../discover/discover_page.dart';
import '../feed/feed_page.dart';
import '../profile/profile_page.dart';
import '../revenue/revenue_page.dart';
import '../schedule/schedule_page.dart';

/// Root shell — five tabs.
///
/// Tab layout:
///   0 · Feed     (SocelleTheme — intelligence surface)
///   1 · Discover (SocelleTheme — brands/events/education)
///   2 · Revenue  (SocelleTheme — gap-recovery, DO NOT CHANGE)
///   3 · Schedule (SocelleTheme — gap-recovery, DO NOT CHANGE)
///   4 · Profile  (SocelleTheme — practice profile + settings)
///
/// The bottom bar remains flat, borderless, and editorial. Active item color
/// adapts per tab theme: SocelleColors.primaryCocoa for Socelle tabs (0, 1, 4),
/// SocelleColors.ink for Socelle tabs (2, 3).
class AppShell extends ConsumerWidget {
  const AppShell({super.key});

  static const _items = <_NavItemData>[
    _NavItemData(
      icon: Icons.rss_feed_outlined,
      activeIcon: Icons.rss_feed_rounded,
      label: 'Feed',
    ),
    _NavItemData(
      icon: Icons.explore_outlined,
      activeIcon: Icons.explore_rounded,
      label: 'Discover',
    ),
    _NavItemData(
      icon: Icons.show_chart_rounded,
      activeIcon: Icons.show_chart_rounded,
      label: 'Revenue',
    ),
    _NavItemData(
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_today_rounded,
      label: 'Schedule',
    ),
    _NavItemData(
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      label: 'Profile',
    ),
  ];

  /// Returns true for tabs that use SocelleTheme (Feed, Discover, Profile).
  static bool _isSocelleTab(int index) =>
      index == 0 || index == 1 || index == 4;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(navigationIndexProvider);
    final safeIndex = currentIndex.clamp(0, _items.length - 1);

    final activeColor = _isSocelleTab(safeIndex)
        ? SocelleColors.primaryCocoa
        : SocelleColors.ink;
    final inactiveColor = _isSocelleTab(safeIndex)
        ? SocelleColors.neutralBeige
        : SocelleColors.inkFaint;

    return Scaffold(
      backgroundColor: SocelleColors.background,
      body: IndexedStack(
        index: safeIndex,
        children: const [
          FeedPage(),
          DiscoverPage(),
          RevenuePage(),
          SchedulePage(),
          ProfilePage(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: SocelleColors.background,
          border: Border(
            top: BorderSide(color: SocelleColors.borderLight, width: 1),
          ),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                for (var i = 0; i < _items.length; i++)
                  Expanded(
                    child: _ShellNavItem(
                      data: _items[i],
                      selected: i == safeIndex,
                      activeColor: activeColor,
                      inactiveColor: inactiveColor,
                      onTap: () {
                        if (i == safeIndex) return;
                        HapticFeedback.selectionClick();
                        ref.read(navigationIndexProvider.notifier).state = i;
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── NAV ITEM DATA ──────────────────────────────────────────────────────────

class _NavItemData {
  const _NavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
}

// ─── NAV ITEM WIDGET ────────────────────────────────────────────────────────

class _ShellNavItem extends StatelessWidget {
  const _ShellNavItem({
    required this.data,
    required this.selected,
    required this.activeColor,
    required this.inactiveColor,
    required this.onTap,
  });

  final _NavItemData data;
  final bool selected;
  final Color activeColor;
  final Color inactiveColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? activeColor : inactiveColor;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                selected ? data.activeIcon : data.icon,
                size: 22,
                color: color,
              ),
              const SizedBox(height: 2),
              Text(
                data.label,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  fontWeight:
                      selected ? FontWeight.w600 : FontWeight.w400,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
