package com.vzeeta.modules.appointment.service;

import com.vzeeta.modules.appointment.dto.AppointmentDto;
import com.vzeeta.modules.appointment.dto.BookAppointmentRequest;
import com.vzeeta.modules.appointment.dto.RescheduleRequest;
import com.vzeeta.modules.appointment.entity.Appointment;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.clinic.repository.ClinicBranchRepository;
import com.vzeeta.modules.clinic.repository.ClinicRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.entity.DoctorAvailability;
import com.vzeeta.modules.doctor.repository.DoctorAvailabilityRepository;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.lookup.entity.Specialty;
import com.vzeeta.modules.lookup.repository.SpecialtyRepository;
import com.vzeeta.modules.notification.service.NotificationService;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.enums.ConsultationType;
import com.vzeeta.shared.exception.AppException;
import com.vzeeta.shared.util.AppointmentNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final ClinicRepository clinicRepository;
    private final ClinicBranchRepository branchRepository;
    private final SpecialtyRepository specialtyRepository;
    private final AppointmentNumberGenerator numberGenerator;
    private final NotificationService notificationService;
    private final MessageSource messageSource;

    private static final List<AppointmentStatus> BLOCKING = List.of(
            AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED);

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }

    @Transactional
    public AppointmentDto book(Long userId, BookAppointmentRequest request) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound(msg("patient.not_found")));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .filter(Doctor::isVerified)
                .orElseThrow(() -> AppException.notFound(msg("doctor.not_found")));

        validateSlotNotTaken(patient.getId(), doctor.getId(), request.getAppointmentDate(), request.getStartTime());
        validateAvailability(doctor.getId(), request);

        int slotMinutes = resolveSlotMinutes(doctor.getId(), request);
        LocalTime endTime = request.getStartTime().plusMinutes(slotMinutes);
        BigDecimal fee = request.getConsultationType() == ConsultationType.ONLINE
                ? (doctor.getOnlineFee() != null ? doctor.getOnlineFee() : doctor.getConsultationFee())
                : doctor.getConsultationFee();

        Appointment appointment = Appointment.builder()
                .appointmentNumber(numberGenerator.nextNumber())
                .patientId(patient.getId())
                .doctorId(doctor.getId())
                .clinicId(doctor.getClinicId())
                .branchId(request.getBranchId())
                .specialtyId(request.getSpecialtyId())
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .consultationType(request.getConsultationType())
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .feeAmount(fee != null ? fee : BigDecimal.ZERO)
                .build();

        appointment = appointmentRepository.save(appointment);

        notificationService.notifyUser(doctor.getUser().getId(), "NEW_APPOINTMENT",
                "موعد جديد", "New Appointment",
                "لديك طلب موعد جديد", "You have a new appointment request",
                "APPOINTMENT", appointment.getId());

        return toDto(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listForPatient(Long userId, String q, Pageable pageable) {
        Patient patient = requirePatient(userId);
        return appointmentRepository.searchByPatientId(patient.getId(), normalizeQ(q), pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public AppointmentDto getForPatient(Long userId, Long id) {
        Patient patient = requirePatient(userId);
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("appointment.not_found")));
        if (!appt.getPatientId().equals(patient.getId())) {
            throw AppException.forbidden(msg("error.access_denied"));
        }
        return toDto(appt);
    }

    @Transactional
    public AppointmentDto cancelForPatient(Long userId, Long id) {
        Patient patient = requirePatient(userId);
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("appointment.not_found")));
        if (!appt.getPatientId().equals(patient.getId())) {
            throw AppException.forbidden(msg("error.access_denied"));
        }
        if (appt.getStatus() == AppointmentStatus.COMPLETED || appt.getStatus() == AppointmentStatus.CANCELLED) {
            throw AppException.badRequest(msg("appointment.cannot_cancel"));
        }
        appt.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(appt));
    }

    @Transactional
    public AppointmentDto rescheduleForPatient(Long userId, Long id, RescheduleRequest request) {
        Patient patient = requirePatient(userId);
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("appointment.not_found")));
        if (!appt.getPatientId().equals(patient.getId())) {
            throw AppException.forbidden(msg("error.access_denied"));
        }
        validateSlotNotTaken(patient.getId(), appt.getDoctorId(), request.getAppointmentDate(), request.getStartTime());
        int slotMinutes = (int) java.time.Duration.between(appt.getStartTime(), appt.getEndTime()).toMinutes();
        appt.setAppointmentDate(request.getAppointmentDate());
        appt.setStartTime(request.getStartTime());
        appt.setEndTime(request.getStartTime().plusMinutes(slotMinutes));
        appt.setStatus(AppointmentStatus.RESCHEDULED);
        return toDto(appointmentRepository.save(appt));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listForDoctor(Long userId, String status, String q, Pageable pageable) {
        Doctor doctor = requireDoctor(userId);
        AppointmentStatus statusFilter = parseStatus(status);
        return appointmentRepository.searchByDoctorId(doctor.getId(), statusFilter, normalizeQ(q), pageable).map(this::toDto);
    }

    @Transactional
    public AppointmentDto acceptForDoctor(Long userId, Long id) {
        Doctor doctor = requireDoctor(userId);
        Appointment appt = requireDoctorAppointment(doctor.getId(), id);
        if (appt.getStatus() != AppointmentStatus.PENDING && appt.getStatus() != AppointmentStatus.RESCHEDULED) {
            throw AppException.badRequest(msg("appointment.cannot_accept"));
        }
        ensureDoctorHasAvailability(doctor.getId(), appt);
        appt.setStatus(AppointmentStatus.CONFIRMED);
        appt = appointmentRepository.save(appt);

        Patient patient = patientRepository.findById(appt.getPatientId()).orElseThrow();
        notificationService.notifyUser(patient.getUser().getId(), "APPOINTMENT_CONFIRMED",
                "تأكيد الموعد", "Appointment Confirmed",
                "تم تأكيد موعدك", "Your appointment has been confirmed",
                "APPOINTMENT", appt.getId());
        return toDto(appt);
    }

    @Transactional
    public AppointmentDto rejectForDoctor(Long userId, Long id, String reason) {
        Doctor doctor = requireDoctor(userId);
        Appointment appt = requireDoctorAppointment(doctor.getId(), id);
        appt.setStatus(AppointmentStatus.REJECTED);
        appt.setDoctorNotes(reason);
        return toDto(appointmentRepository.save(appt));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listForClinic(Long clinicId, String q, AppointmentStatus status, java.time.LocalDate date, Pageable pageable) {
        return appointmentRepository.searchByClinicId(clinicId, normalizeQ(q), status, date, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listForClinic(Long clinicId, String q, AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.searchByClinicId(clinicId, normalizeQ(q), status, null, pageable).map(this::toDto);
    }

    private void validateSlotNotTaken(Long patientId, Long doctorId, java.time.LocalDate date, LocalTime startTime) {
        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndStartTimeAndStatusNotIn(
                doctorId, date, startTime, BLOCKING)) {
            throw AppException.conflict(msg("error.slot_taken"), "SLOT_TAKEN");
        }
        if (appointmentRepository.existsByPatientIdAndDoctorIdAndAppointmentDateAndStartTimeAndStatusNotIn(
                patientId, doctorId, date, startTime, BLOCKING)) {
            throw AppException.conflict(msg("error.duplicate_booking"), "DUPLICATE_BOOKING");
        }
    }

    private void validateAvailability(Long doctorId, BookAppointmentRequest request) {
        int dayOfWeek = request.getAppointmentDate().getDayOfWeek().getValue() % 7;
        List<DoctorAvailability> slots = availabilityRepository
                .findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, dayOfWeek);
        boolean online = request.getConsultationType() == ConsultationType.ONLINE;
        boolean fits = slots.stream().anyMatch(av -> {
            if (online && av.isOnlineOnly() == false && request.getBranchId() != null && av.getBranchId() != null
                    && !av.getBranchId().equals(request.getBranchId())) {
                return false;
            }
            if (!online && av.isOnlineOnly()) return false;
            return !request.getStartTime().isBefore(av.getStartTime())
                    && request.getStartTime().isBefore(av.getEndTime());
        });
        if (!fits) {
            throw AppException.badRequest(msg("appointment.no_availability"));
        }
    }

    private void ensureDoctorHasAvailability(Long doctorId, Appointment appt) {
        int dayOfWeek = appt.getAppointmentDate().getDayOfWeek().getValue() % 7;
        List<DoctorAvailability> slots = availabilityRepository
                .findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, dayOfWeek);
        boolean fits = slots.stream().anyMatch(av ->
                !appt.getStartTime().isBefore(av.getStartTime())
                        && appt.getStartTime().isBefore(av.getEndTime()));
        if (!fits) {
            throw AppException.badRequest(msg("appointment.no_availability"));
        }
    }

    private int resolveSlotMinutes(Long doctorId, BookAppointmentRequest request) {
        int dayOfWeek = request.getAppointmentDate().getDayOfWeek().getValue() % 7;
        return availabilityRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, dayOfWeek).stream()
                .filter(av -> !request.getStartTime().isBefore(av.getStartTime())
                        && request.getStartTime().isBefore(av.getEndTime()))
                .map(av -> av.getSlotMinutes() != null ? av.getSlotMinutes() : 30)
                .findFirst().orElse(30);
    }

    private Patient requirePatient(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound(msg("patient.not_found")));
    }

    private Doctor requireDoctor(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound(msg("doctor.not_found")));
    }

    private Appointment requireDoctorAppointment(Long doctorId, Long appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> AppException.notFound(msg("appointment.not_found")));
        if (!appt.getDoctorId().equals(doctorId)) {
            throw AppException.forbidden(msg("error.access_denied"));
        }
        return appt;
    }

    public AppointmentDto toDto(Appointment a) {
        AppointmentDto.AppointmentDtoBuilder builder = AppointmentDto.builder()
                .id(a.getId())
                .appointmentNumber(a.getAppointmentNumber())
                .patientId(a.getPatientId())
                .doctorId(a.getDoctorId())
                .clinicId(a.getClinicId())
                .branchId(a.getBranchId())
                .specialtyId(a.getSpecialtyId())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .consultationType(a.getConsultationType())
                .status(a.getStatus())
                .notes(a.getNotes())
                .feeAmount(a.getFeeAmount())
                .createdAt(a.getCreatedAt());

        doctorRepository.findById(a.getDoctorId()).ifPresent(d -> {
            builder.doctorNameAr(d.getUser().getFullNameAr());
            builder.doctorNameEn(d.getUser().getFullNameEn());
        });
        patientRepository.findById(a.getPatientId()).ifPresent(p -> {
            builder.patientNameAr(p.getUser().getFullNameAr());
            builder.patientNameEn(p.getUser().getFullNameEn());
        });
        if (a.getClinicId() != null) {
            clinicRepository.findById(a.getClinicId()).ifPresent(c -> builder.clinicNameAr(c.getNameAr()));
        }
        if (a.getBranchId() != null) {
            branchRepository.findById(a.getBranchId()).ifPresent(b -> builder.branchNameAr(b.getNameAr()));
        }
        if (a.getSpecialtyId() != null) {
            specialtyRepository.findById(a.getSpecialtyId()).ifPresent(s -> builder.specialtyNameAr(s.getNameAr()));
        }
        return builder.build();
    }

    private static String normalizeQ(String q) {
        return (q == null || q.isBlank()) ? "" : q.trim();
    }

    private static AppointmentStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return AppointmentStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
