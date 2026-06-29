package com.vzeeta.modules.publicapi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DoctorDetailDto {
    private Long id;
    private String fullNameAr;
    private String fullNameEn;
    private String titleAr;
    private String titleEn;
    private String bioAr;
    private String bioEn;
    private Integer yearsExperience;
    private BigDecimal consultationFee;
    private BigDecimal onlineFee;
    private BigDecimal ratingAvg;
    private Integer ratingCount;
    private boolean acceptsOnline;
    private boolean acceptsInClinic;
    private String profileImage;
    private List<Long> specialtyIds;
    private List<Long> branchIds;
    private Long clinicId;
}
