package com.vzeeta.modules.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_attachments", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(name = "title_ar", length = 255)
    private String titleAr;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
