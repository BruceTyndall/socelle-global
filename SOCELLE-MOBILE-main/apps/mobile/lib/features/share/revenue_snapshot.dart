import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/theme/slotforce_colors.dart';

class RevenueSnapshot extends StatefulWidget {
  const RevenueSnapshot({
    super.key,
    required this.monthlyLeakage,
    required this.recoveredRevenue,
    required this.unfilledSlots,
  });

  final double monthlyLeakage;
  final double recoveredRevenue;
  final int unfilledSlots;

  static Future<void> shareSnapshot(
    BuildContext context, {
    required double monthlyLeakage,
    required double recoveredRevenue,
    required int unfilledSlots,
  }) async {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    // Share as text for now (image rendering can be added later with RepaintBoundary)
    final text = "I just found out I'm leaving "
        "${currency.format(monthlyLeakage)} on my calendar every month.\n\n"
        "SLOTFORCE showed me exactly where my gaps are and helped me recover "
        "${currency.format(recoveredRevenue)}.\n\n"
        "If you do appointments, you need this.";

    await Share.share(text);
  }

  @override
  State<RevenueSnapshot> createState() => _RevenueSnapshotState();
}

class _RevenueSnapshotState extends State<RevenueSnapshot> {
  final _repaintKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return RepaintBoundary(
      key: _repaintKey,
      child: Container(
        width: 340,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: SlotforceColors.glamHeroGradientColors,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'SLOTFORCE',
              style: TextStyle(
                color: SlotforceColors.accentGold,
                fontSize: 14,
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              height: 1,
              color: Colors.white12,
            ),
            const SizedBox(height: 8),
            const Text(
              'MY REVENUE SNAPSHOT',
              style: TextStyle(
                color: Colors.white38,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              height: 1,
              color: Colors.white12,
            ),
            const SizedBox(height: 28),

            // Leakage
            Text(
              currency.format(widget.monthlyLeakage),
              style: const TextStyle(
                color: SlotforceColors.leakageRed,
                fontSize: 40,
                fontWeight: FontWeight.w900,
              ),
            ),
            const Text(
              'leaked from my calendar this month',
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),

            const SizedBox(height: 24),

            // Recovered
            Text(
              currency.format(widget.recoveredRevenue),
              style: const TextStyle(
                color: SlotforceColors.recoveredGreen,
                fontSize: 32,
                fontWeight: FontWeight.w800,
              ),
            ),
            const Text(
              'recovered by filling gaps',
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),

            const SizedBox(height: 24),

            // Unfilled slots
            Text(
              '${widget.unfilledSlots} slots',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Text(
              'went unfilled this month',
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),

            const SizedBox(height: 28),
            Container(
              width: double.infinity,
              height: 1,
              color: Colors.white12,
            ),
            const SizedBox(height: 16),

            const Text(
              '"I didn\'t realize how much money\nwas hiding in my calendar."',
              style: TextStyle(
                color: Colors.white38,
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
