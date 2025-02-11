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
import java.util.Comparator;
import java.util.List;
import java.util.OptionalInt;
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

        childGameStageRepository
                .findAllByChildGameChapterEntity_Id(endGameChapterRequestDto.getChildGameChapterId())
                .orElseThrow(() -> new GameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND))
                .forEach(childGameStageEntity ->
                        updateStatistic(childGameChapterEntity.getChildUserEntity().getId(), childGameStageEntity.getId()));

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

    private void updateStatistic(int childUserId, int childGameStageId) {
        ChildGameStageEntity childGameStage = childGameStageRepository.findById(childGameStageId)
                .orElseThrow(() -> new GameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND));
        int gameStageId = childGameStage.getId();
        int childGameChapterId = childGameStage.getChildGameChapterEntity().getId();

        GameStageEntity gameStage = gameStageRepository.findById(gameStageId)
                .orElseThrow(() -> new GameNotFoundException("Game stage not found", HttpStatus.NOT_FOUND));
        int emotionId = gameStage.getId();

        StatisticEntity statisticEntity = statisticRepository
                .findByEmotionEntity_IdAndChildUserEntity_Id(emotionId, childUserId)
                .orElseThrow(() -> new StatisticNotFoundException("Statistic not found", HttpStatus.NOT_FOUND));

        ChildGameChapterEntity childGameChapter = childGameChapterRepository.findById(childGameChapterId)
                .orElseThrow(() -> new GameNotFoundException("Child game chapter not found", HttpStatus.NOT_FOUND));
        LocalDateTime startDttm = childGameChapter.getStartDttm();
        LocalDateTime endDttm = childGameChapter.getEndDttm();
        int gameChapterId = childGameChapter.getGameChapterEntity().getId();

        List<GameLogEntity> gameLogEntityList = gameLogRepository
                .findAllByChildUserEntity_IdAndGameStageEntity_IdAndSubmitDttmBetween(childUserId, childGameChapterId, startDttm, endDttm)
                .orElseThrow(() -> new GameLogNotFoundException("Game log not found", HttpStatus.NOT_FOUND))
                .stream()
                .sorted(Comparator.comparing(GameLogEntity::getSubmitDttm))
                .toList();

        OptionalInt firstCorrectIndex = IntStream.range(0, gameLogEntityList.size())
                .filter(i -> gameLogEntityList.get(i).getCorrected())
                .findFirst();
        boolean isCrt = firstCorrectIndex.isPresent();
        int whenCrt = firstCorrectIndex.orElse(gameLogEntityList.size()) + 1;

        statisticEntity.setTrialCnt(statisticEntity.getTrialCnt() + gameLogEntityList.size());
        if (isCrt) {
            statisticEntity.setCrtCnt(statisticEntity.getCrtCnt() + 1);
        }
        statisticEntity.setRating((int) (statisticEntity.getRating() + (1.0 / whenCrt) * BASIC_SCORE));

        StatisticEntity updatedStatistic = switch (gameChapterId) {
            case 1 -> StatisticEntity.builder()
                    .id(statisticEntity.getId())
                    .stageTryCnt1(statisticEntity.getStageTryCnt1() + gameLogEntityList.size())
                    .stageCrtCnt1(statisticEntity.getStageCrtCnt1() + (isCrt ? 1 : 0))
                    .stageCrtRate1(calculateRate(
                            statisticEntity.getStageCrtCnt1() + (isCrt ? 1 : 0),
                            statisticEntity.getStageTryCnt1() + gameLogEntityList.size()))
                    .build();
            case 2 -> StatisticEntity.builder()
                    .id(statisticEntity.getId())
                    .stageTryCnt2(statisticEntity.getStageTryCnt2() + gameLogEntityList.size())
                    .stageCrtCnt2(statisticEntity.getStageCrtCnt2() + (isCrt ? 1 : 0))
                    .stageCrtRate2(calculateRate(
                            statisticEntity.getStageCrtCnt2() + (isCrt ? 1 : 0),
                            statisticEntity.getStageTryCnt2() + gameLogEntityList.size()))
                    .build();
            case 3 -> StatisticEntity.builder()
                    .id(statisticEntity.getId())
                    .stageTryCnt3(statisticEntity.getStageTryCnt3() + gameLogEntityList.size())
                    .stageCrtCnt3(statisticEntity.getStageCrtCnt3() + (isCrt ? 1 : 0))
                    .stageCrtRate3(calculateRate(
                            statisticEntity.getStageCrtCnt3() + (isCrt ? 1 : 0),
                            statisticEntity.getStageTryCnt3() + gameLogEntityList.size()))
                    .build();
            case 4 -> StatisticEntity.builder()
                    .id(statisticEntity.getId())
                    .stageTryCnt4(statisticEntity.getStageTryCnt4() + gameLogEntityList.size())
                    .stageCrtCnt4(statisticEntity.getStageCrtCnt4() + (isCrt ? 1 : 0))
                    .stageCrtRate4(calculateRate(
                            statisticEntity.getStageCrtCnt4() + (isCrt ? 1 : 0),
                            statisticEntity.getStageTryCnt4() + gameLogEntityList.size()))
                    .build();
            case 5 -> StatisticEntity.builder()
                    .id(statisticEntity.getId())
                    .stageTryCnt5(statisticEntity.getStageTryCnt5() + gameLogEntityList.size())
                    .stageCrtCnt5(statisticEntity.getStageCrtCnt5() + (isCrt ? 1 : 0))
                    .stageCrtRate5(calculateRate(
                            statisticEntity.getStageCrtCnt5() + (isCrt ? 1 : 0),
                            statisticEntity.getStageTryCnt5() + gameLogEntityList.size()))
                    .build();
            default -> statisticEntity;
        };

        statisticRepository.save(updatedStatistic);
    }

    private BigDecimal calculateRate(int correctCount, int tryCount) {
        if (tryCount == 0) {
            return BigDecimal.ZERO;
        }
        double rate = ((double) correctCount / tryCount) * 100;
        return BigDecimal.valueOf(rate);
    }

}
