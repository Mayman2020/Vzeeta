package com.vzeeta.modules.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    private String type;
    @Column(name = "title_ar", nullable = false) private String titleAr;
    @Column(name = "title_en") private String titleEn;
    @Column(name = "body_ar") private String bodyAr;
    @Column(name = "body_en") private String bodyEn;
    @Column(name = "reference_type") private String referenceType;
    @Column(name = "reference_id") private Long referenceId;
    @Column(name = "read_flag", nullable = false) private boolean readFlag = false;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
