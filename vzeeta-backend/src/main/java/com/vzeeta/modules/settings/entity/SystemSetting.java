package com.vzeeta.modules.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings", schema = "vzeeta_mgmt")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemSetting {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "setting_key", nullable = false, unique = true) private String settingKey;
    @Column(name = "setting_value", nullable = false) private String settingValue;
    private String description;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
