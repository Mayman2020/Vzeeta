package com.vzeeta.modules.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PatientProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String fullNameAr;
    private String fullNameEn;
    private String phone;
    private String profileImage;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    private String nationalId;
}
