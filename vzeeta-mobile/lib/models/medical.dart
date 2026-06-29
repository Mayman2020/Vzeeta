class MedicalRecord {
  const MedicalRecord({
    required this.id,
    required this.titleAr,
    this.titleEn,
    this.descriptionAr,
    this.recordType,
    this.fileUrl,
    this.createdAt,
    this.doctorNameAr,
  });

  final int id;
  final String titleAr;
  final String? titleEn;
  final String? descriptionAr;
  final String? recordType;
  final String? fileUrl;
  final String? createdAt;
  final String? doctorNameAr;

  String get title => titleAr.isNotEmpty ? titleAr : (titleEn ?? '');

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      id: json['id'] as int,
      titleAr: (json['titleAr'] ?? json['title_ar'] ?? '') as String,
      titleEn: json['titleEn'] as String? ?? json['title_en'] as String?,
      descriptionAr: json['descriptionAr'] as String? ?? json['description_ar'] as String?,
      recordType: json['recordType'] as String? ?? json['record_type'] as String?,
      fileUrl: json['fileUrl'] as String? ?? json['file_url'] as String?,
      createdAt: json['createdAt'] as String? ?? json['created_at'] as String?,
      doctorNameAr: json['doctorNameAr'] as String? ?? json['doctor_name_ar'] as String?,
    );
  }
}

class Prescription {
  const Prescription({
    required this.id,
    this.diagnosisAr,
    this.diagnosisEn,
    this.notes,
    this.createdAt,
    this.doctorNameAr,
    this.items = const [],
  });

  final int id;
  final String? diagnosisAr;
  final String? diagnosisEn;
  final String? notes;
  final String? createdAt;
  final String? doctorNameAr;
  final List<PrescriptionItem> items;

  String get diagnosis => diagnosisAr ?? diagnosisEn ?? '';

  factory Prescription.fromJson(Map<String, dynamic> json) {
    final itemsJson = json['items'] as List? ?? [];
    return Prescription(
      id: json['id'] as int,
      diagnosisAr: json['diagnosisAr'] as String? ?? json['diagnosis_ar'] as String?,
      diagnosisEn: json['diagnosisEn'] as String? ?? json['diagnosis_en'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] as String? ?? json['created_at'] as String?,
      doctorNameAr: json['doctorNameAr'] as String? ?? json['doctor_name_ar'] as String?,
      items: itemsJson
          .map((e) => PrescriptionItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class PrescriptionItem {
  const PrescriptionItem({
    required this.medicineName,
    this.dosage,
    this.frequency,
    this.duration,
    this.instructions,
  });

  final String medicineName;
  final String? dosage;
  final String? frequency;
  final String? duration;
  final String? instructions;

  factory PrescriptionItem.fromJson(Map<String, dynamic> json) {
    return PrescriptionItem(
      medicineName: (json['medicineName'] ?? json['medicine_name'] ?? '') as String,
      dosage: json['dosage'] as String?,
      frequency: json['frequency'] as String?,
      duration: json['duration'] as String?,
      instructions: json['instructions'] as String?,
    );
  }
}

class LabResult {
  const LabResult({
    required this.id,
    required this.testNameAr,
    this.testNameEn,
    this.resultSummary,
    this.resultDate,
    this.fileUrl,
    this.clinicNameAr,
  });

  final int id;
  final String testNameAr;
  final String? testNameEn;
  final String? resultSummary;
  final String? resultDate;
  final String? fileUrl;
  final String? clinicNameAr;

  String get testName => testNameAr.isNotEmpty ? testNameAr : (testNameEn ?? '');

  factory LabResult.fromJson(Map<String, dynamic> json) {
    return LabResult(
      id: json['id'] as int,
      testNameAr: (json['testNameAr'] ?? json['test_name_ar'] ?? '') as String,
      testNameEn: json['testNameEn'] as String? ?? json['test_name_en'] as String?,
      resultSummary: json['resultSummary'] as String? ?? json['result_summary'] as String?,
      resultDate: json['resultDate'] as String? ?? json['result_date'] as String?,
      fileUrl: json['fileUrl'] as String? ?? json['file_url'] as String?,
      clinicNameAr: json['clinicNameAr'] as String? ?? json['clinic_name_ar'] as String?,
    );
  }
}
