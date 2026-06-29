class AppNotification {
  const AppNotification({
    required this.id,
    required this.type,
    required this.titleAr,
    this.titleEn,
    this.bodyAr,
    this.bodyEn,
    this.read = false,
    this.createdAt,
    this.referenceType,
    this.referenceId,
  });

  final int id;
  final String type;
  final String titleAr;
  final String? titleEn;
  final String? bodyAr;
  final String? bodyEn;
  final bool read;
  final String? createdAt;
  final String? referenceType;
  final int? referenceId;

  String get title => titleAr.isNotEmpty ? titleAr : (titleEn ?? '');
  String get body => bodyAr ?? bodyEn ?? '';

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as int,
      type: (json['type'] ?? '') as String,
      titleAr: (json['titleAr'] ?? json['title_ar'] ?? '') as String,
      titleEn: json['titleEn'] as String? ?? json['title_en'] as String?,
      bodyAr: json['bodyAr'] as String? ?? json['body_ar'] as String?,
      bodyEn: json['bodyEn'] as String? ?? json['body_en'] as String?,
      read: (json['read'] ?? json['readFlag'] ?? json['read_flag'] ?? false) as bool,
      createdAt: json['createdAt'] as String? ?? json['created_at'] as String?,
      referenceType: json['referenceType'] as String? ?? json['reference_type'] as String?,
      referenceId: json['referenceId'] as int? ?? json['reference_id'] as int?,
    );
  }
}
