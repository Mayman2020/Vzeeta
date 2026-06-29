package com.vzeeta.modules.favorite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_doctors", schema = "vzeeta_mgmt")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@IdClass(FavoriteDoctor.FavoriteDoctorId.class)
public class FavoriteDoctor {

    @Id @Column(name = "patient_id") private Long patientId;
    @Id @Column(name = "doctor_id") private Long doctorId;
    @Column(name = "created_at") private LocalDateTime createdAt;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class FavoriteDoctorId implements Serializable {
        private Long patientId;
        private Long doctorId;
    }
}
