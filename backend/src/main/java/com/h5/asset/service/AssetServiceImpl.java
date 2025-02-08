package com.h5.asset.service;

import com.h5.asset.dto.request.LoadAssetByStageDto;
import com.h5.asset.dto.request.LoadAssetRequestDto;
import com.h5.asset.dto.request.LoadCardRequestDto;
import com.h5.asset.dto.response.*;
import com.h5.asset.entity.CardAssetEntity;
import com.h5.asset.entity.GameAssetEntity;
import com.h5.asset.repository.CardAssetRepository;
import com.h5.asset.repository.GameAssetRepository;
import com.h5.asset.repository.GameChapterRepository;
import com.h5.asset.repository.GameStageRepository;
import com.h5.child.entity.ChildUserEntity;
import com.h5.child.repository.ChildUserRepository;
import com.h5.global.exception.UserNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {
    private final ChildUserRepository childUserRepository;
    private final GameAssetRepository gameAssetRepository;
    private final CardAssetRepository cardAssetRepository;
    private final GameChapterRepository gameChapterRepository;
    private final GameStageRepository gameStageRepository;

    @Override
    @Transactional
    public LoadAssetResponseDto loadAsset(LoadAssetRequestDto loadAssetRequestDto) {
        ChildUserEntity childUserEntity = childUserRepository.findById(loadAssetRequestDto.getChildUserId())
                .orElseThrow(UserNotFoundException::new);
        int cleared = childUserEntity.getClearChapter();
        int chapter = cleared / 10;
        int stage = cleared % 10;

        if(stage == 6){
            chapter++;
            stage = 1;
        }else {
            stage++;
        }

        int stageAnswer = gameStageRepository.findCrtAnsByIdAndGameChapterId(stage, chapter);
        GameAssetEntity gameAssetEntity = gameAssetRepository.findGameAssetByChapterAndStage(chapter, stage)
                .orElseThrow(RuntimeException::new);

        return LoadAssetResponseDto.builder()
                .gameStageId(gameAssetEntity.getId())
                .chapterId(gameAssetEntity.getGameStageEntity().getGameChapterEntity().getId())
                .gameVideo(gameAssetEntity.getGameSceneVideo())
                .options(new String[]{gameAssetEntity.getOpt1(), gameAssetEntity.getOpt2(), gameAssetEntity.getOpt3()})
                .optionImages(new String[]{gameAssetEntity.getOptPic1(), gameAssetEntity.getOptPic2(), gameAssetEntity.getOptPic3()})
                .situation(gameAssetEntity.getSituation())
                .answer(stageAnswer-1)
                .build();
    }

    @Transactional
    @Override
    public LoadAssetResponseDto loadAssetByStage(LoadAssetByStageDto loadAssetByStageDto) {
        int stageNum = loadAssetByStageDto.getStageId();
        int chapter = stageNum / 10;
        int stage = stageNum % 10;

        if(stage == 6){
            chapter++;
            stage = 1;
        }else {
            stage++;
        }

        int stageAnswer = gameStageRepository.findCrtAnsByIdAndGameChapterId(stage, chapter);
        GameAssetEntity gameAssetEntity = gameAssetRepository.findGameAssetByChapterAndStage(chapter, stage)
                .orElseThrow(RuntimeException::new);

        return LoadAssetResponseDto.builder()
                .gameStageId(gameAssetEntity.getId())
                .chapterId(gameAssetEntity.getGameStageEntity().getGameChapterEntity().getId())
                .gameVideo(gameAssetEntity.getGameSceneVideo())
                .options(new String[]{gameAssetEntity.getOpt1(), gameAssetEntity.getOpt2(), gameAssetEntity.getOpt3()})
                .optionImages(new String[]{gameAssetEntity.getOptPic1(), gameAssetEntity.getOptPic2(), gameAssetEntity.getOptPic3()})
                .situation(gameAssetEntity.getSituation())
                .answer(stageAnswer-1)
                .build();
    }

    @Transactional
    @Override
    public LoadCardResponseDto loadCards(LoadCardRequestDto loadCardRequestDto) {
        ChildUserEntity childUserEntity = childUserRepository.findById(loadCardRequestDto.getChildId())
                .orElseThrow(UserNotFoundException::new);
        int cleared = childUserEntity.getClearChapter();
        int chapter = cleared / 10;
        int stage = cleared % 10;

        List<CardAssetEntity> cardAssetEntities = cardAssetRepository.findCardAssetByChapterAndStage(chapter, stage);

        List<CardAssetResponseDto> cardAssetList = cardAssetEntities.stream()
                .map(cardAssetEntity -> new CardAssetResponseDto(
                        cardAssetEntity.getGameStageEntity().getId(),
                        cardAssetEntity.getCardFront(),
                        cardAssetEntity.getCardBack()
                ))
                .toList();
        return LoadCardResponseDto.builder().cardAssetList(cardAssetList).build();
    }

    @Override
    public LoadChapterAssetResponseDto loadChapterAsset() {
        List<ChapterAssetResponseDto> chapterAssetResponseDtoList = gameChapterRepository.findAll().stream()
                .map(gameChapter -> ChapterAssetResponseDto.builder()
                        .gameChapterId(gameChapter.getId())
                        .title(gameChapter.getTitle())
                        .chapterPic(gameChapter.getChapterPic())
                        .build())
                .toList();

        return LoadChapterAssetResponseDto.builder()
                .chapterAssetDtoList(chapterAssetResponseDtoList)
                .build();
    }


}
