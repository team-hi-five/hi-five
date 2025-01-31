package com.h5.schedule.dto.request;

import lombok.*;

@Getter
@Builder
public class ScheduleAvailableTimeRequestDto {
    private Integer consultantId;
    private String date; // YYYY-MM-DD 형식의 날짜
}
