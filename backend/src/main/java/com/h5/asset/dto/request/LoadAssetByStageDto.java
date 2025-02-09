package com.h5.asset.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoadAssetByStageDto {
    private int chapter;
    private int stage;
}
