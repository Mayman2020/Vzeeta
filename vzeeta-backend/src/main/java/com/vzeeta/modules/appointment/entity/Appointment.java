package com.vzeeta.modules.appointment.entity;

import com.vzeeta.shared.enums.AppointmentStatus;
import com.vzeeta.shared.enums.ConsultationType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments", schema = "vzeeta_mgmt",
        uniqueConstraints = @UniqueConstraint(name = "appointments_unique_slot",
                columnNames = {"doctor_id", "appointment_date", "start_time"}))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "appointment_number", nullable = false, unique = true) private String appointmentNumber;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(name = "clinic_id") private Long clinicId;
    @Column(name = "branch_id") private Long branchId;
    @Column(name = "specialty_id") private Long specialtyId;
    @Column(name = "appointment_date", nullable = false) private LocalDate appointmentDate;
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @Enumerated(EnumType.STRING) @Column(name = "consultation_type") private ConsultationType consultationType;
    @Enumerated(EnumType.STRING) private AppointmentStatus status;
    private String notes;
    @Column(name = "doctor_notes") private String doctorNotes;
    @Column(name = "fee_amount") private BigDecimal feeAmount;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    @CreatedBy @Column(name = "created_by") private Long createdBy;
    @LastModifiedBy @Column(name = "updated_by") private Long updatedBy;
}
