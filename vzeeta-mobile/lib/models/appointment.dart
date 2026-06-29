class Appointment {
  const Appointment({
    required this.id,
    required this.appointmentNumber,
    required this.doctorId,
    required this.appointmentDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.consultationType = 'IN_CLINIC',
    this.doctorNameAr,
    this.doctorTitleAr,
    this.specialtyNameAr,
    this.clinicNameAr,
    this.branchNameAr,
    this.feeAmount = 0,
    this.notes,
  });

  final int id;
  final String appointmentNumber;
  final int doctorId;
  final String appointmentDate;
  final String startTime;
  final String endTime;
  final String status;
  final String consultationType;
  final String? doctorNameAr;
  final String? doctorTitleAr;
  final String? specialtyNameAr;
  final String? clinicNameAr;
  final String? branchNameAr;
  final double feeAmount;
  final String? notes;

  bool get isUpcoming {
    const active = {'PENDING', 'CONFIRMED', 'RESCHEDULED'};
    return active.contains(status);
  }

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'] as int,
      appointmentNumber:
          (json['appointmentNumber'] ?? json['appointment_number'] ?? '') as String,
      doctorId: (json['doctorId'] ?? json['doctor_id']) as int,
      appointmentDate:
          (json['appointmentDate'] ?? json['appointment_date'] ?? '') as String,
      startTime: (json['startTime'] ?? json['start_time'] ?? '') as String,
      endTime: (json['endTime'] ?? json['end_time'] ?? '') as String,
      status: (json['status'] ?? 'PENDING') as String,
      consultationType:
          (json['consultationType'] ?? json['consultation_type'] ?? 'IN_CLINIC') as String,
      doctorNameAr: json['doctorNameAr'] as String? ?? json['doctor_name_ar'] as String?,
      doctorTitleAr: json['doctorTitleAr'] as String? ?? json['doctor_title_ar'] as String?,
      specialtyNameAr:
          json['specialtyNameAr'] as String? ?? json['specialty_name_ar'] as String?,
      clinicNameAr: json['clinicNameAr'] as String? ?? json['clinic_name_ar'] as String?,
      branchNameAr: json['branchNameAr'] as String? ?? json['branch_name_ar'] as String?,
      feeAmount: _toDouble(json['feeAmount'] ?? json['fee_amount']),
      notes: json['notes'] as String?,
    );
  }

  static double _toDouble(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString()) ?? 0;
  }
}

class BookAppointmentRequest {
  const BookAppointmentRequest({
    required this.doctorId,
    required this.appointmentDate,
    required this.startTime,
    required this.consultationType,
    this.branchId,
    this.specialtyId,
    this.notes,
  });

  final int doctorId;
  final String appointmentDate;
  final String startTime;
  final String consultationType;
  final int? branchId;
  final int? specialtyId;
  final String? notes;

  Map<String, dynamic> toJson() => {
        'doctorId': doctorId,
        'appointmentDate': appointmentDate,
        'startTime': startTime,
        'consultationType': consultationType,
        if (branchId != null) 'branchId': branchId,
        if (specialtyId != null) 'specialtyId': specialtyId,
        if (notes != null && notes!.isNotEmpty) 'notes': notes,
      };
}
