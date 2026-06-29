package com.vzeeta.modules.appointment.dto;

import com.vzeeta.shared.enums.ConsultationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookAppointmentRequest {

    @NotNull private Long doctorId;
    private Long branchId;
    private Long specialtyId;
    @NotNull private LocalDate appointmentDate;
    @NotNull private LocalTime startTime;
    @NotNull private ConsultationType consultationType;
    private String notes;
}
