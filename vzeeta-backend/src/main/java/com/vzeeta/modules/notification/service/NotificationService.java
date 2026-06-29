package com.vzeeta.modules.notification.service;

import com.vzeeta.modules.notification.entity.Notification;
import com.vzeeta.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void notifyUser(Long userId, String type, String titleAr, String titleEn,
                           String bodyAr, String bodyEn, String referenceType, Long referenceId) {
        notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .titleAr(titleAr)
                .titleEn(titleEn)
                .bodyAr(bodyAr)
                .bodyEn(bodyEn)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .readFlag(false)
                .build());
    }
}
