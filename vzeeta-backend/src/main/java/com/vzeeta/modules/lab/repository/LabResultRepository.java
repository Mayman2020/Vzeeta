package com.vzeeta.modules.lab.repository;

import com.vzeeta.modules.lab.entity.LabResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    Page<LabResult> findByPatientId(Long patientId, Pageable pageable);

    Page<LabResult> findByClinicId(Long clinicId, Pageable pageable);

    @Query("""
            SELECT lr FROM LabResult lr
            WHERE lr.clinicId = :clinicId
            AND (:q = '' OR LOWER(lr.testNameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(lr.testNameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(lr.resultSummary, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<LabResult> searchByClinicId(@Param("clinicId") Long clinicId, @Param("q") String q, Pageable pageable);
}
