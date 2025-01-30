package com.h5.statistic.controller;

import com.h5.statistic.dto.request.DataAnalysisRequestDto;
import com.h5.statistic.service.StatisticService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/statistic")
public class StatisticController {

    private final StatisticService statisticService;

    @Autowired
    public StatisticController(StatisticService statisticService) {
        this.statisticService = statisticService;
    }

    @PostMapping("/data-analysis")
    public ResponseEntity<?> dataAnalysis(@Valid @RequestBody DataAnalysisRequestDto dataAnalysisRequestDto) {
        return null;
    }
}
