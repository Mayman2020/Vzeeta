package com.vzeeta.modules.favorite.repository;

import com.vzeeta.modules.favorite.entity.FavoriteDoctor;
import com.vzeeta.modules.favorite.entity.FavoriteDoctor.FavoriteDoctorId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteDoctorRepository extends JpaRepository<FavoriteDoctor, FavoriteDoctorId> {

    List<FavoriteDoctor> findByPatientId(Long patientId);

    boolean existsByPatientIdAndDoctorId(Long patientId, Long doctorId);
}
