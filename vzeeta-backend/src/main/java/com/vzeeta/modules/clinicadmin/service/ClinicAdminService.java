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
        branch.setClinicId(requireClinicId(userId));
        return branchRepository.save(branch);
    }

    @Transactional(readOnly = true)
    public Page<ClinicService> listServices(Long userId, String q, Pageable pageable) {
        return clinicServiceRepository.searchByClinicId(requireClinicId(userId), normalizeQ(q), pageable);
    }

    @Transactional
    public ClinicService saveService(Long userId, ClinicService service) {
        service.setClinicId(requireClinicId(userId));
        return clinicServiceRepository.save(service);
    }

    @Transactional
    public LabResult createLabResult(Long userId, LabResult result) {
        result.setClinicId(requireClinicId(userId));
        return labResultRepository.save(result);
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
