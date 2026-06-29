import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/app_constants.dart';
import '../storage/auth_storage.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.body});

  final String message;
  final int? statusCode;
  final dynamic body;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient(this._storage);

  final AuthStorage _storage;

  String get baseUrl => _storage.apiBaseUrl;

  Map<String, String> _headers({bool auth = true}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'ar',
    };
    if (auth) {
      final token = _storage.token;
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  Uri _uri(String path, [Map<String, String>? query]) {
    final normalized = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$baseUrl$normalized').replace(queryParameters: query);
  }

  dynamic _decode(http.Response response) {
    if (response.body.isEmpty) return null;
    return jsonDecode(response.body);
  }

  void _throwIfError(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) return;

    String message = 'حدث خطأ (${response.statusCode})';
    try {
      final body = _decode(response);
      if (body is Map && body['message'] != null) {
        message = body['message'].toString();
      } else if (body is Map && body['error'] != null) {
        message = body['error'].toString();
      }
    } catch (_) {}

    throw ApiException(message, statusCode: response.statusCode, body: response.body);
  }

  Future<dynamic> get(
    String path, {
    Map<String, String>? query,
    bool auth = true,
  }) async {
    final response = await http
        .get(_uri(path, query), headers: _headers(auth: auth))
        .timeout(AppConstants.requestTimeout);
    _throwIfError(response);
    return _decode(response);
  }

  Future<dynamic> post(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    final response = await http
        .post(
          _uri(path),
          headers: _headers(auth: auth),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(AppConstants.requestTimeout);
    _throwIfError(response);
    return _decode(response);
  }

  Future<dynamic> put(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    final response = await http
        .put(
          _uri(path),
          headers: _headers(auth: auth),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(AppConstants.requestTimeout);
    _throwIfError(response);
    return _decode(response);
  }

  Future<dynamic> patch(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    final response = await http
        .patch(
          _uri(path),
          headers: _headers(auth: auth),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(AppConstants.requestTimeout);
    _throwIfError(response);
    return _decode(response);
  }

  Future<dynamic> delete(String path, {bool auth = true}) async {
    final response = await http
        .delete(_uri(path), headers: _headers(auth: auth))
        .timeout(AppConstants.requestTimeout);
    _throwIfError(response);
    return _decode(response);
  }

  List<T> parseList<T>(
    dynamic data,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (data is List) {
      return data.map((e) => fromJson(e as Map<String, dynamic>)).toList();
    }
    if (data is Map) {
      if (data['content'] is List) {
        return (data['content'] as List)
            .map((e) => fromJson(e as Map<String, dynamic>))
            .toList();
      }
      final inner = data['data'];
      if (inner is List) {
        return inner.map((e) => fromJson(e as Map<String, dynamic>)).toList();
      }
      if (inner is Map && inner['content'] is List) {
        return (inner['content'] as List)
            .map((e) => fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
    return [];
  }

  Map<String, dynamic>? parseObject(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map && data['data'] is Map) {
      return Map<String, dynamic>.from(data['data'] as Map);
    }
    return null;
  }
}
