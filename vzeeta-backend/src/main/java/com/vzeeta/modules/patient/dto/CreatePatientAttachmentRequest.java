package com.vzeeta.modules.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePatientAttachmentRequest {

    @NotBlank
    private String type;

    @NotBlank
    private String fileUrl;

    private String titleAr;
    private String notes;
}
