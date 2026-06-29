import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'core/api/api_client.dart';
import 'core/router/app_routes.dart';
import 'core/storage/auth_storage.dart';
import 'core/theme/app_theme.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/booking/booking_screen.dart';
import 'screens/doctor/doctor_profile_screen.dart';
import 'screens/main_shell.dart';
import 'screens/medical/lab_results_screen.dart';
import 'screens/medical/medical_records_screen.dart';
import 'screens/medical/prescriptions_screen.dart';
import 'screens/splash_screen.dart';
import 'services/auth_service.dart';

class TabeebiApp extends StatelessWidget {
  const TabeebiApp({
    super.key,
    required this.authStorage,
    required this.apiClient,
    required this.authService,
  });

  final AuthStorage authStorage;
  final ApiClient apiClient;
  final AuthService authService;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AuthStorage>.value(value: authStorage),
        Provider<ApiClient>.value(value: apiClient),
        ChangeNotifierProvider<AuthService>.value(value: authService),
      ],
      child: MaterialApp(
        title: 'طبيبي',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme(),
        locale: const Locale('ar'),
        supportedLocales: const [Locale('ar'), Locale('en')],
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        builder: (context, child) {
          return Directionality(
            textDirection: TextDirection.rtl,
            child: child ?? const SizedBox.shrink(),
          );
        },
        onGenerateRoute: _onGenerateRoute,
        initialRoute: AppRoutes.splash,
      ),
    );
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    final name = settings.name ?? AppRoutes.splash;

    if (name == AppRoutes.splash) {
      return MaterialPageRoute(builder: (_) => const SplashScreen());
    }
    if (name == AppRoutes.login) {
      return MaterialPageRoute(builder: (_) => const LoginScreen());
    }
    if (name == AppRoutes.register) {
      return MaterialPageRoute(builder: (_) => const RegisterScreen());
    }
    if (name == AppRoutes.main) {
      return MaterialPageRoute(builder: (_) => const MainShell());
    }
    if (name == AppRoutes.medicalRecords) {
      return MaterialPageRoute(builder: (_) => const MedicalRecordsScreen());
    }
    if (name == AppRoutes.prescriptions) {
      return MaterialPageRoute(builder: (_) => const PrescriptionsScreen());
    }
    if (name == AppRoutes.labResults) {
      return MaterialPageRoute(builder: (_) => const LabResultsScreen());
    }

    if (name.startsWith('${AppRoutes.doctorProfile}/')) {
      final id = int.tryParse(name.split('/').last);
      if (id != null) {
        return MaterialPageRoute(builder: (_) => DoctorProfileScreen(doctorId: id));
      }
    }
    if (name.startsWith('${AppRoutes.bookAppointment}/')) {
      final id = int.tryParse(name.split('/').last);
      if (id != null) {
        return MaterialPageRoute(builder: (_) => BookingScreen(doctorId: id));
      }
    }

    return MaterialPageRoute(builder: (_) => const SplashScreen());
  }
}
