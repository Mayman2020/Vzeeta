package com.vzeeta.modules.payment.repository;

import com.vzeeta.modules.payment.entity.Payment;
import com.vzeeta.shared.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByAppointmentId(Long appointmentId);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            SELECT p FROM Payment p
            WHERE (:q = '' OR LOWER(COALESCE(p.transactionRef, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR CAST(p.appointmentId AS string) LIKE CONCAT('%', :q, '%')
                 OR LOWER(CAST(p.status AS string)) LIKE LOWER(CONCAT('%', :q, '%')))
            AND (:status IS NULL OR p.status = :status)
            ORDER BY p.createdAt DESC
            """)
    Page<Payment> search(@Param("q") String q, @Param("status") PaymentStatus status, Pageable pageable);
}
