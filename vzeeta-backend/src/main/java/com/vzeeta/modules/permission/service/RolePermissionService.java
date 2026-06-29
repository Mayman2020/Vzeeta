package com.vzeeta.modules.permission.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vzeeta.modules.permission.dto.RolePermissionResponse;
import com.vzeeta.modules.permission.dto.RolePermissionUpdateRequest;
import com.vzeeta.modules.permission.entity.RolePermissionEntity;
import com.vzeeta.modules.permission.repository.RolePermissionRepository;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private static final TypeReference<Map<String, Map<String, Boolean>>> MAP_TYPE = new TypeReference<>() {};

    private final RolePermissionRepository repository;
    private final ObjectMapper objectMapper;

    public List<RolePermissionResponse> getAll() {
        List<RolePermissionResponse> out = new ArrayList<>();
        for (UserRole role : UserRole.values()) {
            out.add(toResponse(findOrCreate(role)));
        }
        return out;
    }

    public RolePermissionResponse getByRole(UserRole role) {
        return toResponse(findOrCreate(role));
    }

    public RolePermissionResponse getMyPermissions(UserRole selectedRole) {
        User user = currentUser();
        if (selectedRole != null) {
            if (selectedRole != user.getRole() && user.getRole() != UserRole.SUPER_ADMIN) {
                throw AppException.forbidden("Selected role is not allowed for this user");
            }
            return RolePermissionResponse.builder()
                    .role(selectedRole)
                    .permissions(getPermissionMap(selectedRole))
                    .build();
        }
        return RolePermissionResponse.builder()
                .role(user.getRole())
                .permissions(getPermissionMap(user.getRole()))
                .build();
    }

    public Map<String, Map<String, Boolean>> getPermissionMap(UserRole role) {
        return readPermissions(findOrCreate(role).getPermissionsJson());
    }

    @Transactional
    public RolePermissionResponse update(UserRole role, RolePermissionUpdateRequest request) {
        RolePermissionEntity entity = findOrCreate(role);
        entity.setPermissionsJson(writePermissions(request.getPermissions()));
        return toResponse(repository.save(entity));
    }

    private RolePermissionEntity findOrCreate(UserRole role) {
        return repository.findById(role).orElseGet(() -> repository.save(
                RolePermissionEntity.builder()
                        .role(role)
                        .permissionsJson(writePermissions(defaultPermissions(role)))
                        .build()));
    }

    private RolePermissionResponse toResponse(RolePermissionEntity entity) {
        return RolePermissionResponse.builder()
                .role(entity.getRole())
                .permissions(readPermissions(entity.getPermissionsJson()))
                .build();
    }

    private Map<String, Map<String, Boolean>> readPermissions(String raw) {
        try {
            return normalize(objectMapper.readValue(raw, MAP_TYPE));
        } catch (Exception e) {
            throw AppException.badRequest("Invalid permissions payload");
        }
    }

    private String writePermissions(Map<String, Map<String, Boolean>> permissions) {
        try {
            return objectMapper.writeValueAsString(normalize(permissions));
        } catch (Exception e) {
            throw AppException.badRequest("Unable to serialize permissions");
        }
    }

    private Map<String, Map<String, Boolean>> normalize(Map<String, Map<String, Boolean>> permissions) {
        Map<String, Map<String, Boolean>> normalized = new LinkedHashMap<>();
        Map<String, Map<String, Boolean>> source = permissions != null ? permissions : Map.of();
        Map<String, Map<String, Boolean>> catalog = baseCatalog();
        for (Map.Entry<String, Map<String, Boolean>> entry : catalog.entrySet()) {
            Map<String, Boolean> incoming = source.getOrDefault(entry.getKey(), Map.of());
            Map<String, Boolean> flags = new LinkedHashMap<>();
            for (String action : entry.getValue().keySet()) {
                flags.put(action, Boolean.TRUE.equals(incoming.get(action)));
            }
            normalized.put(entry.getKey(), flags);
        }
        return normalized;
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

    public static Map<String, Map<String, Boolean>> defaultPermissions(UserRole role) {
        Map<String, Map<String, Boolean>> map = baseCatalog();
        switch (role) {
            case SUPER_ADMIN -> map.replaceAll((k, v) -> fillTrue(v));
            case CLINIC_ADMIN -> {
                grant(map, "dashboard", "enabled", "menu", "view");
                grant(map, "doctors", "enabled", "menu", "view", "create", "edit");
                grant(map, "branches", "enabled", "menu", "view", "create", "edit");
                grant(map, "appointments", "enabled", "menu", "view", "edit");
                grant(map, "patients", "enabled", "menu", "view");
                grant(map, "services", "enabled", "menu", "view", "create", "edit");
                grant(map, "analytics", "enabled", "menu", "view");
            }
            case DOCTOR -> {
                grant(map, "dashboard", "enabled", "menu", "view");
                grant(map, "calendar", "enabled", "menu", "view", "edit");
                grant(map, "appointments", "enabled", "menu", "view", "edit");
                grant(map, "prescriptions", "enabled", "menu", "view", "create", "edit");
                grant(map, "earnings", "enabled", "menu", "view");
            }
            case PATIENT -> {
                grant(map, "dashboard", "enabled", "menu", "view");
                grant(map, "appointments", "enabled", "menu", "view", "create", "edit");
                grant(map, "favorites", "enabled", "menu", "view", "edit");
                grant(map, "prescriptions", "enabled", "menu", "view");
                grant(map, "lab_results", "enabled", "menu", "view");
                grant(map, "medical_records", "enabled", "menu", "view");
                grant(map, "notifications", "enabled", "menu", "view");
            }
            default -> {
                // keep base false
            }
        }
        return map;
    }

    private static Map<String, Map<String, Boolean>> baseCatalog() {
        String[] modules = {
                "dashboard", "appointments", "favorites", "prescriptions", "lab_results", "medical_records", "notifications",
                "calendar", "earnings",
                "doctors", "branches", "patients", "services", "analytics",
                "clinics", "users", "verification", "cities", "payments", "settings", "permissions", "lookups", "profile"
        };
        String[] actions = {"enabled", "menu", "view", "create", "edit", "delete", "export", "approve"};
        Map<String, Map<String, Boolean>> catalog = new LinkedHashMap<>();
        for (String module : modules) {
            Map<String, Boolean> flags = new LinkedHashMap<>();
            for (String action : actions) {
                flags.put(action, false);
            }
            catalog.put(module, flags);
        }
        return catalog;
    }

    private static void grant(Map<String, Map<String, Boolean>> map, String module, String... actions) {
        Map<String, Boolean> flags = map.get(module);
        if (flags == null) {
            return;
        }
        for (String action : actions) {
            if (flags.containsKey(action)) {
                flags.put(action, true);
            }
        }
    }

    private static Map<String, Boolean> fillTrue(Map<String, Boolean> source) {
        Map<String, Boolean> out = new LinkedHashMap<>();
        for (String key : source.keySet()) {
            out.put(key, true);
        }
        return out;
    }
}
