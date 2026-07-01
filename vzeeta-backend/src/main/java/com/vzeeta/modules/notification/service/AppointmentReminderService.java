package com.vzeeta.modules.notification.service;

import com.vzeeta.modules.appointment.entity.Appointment;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.notification.repository.NotificationRepository;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.modules.settings.repository.SystemSettingRepository;
import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.mail.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderService {

    private static final String TYPE_APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER";
    private static final String SETTING_REMINDER_HOURS = "appointment_reminder_hours";
    private static final List<AppointmentStatus> REMINDABLE = List.of(
            AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final EmailService emailService;

    @Value("${vzeeta.reminders.enabled:true}")
    private boolean remindersEnabled;

    @Transactional
    public int sendDueReminders() {
        if (!remindersEnabled) {
            return 0;
        }
        int reminderHours = resolveReminderHours();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusHours(reminderHours).withSecond(0).withNano(0);
        LocalDateTime windowEnd = windowStart.plusMinutes(59);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStartTimeBetweenAndStatusIn(
                windowStart.toLocalDate(),
                windowStart.toLocalTime(),
                windowEnd.toLocalTime(),
                REMINDABLE);

        int sent = 0;
        for (Appointment appointment : appointments) {
            if (dispatchReminder(appointment)) {
                sent++;
            }
        }
        return sent;
    }

    private boolean dispatchReminder(Appointment appointment) {
        Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
        if (patient == null || patient.getUser() == null) {
            return false;
        }
        Long patientUserId = patient.getUser().getId();
        if (notificationRepository.existsByTypeAndReferenceIdAndUserId(
                TYPE_APPOINTMENT_REMINDER, appointment.getId(), patientUserId)) {
            return false;
        }

        String doctorName = doctorRepository.findById(appointment.getDoctorId())
                .map(Doctor::getUser)
                .map(u -> u.getFullNameEn() != null ? u.getFullNameEn() : u.getFullNameAr())
                .orElse("your doctor");

        String titleAr = "تذكير بالموعد";
        String titleEn = "Appointment reminder";
        String bodyAr = String.format("موعدك %s مع %s في %s الساعة %s.",
                appointment.getAppointmentNumber(), doctorName,
                appointment.getAppointmentDate(), appointment.getStartTime());
        String bodyEn = String.format("Reminder: appointment %s with %s on %s at %s.",
                appointment.getAppointmentNumber(), doctorName,
                appointment.getAppointmentDate(), appointment.getStartTime());

        notificationService.notifyUser(
                patientUserId, TYPE_APPOINTMENT_REMINDER,
                titleAr, titleEn, bodyAr, bodyEn,
                "Appointment", appointment.getId());

        Doctor doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        if (doctor != null && doctor.getUser() != null) {
            Long doctorUserId = doctor.getUser().getId();
            if (!notificationRepository.existsByTypeAndReferenceIdAndUserId(
                    TYPE_APPOINTMENT_REMINDER, appointment.getId(), doctorUserId)) {
                notificationService.notifyUser(
                        doctorUserId, TYPE_APPOINTMENT_REMINDER,
                        titleAr, titleEn, bodyAr, bodyEn,
                        "Appointment", appointment.getId());
            }
        }

        String patientEmail = patient.getUser().getEmail();
        emailService.sendOptional(
                patientEmail,
                titleEn,
                bodyEn + "\n\n— Vzeeta");

        return true;
    }

    private int resolveReminderHours() {
        return systemSettingRepository.findBySettingKey(SETTING_REMINDER_HOURS)
                .map(s -> {
                    try {
                        return Math.max(1, Integer.parseInt(s.getSettingValue().trim()));
                    } catch (NumberFormatException e) {
                        return 24;
                    }
                })
                .orElse(24);
    }
}
