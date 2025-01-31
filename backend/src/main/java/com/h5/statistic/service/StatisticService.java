package com.h5.statistic.service;

import com.h5.statistic.dto.response.DataAnalysisResponseDto;
import com.h5.statistic.dto.response.GetChatbotResponseDto;
import com.h5.statistic.dto.response.GetDatesResponseDto;
import com.h5.statistic.dto.response.GetGameVideoLengthResponseDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface StatisticService {

    Map<Integer, DataAnalysisResponseDto> dataAnalysis(int childUserId);

    GetDatesResponseDto getChatbotDates(int childUserId, int year, int month);

    GetDatesResponseDto getGameVideoDates(int childUserId, int year, int month);

    GetChatbotResponseDto getChatbot(int childUserId, LocalDate date);

    List<GetGameVideoLengthResponseDto> getGameVideoLength(int childUserId, LocalDate date, int stageId);



}
