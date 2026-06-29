package com.vzeeta.modules.appointment.dto;

import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.enums.ConsultationType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentDto {
    private Long id;
    private String appointmentNumber;
    private Long patientId;
    private Long doctorId;
    private Long clinicId;
    private Long branchId;
    private Long specialtyId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ConsultationType consultationType;
    private AppointmentStatus status;
    private String notes;
    private BigDecimal feeAmount;
    private LocalDateTime createdAt;
    private String doctorNameAr;
    private String doctorNameEn;
    private String patientNameAr;
    private String patientNameEn;
    private String clinicNameAr;
    private String branchNameAr;
    private String specialtyNameAr;
}
