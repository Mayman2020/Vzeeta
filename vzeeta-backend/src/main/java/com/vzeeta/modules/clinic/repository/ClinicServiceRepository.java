package com.vzeeta.modules.clinic.repository;

import com.vzeeta.modules.clinic.entity.ClinicService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClinicServiceRepository extends JpaRepository<ClinicService, Long> {

    List<ClinicService> findByClinicIdAndActiveTrue(Long clinicId);

    @Query("""
            SELECT s FROM ClinicService s
            WHERE s.clinicId = :clinicId AND s.active = true
            AND (:q = '' OR LOWER(s.nameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(s.nameEn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<ClinicService> searchByClinicId(@Param("clinicId") Long clinicId, @Param("q") String q, Pageable pageable);
}
