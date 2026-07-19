package com.vzeeta.modules.subscription.entity;

import com.vzeeta.shared.enums.ClinicSubscriptionPaymentMethod;
import com.vzeeta.shared.enums.ClinicSubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clinic_subscriptions", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClinicSubscription {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "clinic_id", nullable = false) private Long clinicId;
    @Column(name = "plan_id") private Long planId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) private ClinicSubscriptionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false) private ClinicSubscriptionPaymentMethod paymentMethod;

    @Column(name = "receipt_url") private String receiptUrl;
    private BigDecimal amount;
    @Column(name = "doctor_count") private Integer doctorCount;
    @Column(name = "is_topup") private boolean topUp;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "is_free_trial") private boolean freeTrial;
    @Column(name = "rejection_reason") private String rejectionReason;
    @Column(name = "reviewed_by") private Long reviewedBy;
    @Column(name = "reviewed_at") private LocalDateTime reviewedAt;

    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
