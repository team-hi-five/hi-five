package com.h5.domain.asset.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CardAssetResponseDto {
    private int stageId;
    private String cardFront;
    private String cardBack;

}
