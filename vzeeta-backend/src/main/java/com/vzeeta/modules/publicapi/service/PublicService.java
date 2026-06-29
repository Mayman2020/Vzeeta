package com.vzeeta.modules.publicapi.service;

import com.vzeeta.modules.appointment.entity.Appointment;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.clinic.entity.Clinic;
import com.vzeeta.modules.clinic.entity.ClinicBranch;
import com.vzeeta.modules.clinic.repository.ClinicBranchRepository;
import com.vzeeta.modules.clinic.repository.ClinicRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.entity.DoctorAvailability;
import com.vzeeta.modules.doctor.repository.*;
import com.vzeeta.modules.lookup.entity.Area;
import com.vzeeta.modules.lookup.entity.City;
import com.vzeeta.modules.lookup.entity.Specialty;
import com.vzeeta.modules.lookup.repository.AreaRepository;
import com.vzeeta.modules.lookup.repository.CityRepository;
import com.vzeeta.modules.lookup.repository.SpecialtyRepository;
import com.vzeeta.modules.publicapi.dto.*;
import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.enums.ConsultationType;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicService {

    private final SpecialtyRepository specialtyRepository;
    private final CityRepository cityRepository;
    private final AreaRepository areaRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorSpecialtyRepository doctorSpecialtyRepository;
    private final DoctorBranchRepository doctorBranchRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final ClinicRepository clinicRepository;
    private final ClinicBranchRepository clinicBranchRepository;

    private static final List<AppointmentStatus> BLOCKING = List.of(
            AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED);

    public List<LookupDto> listSpecialties() {
        return specialtyRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toLookup).collect(Collectors.toList());
    }

    public List<LookupDto> listCities() {
        return cityRepository.findByActiveTrueOrderByNameAr().stream()
                .map(this::toLookup).collect(Collectors.toList());
    }

    public List<LookupDto> listAreas(Long cityId) {
        return areaRepository.findByCityIdAndActiveTrueOrderByNameAr(cityId).stream()
                .map(this::toLookup).collect(Collectors.toList());
    }

    public Page<DoctorSummaryDto> searchDoctors(String name, Long specialtyId, Long areaId,
                                                 BigDecimal minPrice, BigDecimal maxPrice,
                                                 BigDecimal minRating, ConsultationType consultationType,
                                                 Pageable pageable) {
        String normalizedName = name == null ? "" : name.trim();
        Boolean online = consultationType == null ? null : consultationType == ConsultationType.ONLINE;
        return doctorRepository.searchVerifiedDoctors(normalizedName, specialtyId, areaId, minPrice, maxPrice, minRating, online, pageable)
                .map(this::toSummary);
    }

    public List<DoctorSummaryDto> listFeaturedDoctors() {
        return doctorRepository.findFeatured(org.springframework.data.domain.PageRequest.of(0, 6)).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public DoctorSummaryDto mapDoctorSummary(Doctor doctor) {
        return toSummary(doctor);
    }

    public DoctorDetailDto getDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .filter(Doctor::isVerified)
                .orElseThrow(() -> AppException.notFound("Doctor not found"));
        return toDetail(doctor);
    }

    public List<SlotDto> getDoctorSlots(Long doctorId, LocalDate date, ConsultationType type) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .filter(Doctor::isVerified)
                .orElseThrow(() -> AppException.notFound("Doctor not found"));

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        List<DoctorAvailability> availabilities = availabilityRepository
                .findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, dayOfWeek);

        boolean online = type == ConsultationType.ONLINE;
        List<Appointment> booked = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusNotIn(doctorId, date, BLOCKING);

        List<SlotDto> slots = new ArrayList<>();
        for (DoctorAvailability av : availabilities) {
            if (online && !av.isOnlineOnly() && !doctor.isAcceptsOnline()) continue;
            if (!online && av.isOnlineOnly()) continue;

            LocalTime slotStart = av.getStartTime();
            int slotMinutes = av.getSlotMinutes() != null ? av.getSlotMinutes() : 30;
            while (slotStart.plusMinutes(slotMinutes).compareTo(av.getEndTime()) <= 0) {
                LocalTime slotEnd = slotStart.plusMinutes(slotMinutes);
                final LocalTime start = slotStart;
                boolean taken = booked.stream().anyMatch(a -> a.getStartTime().equals(start));
                slots.add(SlotDto.builder().startTime(start).endTime(slotEnd).available(!taken).build());
                slotStart = slotEnd;
            }
        }
        return slots;
    }

    private LookupDto toLookup(Specialty s) {
        return LookupDto.builder().id(s.getId()).nameAr(s.getNameAr()).nameEn(s.getNameEn())
                .code(s.getCode()).icon(s.getIcon()).build();
    }

    private LookupDto toLookup(City c) {
        return LookupDto.builder().id(c.getId()).nameAr(c.getNameAr()).nameEn(c.getNameEn()).build();
    }

    private LookupDto toLookup(Area a) {
        return LookupDto.builder().id(a.getId()).nameAr(a.getNameAr()).nameEn(a.getNameEn()).cityId(a.getCityId()).build();
    }

    private DoctorSummaryDto toSummary(Doctor d) {
        List<String> names = doctorSpecialtyRepository.findByDoctorId(d.getId()).stream()
                .map(ds -> specialtyRepository.findById(ds.getSpecialtyId()).map(Specialty::getNameAr).orElse(""))
                .collect(Collectors.toList());
        String clinicName = d.getClinicId() != null
                ? clinicRepository.findById(d.getClinicId()).map(Clinic::getNameAr).orElse(null)
                : null;
        String areaName = doctorBranchRepository.findByDoctorId(d.getId()).stream()
                .map(db -> clinicBranchRepository.findById(db.getBranchId()).orElse(null))
                .filter(b -> b != null && b.getAreaId() != null)
                .map(b -> areaRepository.findById(b.getAreaId()).map(Area::getNameAr).orElse(null))
                .filter(n -> n != null && !n.isBlank())
                .findFirst().orElse(null);
        return DoctorSummaryDto.builder()
                .id(d.getId())
                .fullNameAr(d.getUser().getFullNameAr())
                .fullNameEn(d.getUser().getFullNameEn())
                .titleAr(d.getTitleAr())
                .titleEn(d.getTitleEn())
                .consultationFee(d.getConsultationFee())
                .onlineFee(d.getOnlineFee())
                .ratingAvg(d.getRatingAvg())
                .ratingCount(d.getRatingCount())
                .acceptsOnline(d.isAcceptsOnline())
                .acceptsInClinic(d.isAcceptsInClinic())
                .profileImage(d.getUser().getProfileImage())
                .specialtyNames(names)
                .clinicId(d.getClinicId())
                .clinicNameAr(clinicName)
                .areaNameAr(areaName)
                .verified(d.isVerified())
                .yearsExperience(d.getYearsExperience())
                .build();
    }

    private DoctorDetailDto toDetail(Doctor d) {
        return DoctorDetailDto.builder()
                .id(d.getId())
                .fullNameAr(d.getUser().getFullNameAr())
                .fullNameEn(d.getUser().getFullNameEn())
                .titleAr(d.getTitleAr())
                .titleEn(d.getTitleEn())
                .bioAr(d.getBioAr())
                .bioEn(d.getBioEn())
                .yearsExperience(d.getYearsExperience())
                .consultationFee(d.getConsultationFee())
                .onlineFee(d.getOnlineFee())
                .ratingAvg(d.getRatingAvg())
                .ratingCount(d.getRatingCount())
                .acceptsOnline(d.isAcceptsOnline())
                .acceptsInClinic(d.isAcceptsInClinic())
                .profileImage(d.getUser().getProfileImage())
                .specialtyIds(doctorSpecialtyRepository.findByDoctorId(d.getId()).stream()
                        .map(ds -> ds.getSpecialtyId()).collect(Collectors.toList()))
                .branchIds(doctorBranchRepository.findByDoctorId(d.getId()).stream()
                        .map(db -> db.getBranchId()).collect(Collectors.toList()))
                .clinicId(d.getClinicId())
                .build();
    }
}
