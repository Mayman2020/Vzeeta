package com.vzeeta.modules.publicapi.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LookupDto {
    private Long id;
    private String nameAr;
    private String nameEn;
    private String code;
    private String icon;
    private Long cityId;
}
