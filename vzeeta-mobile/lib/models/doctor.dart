class Doctor {
  const Doctor({
    required this.id,
    required this.fullNameAr,
    this.fullNameEn,
    this.titleAr,
    this.titleEn,
    this.bioAr,
    this.bioEn,
    this.consultationFee = 0,
    this.onlineFee,
    this.yearsExperience = 0,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.profileImage,
    this.verified = false,
    this.acceptsOnline = true,
    this.acceptsInClinic = true,
    this.clinicNameAr,
    this.specialtyNames = const [],
    this.specialtyIds = const [],
  });

  final int id;
  final String fullNameAr;
  final String? fullNameEn;
  final String? titleAr;
  final String? titleEn;
  final String? bioAr;
  final String? bioEn;
  final double consultationFee;
  final double? onlineFee;
  final int yearsExperience;
  final double ratingAvg;
  final int ratingCount;
  final String? profileImage;
  final bool verified;
  final bool acceptsOnline;
  final bool acceptsInClinic;
  final String? clinicNameAr;
  final List<String> specialtyNames;
  final List<int> specialtyIds;

  String get displayName => fullNameAr.isNotEmpty ? fullNameAr : (fullNameEn ?? '');
  String get displayTitle => titleAr ?? titleEn ?? '';
  String get specialtiesText =>
      specialtyNames.isNotEmpty ? specialtyNames.join(' • ') : '';

  factory Doctor.fromJson(Map<String, dynamic> json) {
    List<String> names = [];
    if (json['specialtyNames'] is List) {
      names = (json['specialtyNames'] as List).map((e) => e.toString()).toList();
    } else if (json['specialties'] is List) {
      names = (json['specialties'] as List)
          .map((e) {
            if (e is Map) {
              return (e['nameAr'] ?? e['name_ar'] ?? e['nameEn'] ?? '').toString();
            }
            return e.toString();
          })
          .where((e) => e.isNotEmpty)
          .toList();
    }

    List<int> specialtyIds = [];
    if (json['specialtyIds'] is List) {
      specialtyIds = (json['specialtyIds'] as List).map((e) => (e as num).toInt()).toList();
    }

    return Doctor(
      id: json['id'] as int,
      fullNameAr: (json['fullNameAr'] ?? json['full_name_ar'] ?? json['nameAr'] ?? '') as String,
      fullNameEn: json['fullNameEn'] as String? ?? json['full_name_en'] as String?,
      titleAr: json['titleAr'] as String? ?? json['title_ar'] as String?,
      titleEn: json['titleEn'] as String? ?? json['title_en'] as String?,
      bioAr: json['bioAr'] as String? ?? json['bio_ar'] as String?,
      bioEn: json['bioEn'] as String? ?? json['bio_en'] as String?,
      consultationFee: _toDouble(json['consultationFee'] ?? json['consultation_fee']),
      onlineFee: json['onlineFee'] != null || json['online_fee'] != null
          ? _toDouble(json['onlineFee'] ?? json['online_fee'])
          : null,
      yearsExperience: (json['yearsExperience'] ?? json['years_experience'] ?? 0) as int,
      ratingAvg: _toDouble(json['ratingAvg'] ?? json['rating_avg']),
      ratingCount: (json['ratingCount'] ?? json['rating_count'] ?? 0) as int,
      profileImage: json['profileImage'] as String? ?? json['profile_image'] as String?,
      verified: (json['verified'] ?? false) as bool,
      acceptsOnline: (json['acceptsOnline'] ?? json['accepts_online'] ?? true) as bool,
      acceptsInClinic: (json['acceptsInClinic'] ?? json['accepts_in_clinic'] ?? true) as bool,
      clinicNameAr: json['clinicNameAr'] as String? ?? json['clinic_name_ar'] as String?,
      specialtyNames: names,
      specialtyIds: specialtyIds,
    );
  }

  static double _toDouble(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString()) ?? 0;
  }
}

class TimeSlot {
  const TimeSlot({
    required this.startTime,
    required this.endTime,
    this.available = true,
  });

  final String startTime;
  final String endTime;
  final bool available;

  factory TimeSlot.fromJson(Map<String, dynamic> json) {
    return TimeSlot(
      startTime: (json['startTime'] ?? json['start_time'] ?? '') as String,
      endTime: (json['endTime'] ?? json['end_time'] ?? '') as String,
      available: (json['available'] ?? true) as bool,
    );
  }
}
