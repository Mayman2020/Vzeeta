package com.vzeeta.modules.prescription.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_items", schema = "vzeeta_mgmt")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false) private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    @Column(name = "sort_order") private Integer sortOrder;
}
