package com.vzeeta.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.response.ApiResponse;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MustChangePasswordFilter extends OncePerRequestFilter {

    private static final List<String> ALLOWED_PATHS = List.of("/auth/", "/users/me/change-password");

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token) || !jwtUtil.isAccessToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims claims = jwtUtil.extractAllClaims(token);
        Long userId = claims.get("userId", Long.class);
        boolean mustChangePassword = userId != null && userRepository.findById(userId)
                .map(u -> u.isMustChangePassword())
                .orElse(Boolean.TRUE.equals(claims.get("mustChangePassword", Boolean.class)));

        if (!mustChangePassword) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        if (ALLOWED_PATHS.stream().anyMatch(path::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(
                ApiResponse.error("You must change your password before continuing.", "PASSWORD_CHANGE_REQUIRED")));
    }
}
