package com.h5.statistic.controller;

import com.h5.statistic.dto.request.DataAnalysisRequestDto;
import com.h5.statistic.service.StatisticService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/statistic")
public class StatisticController {

    private final StatisticService statisticService;

    @Autowired
    public StatisticController(StatisticService statisticService) {
        this.statisticService = statisticService;
    }

    @GetMapping("/data-analysis")
    public ResponseEntity<?> dataAnalysis(@Valid @RequestParam int childUserId) {
        return ResponseEntity.ok(statisticService.dataAnalysis(childUserId));
    }

    @GetMapping("/get-dates/chatbot")
    public ResponseEntity<?> getChatbotDates(@Valid @RequestParam int childUserId,
                                             @Valid @RequestParam int year,
                                             @Valid @RequestParam int month) {
        return ResponseEntity.ok(statisticService.getChatbotDates(childUserId, year, month));
    }

    @GetMapping("/get-dates/video")
    public ResponseEntity<?> getGameVideoDates(@Valid @RequestParam int childUserId,
                                               @Valid @RequestParam int year,
                                               @Valid @RequestParam int month) {
        return ResponseEntity.ok(statisticService.getGameVideoDates(childUserId, year, month));
    }

    @GetMapping("/get-chatbot")
    public ResponseEntity<?> getChatbot(@Valid @RequestParam int childUserId,
                                        @Valid @RequestParam LocalDate date) {
        return ResponseEntity.ok(statisticService.getChatbot(childUserId, date));
    }

    @GetMapping("/get-videos-length")
    public ResponseEntity<?> getGameVideosLength(@Valid @RequestParam int childUserId,
                                                 @Valid @RequestParam LocalDate date,
                                                 @Valid @RequestParam int stageId) {
        return ResponseEntity.ok(statisticService.getGameVideoLength(childUserId, date, stageId));
    }

}
