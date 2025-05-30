package com.h5.domain.notification.service;

import com.h5.domain.notification.dto.request.NotificationRequestDto;

public interface NotificationService {
    void sendNotificationToUser(NotificationRequestDto notificationRequestDto);
}
