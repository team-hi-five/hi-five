package com.h5.game.service;

import com.h5.asset.entity.GameStageEntity;
import com.h5.asset.repository.GameChapterRepository;
import com.h5.asset.repository.GameStageRepository;
import com.h5.child.repository.ChildUserRepository;
import com.h5.game.dto.request.EndGameChapterRequestDto;
import com.h5.game.dto.request.SaveGameLogRequestDto;
import com.h5.game.dto.request.StartGameChapterRequsetDto;
import com.h5.game.dto.request.StartGameStageRequestDto;
import com.h5.game.dto.response.EndGameChapterResponseDto;
import com.h5.game.dto.response.SaveGameLogResponseDto;
import com.h5.game.dto.response.StartGameChapterResponseDto;
import com.h5.game.dto.response.StartGameStageResponseDto;
import com.h5.game.entity.AiLogEntity;
import com.h5.game.entity.ChildGameChapterEntity;
import com.h5.game.entity.ChildGameStageEntity;
import com.h5.game.entity.GameLogEntity;
import com.h5.game.repository.AiLogRepository;
import com.h5.game.repository.ChildGameChapterRepository;
import com.h5.game.repository.ChildGameStageRepository;
import com.h5.game.repository.GameLogRepository;
import com.h5.global.exception.GameLogNotFoundException;
import com.h5.global.exception.GameNotFoundException;
import com.h5.global.exception.StatisticNotFoundException;
import com.h5.global.exception.UserNotFoundException;
import com.h5.statistic.entity.StatisticEntity;
import com.h5.statistic.repository.StatisticRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class GameServiceImpl implements GameService {

    private final AiLogRepository aiLogRepository;
    private final ChildGameChapterRepository childGameChapterRepository;
    private final ChildGameStageRepository childGameStageRepository;
    private final GameLogRepository gameLogRepository;
    private final ChildUserRepository childUserRepository;
    private final GameChapterRepository gameChapterRepository;
    private final GameStageRepository gameStageRepository;
    private final StatisticRepository statisticRepository;

    private final int BASIC_SCORE = 100;

    @Transactional
    @Override
    public StartGameChapterResponseDto startGameChapter(StartGameChapterRequsetDto startGameChapterRequsetDto) {
        return StartGameChapterResponseDto.builder()
                .childGameChapterId(childGameChapterRepository.save(ChildGameChapterEntity.builder()
                        .childUserEntity(childUserRepository.findById(startGameChapterRequsetDto.getChildUserId())
                                .orElseThrow(UserNotFoundException::new))
                        .gameChapterEntity(gameChapterRepository.findById(startGameChapterRequsetDto.getGameChapterId())
                                .orElseThrow(() -> new GameNotFoundException("Game chapter not found", HttpStatus.NOT_FOUND)))
                        .startDttm(LocalDateTime.now())
                        .build())
                        .getId())
                .build();
    }

    @Transactional
    @Override
    public StartGameStageResponseDto startGameStage(StartGameStageRequestDto startGameStageRequestDto) {
        return StartGameStageResponseDto.builder()
                .childGameStageId(childGameStageRepository.save(ChildGameStageEntity.builder()
                                .gameStageEntity(gameStageRepository.findById(startGameStageRequestDto.getGameStageId())
                                        .orElseThrow(() -> new GameNotFoundException("Game stage not found", HttpStatus.NOT_FOUND)))
                                .childGameChapterEntity(childGameChapterRepository.findById(startGameStageRequestDto.getChildGameChapterId())
                                        .orElseThrow(() -> new GameNotFoundException("Child game chapter not found", HttpStatus.NOT_FOUND)))
                        .build())
                        .getId())
                .build();
    }

    @Transactional
    @Override
    public EndGameChapterResponseDto endGameChapter(EndGameChapterRequestDto endGameChapterRequestDto) {
        ChildGameChapterEntity childGameChapterEntity = childGameChapterRepository.findById(endGameChapterRequestDto.getChildGameChapterId())
                .orElseThrow(() -> new GameNotFoundException("Entity not found", HttpStatus.NOT_FOUND));
        childGameChapterEntity.setEndDttm(LocalDateTime.now());
        childGameChapterRepository.save(childGameChapterEntity);

        updateAnalytics(childGameChapterEntity);

        return EndGameChapterResponseDto.builder()
                .childGameChapterId(childGameChapterEntity.getId())
                .build();
    }

    @Transactional
    @Override
    public SaveGameLogResponseDto saveGameLog(SaveGameLogRequestDto saveGameLogRequestDto) {

        GameLogEntity gameLogEntity = gameLogRepository.save(GameLogEntity.builder()
                .selectedOpt(saveGameLogRequestDto.getSelectedOption())
                .corrected(saveGameLogRequestDto.isCorrected())
                .submitDttm(saveGameLogRequestDto.getSubmitDttm())
                .consulted(saveGameLogRequestDto.isConsulted())
                .childGameStageEntity(childGameStageRepository.findById(saveGameLogRequestDto.getChildGameStageId())
                        .orElseThrow(() -> new GameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND)))
                .childUserEntity(childUserRepository.findById(saveGameLogRequestDto.getChildUserId())
                        .orElseThrow(UserNotFoundException::new))
                .gameStageEntity(gameStageRepository.findById(saveGameLogRequestDto.getGameStageId())
                        .orElseThrow(() -> new GameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND)))
                .build());

        AiLogEntity aiLogEntity = aiLogRepository.save(AiLogEntity.builder()
                .gameLogEntity(gameLogEntity)
                .fHappy(saveGameLogRequestDto.getFHappy())
                .fAnger(saveGameLogRequestDto.getFAnger())
                .fSad(saveGameLogRequestDto.getFSad())
                .fPanic(saveGameLogRequestDto.getFPanic())
                .fFear(saveGameLogRequestDto.getFFear())
                .tHappy(saveGameLogRequestDto.getTHappy())
                .tAnger(saveGameLogRequestDto.getTAnger())
                .tSad(saveGameLogRequestDto.getTSad())
                .tPanic(saveGameLogRequestDto.getTPanic())
                .tFear(saveGameLogRequestDto.getTFear())
                .stt(saveGameLogRequestDto.getStt())
                .aiAnalyze(saveGameLogRequestDto.getAiAnalysis())
                .build());

        return SaveGameLogResponseDto.builder()
                .gameLogId(gameLogEntity.getId())
                .aiLogId(aiLogEntity.getId())
                .build();
    }

    private void updateAnalytics(ChildGameChapterEntity chapter) {
        List<ChildGameStageEntity> childStages = childGameStageRepository
                .findAllByChildGameChapterEntity_Id(chapter.getId())
                .orElseThrow(() -> new GameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND));

        // 자식 스테이지들을 게임 스테이지 ID 기준으로 그룹화(같은 게임 스테이지에 대해 중복 업데이트 방지)
        Map<Integer, List<ChildGameStageEntity>> stagesGroupedByGameStageId = childStages.stream()
                .collect(Collectors.groupingBy(cs -> cs.getGameStageEntity().getId()));

        int childUserId = chapter.getChildUserEntity().getId();
        LocalDateTime startDttm = chapter.getStartDttm();
        LocalDateTime endDttm = chapter.getEndDttm();
        int gameChapterId = chapter.getGameChapterEntity().getId();

        // 각 게임 스테이지 그룹별로 통계 업데이트
        for (Map.Entry<Integer, List<ChildGameStageEntity>> entry : stagesGroupedByGameStageId.entrySet()) {
            int gameStageId = entry.getKey();
            updateStatisticForGameStage(childUserId, gameStageId, startDttm, endDttm, gameChapterId);
        }
    }

    private void updateStatisticForGameStage(int childUserId, int gameStageId, LocalDateTime startDttm,
                                             LocalDateTime endDttm, int gameChapterId) {

        GameStageEntity gameStage = gameStageRepository.findById(gameStageId)
                .orElseThrow(() -> new GameNotFoundException("Game stage not found", HttpStatus.NOT_FOUND));
        int emotionId = gameStage.getEmotionEntity().getId();

        List<GameLogEntity> gameLogs = gameLogRepository
                .findAllByChildUserEntity_IdAndGameStageEntity_IdAndSubmitDttmBetween(
                        childUserId, gameStageId, startDttm, endDttm)
                .orElse(Collections.emptyList());
        gameLogs.sort(Comparator.comparing(GameLogEntity::getSubmitDttm));

        OptionalInt firstCorrectIndex = IntStream.range(0, gameLogs.size())
                .filter(i -> gameLogs.get(i).getCorrected())
                .findFirst();
        boolean isCorrect = firstCorrectIndex.isPresent();
        int whenCorrect = firstCorrectIndex.orElse(gameLogs.size()) + 1;

        StatisticEntity statistic = statisticRepository
                .findByEmotionEntity_IdAndChildUserEntity_Id(emotionId, childUserId)
                .orElseThrow(() -> new StatisticNotFoundException("Statistic not found", HttpStatus.NOT_FOUND));

        int logCount = gameLogs.size();
        statistic.setTrialCnt(statistic.getTrialCnt() + logCount);
        if (isCorrect) {
            statistic.setCrtCnt(statistic.getCrtCnt() + 1);
        }

        double scoreIncrement = (whenCorrect < 3 ? (1.0 / whenCorrect) * BASIC_SCORE : 0.0);
        statistic.setRating((int) (statistic.getRating() + scoreIncrement));

        switch (gameChapterId) {
            case 1:
                statistic.setStageTryCnt1(statistic.getStageTryCnt1() + logCount);
                statistic.setStageCrtCnt1(statistic.getStageCrtCnt1() + (isCorrect ? 1 : 0));
                statistic.setStageCrtRate1(calculateRate(statistic.getStageCrtCnt1(), statistic.getStageTryCnt1()));
                break;
            case 2:
                statistic.setStageTryCnt2(statistic.getStageTryCnt2() + logCount);
                statistic.setStageCrtCnt2(statistic.getStageCrtCnt2() + (isCorrect ? 1 : 0));
                statistic.setStageCrtRate2(calculateRate(statistic.getStageCrtCnt2(), statistic.getStageTryCnt2()));
                break;
            case 3:
                statistic.setStageTryCnt3(statistic.getStageTryCnt3() + logCount);
                statistic.setStageCrtCnt3(statistic.getStageCrtCnt3() + (isCorrect ? 1 : 0));
                statistic.setStageCrtRate3(calculateRate(statistic.getStageCrtCnt3(), statistic.getStageTryCnt3()));
                break;
            case 4:
                statistic.setStageTryCnt4(statistic.getStageTryCnt4() + logCount);
                statistic.setStageCrtCnt4(statistic.getStageCrtCnt4() + (isCorrect ? 1 : 0));
                statistic.setStageCrtRate4(calculateRate(statistic.getStageCrtCnt4(), statistic.getStageTryCnt4()));
                break;
            case 5:
                statistic.setStageTryCnt5(statistic.getStageTryCnt5() + logCount);
                statistic.setStageCrtCnt5(statistic.getStageCrtCnt5() + (isCorrect ? 1 : 0));
                statistic.setStageCrtRate5(calculateRate(statistic.getStageCrtCnt5(), statistic.getStageTryCnt5()));
                break;
            default:
                break;
        }

        statisticRepository.save(statistic);
    }

    private BigDecimal calculateRate(int correctCount, int tryCount) {
        if (tryCount == 0) {
            return BigDecimal.ZERO;
        }
        double rate = ((double) correctCount / tryCount) * 100;
        return BigDecimal.valueOf(rate);
    }

}
