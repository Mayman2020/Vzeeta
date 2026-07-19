package com.vzeeta.modules.clinicadmin.service;

import com.vzeeta.modules.appointment.dto.AppointmentDto;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.appointment.service.AppointmentService;
import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.modules.clinic.entity.ClinicBranch;
import com.vzeeta.modules.clinic.entity.ClinicService;
import com.vzeeta.modules.clinic.repository.*;
import com.vzeeta.modules.clinicadmin.dto.CreateDoctorRequest;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.lab.entity.LabResult;
import com.vzeeta.modules.lab.repository.LabResultRepository;
import com.vzeeta.modules.lookup.entity.Specialty;
import com.vzeeta.modules.lookup.repository.SpecialtyRepository;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.modules.subscription.dto.SubmitSubscriptionPaymentRequest;
import com.vzeeta.modules.subscription.entity.ClinicSubscription;
import com.vzeeta.modules.subscription.entity.SubscriptionPlan;
import com.vzeeta.modules.subscription.service.ClinicSubscriptionGuardService;
import com.vzeeta.modules.subscription.service.SubscriptionService;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClinicAdminService {

    private final ClinicAdminRepository clinicAdminRepository;
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final ClinicBranchRepository branchRepository;
    private final ClinicServiceRepository clinicServiceRepository;
    private final LabResultRepository labResultRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubscriptionService subscriptionService;
    private final ClinicSubscriptionGuardService subscriptionGuardService;

    private Long requireClinicId(Long userId) {
        return clinicAdminRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.forbidden("Clinic admin not found"))
                .getClinicId();
    }

    @Transactional(readOnly = true)
    public Page<Doctor> listDoctors(Long userId, String q, Pageable pageable) {
        return doctorRepository.searchByClinicId(requireClinicId(userId), normalizeQ(q), pageable);
    }

    @Transactional
    public Doctor createDoctor(Long userId, CreateDoctorRequest req) {
        Long clinicId = requireClinicId(userId);
        subscriptionGuardService.assertActive(clinicId);
        if (userRepository.existsByEmailIgnoreCase(req.getEmail()))
            throw AppException.conflict("Email already registered");
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode("Tabeebi@2025"))
                .fullNameAr(req.getFullNameAr())
                .fullNameEn(req.getFullNameEn())
                .phone(req.getPhone())
                .role(UserRole.DOCTOR)
                .build();
        user = userRepository.save(user);
        Doctor doctor = Doctor.builder()
                .user(user)
                .clinicId(clinicId)
                .titleAr(req.getTitleAr())
                .consultationFee(req.getConsultationFee())
                .acceptsOnline(req.isAcceptsOnline())
                .acceptsInClinic(req.isAcceptsInClinic())
                .verified(false)
                .build();
        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor updateDoctor(Long userId, Long doctorId, Doctor update) {
        Long clinicId = requireClinicId(userId);
        subscriptionGuardService.assertActive(clinicId);
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> AppException.notFound("Doctor not found"));
        if (!clinicId.equals(doctor.getClinicId())) throw AppException.forbidden("Access denied");
        if (update.getConsultationFee() != null) doctor.setConsultationFee(update.getConsultationFee());
        if (update.getTitleAr() != null) doctor.setTitleAr(update.getTitleAr());
        return doctorRepository.save(doctor);
    }

    @Transactional(readOnly = true)
    public List<Specialty> listSpecialties() {
        return specialtyRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listAppointments(Long userId, String q, AppointmentStatus status, Pageable pageable) {
        return appointmentService.listForClinic(requireClinicId(userId), normalizeQ(q), status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listAppointments(Long userId, String q, AppointmentStatus status, LocalDate date, Pageable pageable) {
        return appointmentService.listForClinic(requireClinicId(userId), normalizeQ(q), status, date, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> listPatients(Long userId, String q, Pageable pageable) {
        return patientRepository.searchByClinicId(requireClinicId(userId), normalizeQ(q), pageable);
    }

    @Transactional(readOnly = true)
    public Page<ClinicBranch> listBranches(Long userId, String q, Pageable pageable) {
        return branchRepository.searchByClinicId(requireClinicId(userId), normalizeQ(q), pageable);
    }

    @Transactional
    public ClinicBranch saveBranch(Long userId, ClinicBranch branch) {
        Long clinicId = requireClinicId(userId);
        subscriptionGuardService.assertActive(clinicId);
        branch.setClinicId(clinicId);
        return branchRepository.save(branch);
    }

    @Transactional(readOnly = true)
    public Page<ClinicService> listServices(Long userId, String q, Pageable pageable) {
        return clinicServiceRepository.searchByClinicId(requireClinicId(userId), normalizeQ(q), pageable);
    }

    @Transactional
    public ClinicService saveService(Long userId, ClinicService service) {
        Long clinicId = requireClinicId(userId);
        subscriptionGuardService.assertActive(clinicId);
        service.setClinicId(clinicId);
        return clinicServiceRepository.save(service);
    }

    @Transactional
    public LabResult createLabResult(Long userId, LabResult result) {
        Long clinicId = requireClinicId(userId);
        subscriptionGuardService.assertActive(clinicId);
        result.setClinicId(clinicId);
        return labResultRepository.save(result);
    }

    @Transactional(readOnly = true)
    public ClinicSubscription currentSubscription(Long userId) {
        return subscriptionService.getCurrent(requireClinicId(userId)).orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<ClinicSubscription> subscriptionHistory(Long userId, Pageable pageable) {
        return subscriptionService.getHistory(requireClinicId(userId), pageable);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlan> subscriptionPlans() {
        return subscriptionService.listActivePlans();
    }

    @Transactional
    public ClinicSubscription submitSubscriptionPayment(Long userId, SubmitSubscriptionPaymentRequest request) {
        return subscriptionService.submitPayment(requireClinicId(userId), request);
    }

    @Transactional(readOnly = true)
    public ClinicSubscription pendingSubscriptionCharge(Long userId) {
        return subscriptionService.getPendingCharge(requireClinicId(userId)).orElse(null);
    }

    @Transactional(readOnly = true)
    public long verifiedDoctorCount(Long userId) {
        return subscriptionService.countVerifiedDoctors(requireClinicId(userId));
    }

    @Transactional(readOnly = true)
    public Page<LabResult> listLabResults(Long userId, String q, Pageable pageable) {
        return labResultRepository.searchByClinicId(requireClinicId(userId), normalizeQ(q), pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> analytics(Long userId) {
        Long clinicId = requireClinicId(userId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("doctorCount", doctorRepository.findByClinicId(clinicId).size());
        stats.put("branchCount", branchRepository.findByClinicIdAndActiveTrue(clinicId).size());
        stats.put("appointmentCount", appointmentRepository.findByClinicId(clinicId, Pageable.unpaged()).getTotalElements());
        stats.put("todayCount", appointmentRepository.countByClinicIdAndAppointmentDate(clinicId, LocalDate.now()));
        stats.put("cancelledCount", appointmentRepository.countByClinicIdAndStatus(clinicId, AppointmentStatus.CANCELLED));
        stats.put("pendingCount", appointmentRepository.countByClinicIdAndStatus(clinicId, AppointmentStatus.PENDING));
        return stats;
    }

    private static String normalizeQ(String q) {
        return (q == null || q.isBlank()) ? "" : q.trim();
    }
}
