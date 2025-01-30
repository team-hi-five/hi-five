package com.h5.schedule.dto.request;

import lombok.*;

@Getter
@Builder
public class ScheduleSearchByParentRequestDto {
    private Integer parentId; // 학부모 ID
}
