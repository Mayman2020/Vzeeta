package com.vzeeta.modules.user.repository;

import com.vzeeta.modules.user.entity.User;
import com.vzeeta.shared.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<User> findByRole(UserRole role, Pageable pageable);

    @Query("""
            SELECT u FROM User u
            WHERE (:q = '' OR LOWER(u.fullNameAr) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(u.fullNameEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(u.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<User> search(@Param("q") String q, Pageable pageable);
}
