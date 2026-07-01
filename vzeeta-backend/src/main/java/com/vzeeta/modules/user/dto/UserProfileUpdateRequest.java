package com.vzeeta.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {

    @NotBlank
    @Size(max = 150)
    private String fullNameAr;

    @Size(max = 150)
    private String fullNameEn;

    @Size(max = 20)
    private String phone;

    @Size(max = 500)
    private String profileImage;
}
