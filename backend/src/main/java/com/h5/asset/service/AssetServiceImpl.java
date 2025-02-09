package com.h5.asset.service;

import com.h5.asset.dto.request.LoadAssetByStageDto;
import com.h5.asset.dto.request.LoadAssetRequestDto;
import com.h5.asset.dto.request.LoadCardRequestDto;
import com.h5.asset.dto.request.LoadStudyAssetRequestDto;
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
        int chapter = (cleared / 5) + 1;
        int stage = cleared % 5;

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
        int chapter = loadAssetByStageDto.getChapter();
        int stage = loadAssetByStageDto.getStage();

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
        int chapter = (cleared / 5) + 1;
        int stage = cleared % 5;

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
    public LoadChapterAssetResponseDto loadChapterAsset(LoadAssetRequestDto loadAssetRequestDto) {
        int childId = loadAssetRequestDto.getChildUserId();
        int limit = childUserRepository.findById(childId).orElseThrow(UserNotFoundException::new).getClearChapter() / 5 + 1;

        List<ChapterAssetResponseDto> chapterAssetResponseDtoList = gameChapterRepository.findAll().stream()
                .map(gameChapter -> ChapterAssetResponseDto.builder()
                        .gameChapterId(gameChapter.getId())
                        .title(gameChapter.getTitle())
                        .chapterPic(gameChapter.getChapterPic())
                        .build())
                .toList();

        return LoadChapterAssetResponseDto.builder()
                .chapterAssetDtoList(chapterAssetResponseDtoList)
                .limit(limit)
                .build();
    }

    @Override
    public List<LoadAssetResponseDto> loadStudyAsset(LoadStudyAssetRequestDto loadStudyAssetRequestDto) {
        int chapter = loadStudyAssetRequestDto.getChapterId();
        Integer first = (chapter - 1) * 5;
        Integer last = (chapter + 1) * 5 + 4;

        List<GameAssetEntity> gameAssetEntities = gameAssetRepository.findByIdBetween(first, last);

        return gameAssetEntities.stream()
                .map(this::convertToDto) // 변환 메서드 호출
                .toList(); // List<LoadAssetResponseDto> 변환
    }

    private LoadAssetResponseDto convertToDto(GameAssetEntity entity) {
        return LoadAssetResponseDto.builder()
                .gameStageId(entity.getId()) // ID 설정
                .chapterId(entity.getGameStageEntity().getGameChapterEntity().getId()) // 연관 엔티티 접근
                .gameVideo(entity.getGameSceneVideo()) // 비디오 URL 설정
                .options(new String[]{entity.getOpt1(), entity.getOpt2(), entity.getOpt3()}) // 옵션 배열 변환
                .optionImages(new String[]{entity.getOptPic1(), entity.getOptPic2(), entity.getOptPic3()}) // 옵션 이미지 배열 변환
                .situation(entity.getSituation()) // 상황 설명
                .answer(0) // 정답 필드 (필요하면 로직 추가)
                .build();
    }


}
