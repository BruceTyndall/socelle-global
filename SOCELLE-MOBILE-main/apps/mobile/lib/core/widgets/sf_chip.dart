import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/socelle_colors.dart';

/// Socelle filter/category chip.
///
/// Selected: glamPlum background, white text.
/// Unselected: lightGrey background, secondary text.
/// Fires haptic on selection change.
///
/// Example:
/// ```dart
/// SfChip(
///   label: 'All',
///   selected: _selected == 'all',
///   onTap: () => setState(() => _selected = 'all'),
/// )
/// ```
class SfChip extends StatelessWidget {
  const SfChip({
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
    super.key,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: GestureDetector(
        onTap: () {
          if (!selected) HapticFeedback.selectionClick();
          onTap();
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: selected ? SocelleColors.glamPlum : const Color(0xFFF0EDE9),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 14,
                  color: selected ? Colors.white : const Color(0xFF6B6B6B),
                ),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                  color: selected ? Colors.white : const Color(0xFF6B6B6B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A scrollable row of [SfChip]s.
class SfChipRow extends StatelessWidget {
  const SfChipRow({
    required this.chips,
    this.scrollPadding = const EdgeInsets.symmetric(horizontal: 16),
    super.key,
  });

  final List<SfChip> chips;
  final EdgeInsetsGeometry scrollPadding;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: scrollPadding,
      child: Row(
        children: [
          for (int i = 0; i < chips.length; i++) ...[
            chips[i],
            if (i < chips.length - 1) const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}
