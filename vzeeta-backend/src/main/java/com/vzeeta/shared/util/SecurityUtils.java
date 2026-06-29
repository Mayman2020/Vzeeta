package com.vzeeta.shared.util;

import com.vzeeta.modules.user.entity.User;
import com.vzeeta.shared.exception.AppException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw AppException.forbidden("Authentication required");
        }
        return user;
    }

    public static Long currentUserId() {
        return currentUser().getId();
    }
}
