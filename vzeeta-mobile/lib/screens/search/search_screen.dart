import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../models/doctor.dart';
import '../../models/specialty.dart';
import '../../services/doctor_service.dart';
import '../../widgets/doctor_card.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading.dart';
import '../../widgets/specialty_chip.dart';
import '../main_shell.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, this.initialSpecialtyId});

  final int? initialSpecialtyId;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final DoctorService _doctorService;
  final _searchController = TextEditingController();
  List<Doctor> _doctors = [];
  List<Specialty> _specialties = [];
  int? _selectedSpecialtyId;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _doctorService = DoctorService(context.read<ApiClient>());
    _selectedSpecialtyId = widget.initialSpecialtyId;
    _loadSpecialties();
    _search();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadSpecialties() async {
    try {
      final specialties = await _doctorService.getSpecialties();
      if (mounted) setState(() => _specialties = specialties);
    } catch (_) {}
  }

  Future<void> _search() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final doctors = await _doctorService.searchDoctors(
        query: _searchController.text.trim(),
        specialtyId: _selectedSpecialtyId,
      );
      if (!mounted) return;
      setState(() {
        _doctors = doctors;
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
      appBar: AppBar(title: const Text('بحث عن طبيب')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'ابحث عن طبيب...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _search();
                  },
                ),
              ),
              onSubmitted: (_) => _search(),
            ),
          ),
          if (_specialties.isNotEmpty)
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  SpecialtyChip(
                    specialty: const Specialty(id: 0, code: 'ALL', nameAr: 'الكل'),
                    selected: _selectedSpecialtyId == null,
                    onTap: () {
                      setState(() => _selectedSpecialtyId = null);
                      _search();
                    },
                  ),
                  ..._specialties.map(
                    (s) => SpecialtyChip(
                      specialty: s,
                      selected: _selectedSpecialtyId == s.id,
                      onTap: () {
                        setState(() => _selectedSpecialtyId = s.id);
                        _search();
                      },
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: _loading
                ? const LoadingView()
                : _error != null
                    ? ErrorView(message: _error!, onRetry: _search)
                    : _doctors.isEmpty
                        ? const EmptyState(
                            message: 'لم يتم العثور على أطباء',
                            icon: Icons.search_off,
                          )
                        : RefreshIndicator(
                            onRefresh: _search,
                            child: ListView.builder(
                              itemCount: _doctors.length,
                              itemBuilder: (context, index) {
                                final doctor = _doctors[index];
                                return DoctorCard(
                                  doctor: doctor,
                                  onTap: () => openDoctorProfile(context, doctor.id),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
