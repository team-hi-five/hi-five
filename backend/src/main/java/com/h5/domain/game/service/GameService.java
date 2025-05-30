package com.h5.domain.game.service;

import com.h5.domain.game.dto.request.*;
import com.h5.game.dto.request.*;
import com.h5.domain.game.dto.response.EndGameChapterResponseDto;
import com.h5.domain.game.dto.response.SaveGameLogResponseDto;
import com.h5.domain.game.dto.response.StartGameChapterResponseDto;
import com.h5.domain.game.dto.response.StartGameStageResponseDto;

public interface GameService {

    StartGameChapterResponseDto startGameChapter(StartGameChapterRequsetDto startGameChapterRequsetDto);

    StartGameStageResponseDto startGameStage(StartGameStageRequestDto startGameStageRequestDto);

    EndGameChapterResponseDto endGameChapter(EndGameChapterRequestDto endGameChapterRequestDto);

    SaveGameLogResponseDto saveGameLog(SaveGameLogRequestDto saveGameLogRequestDto);

    int updateChildClearedStage(UpdateChildClearedStageRequestDto updateChildClearedStageRequestDto);

}
