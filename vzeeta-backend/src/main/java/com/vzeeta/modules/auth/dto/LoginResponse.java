package com.vzeeta.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private Long id;
        private String email;
        private String fullNameAr;
        private String fullNameEn;
        private String phone;
        private String role;
        private String profileImage;
        private Long patientId;
        private Long doctorId;
        private Long clinicId;
        private boolean mustChangePassword;
    }
}
