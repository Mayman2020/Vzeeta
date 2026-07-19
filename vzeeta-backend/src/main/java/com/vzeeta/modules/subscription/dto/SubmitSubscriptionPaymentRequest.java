package com.vzeeta.modules.subscription.dto;

import com.vzeeta.shared.enums.ClinicSubscriptionPaymentMethod;
import lombok.Data;

@Data
public class SubmitSubscriptionPaymentRequest {
    private Long planId;
    private ClinicSubscriptionPaymentMethod paymentMethod;
    private String receiptUrl;
    /** When paying an existing PENDING_PAYMENT top-up charge instead of choosing a fresh plan. */
    private Long subscriptionId;
}
