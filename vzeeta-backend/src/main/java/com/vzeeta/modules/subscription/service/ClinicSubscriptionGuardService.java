package com.vzeeta.modules.subscription.service;

import com.vzeeta.modules.subscription.repository.ClinicSubscriptionRepository;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ClinicSubscriptionGuardService {

    private final ClinicSubscriptionRepository clinicSubscriptionRepository;

    @Transactional(readOnly = true)
    public void assertActive(Long clinicId) {
        boolean active = !clinicSubscriptionRepository.findCurrentActive(clinicId, LocalDate.now()).isEmpty();
        if (!active) {
            throw new AppException(
                    "Clinic subscription is not active. Please renew your subscription to continue.",
                    HttpStatus.FORBIDDEN,
                    "SUBSCRIPTION_INACTIVE");
        }
    }
}
