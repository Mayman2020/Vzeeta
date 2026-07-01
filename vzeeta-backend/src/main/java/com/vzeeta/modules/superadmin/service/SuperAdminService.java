package com.vzeeta.modules.superadmin.service;

import com.vzeeta.modules.clinic.entity.Clinic;
import com.vzeeta.modules.clinic.repository.ClinicRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.lookup.entity.Area;
import com.vzeeta.modules.lookup.entity.City;
import com.vzeeta.modules.lookup.repository.AreaRepository;
import com.vzeeta.modules.lookup.repository.CityRepository;
import com.vzeeta.modules.payment.entity.Payment;
import com.vzeeta.modules.payment.repository.PaymentRepository;
import com.vzeeta.shared.enums.PaymentStatus;
import com.vzeeta.modules.settings.entity.SystemSetting;
import com.vzeeta.modules.settings.repository.SystemSettingRepository;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final CityRepository cityRepository;
    private final AreaRepository areaRepository;
    private final PaymentRepository paymentRepository;
    private final SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public Page<Clinic> listClinics(String q, Pageable pageable) {
        return clinicRepository.search(normalizeQ(q), pageable);
    }

    @Transactional
    public Clinic saveClinic(Clinic clinic) {
        return clinicRepository.save(clinic);
    }

    @Transactional(readOnly = true)
    public Page<User> listUsers(String q, Pageable pageable) {
        return userRepository.search(normalizeQ(q), pageable);
    }

    @Transactional
    public User updateUser(Long id, User update) {
        User user = userRepository.findById(id).orElseThrow(() -> AppException.notFound("User not found"));
        if (update.isActive() != user.isActive()) user.setActive(update.isActive());
        if (update.getFullNameAr() != null) user.setFullNameAr(update.getFullNameAr());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<Doctor> listDoctors(Boolean verified, String q, Pageable pageable) {
        return doctorRepository.search(verified, normalizeQ(q), pageable);
    }

    @Transactional
    public Doctor verifyDoctor(Long doctorId, boolean verified) {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> AppException.notFound("Doctor not found"));
        doctor.setVerified(verified);
        return doctorRepository.save(doctor);
    }

    @Transactional
    public City saveCity(City city) {
        return cityRepository.save(city);
    }

    @Transactional
    public Area saveArea(Area area) {
        return areaRepository.save(area);
    }

    @Transactional(readOnly = true)
    public List<Area> listAreas(Long cityId) {
        return areaRepository.findByCityIdAndActiveTrueOrderByNameAr(cityId);
    }

    @Transactional(readOnly = true)
    public List<City> listCities() {
        return cityRepository.findByActiveTrueOrderByNameAr();
    }

    @Transactional(readOnly = true)
    public Page<Payment> listPayments(String q, PaymentStatus status, Pageable pageable) {
        return paymentRepository.search(normalizeQ(q), status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<SystemSetting> listSettings(String q, Pageable pageable) {
        return systemSettingRepository.search(normalizeQ(q), pageable);
    }

    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> AppException.notFound("Setting not found"));
        setting.setSettingValue(value);
        return systemSettingRepository.save(setting);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("userCount", userRepository.count());
        data.put("clinicCount", clinicRepository.count());
        data.put("doctorCount", doctorRepository.count());
        data.put("paymentCount", paymentRepository.count());
        data.put("unverifiedDoctorCount", doctorRepository.countByVerified(false));
        return data;
    }

    private static String normalizeQ(String q) {
        return (q == null || q.isBlank()) ? "" : q.trim();
    }
}
