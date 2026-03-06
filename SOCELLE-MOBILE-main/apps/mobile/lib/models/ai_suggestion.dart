/// Structured AI recovery suggestion.
///
/// AI is NOT a chatbot. It returns structured JSON with exactly three fields.
/// No chat bubbles. No avatars. No conversational UI.
class AiSuggestion {
  const AiSuggestion({
    required this.explanation,
    required this.highestValueWindow,
    required this.recoveryMessage,
  });

  /// Plain language analysis of why this gap represents lost revenue.
  /// 2-3 sentences maximum.
  final String explanation;

  /// The single time slot with the highest recovery potential.
  final AiSuggestionWindow highestValueWindow;

  /// Ready-to-send text message the provider can copy and send to a client.
  final String recoveryMessage;

  /// Static stub for interface stabilization. No AI call.
  factory AiSuggestion.stub() {
    return const AiSuggestion(
      explanation:
          'Tuesday afternoons between 2 and 4 PM have been consistently '
          'open for 3 of the last 4 weeks. At your average rate, this '
          'represents \$170 per week in unrealized revenue.',
      highestValueWindow: AiSuggestionWindow(
        dayOfWeek: 'Tuesday',
        timeRange: '2:00 – 4:00 PM',
        estimatedValue: 170,
      ),
      recoveryMessage:
          'Hi! I have an opening this Tuesday at 2 PM. '
          'Would you like to book a session? Let me know!',
    );
  }
}

class AiSuggestionWindow {
  const AiSuggestionWindow({
    required this.dayOfWeek,
    required this.timeRange,
    required this.estimatedValue,
  });

  final String dayOfWeek;
  final String timeRange;
  final double estimatedValue;
}
