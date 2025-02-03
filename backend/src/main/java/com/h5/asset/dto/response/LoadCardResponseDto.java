package com.h5.asset.dto.response;

import com.h5.asset.entity.CardAssetEntity;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoadCardResponseDto {
    List<CardAssetEntity> cardAssetEntities;
}
