/// Exception hierarchy for Supabase intelligence data layer.
///
/// All repositories in lib/data/repositories/ catch raw Supabase errors
/// and rethrow as one of these typed exceptions, which callers can
/// pattern-match with switch/on.
sealed class SocelleDataException implements Exception {
  const SocelleDataException(this.message, {this.cause});

  final String message;
  final Object? cause;

  @override
  String toString() => '$runtimeType: $message'
      '${cause != null ? ' (cause: $cause)' : ''}';
}

/// Supabase client is not initialized or env vars are missing.
/// Callers should fall back to empty/mock data — this is expected during
/// early development when SOCELLE_SUPABASE_URL is not set.
final class SupabaseNotConfiguredException extends SocelleDataException {
  const SupabaseNotConfiguredException()
      : super(
          'Supabase is not configured. '
          'Set SOCELLE_SUPABASE_URL and SOCELLE_SUPABASE_ANON_KEY via --dart-define.',
        );
}

/// Network or transport error (timeout, DNS failure, etc.).
final class SupabaseNetworkException extends SocelleDataException {
  const SupabaseNetworkException(super.message, {super.cause});
}

/// Supabase returned a non-2xx status (e.g., 403 Forbidden, 422 Validation).
final class SupabaseResponseException extends SocelleDataException {
  const SupabaseResponseException(super.message, {this.statusCode, super.cause});
  final int? statusCode;
}

/// Data deserialization failed — unexpected schema mismatch.
/// Usually means the Supabase schema changed without a matching model update.
final class SupabaseDeserializationException extends SocelleDataException {
  const SupabaseDeserializationException(super.message, {super.cause});
}

/// Requested record was not found (equivalent to 404).
final class SupabaseNotFoundException extends SocelleDataException {
  const SupabaseNotFoundException(super.message);
}
