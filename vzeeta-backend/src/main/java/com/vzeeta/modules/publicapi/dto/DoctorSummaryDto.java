package com.vzeeta.modules.publicapi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DoctorSummaryDto {
    private Long id;
    private String fullNameAr;
    private String fullNameEn;
    private String titleAr;
    private String titleEn;
    private BigDecimal consultationFee;
    private BigDecimal onlineFee;
    private BigDecimal ratingAvg;
    private Integer ratingCount;
    private boolean acceptsOnline;
    private boolean acceptsInClinic;
    private String profileImage;
    private List<String> specialtyNames;
    private Long clinicId;
    private String clinicNameAr;
    private BigDecimal clinicRatingAvg;
    private Integer clinicRatingCount;
    private String areaNameAr;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean verified;
    private Integer yearsExperience;
}
