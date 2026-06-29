package com.vzeeta.modules.publicapi.controller;

import com.vzeeta.modules.publicapi.dto.*;
import com.vzeeta.modules.publicapi.service.PublicService;
import com.vzeeta.shared.enums.ConsultationType;
import com.vzeeta.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse<List<LookupDto>>> specialties() {
        return ResponseEntity.ok(ApiResponse.ok(publicService.listSpecialties()));
    }

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<LookupDto>>> cities() {
        return ResponseEntity.ok(ApiResponse.ok(publicService.listCities()));
    }

    @GetMapping("/areas")
    public ResponseEntity<ApiResponse<List<LookupDto>>> areas(@RequestParam Long cityId) {
        return ResponseEntity.ok(ApiResponse.ok(publicService.listAreas(cityId)));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<Page<DoctorSummaryDto>>> doctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long specialty,
            @RequestParam(required = false) Long area,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) ConsultationType consultationType,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                publicService.searchDoctors(name, specialty, area, minPrice, maxPrice, minRating, consultationType, pageable)));
    }

    @GetMapping("/doctors/featured")
    public ResponseEntity<ApiResponse<List<DoctorSummaryDto>>> featuredDoctors() {
        return ResponseEntity.ok(ApiResponse.ok(publicService.listFeaturedDoctors()));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> doctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(publicService.getDoctor(id)));
    }

    @GetMapping("/doctors/{id}/slots")
    public ResponseEntity<ApiResponse<List<SlotDto>>> slots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ConsultationType consultationType) {
        return ResponseEntity.ok(ApiResponse.ok(
                publicService.getDoctorSlots(id, date, consultationType != null ? consultationType : ConsultationType.IN_CLINIC)));
    }
}
