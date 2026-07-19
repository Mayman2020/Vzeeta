package com.vzeeta.modules.subscription.repository;

import com.vzeeta.modules.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    List<SubscriptionPlan> findByActiveTrueOrderBySortOrderAsc();

    List<SubscriptionPlan> findAllByOrderBySortOrderAsc();
}
