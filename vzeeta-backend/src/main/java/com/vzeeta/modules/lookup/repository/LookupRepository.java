package com.vzeeta.modules.lookup.repository;

import com.vzeeta.modules.lookup.entity.Lookup;
import com.vzeeta.modules.lookup.entity.LookupType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LookupRepository extends JpaRepository<Lookup, Long> {
    List<Lookup> findByTypeAndActiveTrueOrderBySortOrderAscNameEnAsc(LookupType type);
    List<Lookup> findByTypeOrderBySortOrderAscNameEnAsc(LookupType type);
    boolean existsByTypeAndCodeIgnoreCase(LookupType type, String code);
    long countByType(LookupType type);
}
