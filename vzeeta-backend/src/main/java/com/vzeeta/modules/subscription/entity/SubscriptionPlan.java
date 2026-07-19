package com.vzeeta.modules.subscription.entity;

import com.vzeeta.shared.enums.BillingCycle;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubscriptionPlan {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "name_ar", nullable = false) private String nameAr;
    @Column(name = "name_en") private String nameEn;
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false) private BillingCycle billingCycle;
    @Column(nullable = false) private BigDecimal price;
    private boolean active = true;
    @Column(name = "sort_order") private int sortOrder;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
