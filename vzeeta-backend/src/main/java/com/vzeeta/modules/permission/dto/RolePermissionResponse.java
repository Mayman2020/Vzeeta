package com.vzeeta.modules.permission.dto;

import com.vzeeta.shared.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class RolePermissionResponse {
    private UserRole role;
    private Map<String, Map<String, Boolean>> permissions;
}
