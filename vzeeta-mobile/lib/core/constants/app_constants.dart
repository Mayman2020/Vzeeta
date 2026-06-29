import 'package:flutter/foundation.dart' show kIsWeb;

class AppConstants {
  static const String appName = 'طبيبي';
  static const String appNameEn = 'Tabeebi';
  static const String brandColorHex = '#1A6FD4';

  // On web (Chrome) use localhost; on Android emulator use 10.0.2.2
  static String get defaultApiBaseUrl =>
      kIsWeb ? 'http://localhost:8081/api/v1' : 'http://10.0.2.2:8081/api/v1';

  static const String apiBaseUrlKey = 'api_base_url';
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_json';

  static const Duration requestTimeout = Duration(seconds: 30);
}
