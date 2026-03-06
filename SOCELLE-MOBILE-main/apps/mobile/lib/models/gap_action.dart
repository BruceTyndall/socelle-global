enum GapStatus {
  open,
  filled,
  intentional;

  static GapStatus fromString(String? value) {
    switch (value) {
      case 'filled':
        return GapStatus.filled;
      case 'intentional':
        return GapStatus.intentional;
      default:
        return GapStatus.open;
    }
  }
}

enum IntentionalReason {
  lunch('Lunch Break', 'lunch'),
  buffer('Buffer Time', 'buffer'),
  personal('Personal Time', 'personal'),
  other('Other', 'other');

  const IntentionalReason(this.label, this.value);
  final String label;
  final String value;

  static IntentionalReason fromString(String? value) {
    switch (value) {
      case 'lunch':
        return IntentionalReason.lunch;
      case 'buffer':
        return IntentionalReason.buffer;
      case 'personal':
        return IntentionalReason.personal;
      default:
        return IntentionalReason.other;
    }
  }
}
