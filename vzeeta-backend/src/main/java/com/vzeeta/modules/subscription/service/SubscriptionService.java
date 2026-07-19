package com.vzeeta.modules.subscription.service;

import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.subscription.dto.GrantTrialRequest;
import com.vzeeta.modules.subscription.dto.SubmitSubscriptionPaymentRequest;
import com.vzeeta.modules.subscription.entity.ClinicSubscription;
import com.vzeeta.modules.subscription.entity.SubscriptionPlan;
import com.vzeeta.modules.subscription.repository.ClinicSubscriptionRepository;
import com.vzeeta.modules.subscription.repository.SubscriptionPlanRepository;
import com.vzeeta.shared.enums.BillingCycle;
import com.vzeeta.shared.enums.ClinicSubscriptionPaymentMethod;
import com.vzeeta.shared.enums.ClinicSubscriptionStatus;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final ClinicSubscriptionRepository clinicSubscriptionRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<SubscriptionPlan> listActivePlans() {
        return planRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlan> listAllPlans() {
        return planRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public SubscriptionPlan savePlan(SubscriptionPlan plan) {
        return planRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public Optional<ClinicSubscription> getCurrent(Long clinicId) {
        return clinicSubscriptionRepository.findCurrent(clinicId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public boolean isActive(Long clinicId) {
        return getCurrent(clinicId).isPresent();
    }

    @Transactional(readOnly = true)
    public Page<ClinicSubscription> getHistory(Long clinicId, Pageable pageable) {
        return clinicSubscriptionRepository.findByClinicIdOrderByCreatedAtDesc(clinicId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<ClinicSubscription> listAll(Pageable pageable) {
        return clinicSubscriptionRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<ClinicSubscription> listByStatus(ClinicSubscriptionStatus status, Pageable pageable) {
        return clinicSubscriptionRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }

    @Transactional(readOnly = true)
    public long countVerifiedDoctors(Long clinicId) {
        return doctorRepository.countByClinicIdAndVerifiedTrue(clinicId);
    }

    /** Any charge (fresh plan choice or a mid-cycle top-up) still awaiting the clinic's payment. */
    @Transactional(readOnly = true)
    public Optional<ClinicSubscription> getPendingCharge(Long clinicId) {
        return clinicSubscriptionRepository.findFirstByClinicIdAndStatusOrderByCreatedAtDesc(clinicId, ClinicSubscriptionStatus.PENDING_PAYMENT);
    }

    @Transactional
    public ClinicSubscription submitPayment(Long clinicId, SubmitSubscriptionPaymentRequest request) {
        if (clinicSubscriptionRepository.existsByClinicIdAndStatus(clinicId, ClinicSubscriptionStatus.PENDING_APPROVAL)) {
            throw AppException.conflict("A payment is already pending approval for this clinic");
        }
        ClinicSubscriptionPaymentMethod method = request.getPaymentMethod() == null
                ? ClinicSubscriptionPaymentMethod.RECEIPT_UPLOAD
                : request.getPaymentMethod();
        if (method == ClinicSubscriptionPaymentMethod.RECEIPT_UPLOAD
                && (request.getReceiptUrl() == null || request.getReceiptUrl().isBlank())) {
            throw AppException.badRequest("receiptUrl is required for receipt uploads");
        }

        if (request.getSubscriptionId() != null) {
            // Paying an existing mid-cycle top-up charge (created when a new doctor got verified).
            ClinicSubscription topup = clinicSubscriptionRepository.findById(request.getSubscriptionId())
                    .orElseThrow(() -> AppException.notFound("Subscription charge not found"));
            if (!topup.getClinicId().equals(clinicId) || topup.getStatus() != ClinicSubscriptionStatus.PENDING_PAYMENT) {
                throw AppException.badRequest("This charge is not awaiting payment");
            }
            topup.setStatus(ClinicSubscriptionStatus.PENDING_APPROVAL);
            topup.setPaymentMethod(method);
            topup.setReceiptUrl(request.getReceiptUrl());
            return clinicSubscriptionRepository.save(topup);
        }

        // Fresh plan choice (new subscription or renewal): price = per-doctor rate x verified doctor count.
        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> AppException.notFound("Plan not found"));
        long doctorCount = countVerifiedDoctors(clinicId);
        ClinicSubscription subscription = ClinicSubscription.builder()
                .clinicId(clinicId)
                .planId(plan.getId())
                .status(ClinicSubscriptionStatus.PENDING_APPROVAL)
                .paymentMethod(method)
                .receiptUrl(request.getReceiptUrl())
                .amount(plan.getPrice().multiply(BigDecimal.valueOf(doctorCount)))
                .doctorCount((int) doctorCount)
                .freeTrial(false)
                .build();
        return clinicSubscriptionRepository.save(subscription);
    }

    @Transactional
    public ClinicSubscription approve(Long id, Long adminUserId) {
        ClinicSubscription subscription = clinicSubscriptionRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Subscription request not found"));
        if (subscription.getStatus() != ClinicSubscriptionStatus.PENDING_APPROVAL) {
            throw AppException.badRequest("Only pending requests can be approved");
        }
        // At most one row is ever ACTIVE per clinic. A top-up charge (for a newly verified doctor)
        // merges into that row (same period, cumulative amount); a fresh choice/renewal supersedes it.
        List<ClinicSubscription> currentlyActive = clinicSubscriptionRepository
                .findCurrentActive(subscription.getClinicId(), LocalDate.now());

        if (subscription.isTopUp() && !currentlyActive.isEmpty()) {
            ClinicSubscription base = currentlyActive.get(0);
            BigDecimal cumulativeAmount = (base.getAmount() != null ? base.getAmount() : BigDecimal.ZERO)
                    .add(subscription.getAmount() != null ? subscription.getAmount() : BigDecimal.ZERO);
            subscription.setAmount(cumulativeAmount);
            subscription.setStartDate(base.getStartDate());
            subscription.setEndDate(base.getEndDate());
        } else {
            SubscriptionPlan plan = planRepository.findById(subscription.getPlanId())
                    .orElseThrow(() -> AppException.notFound("Plan not found"));
            LocalDate start = LocalDate.now();
            LocalDate end = plan.getBillingCycle() == BillingCycle.YEARLY ? start.plusYears(1) : start.plusMonths(1);
            subscription.setStartDate(start);
            subscription.setEndDate(end);
        }
        for (ClinicSubscription superseded : currentlyActive) {
            superseded.setStatus(ClinicSubscriptionStatus.CANCELLED);
            clinicSubscriptionRepository.save(superseded);
        }
        subscription.setStatus(ClinicSubscriptionStatus.ACTIVE);
        subscription.setReviewedBy(adminUserId);
        subscription.setReviewedAt(LocalDateTime.now());
        return clinicSubscriptionRepository.save(subscription);
    }

    /**
     * Called right after a doctor is verified. If the clinic is on an ACTIVE paid plan and this
     * pushes the verified doctor count above what was last billed, a new per-doctor charge is
     * created immediately (must be paid before it becomes ACTIVE via the normal approval flow).
     * Removing/un-verifying a doctor is intentionally NOT refunded mid-cycle — the lower count
     * only takes effect on the next renewal's price calculation.
     */
    @Transactional
    public void onDoctorVerified(Long clinicId) {
        if (clinicId == null) return;
        Optional<ClinicSubscription> currentOpt = clinicSubscriptionRepository.findCurrent(clinicId, LocalDate.now());
        if (currentOpt.isEmpty()) return;
        ClinicSubscription current = currentOpt.get();
        if (current.getPlanId() == null || current.isFreeTrial()) return; // free trials aren't metered
        if (clinicSubscriptionRepository.existsByClinicIdAndStatus(clinicId, ClinicSubscriptionStatus.PENDING_PAYMENT)
                || clinicSubscriptionRepository.existsByClinicIdAndStatus(clinicId, ClinicSubscriptionStatus.PENDING_APPROVAL)) {
            return; // a charge is already awaiting payment/review
        }
        long verifiedCount = countVerifiedDoctors(clinicId);
        int billedCount = current.getDoctorCount() != null ? current.getDoctorCount() : 0;
        if (verifiedCount <= billedCount) return;

        SubscriptionPlan plan = planRepository.findById(current.getPlanId()).orElse(null);
        if (plan == null) return;
        long extraDoctors = verifiedCount - billedCount;
        ClinicSubscription topup = ClinicSubscription.builder()
                .clinicId(clinicId)
                .planId(plan.getId())
                .status(ClinicSubscriptionStatus.PENDING_PAYMENT)
                .paymentMethod(ClinicSubscriptionPaymentMethod.RECEIPT_UPLOAD)
                .amount(plan.getPrice().multiply(BigDecimal.valueOf(extraDoctors)))
                .doctorCount((int) verifiedCount)
                .freeTrial(false)
                .topUp(true)
                .build();
        clinicSubscriptionRepository.save(topup);
    }

    @Transactional
    public ClinicSubscription reject(Long id, Long adminUserId, String reason) {
        ClinicSubscription subscription = clinicSubscriptionRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Subscription request not found"));
        if (subscription.getStatus() != ClinicSubscriptionStatus.PENDING_APPROVAL) {
            throw AppException.badRequest("Only pending requests can be rejected");
        }
        subscription.setStatus(ClinicSubscriptionStatus.REJECTED);
        subscription.setRejectionReason(reason);
        subscription.setReviewedBy(adminUserId);
        subscription.setReviewedAt(LocalDateTime.now());
        return clinicSubscriptionRepository.save(subscription);
    }

    @Transactional
    public ClinicSubscription grantTrial(Long clinicId, GrantTrialRequest request, Long adminUserId) {
        int months = request.getMonths();
        if (months < 1 || months > 12) {
            throw AppException.badRequest("Trial length must be between 1 and 12 months");
        }
        for (ClinicSubscription superseded : clinicSubscriptionRepository.findCurrentActive(clinicId, LocalDate.now())) {
            superseded.setStatus(ClinicSubscriptionStatus.CANCELLED);
            clinicSubscriptionRepository.save(superseded);
        }
        LocalDate start = LocalDate.now();
        ClinicSubscription subscription = ClinicSubscription.builder()
                .clinicId(clinicId)
                .planId(null)
                .status(ClinicSubscriptionStatus.ACTIVE)
                .paymentMethod(ClinicSubscriptionPaymentMethod.ADMIN_GRANT)
                .amount(java.math.BigDecimal.ZERO)
                .startDate(start)
                .endDate(start.plusMonths(months))
                .freeTrial(true)
                .reviewedBy(adminUserId)
                .reviewedAt(LocalDateTime.now())
                .build();
        return clinicSubscriptionRepository.save(subscription);
    }
}
