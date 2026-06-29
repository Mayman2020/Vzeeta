package com.vzeeta.modules.payment.controller;

import com.vzeeta.modules.payment.dto.CreatePaymentRequest;
import com.vzeeta.modules.payment.dto.PaymentResponseDto;
import com.vzeeta.modules.payment.service.PaymentService;
import com.vzeeta.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT','CLINIC_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> create(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.createPayment(request)));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','CLINIC_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> byAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getByAppointment(appointmentId)));
    }
}
