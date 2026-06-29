import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/notification.dart';
import '../../services/notification_service.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final NotificationService _service;
  List<AppNotification> _notifications = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _service = NotificationService(context.read<ApiClient>());
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await _service.getNotifications();
      if (!mounted) return;
      setState(() {
        _notifications = items;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _markAllRead() async {
    try {
      await _service.markAllAsRead();
      _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _markRead(AppNotification notification) async {
    if (notification.read) return;
    try {
      await _service.markAsRead(notification.id);
      _load();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          if (_notifications.any((n) => !n.read))
            TextButton(
              onPressed: _markAllRead,
              child: const Text('تعليم الكل كمقروء', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _notifications.isEmpty
                  ? const EmptyState(message: 'لا توجد إشعارات', icon: Icons.notifications_none)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final n = _notifications[index];
                          return Dismissible(
                            key: ValueKey(n.id),
                            direction: DismissDirection.startToEnd,
                            onDismissed: (_) => _markRead(n),
                            background: Container(
                              color: AppTheme.primaryBlue,
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              child: const Icon(Icons.done, color: Colors.white),
                            ),
                            child: ListTile(
                              onTap: () => _markRead(n),
                              leading: CircleAvatar(
                                backgroundColor: n.read
                                    ? AppTheme.accentLight
                                    : AppTheme.primaryBlue.withValues(alpha: 0.2),
                                child: Icon(
                                  _iconForType(n.type),
                                  color: AppTheme.primaryBlue,
                                ),
                              ),
                              title: Text(
                                n.title,
                                style: TextStyle(
                                  fontWeight: n.read ? FontWeight.normal : FontWeight.bold,
                                ),
                              ),
                              subtitle: n.body.isNotEmpty ? Text(n.body, maxLines: 2) : null,
                              trailing: n.read
                                  ? null
                                  : Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: AppTheme.primaryBlue,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
      case 'NEW_APPOINTMENT':
        return Icons.event;
      case 'APPOINTMENT_CANCELLED':
        return Icons.event_busy;
      default:
        return Icons.notifications;
    }
  }
}
