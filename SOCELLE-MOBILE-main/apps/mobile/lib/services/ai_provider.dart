import 'dart:convert';
import '../models/ai_suggestion.dart';
import '../models/revenue_summary.dart';

/// LLM provider interface for structured recovery suggestions.
///
/// Output is strict JSON — no chatbot UI, no conversational framing.
/// Schema:
///   { "explanation": String, "highestValueWindow": { "dayOfWeek": String, "timeRange": String, "estimatedValue": double }, "recoveryMessage": String }
abstract class AiProvider {
  Future<AiSuggestion> generateSuggestion({
    required MonthlyLeakageSummary summary,
    required double avgBookingValue,
  });
}

/// Stub implementation for MVP. Returns context-aware suggestions based on real gap data.
/// Replace with real API call (Anthropic/OpenAI) when backend is ready.
class StubAiProvider implements AiProvider {
  @override
  Future<AiSuggestion> generateSuggestion({
    required MonthlyLeakageSummary summary,
    required double avgBookingValue,
  }) async {
    final hvw = summary.highestValueWindow;
    if (hvw == null) {
      return AiSuggestion.stub();
    }

    // Generate context-aware explanation based on actual data.
    final explanation = _generateExplanation(
      dayOfWeek: hvw.dayOfWeek,
      startTime: hvw.startTime,
      endTime: hvw.endTime,
      estimatedValue: hvw.estimatedValue,
      avgBookingValue: avgBookingValue,
    );

    // Generate recovery message referencing the actual opportunity.
    final recoveryMessage = _generateRecoveryMessage(
      dayOfWeek: hvw.dayOfWeek,
      startTime: hvw.startTime,
      estimatedValue: hvw.estimatedValue,
    );

    return AiSuggestion(
      explanation: explanation,
      highestValueWindow: AiSuggestionWindow(
        dayOfWeek: hvw.dayOfWeek,
        timeRange: '${hvw.startTime} – ${hvw.endTime}',
        estimatedValue: hvw.estimatedValue,
      ),
      recoveryMessage: recoveryMessage,
    );
  }

  /// Generates varied explanation text based on the highest value window data.
  String _generateExplanation({
    required String dayOfWeek,
    required String startTime,
    required String endTime,
    required double estimatedValue,
    required double avgBookingValue,
  }) {
    // Round values for readability
    final roundedValue = estimatedValue.toStringAsFixed(0);
    final roundedAvg = avgBookingValue.toStringAsFixed(0);

    // Vary explanation based on which part of the day
    final isPM = startTime.contains('PM');
    final isEarlyDay = startTime.contains('8') || startTime.contains('9');
    final isLunchTime = startTime.contains('12') || startTime.contains('1');

    if (isEarlyDay) {
      return 'Your $dayOfWeek mornings between $startTime and $endTime '
          'are your highest-value opportunity window, consistently showing open availability. '
          'At your average session rate of \$$roundedAvg, this represents \$$roundedValue '
          'per week in unrealized revenue.';
    } else if (isLunchTime) {
      return 'Your $dayOfWeek lunch hours between $startTime and $endTime '
          'have the greatest recovery potential. These time slots are regularly empty, '
          'representing \$$roundedValue per week at your \$$roundedAvg average rate.';
    } else if (isPM) {
      return 'Your $dayOfWeek afternoons between $startTime and $endTime '
          'consistently show the highest booking potential, with \$$roundedValue per week '
          'in unrealized revenue at your current \$$roundedAvg average session value.';
    } else {
      return '$dayOfWeek between $startTime and $endTime represents your peak '
          'opportunity window. These open slots are worth \$$roundedValue per week '
          'based on your average rate of \$$roundedAvg per session.';
    }
  }

  /// Generates varied recovery message with actionable copy-friendly text.
  String _generateRecoveryMessage({
    required String dayOfWeek,
    required String startTime,
    required double estimatedValue,
  }) {
    // Vary message based on time of week and day
    final isDayWeekend =
        dayOfWeek.toLowerCase() == 'saturday' ||
        dayOfWeek.toLowerCase() == 'sunday';
    final hasMultipleSlots = estimatedValue > 200;

    if (isDayWeekend) {
      return 'Hi! I have some availability this $dayOfWeek at $startTime. '
          'Would you like to book a session? I can also look for weekday slots if that works better.';
    } else if (hasMultipleSlots) {
      return 'Hi! I have several openings this $dayOfWeek around $startTime that I\'d love to fill. '
          'Do any of those times work for you?';
    } else {
      return 'Hi! I have an opening this $dayOfWeek at $startTime. '
          'Would you like to book a session?';
    }
  }
}

/// Validates AI response JSON against expected schema.
/// Throws FormatException on invalid structure.
AiSuggestion parseAiResponse(String jsonString) {
  final map = jsonDecode(jsonString) as Map<String, dynamic>;

  if (!map.containsKey('explanation') || map['explanation'] is! String) {
    throw const FormatException('Missing or invalid "explanation" field');
  }
  if (!map.containsKey('recoveryMessage') || map['recoveryMessage'] is! String) {
    throw const FormatException('Missing or invalid "recoveryMessage" field');
  }
  if (!map.containsKey('highestValueWindow') || map['highestValueWindow'] is! Map) {
    throw const FormatException('Missing or invalid "highestValueWindow" field');
  }

  final hvw = map['highestValueWindow'] as Map<String, dynamic>;
  if (!hvw.containsKey('dayOfWeek') || !hvw.containsKey('timeRange') || !hvw.containsKey('estimatedValue')) {
    throw const FormatException('Invalid highestValueWindow structure');
  }

  return AiSuggestion(
    explanation: map['explanation'] as String,
    highestValueWindow: AiSuggestionWindow(
      dayOfWeek: hvw['dayOfWeek'] as String,
      timeRange: hvw['timeRange'] as String,
      estimatedValue: (hvw['estimatedValue'] as num).toDouble(),
    ),
    recoveryMessage: map['recoveryMessage'] as String,
  );
}
