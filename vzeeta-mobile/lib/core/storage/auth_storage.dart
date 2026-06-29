import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../models/user.dart';
import '../constants/app_constants.dart';

class AuthStorage {
  AuthStorage(this._prefs);

  final SharedPreferences _prefs;

  String? get token => _prefs.getString(AppConstants.tokenKey);
  String? get refreshToken => _prefs.getString(AppConstants.refreshTokenKey);
  String get apiBaseUrl =>
      _prefs.getString(AppConstants.apiBaseUrlKey) ?? AppConstants.defaultApiBaseUrl;

  Future<void> saveTokens({required String token, String? refreshToken}) async {
    await _prefs.setString(AppConstants.tokenKey, token);
    if (refreshToken != null) {
      await _prefs.setString(AppConstants.refreshTokenKey, refreshToken);
    }
  }

  Future<void> saveUser(User user) async {
    await _prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }

  User? getUser() {
    final raw = _prefs.getString(AppConstants.userKey);
    if (raw == null) return null;
    return User.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<void> setApiBaseUrl(String url) async {
    await _prefs.setString(AppConstants.apiBaseUrlKey, url);
  }

  Future<void> clear() async {
    await _prefs.remove(AppConstants.tokenKey);
    await _prefs.remove(AppConstants.refreshTokenKey);
    await _prefs.remove(AppConstants.userKey);
  }

  bool get isLoggedIn => token != null && token!.isNotEmpty;
}
