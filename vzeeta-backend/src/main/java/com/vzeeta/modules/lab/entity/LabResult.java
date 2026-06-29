package com.vzeeta.modules.lab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabResult {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "clinic_id") private Long clinicId;
    @Column(name = "appointment_id") private Long appointmentId;
    @Column(name = "test_name_ar", nullable = false) private String testNameAr;
    @Column(name = "test_name_en") private String testNameEn;
    @Column(name = "result_summary") private String resultSummary;
    @Column(name = "file_url") private String fileUrl;
    @Column(name = "result_date", nullable = false) private LocalDate resultDate;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    @CreatedBy @Column(name = "created_by") private Long createdBy;
}
