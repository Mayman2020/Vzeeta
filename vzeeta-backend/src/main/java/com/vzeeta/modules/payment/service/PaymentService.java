package com.vzeeta.modules.payment.service;

import com.vzeeta.modules.appointment.entity.Appointment;
import com.vzeeta.modules.appointment.repository.AppointmentRepository;
import com.vzeeta.modules.payment.dto.CreatePaymentRequest;
import com.vzeeta.modules.payment.dto.InvoiceDto;
import com.vzeeta.modules.payment.dto.PaymentResponseDto;
import com.vzeeta.modules.payment.entity.Invoice;
import com.vzeeta.modules.payment.entity.Payment;
import com.vzeeta.modules.payment.repository.InvoiceRepository;
import com.vzeeta.modules.payment.repository.PaymentRepository;
import com.vzeeta.modules.settings.repository.SystemSettingRepository;
import com.vzeeta.shared.enums.PaymentMethod;
import com.vzeeta.shared.enums.PaymentStatus;
import com.vzeeta.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final SystemSettingRepository systemSettingRepository;

    @Value("${vzeeta.platform-commission-percent:10}")
    private BigDecimal defaultCommissionPercent;

    @Transactional
    public PaymentResponseDto createPayment(CreatePaymentRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> AppException.notFound("Appointment not found"));

        paymentRepository.findByAppointmentId(appointment.getId()).ifPresent(p -> {
            throw AppException.conflict("Payment already exists for appointment");
        });

        BigDecimal amount = appointment.getFeeAmount() != null ? appointment.getFeeAmount() : BigDecimal.ZERO;
        BigDecimal commissionPercent = systemSettingRepository.findBySettingKey("platform_commission_percent")
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElse(defaultCommissionPercent);
        BigDecimal commission = amount.multiply(commissionPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        PaymentStatus status = request.getPaymentMethod() == PaymentMethod.CASH
                ? PaymentStatus.PAID : PaymentStatus.PENDING;

        Payment payment = Payment.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatientId())
                .amount(amount)
                .commission(commission)
                .paymentMethod(request.getPaymentMethod())
                .status(status)
                .transactionRef(request.getTransactionRef())
                .paidAt(status == PaymentStatus.PAID ? LocalDateTime.now() : null)
                .build();
        payment = paymentRepository.save(payment);

        Invoice invoice = createInvoice(payment, appointment, amount, commission);
        return toResponse(payment, invoice);
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getByAppointment(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> AppException.notFound("Payment not found"));
        Invoice invoice = invoiceRepository.findByPaymentId(payment.getId()).orElse(null);
        return toResponse(payment, invoice);
    }

    private Invoice createInvoice(Payment payment, Appointment appointment, BigDecimal subtotal, BigDecimal commission) {
        int year = Year.now().getValue();
        String prefix = "INV-" + year + "-";
        long count = invoiceRepository.countByInvoiceNumberStartingWith(prefix);
        String invoiceNumber = prefix + String.format("%05d", count + 1);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .paymentId(payment.getId())
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatientId())
                .subtotal(subtotal)
                .commission(commission)
                .total(subtotal)
                .issuedAt(LocalDateTime.now())
                .build();
        return invoiceRepository.save(invoice);
    }

    private PaymentResponseDto toResponse(Payment payment, Invoice invoice) {
        InvoiceDto invoiceDto = invoice == null ? null : InvoiceDto.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .subtotal(invoice.getSubtotal())
                .commission(invoice.getCommission())
                .total(invoice.getTotal())
                .issuedAt(invoice.getIssuedAt())
                .build();

        return PaymentResponseDto.builder()
                .id(payment.getId())
                .appointmentId(payment.getAppointmentId())
                .amount(payment.getAmount())
                .commission(payment.getCommission())
                .status(payment.getStatus().name())
                .paymentMethod(payment.getPaymentMethod().name())
                .paidAt(payment.getPaidAt())
                .invoice(invoiceDto)
                .build();
    }
}
