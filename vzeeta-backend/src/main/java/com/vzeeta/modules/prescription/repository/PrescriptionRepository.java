package com.vzeeta.modules.prescription.repository;

import com.vzeeta.modules.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);

    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);

    @Query("""
            SELECT p FROM Prescription p
            WHERE p.patientId = :patientId
            AND (:q = '' OR LOWER(COALESCE(p.diagnosisAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(p.diagnosisEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(p.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Prescription> searchByPatientId(@Param("patientId") Long patientId, @Param("q") String q, Pageable pageable);
}
