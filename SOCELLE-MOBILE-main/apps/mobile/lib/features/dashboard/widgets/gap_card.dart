import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/slotforce_colors.dart';
import '../../../models/sync_models.dart';

// ─────────────────────────────────────────────────────────────
// Urgency tier — updated every 5 minutes as slot approaches
// ─────────────────────────────────────────────────────────────

enum GapUrgencyTier {
  tier1, // > 24h — default
  tier2, // 6–24h — amber border
  tier3, // < 6h — warm tint
}

GapUrgencyTier getUrgencyTier(DateTime gapStart) {
  final h = gapStart.difference(DateTime.now()).inHours;
  if (h > 24) return GapUrgencyTier.tier1;
  if (h > 6) return GapUrgencyTier.tier2;
  return GapUrgencyTier.tier3;
}

String _urgencyCopy(GapUrgencyTier tier, double value, DateTime start) {
  final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
  final v = fmt.format(value);
  switch (tier) {
    case GapUrgencyTier.tier1:
      return 'This slot is worth $v. You have time to fill it.';
    case GapUrgencyTier.tier2:
      return '$v slot is 24 hours out. Worth a message to your waitlist.';
    case GapUrgencyTier.tier3:
      final h = start.difference(DateTime.now()).inHours;
      return '$v expires in ${h}h.';
  }
}

// ─────────────────────────────────────────────────────────────
// GapCard — StatefulWidget with real-time urgency updates
// ─────────────────────────────────────────────────────────────

class GapCard extends StatefulWidget {
  const GapCard({
    super.key,
    required this.gap,
    required this.isBumped,
    required this.onBump,
    required this.onFillSlot,
    required this.onMarkIntentional,
    required this.onTap,
  });

  final GapItem gap;
  final bool isBumped;
  final VoidCallback onBump;
  final VoidCallback onFillSlot;
  final VoidCallback onMarkIntentional;
  final VoidCallback onTap;

  @override
  State<GapCard> createState() => _GapCardState();
}

class _GapCardState extends State<GapCard> {
  GapUrgencyTier _urgencyTier = GapUrgencyTier.tier1;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _refresh();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) _refresh();
    });
  }

  void _refresh() {
    final start = DateTime.tryParse(widget.gap.startIso)?.toLocal();
    if (start == null) return;
    final t = getUrgencyTier(start);
    if (t != _urgencyTier) setState(() => _urgencyTier = t);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTimeRange() {
    try {
      final start = DateTime.parse(widget.gap.startIso).toLocal();
      final end = DateTime.parse(widget.gap.endIso).toLocal();
      return '${DateFormat.EEEE().format(start)}  ${DateFormat.jm().format(start)} - ${DateFormat.jm().format(end)}';
    } catch (_) {
      return '${widget.gap.dayOfWeek} ${widget.gap.startIso}';
    }
  }

  Color? get _borderColor {
    if (!widget.gap.isOpen) return null;
    if (_urgencyTier == GapUrgencyTier.tier2) return Colors.amber.withValues(alpha: 0.5);
    if (_urgencyTier == GapUrgencyTier.tier3) return Colors.deepOrange.withValues(alpha: 0.5);
    return null;
  }

  Color? get _bgColor {
    if (!widget.gap.isOpen) return null;
    if (_urgencyTier == GapUrgencyTier.tier3) return Colors.amber.withValues(alpha: 0.06);
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final gapStart = DateTime.tryParse(widget.gap.startIso)?.toLocal();

    return GestureDetector(
      onTap: widget.onTap,
      child: Card(
        clipBehavior: Clip.antiAlias,
        color: _bgColor,
        shape: _borderColor != null
            ? RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: _borderColor!, width: 1.5),
              )
            : null,
        child: Padding(
          padding: const EdgeInsets.all(17),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (widget.gap.isOpen) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        SlotforceColors.glamPink.withValues(alpha: 0.16),
                        SlotforceColors.glamGold.withValues(alpha: 0.18),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'Hot Slot',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: SlotforceColors.glamPlum,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ),
                const SizedBox(height: 10),
              ],
              Row(
                children: [
                  Expanded(
                    child: Text(
                      _formatTimeRange(),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                  ),
                  if (widget.gap.isFilled)
                    const _StatusChip(
                      label: 'Booked',
                      color: SlotforceColors.recoveredGreen,
                      bgColor: SlotforceColors.recoveredGreenLight,
                    ),
                  if (widget.gap.isIntentional)
                    _StatusChip(
                      label: widget.gap.intentionalReason?.label ?? 'Intentional',
                      color: SlotforceColors.intentionalAmber,
                      bgColor: SlotforceColors.intentionalAmberLight,
                    ),
                  if (widget.isBumped) ...[
                    const SizedBox(width: 6),
                    const _StatusChip(
                      label: 'Bumped',
                      color: SlotforceColors.glamPlum,
                      bgColor: SlotforceColors.glamPink,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.event_available_rounded, size: 16, color: SlotforceColors.textSecondary),
                  const SizedBox(width: 4),
                  Text('${widget.gap.bookableSlots} ${widget.gap.bookableSlots == 1 ? 'slot' : 'slots'}',
                      style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(width: 12),
                  Text('\u00b7', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(width: 12),
                  Text(
                    currencyFormat.format(widget.gap.leakageValue),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: widget.gap.isOpen
                              ? SlotforceColors.leakageRed
                              : SlotforceColors.textSecondary,
                        ),
                  ),
                  const SizedBox(width: 12),
                  Text('\u00b7', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(width: 12),
                  Text('${widget.gap.durationMinutes} min', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),

              // Urgency copy — open gaps only, updates in real-time
              if (widget.gap.isOpen && gapStart != null) ...[
                const SizedBox(height: 6),
                Text(
                  _urgencyCopy(_urgencyTier, widget.gap.leakageValue, gapStart),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _urgencyTier == GapUrgencyTier.tier3
                            ? Colors.deepOrange.shade700
                            : SlotforceColors.textSecondary,
                        fontStyle: FontStyle.italic,
                      ),
                ),
              ],

              if (widget.gap.isOpen) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: widget.onFillSlot,
                        style: FilledButton.styleFrom(
                          backgroundColor: SlotforceColors.glamPlum,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(0, 44),
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.auto_awesome_rounded, size: 16),
                            SizedBox(width: 6),
                            Text('Book This Glow-Up',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: widget.onBump,
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 44),
                        side: BorderSide(
                          color: widget.isBumped
                              ? SlotforceColors.glamPlum.withValues(alpha: 0.35)
                              : SlotforceColors.primary.withValues(alpha: 0.25),
                        ),
                        foregroundColor: widget.isBumped ? SlotforceColors.glamPlum : SlotforceColors.primaryDark,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        backgroundColor: widget.isBumped
                            ? SlotforceColors.glamPink.withValues(alpha: 0.08)
                            : Colors.white.withValues(alpha: 0.7),
                      ),
                      icon: Icon(widget.isBumped ? Icons.bolt_rounded : Icons.bolt_outlined, size: 17),
                      label: Text(widget.isBumped ? 'Unbump' : 'Bump',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: widget.onMarkIntentional,
                      icon: const Icon(Icons.more_horiz_rounded),
                      style: IconButton.styleFrom(
                        backgroundColor: SlotforceColors.glamPink.withValues(alpha: 0.1),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      iconSize: 20,
                      color: SlotforceColors.glamPlum,
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.label,
    required this.color,
    required this.bgColor,
  });

  final String label;
  final Color color;
  final Color bgColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
