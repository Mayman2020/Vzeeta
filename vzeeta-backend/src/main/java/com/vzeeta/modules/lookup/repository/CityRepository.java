package com.vzeeta.modules.lookup.repository;

import com.vzeeta.modules.lookup.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    List<City> findByActiveTrueOrderByNameAr();
}
