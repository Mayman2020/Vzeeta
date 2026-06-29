package com.vzeeta.modules.payment.dto;

import com.vzeeta.shared.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreatePaymentRequest {

    @NotNull private Long appointmentId;
    @NotNull private PaymentMethod paymentMethod;
    private String transactionRef;
}
