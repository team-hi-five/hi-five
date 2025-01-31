package com.h5.schedule.dto.request;

import lombok.*;

@Getter
@Builder
public class ScheduleSearchByParentRequestDto {
    private String date;  // yyyy-MM-dd 형식의 날짜
}
