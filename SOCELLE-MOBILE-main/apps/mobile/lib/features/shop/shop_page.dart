import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/slotforce_colors.dart';

/// Creator Shop — sell retail, packages, gift cards & digital products
/// Built for beauty pros with a social following.
class ShopPage extends StatefulWidget {
  const ShopPage({super.key});

  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  _ShopCategory _selectedCategory = _ShopCategory.all;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SlotforceColors.surfaceSoft,
      body: CustomScrollView(
        slivers: [
          _ShopAppBar(),
          SliverToBoxAdapter(child: _StorefrontHero()),
          SliverToBoxAdapter(child: _ShopStatsRow()),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
              child: Text(
                'Your Products',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: SlotforceColors.textPrimary,
                    ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: _CategoryChips(
              selected: _selectedCategory,
              onSelect: (c) => setState(() => _selectedCategory = c),
            ),
          ),
          _ProductSliverGrid(category: _selectedCategory),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButton: _AddProductFab(),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// App Bar
// ─────────────────────────────────────────────────────────────────────────────

class _ShopAppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      expandedHeight: 0,
      backgroundColor: SlotforceColors.surfaceSoft,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Row(
        children: [
          Text(
            'Shop',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: SlotforceColors.textPrimary,
                  letterSpacing: -0.5,
                ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: SlotforceColors.accentGoldLight,
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text(
              'CREATOR',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: SlotforceColors.accentGoldDark,
                letterSpacing: 1,
              ),
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.bar_chart_rounded),
          color: SlotforceColors.textSecondary,
          onPressed: () {},
          tooltip: 'Shop analytics',
        ),
        const SizedBox(width: 4),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Storefront Hero — shareable link for 1M followers
// ─────────────────────────────────────────────────────────────────────────────

class _StorefrontHero extends StatefulWidget {
  @override
  State<_StorefrontHero> createState() => _StorefrontHeroState();
}

class _StorefrontHeroState extends State<_StorefrontHero> {
  bool _copied = false;

  void _copyLink() {
    Clipboard.setData(
      const ClipboardData(text: 'slotforce.app/shop/yourusername'),
    );
    HapticFeedback.mediumImpact();
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: SlotforceColors.glamHeroGradientColors,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.glamPlum.withValues(alpha: 0.35),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Decorative orb
            Positioned(
              right: -20,
              top: -20,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: SlotforceColors.accentGold.withValues(alpha: 0.12),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.store_rounded,
                                size: 11, color: Colors.white),
                            SizedBox(width: 5),
                            Text(
                              'Your Storefront',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Your shop is live.\n1M followers. Zero middleman.',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 20,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Every click on your link earns you full margin.\nTurn followers into revenue — tonight.',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2),
                            ),
                          ),
                          child: Text(
                            'slotforce.app/shop/yourusername',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: _copyLink,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: _copied
                                ? SlotforceColors.recoveredGreen
                                : SlotforceColors.accentGold,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            _copied ? 'Copied!' : 'Copy',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {},
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.ios_share_rounded,
                            color: Colors.white,
                            size: 16,
                          ),
                        ),
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

// ─────────────────────────────────────────────────────────────────────────────
// Stats Row
// ─────────────────────────────────────────────────────────────────────────────

class _ShopStatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: _StatTile(
              label: 'This month',
              value: r'$1,240',
              icon: Icons.payments_rounded,
              positive: true,
            ),
          ),
          SizedBox(width: 10),
          Expanded(
            child: _StatTile(
              label: 'Orders',
              value: '18',
              icon: Icons.shopping_bag_rounded,
              positive: true,
            ),
          ),
          SizedBox(width: 10),
          Expanded(
            child: _StatTile(
              label: 'Products',
              value: '6',
              icon: Icons.inventory_2_rounded,
              positive: false,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.positive,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool positive;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: SlotforceColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: SlotforceColors.accentGold),
          const SizedBox(height: 6),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: SlotforceColors.textPrimary,
                ),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Chips (replaces tabs — works natively in SliverList without height constraint)
// ─────────────────────────────────────────────────────────────────────────────

enum _ShopCategory { all, retail, packages, digital }

class _CategoryChips extends StatelessWidget {
  const _CategoryChips({required this.selected, required this.onSelect});
  final _ShopCategory selected;
  final ValueChanged<_ShopCategory> onSelect;

  @override
  Widget build(BuildContext context) {
    const categories = [
      ('All', _ShopCategory.all),
      ('Retail', _ShopCategory.retail),
      ('Packages', _ShopCategory.packages),
      ('Digital', _ShopCategory.digital),
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: Row(
        children: categories.map((c) {
          final isSelected = selected == c.$2;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                onSelect(c.$2);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? SlotforceColors.primary
                      : SlotforceColors.cardBackground,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: isSelected
                        ? SlotforceColors.primary
                        : SlotforceColors.divider,
                  ),
                ),
                child: Text(
                  c.$1,
                  style: TextStyle(
                    color: isSelected
                        ? Colors.white
                        : SlotforceColors.textSecondary,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Sliver Grid — lives directly in the CustomScrollView, no fixed height
// ─────────────────────────────────────────────────────────────────────────────

const _kAllProducts = <_ProductData>[
  _ProductData(
    name: 'Lash Aftercare Kit',
    subtitle: 'Oil-free cleanser + brush set',
    price: r'$28',
    tag: 'Retail',
    tagColor: Color(0xFF7A9A78),
    icon: Icons.spa_rounded,
    gradientColors: [Color(0xFFEAF2E8), Color(0xFFCCE5D5)],
    hotLabel: '🔥 Hot',
    soldCount: '47 sold',
  ),
  _ProductData(
    name: 'Volume Set Package',
    subtitle: '2-hour full set — book online',
    price: r'$195',
    tag: 'Package',
    tagColor: Color(0xFFC5A265),
    icon: Icons.star_rounded,
    gradientColors: [Color(0xFFF5ECD8), Color(0xFFE8D5B5)],
    hotLabel: '⭐ Best Seller',
    soldCount: '82 booked',
  ),
  _ProductData(
    name: 'Lash Care Guide',
    subtitle: 'PDF — instant download',
    price: r'$12',
    tag: 'Digital',
    tagColor: Color(0xFF4A6FA5),
    icon: Icons.picture_as_pdf_rounded,
    gradientColors: [Color(0xFFE8EEF8), Color(0xFFC5D4ED)],
    hotLabel: '✨ New',
    soldCount: '12 downloaded',
  ),
  _ProductData(
    name: 'Retention Serum',
    subtitle: 'Extends wear by 30%',
    price: r'$45',
    tag: 'Retail',
    tagColor: Color(0xFF7A9A78),
    icon: Icons.water_drop_rounded,
    gradientColors: [Color(0xFFEAF2E8), Color(0xFFCCE5D5)],
    soldCount: '29 sold',
  ),
  _ProductData(
    name: 'Mega Volume + Refill Bundle',
    subtitle: 'Fill within 3 weeks — save \$40',
    price: r'$285',
    tag: 'Package',
    tagColor: Color(0xFFC5A265),
    icon: Icons.loyalty_rounded,
    gradientColors: [Color(0xFFF5ECD8), Color(0xFFE8D5B5)],
    hotLabel: '💎 VIP',
    soldCount: '18 booked',
  ),
  _ProductData(
    name: 'Lash Artist Tutorial',
    subtitle: '90-min video masterclass',
    price: r'$89',
    tag: 'Digital',
    tagColor: Color(0xFF4A6FA5),
    icon: Icons.play_circle_rounded,
    gradientColors: [Color(0xFFE8EEF8), Color(0xFFC5D4ED)],
    soldCount: '34 downloaded',
  ),
];

class _ProductSliverGrid extends StatelessWidget {
  const _ProductSliverGrid({required this.category});
  final _ShopCategory category;

  List<_ProductData> get _filtered {
    if (category == _ShopCategory.all) return _kAllProducts;
    final tagMap = {
      _ShopCategory.retail: 'Retail',
      _ShopCategory.packages: 'Package',
      _ShopCategory.digital: 'Digital',
    };
    return _kAllProducts.where((p) => p.tag == tagMap[category]).toList();
  }

  @override
  Widget build(BuildContext context) {
    final items = _filtered;
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 0.78,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, i) => _ProductCard(data: items[i]),
          childCount: items.length,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────────────────────────────────────

class _ProductData {
  const _ProductData({
    required this.name,
    required this.subtitle,
    required this.price,
    required this.tag,
    required this.tagColor,
    required this.icon,
    required this.gradientColors,
    this.hotLabel,
    this.soldCount,
  });

  final String name;
  final String subtitle;
  final String price;
  final String tag;
  final Color tagColor;
  final IconData icon;
  final List<Color> gradientColors;
  /// e.g. '🔥 Hot', '✨ New', '⭐ Best Seller'
  final String? hotLabel;
  final String? soldCount;
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.data});
  final _ProductData data;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: SlotforceColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SlotforceColors.divider),
        boxShadow: [
          BoxShadow(
            color: SlotforceColors.primaryDark.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product image placeholder
          Container(
            height: 118,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: data.gradientColors,
              ),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Icon(
                    data.icon,
                    size: 44,
                    color: data.tagColor.withValues(alpha: 0.65),
                  ),
                ),
                // Category tag
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: data.tagColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: data.tagColor.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      data.tag,
                      style: TextStyle(
                        color: data.tagColor,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
                // Hot label
                if (data.hotLabel != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: SlotforceColors.glamInk.withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        data.hotLabel!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                // Sold count
                if (data.soldCount != null)
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.82),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        data.soldCount!,
                        style: TextStyle(
                          color: data.tagColor,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                // More options
                Positioned(
                  bottom: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: () {},
                    child: Container(
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.75),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.more_horiz_rounded,
                        size: 14,
                        color: SlotforceColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Product info
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 10, 10, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.name,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: SlotforceColors.textPrimary,
                        height: 1.2,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Text(
                  data.subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SlotforceColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      data.price,
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: SlotforceColors.textPrimary,
                          ),
                    ),
                    GestureDetector(
                      onTap: () {},
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: SlotforceColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Edit',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Product FAB
// ─────────────────────────────────────────────────────────────────────────────

class _AddProductFab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        _showAddProductSheet(context);
      },
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: SlotforceColors.glamHeroGradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.glamPlum.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.add_rounded, color: Colors.white, size: 18),
            SizedBox(width: 6),
            Text(
              'Add Product',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddProductSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AddProductSheet(),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Product Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

class _AddProductSheet extends StatelessWidget {
  const _AddProductSheet();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SlotforceColors.surfaceSoft,
        borderRadius: BorderRadius.circular(24),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: SlotforceColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'What are you selling?',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: SlotforceColors.textPrimary,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Choose a product type to get started.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SlotforceColors.textSecondary,
                ),
          ),
          const SizedBox(height: 20),
          const _AddTypeRow(
            icon: Icons.shopping_bag_rounded,
            title: 'Retail Product',
            subtitle: 'Physical product — serums, kits, tools',
            color: SlotforceColors.accentSage,
          ),
          const SizedBox(height: 10),
          const _AddTypeRow(
            icon: Icons.star_rounded,
            title: 'Service Package',
            subtitle: 'Bundled bookings — sets, fills, promos',
            color: SlotforceColors.accentGold,
          ),
          const SizedBox(height: 10),
          const _AddTypeRow(
            icon: Icons.card_giftcard_rounded,
            title: 'Gift Card',
            subtitle: 'Store credit — any amount',
            color: SlotforceColors.accentRose,
          ),
          const SizedBox(height: 10),
          const _AddTypeRow(
            icon: Icons.download_rounded,
            title: 'Digital Product',
            subtitle: 'PDFs, videos, guides — instant download',
            color: SlotforceColors.accentBlue,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _AddTypeRow extends StatelessWidget {
  const _AddTypeRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SlotforceColors.cardBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: SlotforceColors.divider),
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: SlotforceColors.textPrimary,
                        ),
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SlotforceColors.textMuted,
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: SlotforceColors.textMuted,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}
