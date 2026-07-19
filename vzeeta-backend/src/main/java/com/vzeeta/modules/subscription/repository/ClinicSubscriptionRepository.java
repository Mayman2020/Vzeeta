package com.vzeeta.modules.subscription.repository;

import com.vzeeta.modules.subscription.entity.ClinicSubscription;
import com.vzeeta.shared.enums.ClinicSubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ClinicSubscriptionRepository extends JpaRepository<ClinicSubscription, Long> {

    @Query("""
            SELECT cs FROM ClinicSubscription cs
            WHERE cs.clinicId = :clinicId AND cs.status = 'ACTIVE' AND cs.endDate >= :today
            ORDER BY cs.endDate DESC
            """)
    List<ClinicSubscription> findCurrentActive(@Param("clinicId") Long clinicId, @Param("today") LocalDate today);

    default Optional<ClinicSubscription> findCurrent(Long clinicId, LocalDate today) {
        List<ClinicSubscription> rows = findCurrentActive(clinicId, today);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    Page<ClinicSubscription> findByClinicIdOrderByCreatedAtDesc(Long clinicId, Pageable pageable);

    Page<ClinicSubscription> findByStatusOrderByCreatedAtDesc(ClinicSubscriptionStatus status, Pageable pageable);

    Page<ClinicSubscription> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsByClinicIdAndStatus(Long clinicId, ClinicSubscriptionStatus status);

    Optional<ClinicSubscription> findFirstByClinicIdAndStatusOrderByCreatedAtDesc(Long clinicId, ClinicSubscriptionStatus status);
}
