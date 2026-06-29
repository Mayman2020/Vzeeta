package com.vzeeta.modules.payment.entity;

import com.vzeeta.shared.enums.PaymentMethod;
import com.vzeeta.shared.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "appointment_id", nullable = false) private Long appointmentId;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    private BigDecimal amount;
    private BigDecimal commission;
    @Enumerated(EnumType.STRING) @Column(name = "payment_method") private PaymentMethod paymentMethod;
    @Enumerated(EnumType.STRING) private PaymentStatus status;
    @Column(name = "transaction_ref") private String transactionRef;
    @Column(name = "paid_at") private LocalDateTime paidAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
