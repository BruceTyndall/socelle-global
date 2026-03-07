import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../theme/socelle_theme.dart';

/// Provides the current connectivity status.
final connectivityProvider = StreamProvider<List<ConnectivityResult>>((ref) {
  return Connectivity().onConnectivityChanged;
});

/// Whether the device currently has network connectivity.
final isOnlineProvider = Provider<bool>((ref) {
  final connectivity = ref.watch(connectivityProvider).valueOrNull;
  if (connectivity == null) return true; // Assume online until proven otherwise
  return !connectivity.contains(ConnectivityResult.none);
});

/// A banner displayed at the top of the screen when connectivity is lost.
///
/// Slides in/out with animation. Shows "No internet connection" message.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(isOnlineProvider);

    return AnimatedSlide(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      offset: isOnline ? const Offset(0, -1) : Offset.zero,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 300),
        opacity: isOnline ? 0.0 : 1.0,
        child: Material(
          color: SocelleTheme.signalWarn,
          child: SafeArea(
            bottom: false,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: SocelleTheme.spacingMd,
                vertical: SocelleTheme.spacingSm,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.wifi_off_rounded,
                    size: 16,
                    color: SocelleTheme.graphite,
                  ),
                  const SizedBox(width: SocelleTheme.spacingSm),
                  Text(
                    'No internet connection',
                    style: SocelleTheme.labelMedium.copyWith(
                      color: SocelleTheme.graphite,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
