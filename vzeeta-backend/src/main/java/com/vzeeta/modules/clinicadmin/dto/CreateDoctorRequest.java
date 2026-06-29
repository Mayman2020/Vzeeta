package com.vzeeta.modules.clinicadmin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateDoctorRequest {
    private String fullNameAr;
    private String fullNameEn;
    private String email;
    private String phone;
    private String titleAr;
    private BigDecimal consultationFee;
    private boolean acceptsOnline = true;
    private boolean acceptsInClinic = true;
}
