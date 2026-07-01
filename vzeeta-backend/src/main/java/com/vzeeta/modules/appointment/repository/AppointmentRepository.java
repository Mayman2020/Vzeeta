package com.vzeeta.modules.appointment.repository;

import com.vzeeta.modules.appointment.entity.Appointment;
import com.vzeeta.shared.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    long countByAppointmentNumberStartingWith(String prefix);

    boolean existsByDoctorIdAndAppointmentDateAndStartTimeAndStatusNotIn(
            Long doctorId, LocalDate date, LocalTime startTime, List<AppointmentStatus> excluded);

    boolean existsByPatientIdAndDoctorIdAndAppointmentDateAndStartTimeAndStatusNotIn(
            Long patientId, Long doctorId, LocalDate date, LocalTime startTime, List<AppointmentStatus> excluded);

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByClinicId(Long clinicId, Pageable pageable);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.clinicId = :clinicId
            AND (:q = '' OR LOWER(a.appointmentNumber) LIKE LOWER(CONCAT('%', :q, '%')))
            AND (:status IS NULL OR a.status = :status)
            AND (:date IS NULL OR a.appointmentDate = :date)
            """)
    Page<Appointment> searchByClinicId(
            @Param("clinicId") Long clinicId,
            @Param("q") String q,
            @Param("status") AppointmentStatus status,
            @Param("date") LocalDate date,
            Pageable pageable);

    long countByClinicIdAndAppointmentDate(Long clinicId, LocalDate date);

    long countByClinicIdAndStatus(Long clinicId, AppointmentStatus status);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.doctorId = :doctorId
            AND (:status IS NULL OR a.status = :status)
            AND (:q = '' OR LOWER(a.appointmentNumber) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Appointment> searchByDoctorId(
            @Param("doctorId") Long doctorId,
            @Param("status") AppointmentStatus status,
            @Param("q") String q,
            Pageable pageable);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.patientId = :patientId
            AND (:q = '' OR LOWER(a.appointmentNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(a.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            AND (:filterByStatus = false OR a.status IN :statuses)
            """)
    Page<Appointment> searchByPatientId(
            @Param("patientId") Long patientId,
            @Param("q") String q,
            @Param("filterByStatus") boolean filterByStatus,
            @Param("statuses") List<AppointmentStatus> statuses,
            Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNotIn(
            Long doctorId, LocalDate date, List<AppointmentStatus> excluded);

    List<Appointment> findByAppointmentDateAndStartTimeBetweenAndStatusIn(
            LocalDate appointmentDate,
            LocalTime startTimeFrom,
            LocalTime startTimeTo,
            List<AppointmentStatus> statuses);
}
