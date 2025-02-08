package com.h5.asset.service;

import com.h5.asset.dto.request.LoadAssetByStageDto;
import com.h5.asset.dto.request.LoadAssetRequestDto;
import com.h5.asset.dto.request.LoadCardRequestDto;
import com.h5.asset.dto.response.LoadAssetResponseDto;
import com.h5.asset.dto.response.LoadCardResponseDto;
import com.h5.asset.dto.response.LoadChapterAssetResponseDto;

public interface AssetService {
    LoadAssetResponseDto loadAsset(LoadAssetRequestDto loadAssetRequestDto);

    LoadAssetResponseDto loadAssetByStage(LoadAssetByStageDto loadAssetByStageDto);

    LoadCardResponseDto loadCards(LoadCardRequestDto loadCardRequestDto);

    LoadChapterAssetResponseDto loadChapterAsset();
}
