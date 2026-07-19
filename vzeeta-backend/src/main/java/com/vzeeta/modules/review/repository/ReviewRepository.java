package com.vzeeta.modules.review.repository;

import com.vzeeta.modules.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByAppointmentId(Long appointmentId);

    Page<Review> findByPatientId(Long patientId, Pageable pageable);

    Page<Review> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Review> findByClinicId(Long clinicId, Pageable pageable);
}
