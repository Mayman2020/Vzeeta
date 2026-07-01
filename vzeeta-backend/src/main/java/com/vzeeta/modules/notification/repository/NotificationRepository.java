package com.vzeeta.modules.notification.repository;

import com.vzeeta.modules.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            Long userId, java.time.LocalDateTime createdAtMinInclusive, Pageable pageable);

    Page<Notification> findByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(
            Long userId, java.time.LocalDateTime createdAtBefore, Pageable pageable);

    long countByUserIdAndReadFlagFalse(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Notification n SET n.readFlag = true WHERE n.userId = :userId AND n.readFlag = false")
    int markAllReadForUser(@Param("userId") Long userId);

    boolean existsByTypeAndReferenceId(String type, Long referenceId);

    boolean existsByTypeAndReferenceIdAndUserId(String type, Long referenceId, Long userId);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.userId = :userId
            AND n.createdAt >= :cutoff
            AND (:q = '' OR LOWER(COALESCE(n.titleAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.titleEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.bodyAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.bodyEn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> searchByUserIdSince(
            @Param("userId") Long userId,
            @Param("q") String q,
            @Param("cutoff") java.time.LocalDateTime cutoff,
            Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.userId = :userId
            AND n.createdAt < :cutoff
            AND (:q = '' OR LOWER(COALESCE(n.titleAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.titleEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.bodyAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.bodyEn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> searchByUserIdBefore(
            @Param("userId") Long userId,
            @Param("q") String q,
            @Param("cutoff") java.time.LocalDateTime cutoff,
            Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.userId = :userId
            AND (:q = '' OR LOWER(COALESCE(n.titleAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.titleEn, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.bodyAr, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(COALESCE(n.bodyEn, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> searchByUserId(@Param("userId") Long userId, @Param("q") String q, Pageable pageable);
}
