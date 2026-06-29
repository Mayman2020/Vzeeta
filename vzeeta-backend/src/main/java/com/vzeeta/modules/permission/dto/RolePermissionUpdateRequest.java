package com.vzeeta.modules.permission.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

@Data
public class RolePermissionUpdateRequest {
    @NotEmpty
    private Map<String, Map<String, Boolean>> permissions;
}
