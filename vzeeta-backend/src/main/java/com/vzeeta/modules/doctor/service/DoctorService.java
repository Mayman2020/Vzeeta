package com.vzeeta.modules.doctor.service;

import com.vzeeta.modules.appointment.dto.AppointmentDto;
import com.vzeeta.modules.appointment.service.AppointmentService;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.entity.DoctorAvailability;
import com.vzeeta.modules.doctor.repository.DoctorAvailabilityRepository;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.medicalrecord.entity.MedicalRecord;
import com.vzeeta.modules.medicalrecord.repository.MedicalRecordRepository;
import com.vzeeta.modules.payment.entity.Payment;
import com.vzeeta.modules.payment.repository.PaymentRepository;
import com.vzeeta.modules.prescription.entity.Prescription;
import com.vzeeta.modules.prescription.repository.PrescriptionRepository;
import com.vzeeta.modules.publicapi.dto.DoctorDetailDto;
import com.vzeeta.modules.publicapi.service.PublicService;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final PublicService publicService;
    private final AppointmentService appointmentService;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public DoctorDetailDto getProfile(Long userId) {
        Doctor doctor = requireDoctor(userId);
        return publicService.getDoctor(doctor.getId());
    }

    @Transactional
    public DoctorDetailDto updateProfile(Long userId, Doctor doctorUpdate) {
        Doctor doctor = requireDoctor(userId);
        if (doctorUpdate.getTitleAr() != null) doctor.setTitleAr(doctorUpdate.getTitleAr());
        if (doctorUpdate.getTitleEn() != null) doctor.setTitleEn(doctorUpdate.getTitleEn());
        if (doctorUpdate.getBioAr() != null) doctor.setBioAr(doctorUpdate.getBioAr());
        if (doctorUpdate.getBioEn() != null) doctor.setBioEn(doctorUpdate.getBioEn());
        if (doctorUpdate.getConsultationFee() != null) doctor.setConsultationFee(doctorUpdate.getConsultationFee());
        if (doctorUpdate.getOnlineFee() != null) doctor.setOnlineFee(doctorUpdate.getOnlineFee());
        doctorRepository.save(doctor);
        return publicService.getDoctor(doctor.getId());
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailability> listAvailability(Long userId) {
        return availabilityRepository.findByDoctorIdAndActiveTrue(requireDoctor(userId).getId());
    }

    @Transactional
    public DoctorAvailability saveAvailability(Long userId, DoctorAvailability availability) {
        Doctor doctor = requireDoctor(userId);
        availability.setDoctorId(doctor.getId());
        availability.setActive(true);
        return availabilityRepository.save(availability);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> listAppointments(Long userId, String status, String q, Pageable pageable) {
        return appointmentService.listForDoctor(userId, status, q, pageable);
    }

    @Transactional
    public AppointmentDto acceptAppointment(Long userId, Long id) {
        return appointmentService.acceptForDoctor(userId, id);
    }

    @Transactional
    public AppointmentDto rejectAppointment(Long userId, Long id, String reason) {
        return appointmentService.rejectForDoctor(userId, id, reason);
    }

    @Transactional
    public Prescription createPrescription(Long userId, Prescription prescription) {
        Doctor doctor = requireDoctor(userId);
        prescription.setDoctorId(doctor.getId());
        if (prescription.getItems() != null) {
            prescription.getItems().forEach(item -> item.setPrescription(prescription));
        }
        return prescriptionRepository.save(prescription);
    }

    @Transactional(readOnly = true)
    public Page<Prescription> listPrescriptions(Long userId, Pageable pageable) {
        return prescriptionRepository.findByDoctorId(requireDoctor(userId).getId(), pageable);
    }

    @Transactional
    public MedicalRecord createMedicalRecord(Long userId, MedicalRecord record) {
        Doctor doctor = requireDoctor(userId);
        record.setDoctorId(doctor.getId());
        return medicalRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecord> listMedicalRecords(Long userId, Pageable pageable) {
        return medicalRecordRepository.findByDoctorId(requireDoctor(userId).getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEarnings(Long userId) {
        Doctor doctor = requireDoctor(userId);
        List<Long> appointmentIds = appointmentService.listForDoctor(userId, null, "", Pageable.unpaged())
                .map(com.vzeeta.modules.appointment.dto.AppointmentDto::getId)
                .toList();

        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> appointmentIds.contains(p.getAppointmentId()))
                .filter(p -> p.getStatus() == com.vzeeta.shared.enums.PaymentStatus.PAID)
                .collect(Collectors.toList());

        BigDecimal total = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of("totalEarnings", total, "paymentCount", payments.size());
    }

    private Doctor requireDoctor(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound("Doctor not found"));
    }
}
