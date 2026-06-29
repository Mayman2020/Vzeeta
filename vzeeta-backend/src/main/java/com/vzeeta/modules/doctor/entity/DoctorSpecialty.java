package com.vzeeta.modules.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "doctor_specialties", schema = "vzeeta_mgmt")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@IdClass(DoctorSpecialty.DoctorSpecialtyId.class)
public class DoctorSpecialty {

    @Id @Column(name = "doctor_id") private Long doctorId;
    @Id @Column(name = "specialty_id") private Long specialtyId;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DoctorSpecialtyId implements Serializable {
        private Long doctorId;
        private Long specialtyId;
    }
}
