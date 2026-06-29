package com.vzeeta.modules.prescription.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PrescriptionDto {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String diagnosisAr;
    private String diagnosisEn;
    private String notes;
    private String fileUrl;
    private LocalDateTime createdAt;
    private List<PrescriptionItemDto> items;

    @Data
    @Builder
    public static class PrescriptionItemDto {
        private Long id;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
