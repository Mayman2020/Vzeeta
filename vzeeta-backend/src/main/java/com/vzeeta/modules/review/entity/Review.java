package com.vzeeta.modules.review.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "appointment_id", nullable = false, unique = true) private Long appointmentId;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(name = "clinic_id") private Long clinicId;
    private Integer rating;
    private String comment;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
