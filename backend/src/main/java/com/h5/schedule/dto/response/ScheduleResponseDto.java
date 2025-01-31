package com.h5.schedule.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ScheduleResponseDto {
    private Integer scheduleId;
    private String schdlDttm;
    private String type;
    private String consultantName;
    private String childName;
    private String parentName;
    private String status;
}
