package com.vzeeta.modules.doctor.entity;

import com.vzeeta.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "clinic_id") private Long clinicId;
    @Column(name = "title_ar") private String titleAr;
    @Column(name = "title_en") private String titleEn;
    @Column(name = "bio_ar") private String bioAr;
    @Column(name = "bio_en") private String bioEn;
    @Column(name = "years_experience") private Integer yearsExperience;
    @Column(name = "consultation_fee") private BigDecimal consultationFee;
    @Column(name = "online_fee") private BigDecimal onlineFee;
    private boolean verified = false;
    @Column(name = "rating_avg") private BigDecimal ratingAvg;
    @Column(name = "rating_count") private Integer ratingCount;
    @Column(name = "accepts_online") private boolean acceptsOnline = true;
    @Column(name = "accepts_in_clinic") private boolean acceptsInClinic = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
