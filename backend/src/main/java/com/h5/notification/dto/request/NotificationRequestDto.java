package com.h5.notification.dto.request;

import lombok.*;

@Setter
@Getter
@RequiredArgsConstructor
@NoArgsConstructor
public class NotificationRequestDto {
    private String targetUser;
    private String message;
}
