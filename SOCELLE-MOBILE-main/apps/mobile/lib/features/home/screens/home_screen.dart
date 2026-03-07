import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// Home screen — Intelligence dashboard.
///
/// DEMO surface: Shows market signals from `market_signals` table when
/// Supabase is connected, otherwise displays demo data with DEMO badge.
///
/// Intelligence leads the experience per SOCELLE doctrine.
/// This is the first surface the user sees after authentication.

// Provider for market signals
final _marketSignalsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoSignals;
  try {
    final response = await SocelleSupabaseClient.client
        .from('market_signals')
        .select()
        .order('created_at', ascending: false)
        .limit(10);
    if (response.isEmpty) return _demoSignals;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoSignals;
  }
});

final _isLiveProvider = Provider<bool>((ref) {
  final signals = ref.watch(_marketSignalsProvider).valueOrNull;
  return signals != null && signals != _demoSignals;
});

const _demoSignals = <Map<String, dynamic>>[
  {
    'title': 'Peptide Serum Demand Rising',
    'category': 'Ingredients',
    'trend': 'up',
    'change_pct': 12.4,
    'summary': 'Search volume for peptide-based serums increased 12.4% this quarter across professional channels.',
  },
  {
    'title': 'LED Therapy Adoption Accelerating',
    'category': 'Devices',
    'trend': 'up',
    'change_pct': 8.7,
    'summary': 'Professional LED device orders up 8.7% YoY, driven by at-home + in-clinic hybrid protocols.',
  },
  {
    'title': 'Retinol Reformulation Trend',
    'category': 'Formulation',
    'trend': 'neutral',
    'change_pct': 2.1,
    'summary': 'Brands reformulating retinol products with encapsulation technology for reduced irritation.',
  },
  {
    'title': 'Clean Beauty Labeling Under Scrutiny',
    'category': 'Regulatory',
    'trend': 'down',
    'change_pct': -5.2,
    'summary': 'Consumer trust in "clean" labels declining as regulatory bodies demand standardized definitions.',
  },
];

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final signalsAsync = ref.watch(_marketSignalsProvider);
    final isLive = ref.watch(_isLiveProvider);
    final user = ref.watch(currentUserProvider);
    final displayName = user?.userMetadata?['full_name'] as String? ?? 'Professional';

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: SocelleTheme.mnBg,
            title: Row(
              children: [
                Text(
                  'SOCELLE',
                  style: SocelleTheme.titleLarge.copyWith(
                    letterSpacing: 2.0,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, size: 22),
                onPressed: () => context.push('/settings/notifications'),
              ),
              const SizedBox(width: 4),
            ],
          ),

          // Greeting
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                SocelleTheme.spacingLg,
                SocelleTheme.spacingSm,
                SocelleTheme.spacingLg,
                SocelleTheme.spacingMd,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back,',
                    style: SocelleTheme.bodyMedium,
                  ),
                  Text(
                    displayName,
                    style: SocelleTheme.headlineMedium,
                  ),
                ],
              ),
            ),
          ),

          // Quick Actions
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
              child: Row(
                children: [
                  _QuickAction(
                    icon: Icons.science_outlined,
                    label: 'Ingredients',
                    onTap: () => context.push('/ingredients'),
                  ),
                  const SizedBox(width: SocelleTheme.spacingMd),
                  _QuickAction(
                    icon: Icons.people_outline_rounded,
                    label: 'CRM',
                    onTap: () => context.push('/crm'),
                  ),
                  const SizedBox(width: SocelleTheme.spacingMd),
                  _QuickAction(
                    icon: Icons.trending_up_rounded,
                    label: 'Sales',
                    onTap: () => context.push('/sales'),
                  ),
                  const SizedBox(width: SocelleTheme.spacingMd),
                  _QuickAction(
                    icon: Icons.campaign_outlined,
                    label: 'Marketing',
                    onTap: () => context.push('/marketing'),
                  ),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(
            child: SizedBox(height: SocelleTheme.spacingLg),
          ),

          // Section header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
              child: Row(
                children: [
                  Text('Market Intelligence', style: SocelleTheme.titleMedium),
                  const Spacer(),
                  if (!isLive) const DemoBadge(compact: true),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(
            child: SizedBox(height: SocelleTheme.spacingMd),
          ),

          // Signals list
          signalsAsync.when(
            data: (signals) {
              if (signals.isEmpty) {
                return const SliverFillRemaining(
                  child: socelle.SocelleErrorWidget(
                    message: 'No intelligence signals available.',
                    icon: Icons.insights_outlined,
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
                sliver: SliverList.separated(
                  itemCount: signals.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: SocelleTheme.spacingMd),
                  itemBuilder: (context, index) {
                    final signal = signals[index];
                    return _SignalCard(
                      title: signal['title'] as String? ?? '',
                      category: signal['category'] as String? ?? '',
                      trend: signal['trend'] as String? ?? 'neutral',
                      changePct: (signal['change_pct'] as num?)?.toDouble() ?? 0,
                      summary: signal['summary'] as String? ?? '',
                    );
                  },
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: SocelleLoadingWidget(message: 'Loading intelligence...'),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Failed to load signals: $e',
                onRetry: () => ref.invalidate(_marketSignalsProvider),
              ),
            ),
          ),

          // Bottom padding
          const SliverToBoxAdapter(
            child: SizedBox(height: SocelleTheme.spacing3xl),
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        child: InkWell(
          borderRadius: SocelleTheme.borderRadiusMd,
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: SocelleTheme.spacingMd),
            decoration: BoxDecoration(
              borderRadius: SocelleTheme.borderRadiusMd,
              border: Border.all(color: SocelleTheme.borderLight),
            ),
            child: Column(
              children: [
                Icon(icon, size: 24, color: SocelleTheme.accent),
                const SizedBox(height: SocelleTheme.spacingXs),
                Text(label, style: SocelleTheme.labelSmall.copyWith(
                  color: SocelleTheme.graphite,
                )),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SignalCard extends StatelessWidget {
  const _SignalCard({
    required this.title,
    required this.category,
    required this.trend,
    required this.changePct,
    required this.summary,
  });

  final String title;
  final String category;
  final String trend;
  final double changePct;
  final String summary;

  Color get _trendColor {
    switch (trend) {
      case 'up':
        return SocelleTheme.signalUp;
      case 'down':
        return SocelleTheme.signalDown;
      default:
        return SocelleTheme.signalWarn;
    }
  }

  IconData get _trendIcon {
    switch (trend) {
      case 'up':
        return Icons.trending_up_rounded;
      case 'down':
        return Icons.trending_down_rounded;
      default:
        return Icons.trending_flat_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(SocelleTheme.spacingMd),
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        border: Border.all(color: SocelleTheme.borderLight),
        boxShadow: SocelleTheme.shadowSm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: SocelleTheme.accentLight,
                  borderRadius: SocelleTheme.borderRadiusPill,
                ),
                child: Text(
                  category,
                  style: SocelleTheme.labelSmall.copyWith(
                    color: SocelleTheme.accent,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              Icon(_trendIcon, size: 18, color: _trendColor),
              const SizedBox(width: 4),
              Text(
                '${changePct >= 0 ? '+' : ''}${changePct.toStringAsFixed(1)}%',
                style: SocelleTheme.labelMedium.copyWith(
                  color: _trendColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: SocelleTheme.spacingMd),
          Text(title, style: SocelleTheme.titleMedium),
          const SizedBox(height: SocelleTheme.spacingSm),
          Text(
            summary,
            style: SocelleTheme.bodyMedium,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
