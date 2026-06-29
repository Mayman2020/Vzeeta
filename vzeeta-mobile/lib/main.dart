import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/api/api_client.dart';
import 'core/storage/auth_storage.dart';
import 'services/auth_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final authStorage = AuthStorage(prefs);
  final apiClient = ApiClient(authStorage);
  final authService = AuthService(apiClient, authStorage);

  runApp(
    TabeebiApp(
      authStorage: authStorage,
      apiClient: apiClient,
      authService: authService,
    ),
  );
}
