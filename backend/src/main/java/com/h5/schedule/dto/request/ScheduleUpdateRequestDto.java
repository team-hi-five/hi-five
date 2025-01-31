package com.h5.schedule.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScheduleUpdateRequestDto {
    private Integer scheduleId;
    private Integer childId;
    private String schdlDttm;
    private String type;
}
