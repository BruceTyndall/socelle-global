import 'package:flutter/material.dart';

/// Socelle notification badge.
///
/// A small red pill with white number, positioned over a parent widget.
/// Use [SfBadge.wrap] to overlay a badge on any widget.
///
/// Example:
/// ```dart
/// SfBadge.wrap(
///   count: 3,
///   child: Icon(Icons.chat_bubble_rounded),
/// )
/// ```
class SfBadge extends StatelessWidget {
  const SfBadge({required this.count, super.key});

  final int count;

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();

    final label = count > 99 ? '99+' : count.toString();

    return Container(
      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: const BoxDecoration(
        color: Color(0xFFC62828), // errorRed
        borderRadius: BorderRadius.all(Radius.circular(9)),
      ),
      child: Center(
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.w600,
            height: 1.0,
          ),
        ),
      ),
    );
  }

  /// Wrap [child] with a badge overlaid at top-right.
  static Widget wrap({
    required int count,
    required Widget child,
    Offset offset = const Offset(-6, -4),
  }) {
    if (count <= 0) return child;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: offset.dy,
          right: offset.dx,
          child: SfBadge(count: count),
        ),
      ],
    );
  }
}
