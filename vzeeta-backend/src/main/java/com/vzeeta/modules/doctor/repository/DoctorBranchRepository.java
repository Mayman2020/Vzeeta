package com.vzeeta.modules.doctor.repository;

import com.vzeeta.modules.doctor.entity.DoctorBranch;
import com.vzeeta.modules.doctor.entity.DoctorBranch.DoctorBranchId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorBranchRepository extends JpaRepository<DoctorBranch, DoctorBranchId> {

    List<DoctorBranch> findByDoctorId(Long doctorId);
}
