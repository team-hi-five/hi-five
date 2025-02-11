package com.h5.game.service;

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
import com.h5.global.exception.ChildGameNotFoundException;
import com.h5.global.exception.UserNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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

    @Transactional
    @Override
    public StartGameChapterResponseDto startGameChapter(StartGameChapterRequsetDto startGameChapterRequsetDto) {
        return StartGameChapterResponseDto.builder()
                .childGameChapterId(childGameChapterRepository.save(ChildGameChapterEntity.builder()
                        .childUserEntity(childUserRepository.findById(startGameChapterRequsetDto.getChildUserId())
                                .orElseThrow(UserNotFoundException::new))
                        .gameChapterEntity(gameChapterRepository.findById(startGameChapterRequsetDto.getGameChapterId())
                                .orElseThrow(() -> new ChildGameNotFoundException("Game chapter not found", HttpStatus.NOT_FOUND)))
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
                                        .orElseThrow(() -> new ChildGameNotFoundException("Game stage nof found", HttpStatus.NOT_FOUND)))
                                .childGameChapterEntity(childGameChapterRepository.findById(startGameStageRequestDto.getChildGameChapterId())
                                        .orElseThrow(() -> new ChildGameNotFoundException("Child game chapter not found", HttpStatus.NOT_FOUND)))
                        .build())
                        .getId())
                .build();
    }

    @Transactional
    @Override
    public EndGameChapterResponseDto endGameChapter(EndGameChapterRequestDto endGameChapterRequestDto) {
        ChildGameChapterEntity childGameChapterEntity = childGameChapterRepository.findById(endGameChapterRequestDto.getChildGameChapterId())
                .orElseThrow(() -> new ChildGameNotFoundException("Entity not found", HttpStatus.NOT_FOUND));
        childGameChapterEntity.setEndDttm(LocalDateTime.now());
        childGameChapterRepository.save(childGameChapterEntity);
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
                        .orElseThrow(() -> new ChildGameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND)))
                .childUserEntity(childUserRepository.findById(saveGameLogRequestDto.getChildUserId())
                        .orElseThrow(UserNotFoundException::new))
                .gameStageEntity(gameStageRepository.findById(saveGameLogRequestDto.getGameStageId())
                        .orElseThrow(() -> new ChildGameNotFoundException("Child game stage not found", HttpStatus.NOT_FOUND)))
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
}
