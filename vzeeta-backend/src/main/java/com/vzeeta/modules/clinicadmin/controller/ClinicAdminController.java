package com.vzeeta.modules.clinicadmin.controller;

import com.vzeeta.modules.appointment.dto.AppointmentDto;
import com.vzeeta.modules.clinicadmin.dto.CreateDoctorRequest;
import com.vzeeta.modules.clinic.entity.ClinicBranch;
import com.vzeeta.modules.clinic.entity.ClinicService;
import com.vzeeta.modules.clinicadmin.service.ClinicAdminService;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.lab.entity.LabResult;
import com.vzeeta.modules.lookup.entity.Specialty;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.subscription.dto.SubmitSubscriptionPaymentRequest;
import com.vzeeta.modules.subscription.entity.ClinicSubscription;
import com.vzeeta.modules.subscription.entity.SubscriptionPlan;
import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.response.ApiResponse;
import com.vzeeta.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLINIC_ADMIN')")
public class ClinicAdminController {

    private final ClinicAdminService clinicAdminService;

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<Page<Doctor>>> doctors(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listDoctors(SecurityUtils.currentUserId(), q, pageable)));
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@RequestBody CreateDoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.createDoctor(SecurityUtils.currentUserId(), request)));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(@PathVariable Long id, @RequestBody Doctor request) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.updateDoctor(SecurityUtils.currentUserId(), id, request)));
    }

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse<List<Specialty>>> specialties() {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listSpecialties()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<Page<AppointmentDto>>> appointments(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) LocalDate date,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listAppointments(SecurityUtils.currentUserId(), q, status, date, pageable)));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<Page<Patient>>> patients(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listPatients(SecurityUtils.currentUserId(), q, pageable)));
    }

    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<Page<ClinicBranch>>> branches(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listBranches(SecurityUtils.currentUserId(), q, pageable)));
    }

    @PostMapping("/branches")
    public ResponseEntity<ApiResponse<ClinicBranch>> saveBranch(@RequestBody ClinicBranch request) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.saveBranch(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<Page<ClinicService>>> services(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listServices(SecurityUtils.currentUserId(), q, pageable)));
    }

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ClinicService>> saveService(@RequestBody ClinicService request) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.saveService(SecurityUtils.currentUserId(), request)));
    }

    @PostMapping("/lab-results")
    public ResponseEntity<ApiResponse<LabResult>> createLabResult(@RequestBody LabResult request) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.createLabResult(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/lab-results")
    public ResponseEntity<ApiResponse<Page<LabResult>>> labResults(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.listLabResults(SecurityUtils.currentUserId(), q, pageable)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analytics() {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.analytics(SecurityUtils.currentUserId())));
    }

    @GetMapping("/subscription/current")
    public ResponseEntity<ApiResponse<ClinicSubscription>> currentSubscription() {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.currentSubscription(SecurityUtils.currentUserId())));
    }

    @GetMapping("/subscription/history")
    public ResponseEntity<ApiResponse<Page<ClinicSubscription>>> subscriptionHistory(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.subscriptionHistory(SecurityUtils.currentUserId(), pageable)));
    }

    @GetMapping("/subscription/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> subscriptionPlans() {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.subscriptionPlans()));
    }

    @PostMapping("/subscription/submit")
    public ResponseEntity<ApiResponse<ClinicSubscription>> submitSubscriptionPayment(@RequestBody SubmitSubscriptionPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.submitSubscriptionPayment(SecurityUtils.currentUserId(), request)));
    }

    @GetMapping("/subscription/pending")
    public ResponseEntity<ApiResponse<ClinicSubscription>> pendingSubscriptionCharge() {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.pendingSubscriptionCharge(SecurityUtils.currentUserId())));
    }

    @GetMapping("/subscription/doctor-count")
    public ResponseEntity<ApiResponse<Long>> verifiedDoctorCount() {
        return ResponseEntity.ok(ApiResponse.ok(clinicAdminService.verifiedDoctorCount(SecurityUtils.currentUserId())));
    }
}
