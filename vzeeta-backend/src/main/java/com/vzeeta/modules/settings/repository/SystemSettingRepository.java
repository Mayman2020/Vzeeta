package com.vzeeta.modules.settings.repository;

import com.vzeeta.modules.settings.entity.SystemSetting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    Optional<SystemSetting> findBySettingKey(String settingKey);

    @Query("""
            SELECT s FROM SystemSetting s
            WHERE (:q = '' OR LOWER(s.settingKey) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(s.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(s.settingValue) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<SystemSetting> search(@Param("q") String q, Pageable pageable);
}
