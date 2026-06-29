package com.vzeeta.modules.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "doctor_branches", schema = "vzeeta_mgmt")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@IdClass(DoctorBranch.DoctorBranchId.class)
public class DoctorBranch {

    @Id @Column(name = "doctor_id") private Long doctorId;
    @Id @Column(name = "branch_id") private Long branchId;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DoctorBranchId implements Serializable {
        private Long doctorId;
        private Long branchId;
    }
}
