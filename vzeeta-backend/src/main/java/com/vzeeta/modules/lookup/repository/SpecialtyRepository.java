package com.vzeeta.modules.lookup.repository;

import com.vzeeta.modules.lookup.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {

    List<Specialty> findByActiveTrueOrderBySortOrderAsc();
}
