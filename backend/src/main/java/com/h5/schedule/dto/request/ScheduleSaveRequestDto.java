package com.h5.schedule.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScheduleSaveRequestDto {
    private Integer scheduleId;
    private Integer consultantId;
    private Integer childId;
    private String schdlDttm;
    private String type;
}
