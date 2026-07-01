package com.vzeeta.modules.superadmin.controller;

import com.vzeeta.modules.clinic.entity.Clinic;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.lookup.entity.Area;
import com.vzeeta.modules.lookup.entity.City;
import com.vzeeta.modules.permission.annotation.RequiresPermission;
import com.vzeeta.modules.payment.entity.Payment;
import com.vzeeta.modules.settings.entity.SystemSetting;
import com.vzeeta.modules.superadmin.service.SuperAdminService;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.shared.enums.PaymentStatus;
import com.vzeeta.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/super-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/clinics")
    @RequiresPermission(module = "clinics", action = "view")
    public ResponseEntity<ApiResponse<Page<Clinic>>> clinics(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listClinics(q, pageable)));
    }

    @PostMapping("/clinics")
    @RequiresPermission(module = "clinics", action = "edit")
    public ResponseEntity<ApiResponse<Clinic>> saveClinic(@RequestBody Clinic clinic) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.saveClinic(clinic)));
    }

    @GetMapping("/users")
    @RequiresPermission(module = "users", action = "view")
    public ResponseEntity<ApiResponse<Page<User>>> users(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listUsers(q, pageable)));
    }

    @PutMapping("/users/{id}")
    @RequiresPermission(module = "users", action = "edit")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @RequestBody User request) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.updateUser(id, request)));
    }

    @PostMapping("/doctors/{id}/verify")
    @RequiresPermission(module = "verification", action = "approve")
    public ResponseEntity<ApiResponse<Doctor>> verifyDoctor(@PathVariable Long id, @RequestParam boolean verified) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.verifyDoctor(id, verified)));
    }

    @GetMapping("/doctors")
    @RequiresPermission(module = "verification", action = "view")
    public ResponseEntity<ApiResponse<Page<Doctor>>> doctors(
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listDoctors(verified, q, pageable)));
    }

    @GetMapping("/cities")
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<City>>> cities() {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listCities()));
    }

    @PostMapping("/cities")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<City>> saveCity(@RequestBody City city) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.saveCity(city)));
    }

    @PostMapping("/areas")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<Area>> saveArea(@RequestBody Area area) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.saveArea(area)));
    }

    @GetMapping("/areas")
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<Area>>> areas(@RequestParam Long cityId) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listAreas(cityId)));
    }

    @GetMapping("/payments")
    @RequiresPermission(module = "payments", action = "view")
    public ResponseEntity<ApiResponse<Page<Payment>>> payments(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) PaymentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listPayments(q, status, pageable)));
    }

    @GetMapping("/settings")
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<Page<SystemSetting>>> settings(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.listSettings(q, pageable)));
    }

    @PutMapping("/settings/{key}")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(@PathVariable String key, @RequestParam String value) {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.updateSetting(key, value)));
    }

    @GetMapping("/dashboard")
    @RequiresPermission(module = "dashboard", action = "view")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(superAdminService.dashboard()));
    }
}
