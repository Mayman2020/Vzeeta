package com.vzeeta.modules.patient.controller;

import com.vzeeta.modules.appointment.dto.AppointmentDto;
import com.vzeeta.modules.appointment.dto.BookAppointmentRequest;
import com.vzeeta.modules.appointment.dto.RescheduleRequest;
import com.vzeeta.modules.appointment.service.AppointmentService;
import com.vzeeta.modules.lab.entity.LabResult;
import com.vzeeta.modules.medicalrecord.entity.MedicalRecord;
import com.vzeeta.modules.notification.entity.Notification;
import com.vzeeta.modules.patient.dto.CreateReviewRequest;
import com.vzeeta.modules.patient.dto.PatientProfileDto;
import com.vzeeta.modules.patient.service.PatientService;
import com.vzeeta.modules.prescription.dto.PrescriptionDto;
import com.vzeeta.modules.publicapi.dto.DoctorSummaryDto;
import com.vzeeta.modules.review.entity.Review;
import com.vzeeta.shared.response.ApiResponse;
import com.vzeeta.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> profile() {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getProfile(SecurityUtils.currentUserId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> updateProfile(@RequestBody PatientProfileDto request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.updateProfile(SecurityUtils.currentUserId(), request)));
    }

    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse<AppointmentDto>> book(@Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.book(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<Page<AppointmentDto>>> appointments(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.listForPatient(SecurityUtils.currentUserId(), q, pageable)));
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<ApiResponse<AppointmentDto>> appointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getForPatient(SecurityUtils.currentUserId(), id)));
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.cancelForPatient(SecurityUtils.currentUserId(), id)));
    }

    @PostMapping("/appointments/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDto>> reschedule(@PathVariable Long id, @Valid @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.rescheduleForPatient(SecurityUtils.currentUserId(), id, request)));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<DoctorSummaryDto>>> favorites() {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listFavorites(SecurityUtils.currentUserId())));
    }

    @PostMapping("/favorites/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> addFavorite(@PathVariable Long doctorId) {
        patientService.addFavorite(SecurityUtils.currentUserId(), doctorId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/favorites/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long doctorId) {
        patientService.removeFavorite(SecurityUtils.currentUserId(), doctorId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<Review>> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.createReview(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Page<PrescriptionDto>>> prescriptions(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listPrescriptions(SecurityUtils.currentUserId(), q, pageable)));
    }

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<ApiResponse<PrescriptionDto>> prescription(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPrescription(SecurityUtils.currentUserId(), id)));
    }

    @GetMapping("/lab-results")
    public ResponseEntity<ApiResponse<Page<LabResult>>> labResults(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listLabResults(SecurityUtils.currentUserId(), pageable)));
    }

    @GetMapping("/lab-results/{id}")
    public ResponseEntity<ApiResponse<LabResult>> labResult(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getLabResult(SecurityUtils.currentUserId(), id)));
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<Page<MedicalRecord>>> medicalRecords(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listMedicalRecords(SecurityUtils.currentUserId(), pageable)));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Page<Notification>>> notifications(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listNotifications(SecurityUtils.currentUserId(), q, pageable)));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        patientService.markNotificationRead(SecurityUtils.currentUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
