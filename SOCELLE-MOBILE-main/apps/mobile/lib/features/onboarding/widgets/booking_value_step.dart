import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/theme/socelle_colors.dart';

class BookingValueStep extends StatefulWidget {
  const BookingValueStep({
    super.key,
    required this.initialValue,
    required this.onChanged,
  });

  final double initialValue;
  final ValueChanged<double> onChanged;

  @override
  State<BookingValueStep> createState() => _BookingValueStepState();
}

class _BookingValueStepState extends State<BookingValueStep> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: widget.initialValue.toStringAsFixed(0),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          Text(
            "What's your average\nbooking worth?",
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 12),
          Text(
            "This helps us calculate how much revenue each empty slot represents.",
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 48),
          Center(
            child: SizedBox(
              width: 200,
              child: TextField(
                controller: _controller,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w800,
                  color: SocelleColors.textPrimary,
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(5),
                ],
                decoration: const InputDecoration(
                  prefixText: '\$ ',
                  prefixStyle: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w800,
                    color: SocelleColors.textMuted,
                  ),
                  border: InputBorder.none,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: SocelleColors.divider,
                      width: 2,
                    ),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: SocelleColors.primary,
                      width: 2,
                    ),
                  ),
                ),
                onChanged: (value) {
                  final parsed = double.tryParse(value);
                  if (parsed != null && parsed > 0) {
                    widget.onChanged(parsed);
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              'per appointment',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SocelleColors.leakageRedLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.lightbulb_outline,
                  color: SocelleColors.leakageRed,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Most service pros leave \$800-1,500 on their calendar every month without realizing it.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SocelleColors.leakageRedDark,
                        ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
