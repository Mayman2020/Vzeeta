package com.vzeeta.modules.doctor.controller;

import com.vzeeta.modules.appointment.dto.AppointmentDto;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.entity.DoctorAvailability;
import com.vzeeta.modules.doctor.service.DoctorService;
import com.vzeeta.modules.medicalrecord.entity.MedicalRecord;
import com.vzeeta.modules.prescription.entity.Prescription;
import com.vzeeta.modules.publicapi.dto.DoctorDetailDto;
import com.vzeeta.shared.response.ApiResponse;
import com.vzeeta.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> profile() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getProfile(SecurityUtils.currentUserId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> updateProfile(@RequestBody Doctor request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.updateProfile(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<DoctorAvailability>>> availability() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listAvailability(SecurityUtils.currentUserId())));
    }

    @PostMapping("/availability")
    public ResponseEntity<ApiResponse<DoctorAvailability>> saveAvailability(@RequestBody DoctorAvailability request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.saveAvailability(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<Page<AppointmentDto>>> appointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listAppointments(SecurityUtils.currentUserId(), status, q, pageable)));
    }

    @PostMapping("/appointments/{id}/accept")
    public ResponseEntity<ApiResponse<AppointmentDto>> accept(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.acceptAppointment(SecurityUtils.currentUserId(), id)));
    }

    @PostMapping("/appointments/{id}/reject")
    public ResponseEntity<ApiResponse<AppointmentDto>> reject(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.rejectAppointment(SecurityUtils.currentUserId(), id, reason)));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(@RequestBody Prescription request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.createPrescription(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Page<Prescription>>> prescriptions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listPrescriptions(SecurityUtils.currentUserId(), pageable)));
    }

    @PostMapping("/medical-records")
    public ResponseEntity<ApiResponse<MedicalRecord>> createMedicalRecord(@RequestBody MedicalRecord request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.createMedicalRecord(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<Page<MedicalRecord>>> medicalRecords(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listMedicalRecords(SecurityUtils.currentUserId(), pageable)));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> earnings() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getEarnings(SecurityUtils.currentUserId())));
    }
}
