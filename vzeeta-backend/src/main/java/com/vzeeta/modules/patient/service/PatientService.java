package com.vzeeta.modules.patient.service;

import com.vzeeta.modules.appointment.entity.Appointment;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.favorite.entity.FavoriteDoctor;
import com.vzeeta.modules.favorite.repository.FavoriteDoctorRepository;
import com.vzeeta.modules.lab.entity.LabResult;
import com.vzeeta.modules.lab.repository.LabResultRepository;
import com.vzeeta.modules.medicalrecord.entity.MedicalRecord;
import com.vzeeta.modules.medicalrecord.repository.MedicalRecordRepository;
import com.vzeeta.modules.notification.entity.Notification;
import com.vzeeta.modules.notification.repository.NotificationRepository;
import com.vzeeta.modules.patient.dto.CreatePatientAttachmentRequest;
import com.vzeeta.modules.patient.dto.CreateReviewRequest;
import com.vzeeta.modules.patient.dto.PatientAttachmentDto;
import com.vzeeta.modules.patient.dto.PatientProfileDto;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.patient.entity.PatientAttachment;
import com.vzeeta.modules.patient.repository.PatientAttachmentRepository;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.modules.prescription.dto.PrescriptionDto;
import com.vzeeta.modules.prescription.entity.Prescription;
import com.vzeeta.modules.prescription.entity.PrescriptionItem;
import com.vzeeta.modules.prescription.repository.PrescriptionRepository;
import com.vzeeta.modules.publicapi.dto.DoctorSummaryDto;
import com.vzeeta.modules.publicapi.service.PublicService;
import com.vzeeta.modules.review.entity.Review;
import com.vzeeta.modules.review.repository.ReviewRepository;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FavoriteDoctorRepository favoriteDoctorRepository;
    private final DoctorRepository doctorRepository;
    private final PublicService publicService;
    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final NotificationRepository notificationRepository;
    private final PatientAttachmentRepository patientAttachmentRepository;

    private static final Set<String> ATTACHMENT_TYPES = Set.of("XRAY", "LAB", "SCAN", "OTHER");

    @Transactional(readOnly = true)
    public PatientProfileDto getProfile(Long userId) {
        Patient patient = requirePatient(userId);
        User user = patient.getUser();
        return PatientProfileDto.builder()
                .id(patient.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .fullNameAr(user.getFullNameAr())
                .fullNameEn(user.getFullNameEn())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodType(patient.getBloodType())
                .nationalId(patient.getNationalId())
                .build();
    }

    @Transactional
    public PatientProfileDto updateProfile(Long userId, PatientProfileDto request) {
        Patient patient = requirePatient(userId);
        User user = patient.getUser();
        if (request.getFullNameAr() != null) user.setFullNameAr(request.getFullNameAr());
        if (request.getFullNameEn() != null) user.setFullNameEn(request.getFullNameEn());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) patient.setGender(request.getGender());
        if (request.getBloodType() != null) patient.setBloodType(request.getBloodType());
        if (request.getNationalId() != null) patient.setNationalId(request.getNationalId());
        userRepository.save(user);
        patientRepository.save(patient);
        return getProfile(userId);
    }

    @Transactional(readOnly = true)
    public List<DoctorSummaryDto> listFavorites(Long userId) {
        Patient patient = requirePatient(userId);
        return favoriteDoctorRepository.findByPatientId(patient.getId()).stream()
                .map(f -> doctorRepository.findById(f.getDoctorId()).orElse(null))
                .filter(d -> d != null && d.isVerified())
                .map(publicService::mapDoctorSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Long userId, Long doctorId) {
        Patient patient = requirePatient(userId);
        doctorRepository.findById(doctorId).orElseThrow(() -> AppException.notFound("Doctor not found"));
        if (!favoriteDoctorRepository.existsByPatientIdAndDoctorId(patient.getId(), doctorId)) {
            FavoriteDoctor fav = new FavoriteDoctor();
            fav.setPatientId(patient.getId());
            fav.setDoctorId(doctorId);
            fav.setCreatedAt(LocalDateTime.now());
            favoriteDoctorRepository.save(fav);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long doctorId) {
        Patient patient = requirePatient(userId);
        favoriteDoctorRepository.deleteById(new FavoriteDoctor.FavoriteDoctorId(patient.getId(), doctorId));
    }

    @Transactional
    public Review createReview(Long userId, CreateReviewRequest request) {
        Patient patient = requirePatient(userId);
        Appointment appt = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> AppException.notFound("Appointment not found"));
        if (!appt.getPatientId().equals(patient.getId())) {
            throw AppException.forbidden("Access denied");
        }
        if (appt.getStatus() != AppointmentStatus.COMPLETED) {
            throw AppException.badRequest("Reviews only allowed after completed appointment");
        }
        if (reviewRepository.existsByAppointmentId(appt.getId())) {
            throw AppException.conflict("Review already exists");
        }
        Review review = Review.builder()
                .appointmentId(appt.getId())
                .patientId(patient.getId())
                .doctorId(appt.getDoctorId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);
        updateDoctorRating(appt.getDoctorId());
        return review;
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDto> listPrescriptions(Long userId, String q, Pageable pageable) {
        Long patientId = requirePatient(userId).getId();
        String term = normalizeQ(q);
        Page<Prescription> page = term.isEmpty()
                ? prescriptionRepository.findByPatientId(patientId, pageable)
                : prescriptionRepository.searchByPatientId(patientId, term, pageable);
        return page.map(this::toPrescriptionDto);
    }

    @Transactional(readOnly = true)
    public PrescriptionDto getPrescription(Long userId, Long id) {
        Prescription p = prescriptionRepository.findById(id).orElseThrow(() -> AppException.notFound("Not found"));
        ensurePatientOwns(requirePatient(userId).getId(), p.getPatientId());
        return toPrescriptionDto(p);
    }

    private PrescriptionDto toPrescriptionDto(Prescription p) {
        p.getItems().size(); // trigger lazy load within transaction
        return PrescriptionDto.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .patientId(p.getPatientId())
                .doctorId(p.getDoctorId())
                .diagnosisAr(p.getDiagnosisAr())
                .diagnosisEn(p.getDiagnosisEn())
                .notes(p.getNotes())
                .fileUrl(p.getFileUrl())
                .createdAt(p.getCreatedAt())
                .items(p.getItems().stream().map(this::toItemDto).collect(Collectors.toList()))
                .build();
    }

    private PrescriptionDto.PrescriptionItemDto toItemDto(PrescriptionItem item) {
        return PrescriptionDto.PrescriptionItemDto.builder()
                .id(item.getId())
                .medicineName(item.getMedicineName())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .duration(item.getDuration())
                .instructions(item.getInstructions())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<LabResult> listLabResults(Long userId, Pageable pageable) {
        return labResultRepository.findByPatientId(requirePatient(userId).getId(), pageable);
    }

    @Transactional(readOnly = true)
    public LabResult getLabResult(Long userId, Long id) {
        LabResult r = labResultRepository.findById(id).orElseThrow(() -> AppException.notFound("Not found"));
        ensurePatientOwns(requirePatient(userId).getId(), r.getPatientId());
        return r;
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecord> listMedicalRecords(Long userId, Pageable pageable) {
        return medicalRecordRepository.findByPatientId(requirePatient(userId).getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> listNotifications(Long userId, String q, String scope, Pageable pageable) {
        String term = normalizeQ(q);
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusDays(14);
        String s = scope == null ? "recent" : scope.trim().toLowerCase();
        boolean older = "older".equals(s);

        if (!term.isEmpty()) {
            return older
                    ? notificationRepository.searchByUserIdBefore(userId, term, cutoff, pageable)
                    : notificationRepository.searchByUserIdSince(userId, term, cutoff, pageable);
        }
        if (older) {
            return notificationRepository.findByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(userId, cutoff, pageable);
        }
        return notificationRepository.findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(userId, cutoff, pageable);
    }

    @Transactional
    public void markAllNotificationsRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    @Transactional
    public void markNotificationRead(Long userId, Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> AppException.notFound("Not found"));
        if (!n.getUserId().equals(userId)) throw AppException.forbidden("Access denied");
        n.setReadFlag(true);
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<PatientAttachmentDto> listAttachments(Long userId, String type) {
        Patient patient = requirePatient(userId);
        List<PatientAttachment> rows = (type == null || type.isBlank())
                ? patientAttachmentRepository.findByPatientIdOrderByUploadedAtDesc(patient.getId())
                : patientAttachmentRepository.findByPatientIdAndTypeOrderByUploadedAtDesc(patient.getId(), normalizeAttachmentType(type));
        return rows.stream().map(this::toAttachmentDto).collect(Collectors.toList());
    }

    @Transactional
    public PatientAttachmentDto addAttachment(Long userId, CreatePatientAttachmentRequest request) {
        Patient patient = requirePatient(userId);
        String type = normalizeAttachmentType(request.getType());
        if (request.getFileUrl() == null || request.getFileUrl().isBlank()) {
            throw AppException.badRequest("fileUrl is required");
        }
        PatientAttachment attachment = PatientAttachment.builder()
                .patientId(patient.getId())
                .type(type)
                .titleAr(request.getTitleAr())
                .fileUrl(request.getFileUrl().trim())
                .notes(request.getNotes())
                .uploadedAt(LocalDateTime.now())
                .build();
        attachment = patientAttachmentRepository.save(attachment);
        return toAttachmentDto(attachment);
    }

    @Transactional
    public void deleteAttachment(Long userId, Long attachmentId) {
        Patient patient = requirePatient(userId);
        PatientAttachment attachment = patientAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> AppException.notFound("Attachment not found"));
        if (!attachment.getPatientId().equals(patient.getId())) {
            throw AppException.forbidden("Access denied");
        }
        patientAttachmentRepository.delete(attachment);
    }

    private PatientAttachmentDto toAttachmentDto(PatientAttachment attachment) {
        return PatientAttachmentDto.builder()
                .id(attachment.getId())
                .type(attachment.getType())
                .titleAr(attachment.getTitleAr())
                .fileUrl(attachment.getFileUrl())
                .notes(attachment.getNotes())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }

    private static String normalizeAttachmentType(String type) {
        if (type == null || type.isBlank()) {
            throw AppException.badRequest("Attachment type is required");
        }
        String normalized = type.trim().toUpperCase();
        if (!ATTACHMENT_TYPES.contains(normalized)) {
            throw AppException.badRequest("Invalid attachment type");
        }
        return normalized;
    }

    private void updateDoctorRating(Long doctorId) {
        Page<Review> reviews = reviewRepository.findByDoctorId(doctorId, Pageable.unpaged());
        if (reviews.isEmpty()) return;
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow();
        doctor.setRatingAvg(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        doctor.setRatingCount((int) reviews.getTotalElements());
        doctorRepository.save(doctor);
    }

    private Patient requirePatient(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound("Patient not found"));
    }

    private void ensurePatientOwns(Long patientId, Long resourcePatientId) {
        if (!patientId.equals(resourcePatientId)) {
            throw AppException.forbidden("Access denied");
        }
    }

    private static String normalizeQ(String q) {
        return (q == null || q.isBlank()) ? "" : q.trim();
    }
}
