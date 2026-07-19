package com.vzeeta.modules.clinic.entity;

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
@Table(name = "clinics", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Clinic {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "name_ar", nullable = false) private String nameAr;
    @Column(name = "name_en") private String nameEn;
    @Column(name = "description_ar") private String descriptionAr;
    @Column(name = "description_en") private String descriptionEn;
    @Column(name = "logo_url") private String logoUrl;
    private String phone;
    private String email;
    private String website;
    private boolean active = true;
    private boolean verified = false;
    @Column(name = "commission_percent") private BigDecimal commissionPercent;
    @Column(name = "rating_avg") private BigDecimal ratingAvg;
    @Column(name = "rating_count") private Integer ratingCount;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    @CreatedBy @Column(name = "created_by") private Long createdBy;
    @LastModifiedBy @Column(name = "updated_by") private Long updatedBy;
}
