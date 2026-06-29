import '../core/api/api_client.dart';
import '../models/medical.dart';

class MedicalService {
  MedicalService(this._api);

  final ApiClient _api;

  Future<List<MedicalRecord>> getMedicalRecords() async {
    final data = await _api.get('/patient/medical-records');
    return _api.parseList(data, MedicalRecord.fromJson);
  }

  Future<List<Prescription>> getPrescriptions() async {
    final data = await _api.get('/patient/prescriptions');
    return _api.parseList(data, Prescription.fromJson);
  }

  Future<List<LabResult>> getLabResults() async {
    final data = await _api.get('/patient/lab-results');
    return _api.parseList(data, LabResult.fromJson);
  }
}
