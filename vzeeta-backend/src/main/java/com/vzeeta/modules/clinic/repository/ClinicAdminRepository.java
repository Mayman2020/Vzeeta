package com.vzeeta.modules.clinic.repository;

import com.vzeeta.modules.clinic.entity.ClinicAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClinicAdminRepository extends JpaRepository<ClinicAdmin, Long> {

    Optional<ClinicAdmin> findByUserId(Long userId);
}
