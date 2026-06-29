import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/medical.dart';
import '../../services/medical_service.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});

  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  late final MedicalService _service;
  List<Prescription> _prescriptions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _service = MedicalService(context.read<ApiClient>());
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await _service.getPrescriptions();
      if (!mounted) return;
      setState(() {
        _prescriptions = items;
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
      appBar: AppBar(title: const Text('الوصفات الطبية')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _prescriptions.isEmpty
                  ? const EmptyState(message: 'لا توجد وصفات طبية', icon: Icons.medication_outlined)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _prescriptions.length,
                        itemBuilder: (context, index) {
                          final p = _prescriptions[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: ExpansionTile(
                              leading: const Icon(Icons.medication, color: AppTheme.primaryBlue),
                              title: Text(p.diagnosis.isNotEmpty ? p.diagnosis : 'وصفة طبية'),
                              subtitle: p.doctorNameAr != null ? Text('د. ${p.doctorNameAr}') : null,
                              children: p.items
                                  .map(
                                    (item) => ListTile(
                                      dense: true,
                                      title: Text(item.medicineName),
                                      subtitle: Text(
                                        [
                                          if (item.dosage != null) item.dosage,
                                          if (item.frequency != null) item.frequency,
                                          if (item.duration != null) item.duration,
                                        ].whereType<String>().join(' • '),
                                      ),
                                    ),
                                  )
                                  .toList(),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
