package com.vzeeta.modules.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponseDto {
    private Long id;
    private Long appointmentId;
    private BigDecimal amount;
    private BigDecimal commission;
    private String status;
    private String paymentMethod;
    private LocalDateTime paidAt;
    private InvoiceDto invoice;
}
