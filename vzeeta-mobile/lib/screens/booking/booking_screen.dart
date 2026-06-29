import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/appointment.dart';
import '../../models/doctor.dart';
import '../../services/appointment_service.dart';
import '../../services/doctor_service.dart';
import '../../widgets/loading.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key, required this.doctorId});

  final int doctorId;

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late final DoctorService _doctorService;
  late final AppointmentService _appointmentService;

  Doctor? _doctor;
  List<TimeSlot> _slots = [];
  DateTime _selectedDate = DateTime.now();
  String? _selectedTime;
  String _consultationType = 'IN_CLINIC';
  final _notesController = TextEditingController();
  bool _loadingDoctor = true;
  bool _loadingSlots = false;
  bool _booking = false;

  @override
  void initState() {
    super.initState();
    final api = context.read<ApiClient>();
    _doctorService = DoctorService(api);
    _appointmentService = AppointmentService(api);
    _loadDoctor();
    _loadSlots();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadDoctor() async {
    try {
      final doctor = await _doctorService.getDoctor(widget.doctorId);
      if (!mounted) return;
      setState(() {
        _doctor = doctor;
        _loadingDoctor = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _loadingDoctor = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _loadSlots() async {
    setState(() {
      _loadingSlots = true;
      _selectedTime = null;
    });
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final slots = await _doctorService.getAvailableSlots(
        doctorId: widget.doctorId,
        date: dateStr,
        consultationType: _consultationType,
      );
      if (!mounted) return;
      setState(() {
        _slots = slots.where((s) => s.available).toList();
        _loadingSlots = false;
      });
    } on ApiException {
      if (!mounted) return;
      setState(() {
        _slots = [];
        _loadingSlots = false;
      });
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      locale: const Locale('ar'),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
      await _loadSlots();
    }
  }

  Future<void> _confirmBooking() async {
    if (_selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى اختيار وقت الموعد')),
      );
      return;
    }

    setState(() => _booking = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final request = BookAppointmentRequest(
        doctorId: widget.doctorId,
        appointmentDate: dateStr,
        startTime: _selectedTime!,
        consultationType: _consultationType,
        notes: _notesController.text.trim(),
        specialtyId: _doctor?.specialtyIds.isNotEmpty == true
            ? _doctor!.specialtyIds.first
            : null,
      );
      await _appointmentService.bookAppointment(request);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حجز الموعد بنجاح')),
      );
      Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _booking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingDoctor) return const Scaffold(body: LoadingView());

    return Scaffold(
      appBar: AppBar(title: const Text('حجز موعد')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_doctor != null)
              Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.person)),
                  title: Text(_doctor!.displayName),
                  subtitle: Text(_doctor!.displayTitle),
                ),
              ),
            const SizedBox(height: 16),
            const Text('نوع الاستشارة', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'IN_CLINIC', label: Text('في العيادة'), icon: Icon(Icons.store)),
                ButtonSegment(value: 'ONLINE', label: Text('أونلاين'), icon: Icon(Icons.videocam)),
              ],
              selected: {_consultationType},
              onSelectionChanged: (s) {
                setState(() => _consultationType = s.first);
                _loadSlots();
              },
            ),
            const SizedBox(height: 16),
            const Text('اختر التاريخ', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _pickDate,
              icon: const Icon(Icons.calendar_today),
              label: Text(DateFormat('EEEE، d MMMM yyyy', 'ar').format(_selectedDate)),
            ),
            const SizedBox(height: 16),
            const Text('اختر الوقت', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (_loadingSlots)
              const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
            else if (_slots.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('لا توجد مواعيد متاحة في هذا اليوم', textAlign: TextAlign.center),
                ),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _slots.map((slot) {
                  final selected = _selectedTime == slot.startTime;
                  return ChoiceChip(
                    label: Text(_formatTime(slot.startTime)),
                    selected: selected,
                    selectedColor: AppTheme.primaryBlue,
                    labelStyle: TextStyle(color: selected ? Colors.white : null),
                    onSelected: (_) => setState(() => _selectedTime = slot.startTime),
                  );
                }).toList(),
              ),
            const SizedBox(height: 16),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'ملاحظات (اختياري)',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _booking ? null : _confirmBooking,
              child: _booking
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('تأكيد الحجز'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String time) {
    try {
      final parts = time.split(':');
      final hour = int.parse(parts[0]);
      final minute = parts.length > 1 ? parts[1] : '00';
      final period = hour >= 12 ? 'م' : 'ص';
      final h12 = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
      return '$h12:$minute $period';
    } catch (_) {
      return time;
    }
  }
}
