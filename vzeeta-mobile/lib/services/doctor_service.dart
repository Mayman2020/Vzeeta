import '../core/api/api_client.dart';
import '../models/doctor.dart';
import '../models/specialty.dart';

class DoctorService {
  DoctorService(this._api);

  final ApiClient _api;

  Future<List<Specialty>> getSpecialties() async {
    final data = await _api.get('/public/specialties', auth: false);
    return _api.parseList(data, Specialty.fromJson);
  }

  Future<List<Doctor>> getFeaturedDoctors() async {
    final data = await _api.get('/public/doctors/featured', auth: false);
    return _api.parseList(data, Doctor.fromJson);
  }

  Future<List<Doctor>> searchDoctors({
    String? query,
    int? specialtyId,
    double? minRating,
    int page = 0,
    int size = 20,
  }) async {
    final queryParams = <String, String>{
      'page': '$page',
      'size': '$size',
    };
    if (query != null && query.isNotEmpty) queryParams['name'] = query;
    if (specialtyId != null) queryParams['specialty'] = '$specialtyId';
    if (minRating != null) queryParams['minRating'] = '$minRating';

    final data = await _api.get('/public/doctors', query: queryParams, auth: false);
    return _api.parseList(data, Doctor.fromJson);
  }

  Future<Doctor> getDoctor(int id) async {
    final data = await _api.get('/public/doctors/$id', auth: false);
    final json = _api.parseObject(data) ?? data as Map<String, dynamic>;
    return Doctor.fromJson(json);
  }

  Future<List<TimeSlot>> getAvailableSlots({
    required int doctorId,
    required String date,
    String consultationType = 'IN_CLINIC',
    int? branchId,
  }) async {
    final query = <String, String>{
      'date': date,
      'consultationType': consultationType,
    };
    if (branchId != null) query['branchId'] = '$branchId';

    final data = await _api.get('/public/doctors/$doctorId/slots', query: query, auth: false);
    return _api.parseList(data, TimeSlot.fromJson);
  }
}
