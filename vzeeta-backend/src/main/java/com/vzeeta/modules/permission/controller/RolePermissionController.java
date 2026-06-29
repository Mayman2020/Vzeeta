package com.vzeeta.modules.permission.controller;

import com.vzeeta.modules.permission.annotation.RequiresPermission;
import com.vzeeta.modules.permission.dto.RolePermissionResponse;
import com.vzeeta.modules.permission.dto.RolePermissionUpdateRequest;
import com.vzeeta.modules.permission.service.RolePermissionService;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/role-permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @GetMapping
    @RequiresPermission(module = "permissions", action = "view")
    public ResponseEntity<ApiResponse<List<RolePermissionResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.getAll()));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> getMine(@RequestParam(required = false) UserRole role) {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.getMyPermissions(role)));
    }

    @GetMapping("/{role}")
    @RequiresPermission(module = "permissions", action = "view")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> getByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.getByRole(role)));
    }

    @PutMapping("/{role}")
    @RequiresPermission(module = "permissions", action = "edit")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> update(
            @PathVariable UserRole role,
            @Valid @RequestBody RolePermissionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.update(role, request)));
    }
}
