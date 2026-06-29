package com.vzeeta.modules.payment.repository;

import com.vzeeta.modules.payment.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByPaymentId(Long paymentId);

    long countByInvoiceNumberStartingWith(String prefix);
}
