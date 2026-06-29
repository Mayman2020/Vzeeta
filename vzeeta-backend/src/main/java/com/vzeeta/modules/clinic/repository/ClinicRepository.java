package com.vzeeta.modules.clinic.repository;

import com.vzeeta.modules.clinic.entity.Clinic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {

    Page<Clinic> findByActiveTrue(Pageable pageable);

    @Query("""
            SELECT c FROM Clinic c
            WHERE (:q = '' OR LOWER(c.nameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(c.nameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Clinic> search(@Param("q") String q, Pageable pageable);
}
