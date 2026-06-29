package com.vzeeta.modules.patient.repository;

import com.vzeeta.modules.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUserId(Long userId);

    @Query("""
            SELECT DISTINCT p FROM Patient p
            JOIN Appointment a ON a.patientId = p.id
            WHERE a.clinicId = :clinicId
            """)
    Page<Patient> findDistinctByClinicId(@Param("clinicId") Long clinicId, Pageable pageable);

    @Query("""
            SELECT DISTINCT p FROM Patient p
            JOIN Appointment a ON a.patientId = p.id
            WHERE a.clinicId = :clinicId
            AND (:q = '' OR LOWER(p.user.fullNameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(p.user.fullNameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(p.user.email) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(p.user.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Patient> searchByClinicId(@Param("clinicId") Long clinicId, @Param("q") String q, Pageable pageable);
}
