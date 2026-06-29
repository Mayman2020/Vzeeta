package com.vzeeta.modules.lookup.service;

import com.vzeeta.modules.lookup.dto.CreateLookupRequest;
import com.vzeeta.modules.lookup.dto.LookupResponse;
import com.vzeeta.modules.lookup.dto.UpdateLookupRequest;
import com.vzeeta.modules.lookup.entity.Lookup;
import com.vzeeta.modules.lookup.entity.LookupType;
import com.vzeeta.modules.lookup.repository.LookupRepository;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LookupService {

    private final LookupRepository lookupRepository;

    public List<LookupResponse> getByType(LookupType type) {
        return lookupRepository.findByTypeAndActiveTrueOrderBySortOrderAscNameEnAsc(type)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<LookupResponse> getAllByType(LookupType type) {
        return lookupRepository.findByTypeOrderBySortOrderAscNameEnAsc(type)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LookupResponse create(CreateLookupRequest request) {
        LookupType type = request.getType();
        String code = request.getCode() != null && !request.getCode().isBlank()
                ? normalizeCode(request.getCode())
                : generateCode(type);
        if (lookupRepository.existsByTypeAndCodeIgnoreCase(type, code)) {
            throw AppException.conflict("Lookup code already exists: " + code);
        }
        Lookup item = Lookup.builder()
                .type(type)
                .code(code)
                .nameAr(request.getNameAr().trim())
                .nameEn(request.getNameEn().trim())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .active(true)
                .locked(false)
                .build();
        return toResponse(lookupRepository.save(item));
    }

    @Transactional
    public LookupResponse update(Long id, UpdateLookupRequest request) {
        Lookup item = lookupRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Lookup not found"));
        if (!item.isLocked()) {
            String code = normalizeCode(request.getCode());
            if (!code.equalsIgnoreCase(item.getCode())
                    && lookupRepository.existsByTypeAndCodeIgnoreCase(item.getType(), code)) {
                throw AppException.conflict("Lookup code already exists: " + code);
            }
            item.setCode(code);
        }
        item.setNameAr(request.getNameAr().trim());
        item.setNameEn(request.getNameEn().trim());
        item.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        item.setActive(request.isActive());
        return toResponse(lookupRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        Lookup item = lookupRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Lookup not found"));
        if (item.isLocked()) {
            throw AppException.badRequest("Cannot delete locked lookup");
        }
        lookupRepository.delete(item);
    }

    private LookupResponse toResponse(Lookup item) {
        return LookupResponse.builder()
                .id(item.getId())
                .type(item.getType())
                .code(item.getCode())
                .nameAr(item.getNameAr())
                .nameEn(item.getNameEn())
                .sortOrder(item.getSortOrder())
                .active(item.isActive())
                .locked(item.isLocked())
                .build();
    }

    private String generateCode(LookupType type) {
        String prefix = type.name().substring(0, Math.min(3, type.name().length()));
        long i = lookupRepository.countByType(type) + 1;
        String candidate;
        do {
            candidate = prefix + "-" + i++;
        } while (lookupRepository.existsByTypeAndCodeIgnoreCase(type, candidate));
        return candidate;
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }
}
