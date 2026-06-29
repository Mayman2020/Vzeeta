class User {
  const User({
    required this.id,
    required this.email,
    required this.fullNameAr,
    this.fullNameEn,
    this.phone,
    this.role = 'PATIENT',
    this.profileImage,
    this.patientId,
  });

  final int id;
  final String email;
  final String fullNameAr;
  final String? fullNameEn;
  final String? phone;
  final String role;
  final String? profileImage;
  final int? patientId;

  String get displayName => fullNameAr.isNotEmpty ? fullNameAr : (fullNameEn ?? email);

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      email: json['email'] as String,
      fullNameAr: (json['fullNameAr'] ?? json['full_name_ar'] ?? '') as String,
      fullNameEn: json['fullNameEn'] as String? ?? json['full_name_en'] as String?,
      phone: json['phone'] as String?,
      role: (json['role'] ?? 'PATIENT') as String,
      profileImage: json['profileImage'] as String? ?? json['profile_image'] as String?,
      patientId: json['patientId'] as int? ?? json['patient_id'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'fullNameAr': fullNameAr,
        'fullNameEn': fullNameEn,
        'phone': phone,
        'role': role,
        'profileImage': profileImage,
        'patientId': patientId,
      };
}

class AuthResponse {
  const AuthResponse({
    required this.token,
    required this.user,
    this.refreshToken,
  });

  final String token;
  final String? refreshToken;
  final User user;

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    final userJson = json['user'] as Map<String, dynamic>? ?? json;
    return AuthResponse(
      token: (json['token'] ?? json['accessToken'] ?? json['access_token']) as String,
      refreshToken: json['refreshToken'] as String? ?? json['refresh_token'] as String?,
      user: User.fromJson(userJson),
    );
  }
}
