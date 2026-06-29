package com.vzeeta.modules.lookup.dto;

import com.vzeeta.modules.lookup.entity.LookupType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LookupResponse {
    private Long id;
    private LookupType type;
    private String code;
    private String nameAr;
    private String nameEn;
    private Integer sortOrder;
    private boolean active;
    private boolean locked;
}
