import '../core/api/api_client.dart';
import '../models/appointment.dart';

class AppointmentService {
  AppointmentService(this._api);

  final ApiClient _api;

  Future<List<Appointment>> getMyAppointments({String? status}) async {
    final query = status != null ? {'status': status} : null;
    final data = await _api.get('/patient/appointments', query: query);
    return _api.parseList(data, Appointment.fromJson);
  }

  Future<Appointment> getAppointment(int id) async {
    final data = await _api.get('/patient/appointments/$id');
    final json = _api.parseObject(data) ?? data as Map<String, dynamic>;
    return Appointment.fromJson(json);
  }

  Future<Appointment> bookAppointment(BookAppointmentRequest request) async {
    final data = await _api.post('/patient/appointments', body: request.toJson());
    final json = _api.parseObject(data) ?? data as Map<String, dynamic>;
    return Appointment.fromJson(json);
  }

  Future<Appointment> cancelAppointment(int id) async {
    final data = await _api.post('/patient/appointments/$id/cancel');
    final json = _api.parseObject(data) ?? data as Map<String, dynamic>;
    return Appointment.fromJson(json);
  }
}
