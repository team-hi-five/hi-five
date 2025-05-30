package com.h5.domain.notification.controller;

import com.h5.domain.notification.dto.request.NotificationRequestDto;
import com.h5.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @MessageMapping("/send-notification")
    public void sendNotification(NotificationRequestDto notificationRequestDto) {

        notificationService.sendNotificationToUser(notificationRequestDto);
    }
}
