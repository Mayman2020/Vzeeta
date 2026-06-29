package com.vzeeta.modules.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleRequest {

    @NotNull private LocalDate appointmentDate;
    @NotNull private LocalTime startTime;
}
