package com.vzeeta.modules.lookup.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateLookupRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String nameAr;

    @NotBlank
    private String nameEn;

    private Integer sortOrder;

    private boolean active;
}
