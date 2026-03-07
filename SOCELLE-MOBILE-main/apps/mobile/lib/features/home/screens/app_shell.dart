import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';

/// Root shell with BottomNavigationBar — 5 tabs.
///
/// Tab layout:
///   0: Home     — Intelligence dashboard
///   1: Learn    — Education / training modules
///   2: Shop     — Product discovery (not primary navigation hook)
///   3: Book     — Appointment booking
///   4: More     — Profile / settings / feature access
///
/// Intelligence leads navigation per SOCELLE doctrine.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child});

  /// The child widget (current route page) rendered by GoRouter ShellRoute.
  final Widget child;

  static const _tabs = <_TabConfig>[
    _TabConfig(
      icon: Icons.insights_outlined,
      activeIcon: Icons.insights_rounded,
      label: 'Home',
      path: '/',
    ),
    _TabConfig(
      icon: Icons.school_outlined,
      activeIcon: Icons.school_rounded,
      label: 'Learn',
      path: '/learn',
    ),
    _TabConfig(
      icon: Icons.storefront_outlined,
      activeIcon: Icons.storefront_rounded,
      label: 'Shop',
      path: '/shop',
    ),
    _TabConfig(
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_today_rounded,
      label: 'Book',
      path: '/book',
    ),
    _TabConfig(
      icon: Icons.menu_rounded,
      activeIcon: Icons.menu_rounded,
      label: 'More',
      path: '/more',
    ),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = _tabs.length - 1; i >= 0; i--) {
      if (location.startsWith(_tabs[i].path)) {
        // Exact match for '/' to avoid matching everything
        if (_tabs[i].path == '/' && location != '/') continue;
        return i;
      }
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _currentIndex(context);

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: SocelleTheme.mnBg,
          border: Border(
            top: BorderSide(color: SocelleTheme.borderLight, width: 1),
          ),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                for (var i = 0; i < _tabs.length; i++)
                  Expanded(
                    child: _BottomNavItem(
                      config: _tabs[i],
                      selected: i == currentIndex,
                      onTap: () {
                        if (i == currentIndex) return;
                        HapticFeedback.selectionClick();
                        context.go(_tabs[i].path);
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

class _TabConfig {
  const _TabConfig({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.path,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;
}

class _BottomNavItem extends StatelessWidget {
  const _BottomNavItem({
    required this.config,
    required this.selected,
    required this.onTap,
  });

  final _TabConfig config;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? SocelleTheme.graphite : SocelleTheme.textFaint;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: SocelleTheme.borderRadiusMd,
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                selected ? config.activeIcon : config.icon,
                size: 22,
                color: color,
              ),
              const SizedBox(height: 2),
              Text(
                config.label,
                style: TextStyle(
                  fontFamily: SocelleTheme.fontFamily,
                  fontSize: 11,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
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
