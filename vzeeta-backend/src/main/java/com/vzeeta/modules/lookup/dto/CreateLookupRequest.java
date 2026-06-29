package com.vzeeta.modules.lookup.dto;

import com.vzeeta.modules.lookup.entity.LookupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLookupRequest {
    @NotNull
    private LookupType type;

    private String code;

    @NotBlank
    private String nameAr;

    @NotBlank
    private String nameEn;

    private Integer sortOrder;
}
