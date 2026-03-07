import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Checkout screen — address, payment, order confirmation.
///
/// DEMO surface: Checkout flow is a stub pending Stripe integration.
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Checkout'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: Stepper(
        currentStep: _currentStep,
        type: StepperType.vertical,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep++);
          } else {
            _showOrderConfirmation();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep--);
          }
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: SocelleTheme.spacingMd),
            child: Row(
              children: [
                FilledButton(
                  onPressed: details.onStepContinue,
                  child: Text(_currentStep == 2 ? 'Place Order' : 'Continue'),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: SocelleTheme.spacingMd),
                  TextButton(
                    onPressed: details.onStepCancel,
                    child: const Text('Back'),
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          Step(
            title: Text('Shipping Address', style: SocelleTheme.titleSmall),
            content: Column(
              children: [
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Full Name'),
                ),
                const SizedBox(height: SocelleTheme.spacingMd),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Address Line 1'),
                ),
                const SizedBox(height: SocelleTheme.spacingMd),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        decoration: const InputDecoration(labelText: 'City'),
                      ),
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(
                      child: TextFormField(
                        decoration: const InputDecoration(labelText: 'ZIP'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            isActive: _currentStep >= 0,
          ),
          Step(
            title: Text('Payment Method', style: SocelleTheme.titleSmall),
            content: Container(
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.warmIvory,
                borderRadius: SocelleTheme.borderRadiusMd,
                border: Border.all(color: SocelleTheme.borderLight),
              ),
              child: Row(
                children: [
                  Icon(Icons.credit_card_rounded, color: SocelleTheme.accent),
                  const SizedBox(width: SocelleTheme.spacingMd),
                  Text(
                    'Payment integration pending',
                    style: SocelleTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            isActive: _currentStep >= 1,
          ),
          Step(
            title: Text('Review Order', style: SocelleTheme.titleSmall),
            content: Container(
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.surfaceElevated,
                borderRadius: SocelleTheme.borderRadiusMd,
                border: Border.all(color: SocelleTheme.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order Summary', style: SocelleTheme.titleSmall),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text('Demo order — no items will be charged.',
                      style: SocelleTheme.bodyMedium),
                ],
              ),
            ),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }

  void _showOrderConfirmation() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: SocelleTheme.borderRadiusLg),
        title: Column(
          children: [
            Icon(Icons.check_circle_outline_rounded,
                size: 48, color: SocelleTheme.signalUp),
            const SizedBox(height: SocelleTheme.spacingMd),
            const Text('Order Placed'),
          ],
        ),
        content: Text(
          'This is a demo order confirmation. No payment was processed.',
          style: SocelleTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              context.go('/shop');
            },
            child: const Text('Continue Shopping'),
          ),
        ],
      ),
    );
  }
}
