import '../core/api/api_client.dart';
import '../models/notification.dart';

class NotificationService {
  NotificationService(this._api);

  final ApiClient _api;

  Future<List<AppNotification>> getNotifications() async {
    final data = await _api.get('/patient/notifications');
    return _api.parseList(data, AppNotification.fromJson);
  }

  Future<void> markAsRead(int id) async {
    await _api.patch('/patient/notifications/$id/read');
  }

  Future<void> markAllAsRead() async {
    // Mark individually if bulk endpoint not available
    final items = await getNotifications();
    for (final n in items.where((n) => !n.read)) {
      await markAsRead(n.id);
    }
  }
}
