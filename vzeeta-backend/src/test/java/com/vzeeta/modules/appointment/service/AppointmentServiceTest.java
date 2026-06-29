package com.vzeeta.modules.appointment.service;

import com.vzeeta.modules.appointment.dto.BookAppointmentRequest;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.entity.DoctorAvailability;
import com.vzeeta.modules.doctor.repository.DoctorAvailabilityRepository;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.enums.ConsultationType;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AppointmentServiceTest {

    @Autowired private AppointmentService appointmentService;
    @Autowired private UserRepository userRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private DoctorAvailabilityRepository availabilityRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Long patientUserId;
    private Long doctorId;

    @BeforeEach
    void setUp() {
        User patientUser = userRepository.save(User.builder()
                .email("appt-patient@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .fullNameAr("مريض")
                .role(UserRole.PATIENT)
                .active(true)
                .build());
        patientRepository.save(Patient.builder().user(patientUser).build());
        patientUserId = patientUser.getId();

        User doctorUser = userRepository.save(User.builder()
                .email("appt-doctor@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .fullNameAr("طبيب")
                .role(UserRole.DOCTOR)
                .active(true)
                .build());
        Doctor doctor = doctorRepository.save(Doctor.builder()
                .user(doctorUser)
                .verified(true)
                .consultationFee(BigDecimal.valueOf(300))
                .build());
        doctorId = doctor.getId();

        LocalDate date = LocalDate.now().plusDays(1);
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        availabilityRepository.save(DoctorAvailability.builder()
                .doctorId(doctorId)
                .dayOfWeek(dayOfWeek)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .slotMinutes(30)
                .active(true)
                .build());
    }

    @Test
    void book_generatesAppointmentNumber() {
        LocalDate date = LocalDate.now().plusDays(1);
        BookAppointmentRequest request = new BookAppointmentRequest();
        request.setDoctorId(doctorId);
        request.setAppointmentDate(date);
        request.setStartTime(LocalTime.of(9, 0));
        request.setConsultationType(ConsultationType.IN_CLINIC);

        var dto = appointmentService.book(patientUserId, request);
        assertNotNull(dto.getAppointmentNumber());
        assertTrue(dto.getAppointmentNumber().startsWith("TB-"));
        assertEquals(1, appointmentRepository.count());
    }

    @Test
    void book_duplicateSlot_throws() {
        LocalDate date = LocalDate.now().plusDays(1);
        BookAppointmentRequest request = new BookAppointmentRequest();
        request.setDoctorId(doctorId);
        request.setAppointmentDate(date);
        request.setStartTime(LocalTime.of(9, 0));
        request.setConsultationType(ConsultationType.IN_CLINIC);

        appointmentService.book(patientUserId, request);
        assertThrows(AppException.class, () -> appointmentService.book(patientUserId, request));
    }
}
