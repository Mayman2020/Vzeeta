import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/appointment.dart';
import '../../services/appointment_service.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late final AppointmentService _service;
  late final TabController _tabController;
  List<Appointment> _upcoming = [];
  List<Appointment> _past = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _service = AppointmentService(context.read<ApiClient>());
    _tabController = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final all = await _service.getMyAppointments();
      if (!mounted) return;
      setState(() {
        _upcoming = all.where((a) => a.isUpcoming).toList();
        _past = all.where((a) => !a.isUpcoming).toList();
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

  Future<void> _cancel(Appointment appointment) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إلغاء الموعد'),
        content: const Text('هل أنت متأكد من إلغاء هذا الموعد؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('لا')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('نعم')),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      await _service.cancelAppointment(appointment.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إلغاء الموعد')),
      );
      _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('مواعيدي'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'القادمة'),
            Tab(text: 'السابقة'),
          ],
        ),
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildList(_upcoming, upcoming: true),
                    _buildList(_past, upcoming: false),
                  ],
                ),
    );
  }

  Widget _buildList(List<Appointment> items, {required bool upcoming}) {
    if (items.isEmpty) {
      return EmptyState(
        message: upcoming ? 'لا توجد مواعيد قادمة' : 'لا توجد مواعيد سابقة',
        icon: Icons.event_busy,
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: items.length,
        itemBuilder: (context, index) => _AppointmentCard(
          appointment: items[index],
          onCancel: upcoming ? () => _cancel(items[index]) : null,
        ),
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({required this.appointment, this.onCancel});

  final Appointment appointment;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    appointment.doctorNameAr ?? 'طبيب',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                _StatusBadge(status: appointment.status),
              ],
            ),
            if (appointment.doctorTitleAr != null)
              Text(appointment.doctorTitleAr!, style: const TextStyle(color: AppTheme.textSecondary)),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: AppTheme.primaryBlue),
                const SizedBox(width: 6),
                Text(_formatDate(appointment.appointmentDate)),
                const SizedBox(width: 16),
                const Icon(Icons.access_time, size: 16, color: AppTheme.primaryBlue),
                const SizedBox(width: 6),
                Text(appointment.startTime),
              ],
            ),
            if (appointment.clinicNameAr != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.local_hospital, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 6),
                  Text(appointment.clinicNameAr!),
                ],
              ),
            ],
            const SizedBox(height: 8),
            Text(
              '${appointment.feeAmount.toStringAsFixed(0)} ج.م • ${appointment.consultationType == 'ONLINE' ? 'أونلاين' : 'في العيادة'}',
              style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w600),
            ),
            if (onCancel != null) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: onCancel,
                  icon: const Icon(Icons.cancel_outlined, color: AppTheme.error),
                  label: const Text('إلغاء الموعد', style: TextStyle(color: AppTheme.error)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDate(String date) {
    try {
      final parsed = DateTime.parse(date);
      return DateFormat('d MMM yyyy', 'ar').format(parsed);
    } catch (_) {
      return date;
    }
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (status) {
      case 'CONFIRMED':
        color = AppTheme.success;
        label = 'مؤكد';
      case 'CANCELLED':
        color = AppTheme.error;
        label = 'ملغي';
      case 'COMPLETED':
        color = AppTheme.primaryBlue;
        label = 'مكتمل';
      case 'REJECTED':
        color = AppTheme.error;
        label = 'مرفوض';
      default:
        color = AppTheme.warning;
        label = 'قيد الانتظار';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
