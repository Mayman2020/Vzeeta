package com.vzeeta.modules.doctor.repository;

import com.vzeeta.modules.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    @Query("""
            SELECT DISTINCT d FROM Doctor d
            JOIN DoctorSpecialty ds ON ds.doctorId = d.id
            JOIN Specialty sp ON sp.id = ds.specialtyId
            JOIN DoctorBranch db ON db.doctorId = d.id
            JOIN ClinicBranch cb ON cb.id = db.branchId
            JOIN Area ar ON ar.id = cb.areaId
            LEFT JOIN Clinic cl ON cl.id = cb.clinicId
            WHERE d.verified = true
            AND (:name = '' OR LOWER(d.user.fullNameAr) LIKE LOWER(CONCAT('%', :name, '%'))
                 OR LOWER(d.user.fullNameEn) LIKE LOWER(CONCAT('%', :name, '%'))
                 OR LOWER(sp.nameAr) LIKE LOWER(CONCAT('%', :name, '%'))
                 OR LOWER(COALESCE(sp.nameEn, '')) LIKE LOWER(CONCAT('%', :name, '%'))
                 OR LOWER(COALESCE(cl.nameAr, '')) LIKE LOWER(CONCAT('%', :name, '%'))
                 OR LOWER(COALESCE(cl.nameEn, '')) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:specialtyId IS NULL OR ds.specialtyId = :specialtyId)
            AND (:areaId IS NULL OR cb.areaId = :areaId)
            AND (:cityId IS NULL OR ar.cityId = :cityId)
            AND (:minPrice IS NULL OR d.consultationFee >= :minPrice)
            AND (:maxPrice IS NULL OR d.consultationFee <= :maxPrice)
            AND (:minRating IS NULL OR d.ratingAvg >= :minRating)
            AND (:online IS NULL OR (:online = true AND d.acceptsOnline = true) OR (:online = false AND d.acceptsInClinic = true))
            AND EXISTS (
                SELECT 1 FROM ClinicSubscription cs
                WHERE cs.clinicId = d.clinicId
                AND cs.status = com.vzeeta.shared.enums.ClinicSubscriptionStatus.ACTIVE
                AND cs.endDate >= CURRENT_DATE
            )
            """)
    Page<Doctor> searchVerifiedDoctors(
            @Param("name") String name,
            @Param("specialtyId") Long specialtyId,
            @Param("areaId") Long areaId,
            @Param("cityId") Long cityId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("online") Boolean online,
            Pageable pageable);

    List<Doctor> findByClinicId(Long clinicId);

    long countByClinicIdAndVerifiedTrue(Long clinicId);

    @Query("""
            SELECT DISTINCT d FROM Doctor d
            LEFT JOIN DoctorSpecialty ds ON ds.doctorId = d.id
            LEFT JOIN Specialty sp ON sp.id = ds.specialtyId
            WHERE d.clinicId = :clinicId
            AND (:q = '' OR LOWER(COALESCE(d.titleAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(d.titleEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(d.user.fullNameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(d.user.fullNameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(sp.nameAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(sp.nameEn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Doctor> searchByClinicId(@Param("clinicId") Long clinicId, @Param("q") String q, Pageable pageable);

    @Query("""
            SELECT DISTINCT d FROM Doctor d
            LEFT JOIN DoctorSpecialty ds ON ds.doctorId = d.id
            LEFT JOIN Specialty sp ON sp.id = ds.specialtyId
            LEFT JOIN Clinic cl ON cl.id = d.clinicId
            WHERE (:verified IS NULL OR d.verified = :verified)
            AND (:q = '' OR LOWER(COALESCE(d.titleAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(d.titleEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(d.user.fullNameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(d.user.fullNameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(sp.nameAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(sp.nameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(cl.nameAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(cl.nameEn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Doctor> search(@Param("verified") Boolean verified, @Param("q") String q, Pageable pageable);

    long countByVerified(boolean verified);

    Page<Doctor> findByVerified(boolean verified, Pageable pageable);

    @Query("""
            SELECT d FROM Doctor d
            WHERE d.verified = true
            AND EXISTS (
                SELECT 1 FROM ClinicSubscription cs
                WHERE cs.clinicId = d.clinicId
                AND cs.status = com.vzeeta.shared.enums.ClinicSubscriptionStatus.ACTIVE
                AND cs.endDate >= CURRENT_DATE
            )
            ORDER BY d.ratingAvg DESC, d.ratingCount DESC
            """)
    List<Doctor> findFeatured(org.springframework.data.domain.Pageable pageable);
}
