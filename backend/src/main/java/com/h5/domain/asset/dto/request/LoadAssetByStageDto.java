package com.h5.domain.asset.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoadAssetByStageDto {
    private int chapter;
    private int stage;
}
