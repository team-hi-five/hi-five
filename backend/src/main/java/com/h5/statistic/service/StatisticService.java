package com.h5.statistic.service;

import com.h5.statistic.dto.data.PentagonAndStickDataDto;

import java.util.Map;

public interface StatisticService {

    Map<Integer, PentagonAndStickDataDto> dataAnalysis(int childUserId);

}
