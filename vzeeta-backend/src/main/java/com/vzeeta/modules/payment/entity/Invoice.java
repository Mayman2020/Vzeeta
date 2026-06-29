package com.vzeeta.modules.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "invoice_number", nullable = false, unique = true) private String invoiceNumber;
    @Column(name = "payment_id", nullable = false, unique = true) private Long paymentId;
    @Column(name = "appointment_id", nullable = false) private Long appointmentId;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    private BigDecimal subtotal;
    private BigDecimal commission;
    private BigDecimal total;
    @Column(name = "issued_at") private LocalDateTime issuedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
