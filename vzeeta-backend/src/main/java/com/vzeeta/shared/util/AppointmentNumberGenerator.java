package com.vzeeta.shared.util;

import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
@RequiredArgsConstructor
public class AppointmentNumberGenerator {

    private final AppointmentRepository appointmentRepository;

    public String nextNumber() {
        int year = Year.now().getValue();
        String prefix = "TB-" + year + "-";
        long count = appointmentRepository.countByAppointmentNumberStartingWith(prefix);
        return prefix + String.format("%05d", count + 1);
    }
}
