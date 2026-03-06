import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/paywall/paywall_page.dart';
import '../../features/support/support_page.dart';
import '../../providers/navigation_provider.dart';
import '../../providers/sync_provider.dart';
import '../theme/socelle_design_system.dart';
import '../theme/socelle_colors.dart';

/// Side drawer — reflects the 5-tab shell layout.
///
/// Tabs 0–1 and 4 (Feed, Discover, Profile) use Socelle accent color.
/// Tabs 2–3 (Revenue, Schedule) use SocelleColors.ink (gap-recovery).
class MainNavigationDrawer extends ConsumerWidget {
  const MainNavigationDrawer({super.key});

  void _goToTab(BuildContext context, WidgetRef ref, int index) {
    Navigator.of(context).pop();
    ref.read(navigationIndexProvider.notifier).state = index;
  }

  void _openSubscription(BuildContext context, WidgetRef ref) {
    final weeklyLeakage =
        ref.read(syncResultProvider).valueOrNull?.currentWeekActiveLeakage() ??
            0.0;
    Navigator.of(context).pop();
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PaywallPage(weeklyLeakage: weeklyLeakage),
      ),
    );
  }

  void _openSupport(BuildContext context) {
    Navigator.of(context).pop();
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const SupportPage(),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(navigationIndexProvider);
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              decoration: BoxDecoration(
                color: SocelleColors.primaryCocoa,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Socelle',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Intelligence + Revenue',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
            // ── Intelligence tabs (Socelle) ──
            _DrawerTile(
              icon: Icons.rss_feed_outlined,
              label: 'Feed',
              selected: currentIndex == 0,
              selectedColor: SocelleColors.primaryCocoa,
              onTap: () => _goToTab(context, ref, 0),
            ),
            _DrawerTile(
              icon: Icons.explore_outlined,
              label: 'Discover',
              selected: currentIndex == 1,
              selectedColor: SocelleColors.primaryCocoa,
              onTap: () => _goToTab(context, ref, 1),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Divider(
                height: 1,
                color: SocelleColors.borderLight,
              ),
            ),
            // ── Gap-recovery tabs (Socelle) ──
            _DrawerTile(
              icon: Icons.show_chart_rounded,
              label: 'Revenue',
              selected: currentIndex == 2,
              selectedColor: SocelleColors.ink,
              onTap: () => _goToTab(context, ref, 2),
            ),
            _DrawerTile(
              icon: Icons.calendar_today_rounded,
              label: 'Schedule',
              selected: currentIndex == 3,
              selectedColor: SocelleColors.ink,
              onTap: () => _goToTab(context, ref, 3),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Divider(
                height: 1,
                color: SocelleColors.borderLight,
              ),
            ),
            // ── Profile (Socelle) ──
            _DrawerTile(
              icon: Icons.person_outline_rounded,
              label: 'Profile',
              selected: currentIndex == 4,
              selectedColor: SocelleColors.primaryCocoa,
              onTap: () => _goToTab(context, ref, 4),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Divider(
                height: 1,
                color: SocelleColors.borderLight,
              ),
            ),
            // ── Secondary actions ──
            _DrawerTile(
              icon: Icons.star_rounded,
              label: 'Subscription',
              onTap: () => _openSubscription(context, ref),
            ),
            _DrawerTile(
              icon: Icons.help_outline_rounded,
              label: 'Support & Feedback',
              onTap: () => _openSupport(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerTile extends StatelessWidget {
  const _DrawerTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.selected = false,
    this.selectedColor = SocelleColors.ink,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;
  final Color selectedColor;

  @override
  Widget build(BuildContext context) {
    final selectedBg = selectedColor.withValues(alpha: 0.10);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Ink(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: selected ? selectedBg : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: selected ? selectedColor : SocelleColors.inkMuted,
                ),
                const SizedBox(width: 12),
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: selected ? selectedColor : SocelleColors.ink,
                        fontWeight:
                            selected ? FontWeight.w700 : FontWeight.w600,
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
