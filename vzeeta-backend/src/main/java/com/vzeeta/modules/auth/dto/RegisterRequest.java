package com.vzeeta.modules.auth.dto;

import com.vzeeta.shared.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String fullNameAr;

    private String fullNameEn;

    private String phone;

    private UserRole role = UserRole.PATIENT;
}
