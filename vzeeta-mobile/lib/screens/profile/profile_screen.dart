import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/router/app_routes.dart';
import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppTheme.accentLight,
                    backgroundImage:
                        user?.profileImage != null ? NetworkImage(user!.profileImage!) : null,
                    child: user?.profileImage == null
                        ? const Icon(Icons.person, size: 40, color: AppTheme.primaryBlue)
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.displayName ?? 'مستخدم',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        if (user?.email != null)
                          Text(user!.email, style: const TextStyle(color: AppTheme.textSecondary)),
                        if (user?.phone != null)
                          Text(user!.phone!, style: const TextStyle(color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('السجلات الطبية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          _MenuTile(
            icon: Icons.folder_outlined,
            title: 'السجلات الطبية',
            onTap: () => Navigator.of(context).pushNamed(AppRoutes.medicalRecords),
          ),
          _MenuTile(
            icon: Icons.medication_outlined,
            title: 'الوصفات الطبية',
            onTap: () => Navigator.of(context).pushNamed(AppRoutes.prescriptions),
          ),
          _MenuTile(
            icon: Icons.science_outlined,
            title: 'نتائج التحاليل',
            onTap: () => Navigator.of(context).pushNamed(AppRoutes.labResults),
          ),
          const Divider(height: 32),
          const Text('الإعدادات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          _MenuTile(
            icon: Icons.settings_ethernet,
            title: 'عنوان الخادم (API)',
            subtitle: auth.apiBaseUrl,
            onTap: () => _showApiSettings(context, auth),
          ),
          _MenuTile(
            icon: Icons.logout,
            title: 'تسجيل الخروج',
            color: AppTheme.error,
            onTap: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.login, (_) => false);
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _showApiSettings(BuildContext context, AuthService auth) async {
    final controller = TextEditingController(text: auth.apiBaseUrl);
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('عنوان الخادم'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'http://10.0.2.2:8081/api/v1',
            labelText: 'Base URL',
          ),
          textDirection: TextDirection.ltr,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () async {
              await auth.setApiBaseUrl(controller.text.trim());
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
    controller.dispose();
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.color,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: color ?? AppTheme.primaryBlue),
        title: Text(title, style: TextStyle(color: color)),
        subtitle: subtitle != null ? Text(subtitle!, textDirection: TextDirection.ltr) : null,
        trailing: const Icon(Icons.chevron_left),
        onTap: onTap,
      ),
    );
  }
}
