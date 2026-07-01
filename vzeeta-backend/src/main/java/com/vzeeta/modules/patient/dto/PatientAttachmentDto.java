package com.vzeeta.modules.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PatientAttachmentDto {
    private Long id;
    private String type;
    private String titleAr;
    private String fileUrl;
    private String notes;
    private LocalDateTime uploadedAt;
}
