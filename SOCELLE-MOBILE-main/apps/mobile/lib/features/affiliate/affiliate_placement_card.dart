import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/socelle_design_system.dart';
import '../../data/models/affiliate_product.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Affiliate product placement card.
//
// Used on Feed (inline injection after position 2) and Discover (Brands tab
// sponsored section, Products tab browse). Includes "Sponsored" disclosure
// label for FTC compliance. Tapping any part of the card opens
// [AffiliateProduct.affiliateUrl] in an external browser.
// ─────────────────────────────────────────────────────────────────────────────

class AffiliatePlacementCard extends StatelessWidget {
  const AffiliatePlacementCard({super.key, required this.product});

  final AffiliateProduct product;

  Future<void> _openUrl() async {
    final uri = Uri.tryParse(product.affiliateUrl);
    if (uri == null) return;
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Color _categoryColor(String cat) => switch (cat) {
        'skincare' => SocelleColors.purple400,
        'haircare' => SocelleColors.teal400,
        'business' || 'tools' => SocelleColors.blue400,
        'wellness' => SocelleColors.green400,
        _ => SocelleColors.neutralBeige,
      };

  String _capitalize(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';

  @override
  Widget build(BuildContext context) {
    final radius = SocelleRadius.card(context);
    final catColor = _categoryColor(product.category);

    return ClipRRect(
      borderRadius: radius,
      child: SocelleCard(
        padding: EdgeInsets.zero,
        borderRadius: radius,
        onTap: _openUrl,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Hero image (optional) ──
            if (product.imageUrl != null)
              AspectRatio(
                aspectRatio: 4 / 3,
                child: Image.network(
                  product.imageUrl!,
                  fit: BoxFit.cover,
                  loadingBuilder: (_, child, progress) =>
                      progress == null ? child : Container(color: SocelleColors.bgAlt),
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
                  // Sponsored disclosure + category dot
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Sponsored',
                          style: SocelleText.bodyMedium.copyWith(
                            fontSize: 10,
                            color: SocelleColors.neutralBeige,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          color: catColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _capitalize(product.category),
                        style: SocelleText.bodyMedium.copyWith(
                          fontSize: 11,
                          color: catColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Product name
                  Text(
                    product.name,
                    style: SocelleText.bodyLarge,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  // Brand
                  if (product.brand != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      product.brand!,
                      style: SocelleText.bodyMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  // Description
                  if (product.description != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      product.description!,
                      style: SocelleText.bodyMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  const SizedBox(height: 14),

                  // Price + CTA
                  Row(
                    children: [
                      if (product.priceDisplay.isNotEmpty) ...[
                        Text(
                          product.priceDisplay,
                          style: SocelleText.bodyLarge.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const Spacer(),
                      ] else
                        const Spacer(),
                      // AbsorbPointer prevents double-tap: card onTap handles it.
                      AbsorbPointer(
                        child: SocellePillButton(
                          label: 'Shop Now',
                          onTap: _openUrl,
                          variant: PillVariant.secondary,
                          tone: PillTone.light,
                          size: PillSize.small,
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
