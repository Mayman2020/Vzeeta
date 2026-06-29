package com.vzeeta.modules.doctor.repository;

import com.vzeeta.modules.doctor.entity.DoctorSpecialty;
import com.vzeeta.modules.doctor.entity.DoctorSpecialty.DoctorSpecialtyId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorSpecialtyRepository extends JpaRepository<DoctorSpecialty, DoctorSpecialtyId> {

    List<DoctorSpecialty> findByDoctorId(Long doctorId);
}
