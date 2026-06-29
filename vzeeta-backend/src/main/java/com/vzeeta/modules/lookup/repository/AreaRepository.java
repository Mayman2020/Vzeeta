package com.vzeeta.modules.lookup.repository;

import com.vzeeta.modules.lookup.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AreaRepository extends JpaRepository<Area, Long> {

    List<Area> findByCityIdAndActiveTrueOrderByNameAr(Long cityId);
}
