import 'package:flutter/foundation.dart';

import '../core/api/api_client.dart';
import '../core/storage/auth_storage.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  AuthService(this._api, this._storage);

  final ApiClient _api;
  final AuthStorage _storage;

  User? _user;
  bool _loading = false;
  String? _error;

  User? get user => _user;
  bool get isLoggedIn => _storage.isLoggedIn;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> init() async {
    _user = _storage.getUser();
    if (_storage.isLoggedIn) {
      try {
        await refreshProfile();
      } catch (_) {
        // Keep cached user if offline
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    try {
      final data = await _api.post(
        '/auth/login',
        body: {'email': email, 'password': password},
        auth: false,
      );
      final response = AuthResponse.fromJson(
        _api.parseObject(data) ?? data as Map<String, dynamic>,
      );
      await _storage.saveTokens(
        token: response.token,
        refreshToken: response.refreshToken,
      );
      await _storage.saveUser(response.user);
      _user = response.user;
      _error = null;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullNameAr,
    String? fullNameEn,
    String? phone,
  }) async {
    _setLoading(true);
    try {
      final data = await _api.post(
        '/auth/register',
        body: {
          'email': email,
          'password': password,
          'fullNameAr': fullNameAr,
          if (fullNameEn != null && fullNameEn.isNotEmpty) 'fullNameEn': fullNameEn,
          if (phone != null && phone.isNotEmpty) 'phone': phone,
          'role': 'PATIENT',
        },
        auth: false,
      );
      final response = AuthResponse.fromJson(
        _api.parseObject(data) ?? data as Map<String, dynamic>,
      );
      await _storage.saveTokens(
        token: response.token,
        refreshToken: response.refreshToken,
      );
      await _storage.saveUser(response.user);
      _user = response.user;
      _error = null;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshProfile() async {
    final data = await _api.get('/auth/me');
    final userJson = _api.parseObject(data) ?? data as Map<String, dynamic>;
    _user = User.fromJson(userJson);
    await _storage.saveUser(_user!);
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {}
    await _storage.clear();
    _user = null;
    notifyListeners();
  }

  Future<void> setApiBaseUrl(String url) async {
    await _storage.setApiBaseUrl(url);
    notifyListeners();
  }

  String get apiBaseUrl => _storage.apiBaseUrl;

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }
}
