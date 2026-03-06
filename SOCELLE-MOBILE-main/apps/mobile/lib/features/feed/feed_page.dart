import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/feature_flags.dart';
import '../../core/theme/socelle_design_system.dart';
import '../../data/models/affiliate_product.dart';
import '../../data/models/feed_item.dart';
import '../../data/repositories/affiliate_repository.dart';
import '../../data/repositories/feed_repository.dart';
import '../affiliate/affiliate_placement_card.dart';

// ─── Category constants ───────────────────────────────────────────────────────

const _kCategories = <String?>[
  null,
  'skincare',
  'haircare',
  'business',
  'wellness',
];

const _kCategoryLabels = <String>[
  'All',
  'Skincare',
  'Haircare',
  'Business',
  'Wellness',
];

// ─────────────────────────────────────────────────────────────────────────────
// Feed tab — Tab 0.
//
// Intelligence feed powered by [intelligence_signals] (Supabase).
// Uses [feedProvider] from [FeedRepository]. Falls back gracefully to
// empty list when [kEnableSupabaseIntelligence] is false (Supabase not
// configured) — the loading skeleton and empty state handle both cases.
// ─────────────────────────────────────────────────────────────────────────────

class FeedPage extends ConsumerStatefulWidget {
  const FeedPage({super.key});

  @override
  ConsumerState<FeedPage> createState() => _FeedPageState();
}

class _FeedPageState extends ConsumerState<FeedPage> {
  String? _selectedCategory;

  Future<void> _handleRefresh() async {
    ref.read(feedRepositoryProvider).invalidateCache();
    ref.invalidate(feedProvider(_selectedCategory));
    try {
      await ref.read(feedProvider(_selectedCategory).future);
    } catch (_) {
      // Error state handled in build — refresh spinner can still dismiss.
    }
  }

  void _selectCategory(String? category) {
    if (_selectedCategory == category) return;
    setState(() => _selectedCategory = category);
  }

  @override
  Widget build(BuildContext context) {
    final feedAsync = ref.watch(feedProvider(_selectedCategory));

    // Affiliate placement injection — first placement for the 'feed' surface.
    // Gated by FeatureFlags.kEnableAffiliateShop; no-op when false (no provider watch).
    final placementList = FeatureFlags.kEnableAffiliateShop
        ? ref.watch(affiliatePlacementsProvider('feed')).valueOrNull
        : null;
    final AffiliateProduct? placement =
        (placementList != null && placementList.isNotEmpty)
            ? placementList.first
            : null;

    return SocelleScaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _handleRefresh,
          color: SocelleColors.primaryCocoa,
          backgroundColor: SocelleColors.bgNearWhite,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // ── Header ──────────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SocelleSectionLabel('Intelligence Feed'),
                      const SizedBox(height: 8),
                      const Text(
                        'Your daily briefing',
                        style: SocelleText.displayMedium,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Industry intelligence curated for your practice.',
                        style: SocelleText.bodyMedium,
                      ),
                      const SizedBox(height: 20),
                      // Category filter chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            for (var i = 0; i < _kCategories.length; i++) ...[
                              SocelleChip(
                                label: _kCategoryLabels[i],
                                isSelected:
                                    _selectedCategory == _kCategories[i],
                                onTap: () => _selectCategory(_kCategories[i]),
                              ),
                              if (i < _kCategories.length - 1)
                                const SizedBox(width: 8),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),

              // ── Content ─────────────────────────────────────────────────
              feedAsync.when(
                loading: () =>
                    const SliverToBoxAdapter(child: _FeedSkeleton()),
                error: (_, __) => SliverFillRemaining(
                  hasScrollBody: false,
                  child: _FeedError(
                    onRetry: () =>
                        ref.invalidate(feedProvider(_selectedCategory)),
                  ),
                ),
                data: (items) {
                  if (items.isEmpty) {
                    return const SliverFillRemaining(
                      hasScrollBody: false,
                      child: _FeedEmpty(),
                    );
                  }
                  final entries = _buildFeedEntries(items, placement);
                  return SliverPadding(
                    padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                    sliver: SliverList.separated(
                      itemCount: entries.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, i) {
                        final entry = entries[i];
                        if (entry is FeedItem) return _FeedCard(item: entry);
                        if (entry is AffiliateProduct) {
                          return AffiliatePlacementCard(product: entry);
                        }
                        return const SizedBox.shrink(); // unreachable
                      },
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Feed entry list builder ──────────────────────────────────────────────────

/// Builds a combined feed + affiliate entry list.
///
/// When [placement] is non-null, injects it after the 3rd item (index 2),
/// or at the end of the list when fewer than 3 items are present.
List<Object> _buildFeedEntries(List<FeedItem> items, AffiliateProduct? placement) {
  if (placement == null || items.isEmpty) return List<Object>.from(items);
  final entries = List<Object>.from(items);
  entries.insert(items.length >= 3 ? 2 : items.length, placement);
  return entries;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

class _FeedSkeleton extends StatelessWidget {
  const _FeedSkeleton();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        children: [
          for (var i = 0; i < 4; i++) ...[
            SocelleCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title line 1
                  Container(
                    width: double.infinity,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Title line 2
                  Container(
                    width: w * 0.55,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Description line 1
                  Container(
                    width: double.infinity,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Description line 2
                  Container(
                    width: w * 0.4,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Meta row
                  Container(
                    width: 80,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

// ─── Error state ──────────────────────────────────────────────────────────────

class _FeedError extends StatelessWidget {
  const _FeedError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.wifi_off_rounded,
              size: 48,
              color: SocelleColors.neutralBeige,
            ),
            const SizedBox(height: 16),
            const Text('Could not load feed', style: SocelleText.headlineMedium),
            const SizedBox(height: 8),
            const Text(
              'Pull down to refresh or tap retry.',
              style: SocelleText.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SocellePillButton(
              label: 'Retry',
              onTap: onRetry,
              variant: PillVariant.secondary,
              tone: PillTone.light,
              size: PillSize.small,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

class _FeedEmpty extends StatelessWidget {
  const _FeedEmpty();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.rss_feed_rounded,
              size: 48,
              color: SocelleColors.neutralBeige,
            ),
            SizedBox(height: 16),
            Text('No signals yet', style: SocelleText.headlineMedium),
            SizedBox(height: 8),
            Text(
              'Check back soon for your intelligence briefing.',
              style: SocelleText.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Feed card ────────────────────────────────────────────────────────────────

class _FeedCard extends StatelessWidget {
  const _FeedCard({required this.item});

  final FeedItem item;

  // ── Color helpers ──

  Color _categoryColor(String? cat) => switch (cat) {
        'skincare' => SocelleColors.purple400,
        'haircare' => SocelleColors.teal400,
        'business' => SocelleColors.blue400,
        'wellness' => SocelleColors.green400,
        _ => SocelleColors.neutralBeige,
      };

  Color _sentimentColor(String? sentiment) => switch (sentiment) {
        'positive' => SocelleColors.green400,
        'negative' => SocelleColors.red400,
        _ => SocelleColors.neutralBeige,
      };

  // ── Time helper ──

  String _relativeTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.isNegative || diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[dt.month - 1]} ${dt.day}';
  }

  // ── URL helper ──

  Future<void> _openUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  // ── Capitalize first letter ──

  String _capitalize(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';

  @override
  Widget build(BuildContext context) {
    final radius = SocelleRadius.card(context);
    final catColor = _categoryColor(item.category);

    return ClipRRect(
      borderRadius: radius,
      child: SocelleCard(
        padding: EdgeInsets.zero,
        borderRadius: radius,
        onTap: item.url.isNotEmpty ? () => _openUrl(item.url) : null,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Hero image (optional) ──
            if (item.imageUrl != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  item.imageUrl!,
                  fit: BoxFit.cover,
                  loadingBuilder: (_, child, progress) =>
                      progress == null
                          ? child
                          : Container(color: SocelleColors.bgAlt),
                  errorBuilder: (_, __, ___) => Container(
                    color: SocelleColors.bgAlt,
                    child: const Center(
                      child: Icon(
                        Icons.image_not_supported_outlined,
                        color: SocelleColors.neutralBeige,
                      ),
                    ),
                  ),
                ),
              ),

            // ── Card body ──
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category badge + brand mention
                  if (item.category != null || item.brandMention != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          if (item.category != null) ...[
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: catColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _capitalize(item.category!),
                              style: SocelleText.bodyMedium.copyWith(
                                fontSize: 12,
                                color: catColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                          if (item.category != null &&
                              item.brandMention != null)
                            const SizedBox(width: 12),
                          if (item.brandMention != null)
                            Expanded(
                              child: Text(
                                item.brandMention!,
                                style:
                                    SocelleText.bodyMedium.copyWith(fontSize: 12),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                      ),
                    ),

                  // Title
                  Text(
                    item.title,
                    style: SocelleText.bodyLarge,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Description
                  Text(
                    item.description,
                    style: SocelleText.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 14),

                  // Meta row: sentiment · time · tags · open icon
                  Row(
                    children: [
                      if (item.sentiment != null) ...[
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: _sentimentColor(item.sentiment),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Text(
                        _relativeTime(item.publishedAt),
                        style: SocelleText.bodyMedium.copyWith(fontSize: 12),
                      ),
                      if (item.tags.isNotEmpty) ...[
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            item.tags.take(2).join(' · '),
                            style: SocelleText.bodyMedium.copyWith(fontSize: 11),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ] else
                        const Spacer(),
                      const Icon(
                        Icons.open_in_new_rounded,
                        size: 14,
                        color: SocelleColors.neutralBeige,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
