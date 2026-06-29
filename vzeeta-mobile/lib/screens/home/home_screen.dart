import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/doctor.dart';
import '../../models/specialty.dart';
import '../../services/doctor_service.dart';
import '../../widgets/doctor_card.dart';
import '../../widgets/loading.dart';
import '../../widgets/specialty_chip.dart';
import '../main_shell.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final DoctorService _doctorService;
  List<Specialty> _specialties = [];
  List<Doctor> _featuredDoctors = [];
  bool _loading = true;
  String? _error;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _doctorService = DoctorService(context.read<ApiClient>());
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _doctorService.getSpecialties(),
        _doctorService.getFeaturedDoctors(),
      ]);
      if (!mounted) return;
      setState(() {
        _specialties = results[0] as List<Specialty>;
        _featuredDoctors = results[1] as List<Doctor>;
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
      body: SafeArea(
        child: _loading
            ? const LoadingView(message: 'جاري التحميل...')
            : _error != null
                ? ErrorView(message: _error!, onRetry: _load)
                : RefreshIndicator(
                    onRefresh: _load,
                    child: CustomScrollView(
                      slivers: [
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'طبيبي',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryBlue,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'ابحث عن أفضل الأطباء واحجز موعدك',
                                  style: TextStyle(color: AppTheme.textSecondary),
                                ),
                                const SizedBox(height: 16),
                                TextField(
                                  controller: _searchController,
                                  readOnly: true,
                                  onTap: () {
                                    // Switch to search tab via parent shell if needed
                                  },
                                  decoration: InputDecoration(
                                    hintText: 'ابحث عن طبيب أو تخصص...',
                                    prefixIcon: const Icon(Icons.search),
                                    suffixIcon: IconButton(
                                      icon: const Icon(Icons.tune),
                                      onPressed: () {},
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(16),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
                            child: Text(
                              'التخصصات',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        SliverToBoxAdapter(
                          child: SpecialtyGrid(
                            specialties: _specialties,
                            onTap: (_) {},
                          ),
                        ),
                        const SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                            child: Text(
                              'أطباء مميزون',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        if (_featuredDoctors.isEmpty)
                          const SliverToBoxAdapter(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: Center(child: Text('لا يوجد أطباء مميزون حالياً')),
                            ),
                          )
                        else
                          SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final doctor = _featuredDoctors[index];
                                return DoctorCard(
                                  doctor: doctor,
                                  onTap: () => openDoctorProfile(context, doctor.id),
                                );
                              },
                              childCount: _featuredDoctors.length,
                            ),
                          ),
                        const SliverToBoxAdapter(child: SizedBox(height: 16)),
                      ],
                    ),
                  ),
      ),
    );
  }
}
