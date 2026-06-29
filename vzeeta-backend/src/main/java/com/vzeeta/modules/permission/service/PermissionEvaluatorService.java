package com.vzeeta.modules.permission.service;

import com.vzeeta.modules.user.entity.User;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PermissionEvaluatorService {

    private final RolePermissionService rolePermissionService;

    public void assertCan(String module, String action) {
        User user = currentUser();
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }
        Map<String, Map<String, Boolean>> permissions = rolePermissionService.getPermissionMap(user.getRole());
        Map<String, Boolean> modulePermissions = permissions.get(module);
        if (modulePermissions == null || Boolean.FALSE.equals(modulePermissions.get("enabled"))) {
            throw AppException.forbidden("Access denied for module '" + module + "'");
        }
        if (!Boolean.TRUE.equals(modulePermissions.get(action))) {
            throw AppException.forbidden("Action '" + action + "' is not allowed on '" + module + "'");
        }
    }

    public boolean can(String module, String action) {
        try {
            assertCan(module, action);
            return true;
        } catch (AppException ex) {
            return false;
        }
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;
        if (!(principal instanceof User user)) {
            throw AppException.forbidden("Authentication required");
        }
        return user;
    }
}
