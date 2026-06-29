import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/doctor.dart';
import '../../services/doctor_service.dart';
import '../../widgets/loading.dart';
import '../main_shell.dart';

class DoctorProfileScreen extends StatefulWidget {
  const DoctorProfileScreen({super.key, required this.doctorId});

  final int doctorId;

  @override
  State<DoctorProfileScreen> createState() => _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends State<DoctorProfileScreen> {
  late final DoctorService _doctorService;
  Doctor? _doctor;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _doctorService = DoctorService(context.read<ApiClient>());
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final doctor = await _doctorService.getDoctor(widget.doctorId);
      if (!mounted) return;
      setState(() {
        _doctor = doctor;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ملف الطبيب')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _buildContent(_doctor!),
      bottomNavigationBar: _doctor == null
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton.icon(
                  onPressed: () => openBooking(context, _doctor!.id),
                  icon: const Icon(Icons.calendar_month),
                  label: const Text('حجز موعد'),
                ),
              ),
            ),
    );
  }

  Widget _buildContent(Doctor doctor) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: AppTheme.accentLight,
            backgroundImage:
                doctor.profileImage != null ? NetworkImage(doctor.profileImage!) : null,
            child: doctor.profileImage == null
                ? const Icon(Icons.person, size: 56, color: AppTheme.primaryBlue)
                : null,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                doctor.displayName,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              if (doctor.verified) ...[
                const SizedBox(width: 6),
                const Icon(Icons.verified, color: AppTheme.primaryBlue),
              ],
            ],
          ),
          if (doctor.displayTitle.isNotEmpty)
            Text(doctor.displayTitle, style: const TextStyle(color: AppTheme.textSecondary)),
          if (doctor.specialtiesText.isNotEmpty)
            Text(doctor.specialtiesText, style: const TextStyle(color: AppTheme.primaryBlue)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _statItem(Icons.star, doctor.ratingAvg.toStringAsFixed(1), 'التقييم'),
              _statItem(Icons.work_history, '${doctor.yearsExperience}', 'سنوات الخبرة'),
              _statItem(
                Icons.payments_outlined,
                '${doctor.consultationFee.toStringAsFixed(0)} ج.م',
                'رسوم الكشف',
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (doctor.clinicNameAr != null) ...[
            _infoRow(Icons.local_hospital, doctor.clinicNameAr!),
            const SizedBox(height: 8),
          ],
          Row(
            children: [
              if (doctor.acceptsInClinic)
                const Chip(label: Text('في العيادة'), avatar: Icon(Icons.store, size: 16)),
              const SizedBox(width: 8),
              if (doctor.acceptsOnline)
                const Chip(label: Text('أونلاين'), avatar: Icon(Icons.videocam, size: 16)),
            ],
          ),
          const SizedBox(height: 24),
          if (doctor.bioAr != null && doctor.bioAr!.isNotEmpty) ...[
            const Align(
              alignment: Alignment.centerRight,
              child: Text('نبذة عن الطبيب', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(doctor.bioAr!, textAlign: TextAlign.right),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _statItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.primaryBlue),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryBlue, size: 20),
        const SizedBox(width: 8),
        Expanded(child: Text(text)),
      ],
    );
  }
}
