package com.h5.domain.notification.dto.request;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequestDto {
    private String targetUser;
    private String message;
}
