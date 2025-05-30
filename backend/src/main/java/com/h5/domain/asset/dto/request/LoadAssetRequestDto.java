package com.h5.domain.asset.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadAssetRequestDto {
    private int childUserId;
}
