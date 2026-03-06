/// Industry event from the [socelle.events] Supabase table.
///
/// Schema: socelle.events
/// Source: EVENTS_MIGRATION.sql (March 2026)
class SocelleEvent {
  const SocelleEvent({
    required this.id,
    required this.name,
    required this.slug,
    required this.eventType,
    required this.startDate,
    required this.sourceUrl,
    this.description,
    this.organizerName,
    this.organizerBrandId,
    this.registrationUrl,
    this.registrationPriceMinCents,
    this.registrationPriceMaxCents,
    this.isFree = false,
    this.ceCreditsAvailable = false,
    this.ceCreditsCount,
    this.ceProvider,
    this.endDate,
    this.startTime,
    this.endTime,
    this.timezone,
    this.isVirtual = false,
    this.virtualPlatform,
    this.venueName,
    this.venueAddress,
    this.city,
    this.state,
    this.country = 'US',
    this.lat,
    this.lng,
    this.specialtyTags = const [],
    this.brandSponsors = const [],
    this.heroImageUrl,
    this.isCancelled = false,
    this.isHidden = false,
    this.isFeatured = false,
  });

  final String id;
  final String name;
  final String slug;

  /// 'conference' | 'training' | 'webinar' | 'summit' | 'tradeshow' |
  /// 'brand_education' | 'retreat' | 'networking'
  final String eventType;

  final DateTime startDate;
  final String sourceUrl;
  final String? description;
  final String? organizerName;
  final String? organizerBrandId;
  final String? registrationUrl;
  final int? registrationPriceMinCents;
  final int? registrationPriceMaxCents;
  final bool isFree;
  final bool ceCreditsAvailable;
  final double? ceCreditsCount;
  final String? ceProvider;
  final DateTime? endDate;
  final String? startTime;
  final String? endTime;
  final String? timezone;
  final bool isVirtual;
  final String? virtualPlatform;
  final String? venueName;
  final String? venueAddress;
  final String? city;
  final String? state;
  final String country;
  final double? lat;
  final double? lng;
  final List<String> specialtyTags;
  final List<String> brandSponsors;
  final String? heroImageUrl;
  final bool isCancelled;
  final bool isHidden;
  final bool isFeatured;

  bool get isMultiDay => endDate != null && endDate != startDate;

  /// Display price string, e.g. "Free", "$299–$599", "$299"
  String get priceDisplay {
    if (isFree) return 'Free';
    if (registrationPriceMinCents == null) return 'TBD';
    final minDollars = registrationPriceMinCents! ~/ 100;
    if (registrationPriceMaxCents == null ||
        registrationPriceMaxCents == registrationPriceMinCents) {
      return '\$$minDollars';
    }
    return '\$$minDollars–\$${registrationPriceMaxCents! ~/ 100}';
  }

  factory SocelleEvent.fromJson(Map<String, dynamic> json) {
    return SocelleEvent(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      eventType: json['event_type'] as String? ?? 'conference',
      startDate: json['start_date'] != null
          ? DateTime.tryParse(json['start_date'] as String) ?? DateTime.now()
          : DateTime.now(),
      sourceUrl: json['source_url'] as String? ?? '',
      description: json['description'] as String?,
      organizerName: json['organizer_name'] as String?,
      organizerBrandId: json['organizer_brand_id'] as String?,
      registrationUrl: json['registration_url'] as String?,
      registrationPriceMinCents: json['registration_price_min_cents'] as int?,
      registrationPriceMaxCents: json['registration_price_max_cents'] as int?,
      isFree: json['is_free'] as bool? ?? false,
      ceCreditsAvailable: json['ce_credits_available'] as bool? ?? false,
      ceCreditsCount: (json['ce_credits_count'] as num?)?.toDouble(),
      ceProvider: json['ce_provider'] as String?,
      endDate: json['end_date'] != null
          ? DateTime.tryParse(json['end_date'] as String)
          : null,
      startTime: json['start_time'] as String?,
      endTime: json['end_time'] as String?,
      timezone: json['timezone'] as String?,
      isVirtual: json['is_virtual'] as bool? ?? false,
      virtualPlatform: json['virtual_platform'] as String?,
      venueName: json['venue_name'] as String?,
      venueAddress: json['venue_address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      country: json['country'] as String? ?? 'US',
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
      specialtyTags:
          (json['specialty_tags'] as List<dynamic>?)?.cast<String>() ?? const [],
      brandSponsors:
          (json['brand_sponsors'] as List<dynamic>?)?.cast<String>() ?? const [],
      heroImageUrl: json['hero_image_url'] as String?,
      isCancelled: json['is_cancelled'] as bool? ?? false,
      isHidden: json['is_hidden'] as bool? ?? false,
      isFeatured: json['is_featured'] as bool? ?? false,
    );
  }
}
