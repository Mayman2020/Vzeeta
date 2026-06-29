package com.vzeeta.modules.medicalrecord.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(name = "appointment_id") private Long appointmentId;
    @Column(name = "title_ar", nullable = false) private String titleAr;
    @Column(name = "title_en") private String titleEn;
    @Column(name = "description_ar") private String descriptionAr;
    @Column(name = "description_en") private String descriptionEn;
    @Column(name = "record_type") private String recordType;
    @Column(name = "file_url") private String fileUrl;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    @CreatedBy @Column(name = "created_by") private Long createdBy;
}
