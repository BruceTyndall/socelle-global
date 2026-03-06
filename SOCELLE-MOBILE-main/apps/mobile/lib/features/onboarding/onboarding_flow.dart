import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/constants.dart';
import '../../core/theme/socelle_colors.dart';
import '../../core/widgets/sf_widgets.dart';
import '../../models/user_settings.dart';
import '../../providers/google_connection_provider.dart';
import '../../providers/user_settings_provider.dart';
import '../shell/app_shell.dart';

class OnboardingFlow extends ConsumerStatefulWidget {
  const OnboardingFlow({super.key});

  @override
  ConsumerState<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends ConsumerState<OnboardingFlow> {
  late PageController _pageController;
  int _currentPage = 0;
  bool _isManualMode = false;
  bool _isProcessing = false;

  // Manual mode fields
  double _avgBookingValue = SocelleConstants.defaultAvgBookingValue;
  int _slotDurationMinutes = SocelleConstants.defaultSlotDurationMinutes;
  late Map<String, WorkingDay> _workingHours;
  TimeOfDay _workStartTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _workEndTime = const TimeOfDay(hour: 17, minute: 0);

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _initWorkingHours();
  }

  void _initWorkingHours() {
    _workingHours = {
      for (final entry in SocelleConstants.defaultWorkingHours.entries)
        entry.key: WorkingDay(
          enabled: entry.value['enabled'] as bool,
          start: entry.value['start'] as String?,
          end: entry.value['end'] as String?,
        ),
    };
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToScreen(int pageIndex) {
    _pageController.animateToPage(
      pageIndex,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
    );
    setState(() => _currentPage = pageIndex);
  }

  Future<void> _handleGoogleConnect() async {
    setState(() => _isProcessing = true);
    try {
      await ref.read(googleConnectionProvider.notifier).connect();
      // If connection succeeded, move to screen 3
      if (mounted) {
        _goToScreen(2);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<void> _completeOnboarding() async {
    setState(() => _isProcessing = true);
    try {
      // Build the final settings
      final settings = UserSettings(
        providerType: SocelleConstants.defaultProviderType,
        growthGoal: SocelleConstants.defaultGrowthGoal,
        avgBookingValue: _avgBookingValue,
        slotDurationMinutes: _slotDurationMinutes,
        workingHours: _workingHours,
        calendarSource: _isManualMode ? '' : 'google',
      );

      // Save settings
      final storage = ref.read(settingsStorageProvider);
      await storage.saveSettings(settings);
      await storage.setOnboardingComplete();

      // Invalidate providers
      ref.invalidate(userSettingsProvider);
      ref.invalidate(onboardingCompleteProvider);

      if (!mounted) return;

      // Navigate to app shell
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AppShell()),
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  double _calculateEstimatedLeakage() {
    // Calculate total working hours per week
    int totalWorkingMinutesPerWeek = 0;
    for (final day in _workingHours.values) {
      if (day.enabled) {
        totalWorkingMinutesPerWeek += day.totalMinutes;
      }
    }

    final totalWorkingHoursPerWeek = totalWorkingMinutesPerWeek / 60.0;

    // Formula: avgBookingValue * (totalWorkingHoursPerWeek / slotDurationMinutes) * 0.15 * 4.3
    // 15% gap rate, 4.3 weeks/month
    final estimatedMonthly = _avgBookingValue *
        (totalWorkingHoursPerWeek / _slotDurationMinutes) *
        0.15 *
        4.3;

    return estimatedMonthly;
  }

  void _toggleWorkingDay(String day) {
    setState(() {
      final current = _workingHours[day]!;
      _workingHours[day] = current.copyWith(enabled: !current.enabled);
    });
  }

  Future<void> _selectStartTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _workStartTime,
    );
    if (picked != null) {
      setState(() {
        _workStartTime = picked;
        // Update all enabled days with this start time
        for (final day in _workingHours.keys) {
          if (_workingHours[day]!.enabled) {
            _workingHours[day] = _workingHours[day]!.copyWith(
              start: '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}',
            );
          }
        }
      });
    }
  }

  Future<void> _selectEndTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _workEndTime,
    );
    if (picked != null) {
      setState(() {
        _workEndTime = picked;
        // Update all enabled days with this end time
        for (final day in _workingHours.keys) {
          if (_workingHours[day]!.enabled) {
            _workingHours[day] = _workingHours[day]!.copyWith(
              end: '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}',
            );
          }
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentPage > 0 && !_isProcessing)
                    GestureDetector(
                      onTap: () => _goToScreen(_currentPage - 1),
                      child: const Icon(Icons.arrow_back_rounded),
                    )
                  else
                    const SizedBox(width: 24),
                  Text(
                    'Socelle',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(width: 24),
                ],
              ),
            ),
            // Pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  // Screen 1: Hook
                  _Screen1Hook(
                    onConnectGoogle: _handleGoogleConnect,
                    onManualMode: () {
                      setState(() => _isManualMode = true);
                      _goToScreen(1);
                    },
                    isProcessing: _isProcessing,
                  ),
                  // Screen 2: Input
                  _Screen2Input(
                    isManualMode: _isManualMode,
                    isGoogleConnected: ref.watch(googleConnectionProvider).valueOrNull ?? false,
                    avgBookingValue: _avgBookingValue,
                    slotDurationMinutes: _slotDurationMinutes,
                    workingHours: _workingHours,
                    workStartTime: _workStartTime,
                    workEndTime: _workEndTime,
                    onAvgBookingValueChanged: (v) => setState(() => _avgBookingValue = v),
                    onSlotDurationChanged: (v) => setState(() => _slotDurationMinutes = v),
                    onToggleWorkingDay: _toggleWorkingDay,
                    onSelectStartTime: _selectStartTime,
                    onSelectEndTime: _selectEndTime,
                    onContinue: () => _goToScreen(2),
                    isProcessing: _isProcessing,
                  ),
                  // Screen 3: Revenue Reveal
                  _Screen3RevenueReveal(
                    estimatedLeakage: _calculateEstimatedLeakage(),
                    onStart: _completeOnboarding,
                    isProcessing: _isProcessing,
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

// ─────────────────────────────────────────────────────────────
// Screen 1: Hook
// ─────────────────────────────────────────────────────────────

class _Screen1Hook extends StatelessWidget {
  const _Screen1Hook({
    required this.onConnectGoogle,
    required this.onManualMode,
    required this.isProcessing,
  });

  final VoidCallback onConnectGoogle;
  final VoidCallback onManualMode;
  final bool isProcessing;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),
          // Headline
          Text(
            'See what your calendar is hiding',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: SocelleColors.ink,
                ),
          ),
          const SizedBox(height: 16),
          // Subtext
          Text(
            'Socelle analyzes your schedule to find unrealized revenue from open gaps.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: SocelleColors.inkMuted,
                  height: 1.5,
                ),
          ),
          const SizedBox(height: 48),
          // Primary CTA: Connect Google Calendar
          SfButton.primary(
            label: 'Connect Google Calendar',
            onPressed: isProcessing ? null : onConnectGoogle,
            loading: isProcessing,
            icon: Icons.calendar_month_rounded,
          ),
          const SizedBox(height: 12),
          // Secondary text button: Manual mode
          SfButton.ghost(
            label: "I'll estimate manually",
            onPressed: isProcessing ? null : onManualMode,
            height: 44,
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Screen 2: Input (Manual or Google Success)
// ─────────────────────────────────────────────────────────────

class _Screen2Input extends StatelessWidget {
  const _Screen2Input({
    required this.isManualMode,
    required this.isGoogleConnected,
    required this.avgBookingValue,
    required this.slotDurationMinutes,
    required this.workingHours,
    required this.workStartTime,
    required this.workEndTime,
    required this.onAvgBookingValueChanged,
    required this.onSlotDurationChanged,
    required this.onToggleWorkingDay,
    required this.onSelectStartTime,
    required this.onSelectEndTime,
    required this.onContinue,
    required this.isProcessing,
  });

  final bool isManualMode;
  final bool isGoogleConnected;
  final double avgBookingValue;
  final int slotDurationMinutes;
  final Map<String, WorkingDay> workingHours;
  final TimeOfDay workStartTime;
  final TimeOfDay workEndTime;
  final ValueChanged<double> onAvgBookingValueChanged;
  final ValueChanged<int> onSlotDurationChanged;
  final ValueChanged<String> onToggleWorkingDay;
  final VoidCallback onSelectStartTime;
  final VoidCallback onSelectEndTime;
  final VoidCallback onContinue;
  final bool isProcessing;

  @override
  Widget build(BuildContext context) {
    // If Google connected, show success state
    if (!isManualMode && isGoogleConnected) {
      return _GoogleSuccessState(onContinue: onContinue);
    }

    // Manual mode form
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tell us about your business',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: SocelleColors.ink,
                ),
          ),
          const SizedBox(height: 24),
          // Average booking value
          _DollarInput(
            label: 'Average booking value',
            value: avgBookingValue,
            onChanged: onAvgBookingValueChanged,
          ),
          const SizedBox(height: 20),
          // Slot duration picker
          _DurationPicker(
            label: 'Typical appointment length',
            selectedMinutes: slotDurationMinutes,
            onChanged: onSlotDurationChanged,
          ),
          const SizedBox(height: 20),
          // Working days
          Text(
            'Working days',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: SocelleColors.inkMuted,
                ),
          ),
          const SizedBox(height: 12),
          _WorkingDayToggles(
            workingHours: workingHours,
            onToggle: onToggleWorkingDay,
          ),
          const SizedBox(height: 20),
          // Working hours
          Text(
            'Working hours',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: SocelleColors.inkMuted,
                ),
          ),
          const SizedBox(height: 12),
          _WorkingHoursSelector(
            startTime: workStartTime,
            endTime: workEndTime,
            onSelectStart: onSelectStartTime,
            onSelectEnd: onSelectEndTime,
          ),
          const SizedBox(height: 32),
          // Continue button
          SfButton.primary(
            label: 'Continue',
            onPressed: isProcessing ? null : onContinue,
            icon: Icons.arrow_forward_rounded,
          ),
        ],
      ),
    );
  }
}

class _GoogleSuccessState extends StatelessWidget {
  const _GoogleSuccessState({required this.onContinue});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: SocelleColors.accentSurface,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_rounded,
                size: 44,
                color: SocelleColors.accent,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Google Calendar connected!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: SocelleColors.ink,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              'We\'ll analyze your schedule to find revenue opportunities.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: SocelleColors.inkMuted,
                  ),
            ),
            const SizedBox(height: 48),
            SfButton.primary(
              label: 'Continue',
              onPressed: onContinue,
              icon: Icons.arrow_forward_rounded,
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Screen 3: Revenue Reveal
// ─────────────────────────────────────────────────────────────

class _Screen3RevenueReveal extends StatefulWidget {
  const _Screen3RevenueReveal({
    required this.estimatedLeakage,
    required this.onStart,
    required this.isProcessing,
  });

  final double estimatedLeakage;
  final VoidCallback onStart;
  final bool isProcessing;

  @override
  State<_Screen3RevenueReveal> createState() => _Screen3RevenueRevealState();
}

class _Screen3RevenueRevealState extends State<_Screen3RevenueReveal>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _valueAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _valueAnimation = Tween<double>(
      begin: 0,
      end: widget.estimatedLeakage,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 60),
          // Animated counter
          AnimatedBuilder(
            animation: _valueAnimation,
            builder: (context, child) {
              return Column(
                children: [
                  Text(
                    fmt.format(_valueAnimation.value),
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: SocelleColors.leakage,
                          letterSpacing: -1.5,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'in unrealized revenue hiding in your calendar',
                    textAlign: TextAlign.center,
                    style:
                        Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: SocelleColors.inkMuted,
                              height: 1.4,
                            ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 60),
          // Primary CTA
          SfButton.primary(
            label: 'Start recovering',
            onPressed: widget.isProcessing ? null : widget.onStart,
            loading: widget.isProcessing,
            icon: Icons.arrow_forward_rounded,
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Input Components
// ─────────────────────────────────────────────────────────────

class _DollarInput extends StatefulWidget {
  const _DollarInput({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  State<_DollarInput> createState() => _DollarInputState();
}

class _DollarInputState extends State<_DollarInput> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value.toStringAsFixed(0));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: SocelleColors.inkMuted,
              ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _controller,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            prefix: const Text('\$ '),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          onChanged: (value) {
            final parsed = double.tryParse(value) ?? widget.value;
            widget.onChanged(parsed);
          },
        ),
      ],
    );
  }
}

class _DurationPicker extends StatelessWidget {
  const _DurationPicker({
    required this.label,
    required this.selectedMinutes,
    required this.onChanged,
  });

  final String label;
  final int selectedMinutes;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: SocelleColors.inkMuted,
              ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          children: SocelleConstants.slotDurationOptions.map((minutes) {
            return FilterChip(
              label: Text('$minutes min'),
              selected: selectedMinutes == minutes,
              onSelected: (_) => onChanged(minutes),
              backgroundColor: SocelleColors.background,
              selectedColor: SocelleColors.accentSurface,
              labelStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: selectedMinutes == minutes
                        ? SocelleColors.accent
                        : SocelleColors.inkMuted,
                    fontWeight: FontWeight.w600,
                  ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: selectedMinutes == minutes
                      ? SocelleColors.accent
                      : SocelleColors.borderLight,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _WorkingDayToggles extends StatelessWidget {
  const _WorkingDayToggles({
    required this.workingHours,
    required this.onToggle,
  });

  final Map<String, WorkingDay> workingHours;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: workingHours.entries.map((entry) {
        final day = entry.key;
        final isEnabled = entry.value.enabled;
        final dayLabel = SocelleConstants.dayAbbreviations[day] ?? day;

        return FilterChip(
          label: Text(dayLabel),
          selected: isEnabled,
          onSelected: (_) => onToggle(day),
          backgroundColor: SocelleColors.background,
          selectedColor: SocelleColors.accentSurface,
          labelStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: isEnabled ? SocelleColors.accent : SocelleColors.inkMuted,
                fontWeight: FontWeight.w600,
              ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(
              color: isEnabled ? SocelleColors.accent : SocelleColors.borderLight,
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _WorkingHoursSelector extends StatelessWidget {
  const _WorkingHoursSelector({
    required this.startTime,
    required this.endTime,
    required this.onSelectStart,
    required this.onSelectEnd,
  });

  final TimeOfDay startTime;
  final TimeOfDay endTime;
  final VoidCallback onSelectStart;
  final VoidCallback onSelectEnd;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: onSelectStart,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border.all(color: SocelleColors.borderLight),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Start',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SocelleColors.inkMuted,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    startTime.format(context),
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: onSelectEnd,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border.all(color: SocelleColors.borderLight),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'End',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SocelleColors.inkMuted,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    endTime.format(context),
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
