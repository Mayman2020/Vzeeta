class Specialty {
  const Specialty({
    required this.id,
    required this.code,
    required this.nameAr,
    this.nameEn,
    this.icon,
  });

  final int id;
  final String code;
  final String nameAr;
  final String? nameEn;
  final String? icon;

  String get displayName => nameAr.isNotEmpty ? nameAr : (nameEn ?? code);

  factory Specialty.fromJson(Map<String, dynamic> json) {
    return Specialty(
      id: json['id'] as int,
      code: json['code'] as String,
      nameAr: (json['nameAr'] ?? json['name_ar'] ?? '') as String,
      nameEn: json['nameEn'] as String? ?? json['name_en'] as String?,
      icon: json['icon'] as String?,
    );
  }
}
