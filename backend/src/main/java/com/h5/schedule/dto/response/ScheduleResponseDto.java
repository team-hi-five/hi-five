package com.h5.schedule.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ScheduleResponseDto {
    private Integer scheduleId;
    private LocalDateTime schdlDttm;
    private String type;
    private String consultantName;
    private String childName;
    private String parentName;
    private String status;
}
