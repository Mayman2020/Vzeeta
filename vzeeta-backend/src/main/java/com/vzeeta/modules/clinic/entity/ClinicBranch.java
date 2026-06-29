package com.vzeeta.modules.clinic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "clinic_branches", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClinicBranch {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "clinic_id", nullable = false) private Long clinicId;
    @Column(name = "name_ar", nullable = false) private String nameAr;
    @Column(name = "name_en") private String nameEn;
    @Column(name = "area_id") private Long areaId;
    @Column(name = "address_ar") private String addressAr;
    @Column(name = "address_en") private String addressEn;
    private String phone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
