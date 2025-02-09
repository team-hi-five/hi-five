package com.h5.asset.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoadAssetByStageDto {
    private int chapter;
    private int stage;
}
