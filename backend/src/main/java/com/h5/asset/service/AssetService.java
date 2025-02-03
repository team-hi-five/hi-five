package com.h5.asset.service;

import com.h5.asset.dto.request.LoadAssetRequestDto;
import com.h5.asset.dto.request.LoadCardRequestDto;
import com.h5.asset.dto.response.LoadAssetResponseDto;
import com.h5.asset.dto.response.LoadCardResponseDto;

public interface AssetService {
    LoadAssetResponseDto loadAsset(LoadAssetRequestDto loadAssetRequestDto);

    LoadCardResponseDto loadCard(LoadCardRequestDto loadCardRequestDto);
}
