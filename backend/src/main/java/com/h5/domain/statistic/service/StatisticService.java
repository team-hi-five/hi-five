package com.h5.domain.statistic.service;

import com.h5.domain.statistic.dto.response.DataAnalysisResponseDto;
import com.h5.domain.statistic.dto.response.GetGameVideoDatesResponseDto;
import com.h5.domain.statistic.dto.response.GetGameVideoLengthResponseDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface StatisticService {

    Map<Integer, DataAnalysisResponseDto> dataAnalysis(int childUserId);

    GetGameVideoDatesResponseDto getGameVideoDates(int childUserId, int year, int month);

    List<GetGameVideoLengthResponseDto> getGameVideoLength(int childUserId, LocalDate date, int stageId);



}
