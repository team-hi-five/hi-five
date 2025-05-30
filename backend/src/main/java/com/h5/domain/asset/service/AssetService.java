package com.h5.domain.asset.service;

import com.h5.domain.asset.dto.request.LoadAssetByStageDto;
import com.h5.domain.asset.dto.request.LoadAssetRequestDto;
import com.h5.domain.asset.dto.request.LoadCardRequestDto;
import com.h5.domain.asset.dto.request.LoadStudyAssetRequestDto;
import com.h5.domain.asset.dto.response.GetStageResponseDto;
import com.h5.domain.asset.dto.response.LoadAssetResponseDto;
import com.h5.domain.asset.dto.response.LoadCardResponseDto;
import com.h5.domain.asset.dto.response.LoadChapterAssetResponseDto;

import java.util.List;

public interface AssetService {
    LoadAssetResponseDto loadAsset(LoadAssetRequestDto loadAssetRequestDto);

    LoadAssetResponseDto loadAssetByStage(LoadAssetByStageDto loadAssetByStageDto);

    LoadCardResponseDto loadCards(LoadCardRequestDto loadCardRequestDto);

    LoadChapterAssetResponseDto loadChapterAsset(LoadAssetRequestDto loadAssetRequestDto);

    List<LoadAssetResponseDto> loadStudyAsset(LoadStudyAssetRequestDto loadStudyAssetRequestDto);

    GetStageResponseDto getStage(int childId);
}
