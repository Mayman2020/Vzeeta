package com.vzeeta.modules.lookup.controller;

import com.vzeeta.modules.lookup.dto.CreateLookupRequest;
import com.vzeeta.modules.lookup.dto.LookupResponse;
import com.vzeeta.modules.lookup.dto.UpdateLookupRequest;
import com.vzeeta.modules.lookup.entity.LookupType;
import com.vzeeta.modules.lookup.service.LookupService;
import com.vzeeta.modules.permission.annotation.RequiresPermission;
import com.vzeeta.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/lookups")
@RequiredArgsConstructor
public class LookupController {

    private final LookupService lookupService;

    @GetMapping("/by-type")
    public ResponseEntity<ApiResponse<List<LookupResponse>>> getByType(@RequestParam LookupType type) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.getByType(type)));
    }

    @GetMapping("/admin/by-type")
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<LookupResponse>>> getAllByType(@RequestParam LookupType type) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.getAllByType(type)));
    }

    @PostMapping
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<LookupResponse>> create(@Valid @RequestBody CreateLookupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(lookupService.create(request)));
    }

    @PutMapping("/{id}")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<LookupResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLookupRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        lookupService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
