package com.vzeeta.modules.permission.repository;

import com.vzeeta.modules.permission.entity.RolePermissionEntity;
import com.vzeeta.shared.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermissionEntity, UserRole> {
}
