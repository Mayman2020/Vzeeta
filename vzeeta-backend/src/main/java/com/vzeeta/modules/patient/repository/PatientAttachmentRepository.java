package com.vzeeta.modules.patient.repository;

import com.vzeeta.modules.patient.entity.PatientAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientAttachmentRepository extends JpaRepository<PatientAttachment, Long> {

    List<PatientAttachment> findByPatientIdOrderByUploadedAtDesc(Long patientId);

    List<PatientAttachment> findByPatientIdAndTypeOrderByUploadedAtDesc(Long patientId, String type);
}
