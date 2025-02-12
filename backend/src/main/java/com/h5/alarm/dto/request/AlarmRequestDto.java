package com.h5.alarm.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlarmRequestDto {
    private int toUserId;
    private int senderUserId;
    private String senderRole;
    private String sessionType;
}
