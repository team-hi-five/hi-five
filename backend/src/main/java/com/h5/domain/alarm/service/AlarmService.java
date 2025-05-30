package com.h5.domain.alarm.service;

import com.h5.domain.alarm.dto.request.AlarmRequestDto;

public interface AlarmService {
    void sendAlarm(AlarmRequestDto alarmRequestDto);
}
