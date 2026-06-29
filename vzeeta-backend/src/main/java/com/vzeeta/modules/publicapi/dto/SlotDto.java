package com.vzeeta.modules.publicapi.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class SlotDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
}
