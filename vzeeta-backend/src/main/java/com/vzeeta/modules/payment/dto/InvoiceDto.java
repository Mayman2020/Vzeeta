package com.vzeeta.modules.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    private BigDecimal subtotal;
    private BigDecimal commission;
    private BigDecimal total;
    private LocalDateTime issuedAt;
}
