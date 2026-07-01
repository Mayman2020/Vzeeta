package com.vzeeta.modules.user.controller;

import com.vzeeta.modules.auth.dto.LoginResponse;
import com.vzeeta.modules.auth.service.AuthService;
import com.vzeeta.modules.user.dto.ChangePasswordRequest;
import com.vzeeta.modules.user.dto.UserProfileUpdateRequest;
import com.vzeeta.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<LoginResponse.UserDto>> getProfile() {
        return ResponseEntity.ok(ApiResponse.ok(authService.currentUser()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<LoginResponse.UserDto>> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.updateProfileForCurrentUser(request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<LoginResponse>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePasswordForCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.ok(authService.issueTokensForCurrentUser()));
    }
}
