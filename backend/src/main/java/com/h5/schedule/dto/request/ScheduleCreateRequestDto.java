package com.h5.schedule.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScheduleCreateRequestDto {
    private Integer scheduleId;
    private Integer childId;
    private Integer parentId;
    private String schdlDttm;
    private String type;
}
