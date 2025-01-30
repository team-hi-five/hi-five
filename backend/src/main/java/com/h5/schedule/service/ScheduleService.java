package com.h5.schedule.service;

import com.h5.schedule.dto.request.*;
import com.h5.schedule.dto.response.ScheduleResponseDto;
import java.util.List;

public interface ScheduleService {
    /** 날짜 별 상담 일정 조회 (상담사) */
    List<ScheduleResponseDto> getSchedulesByDate(ScheduleSearchByDateRequestDto scheduleSearchByDateRequestDto);

    /** 아동 이름으로 해당 아동의 상담이 있는 날짜 가져오기 */
    List<String> getScheduleDatesByChildId(ScheduleSearchByChildRequestDto scheduleSearchByChildRequestDto);

    /** 아동 이름으로 해당 아동의 상담 스케줄 조회 */
    List<ScheduleResponseDto> getSchedulesByChildId(ScheduleSearchByChildRequestDto scheduleSearchByChildRequestDto);

    /** 날짜 별 비어있는 시간대 조회 */
    List<String> getAvailableTimes(ScheduleAvailableTimeRequestDto scheduleAvailableTimeRequestDto);

    /** 스케줄 생성 */
    void createSchedule(ScheduleSaveRequestDto scheduleSaveRequestDto);

    /** 스케줄 수정 */
    void updateSchedule(ScheduleSaveRequestDto scheduleSaveRequestDto);

    /** 스케줄 삭제 */
    void deleteSchedule(ScheduleDeleteRequestDto scheduleDeleteRequestDto );

    /** 학부모가 자신의 아동의 상담 일정을 조회 */
    List<ScheduleResponseDto> getSchedulesByParentId(ScheduleSearchByParentRequestDto scheduleSearchByParentRequestDto);
}
