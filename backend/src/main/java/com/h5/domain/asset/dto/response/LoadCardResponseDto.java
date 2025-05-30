package com.h5.domain.asset.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoadCardResponseDto {
    List<CardAssetResponseDto> cardAssetList;
}
