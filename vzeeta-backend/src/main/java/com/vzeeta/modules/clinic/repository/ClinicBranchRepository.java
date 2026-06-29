package com.vzeeta.modules.clinic.repository;

import com.vzeeta.modules.clinic.entity.ClinicBranch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClinicBranchRepository extends JpaRepository<ClinicBranch, Long> {

    List<ClinicBranch> findByClinicIdAndActiveTrue(Long clinicId);

    List<ClinicBranch> findByAreaIdAndActiveTrue(Long areaId);

    @Query("""
            SELECT b FROM ClinicBranch b
            WHERE b.clinicId = :clinicId AND b.active = true
            AND (:q = '' OR LOWER(b.nameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(b.nameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(b.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<ClinicBranch> searchByClinicId(@Param("clinicId") Long clinicId, @Param("q") String q, Pageable pageable);
}
