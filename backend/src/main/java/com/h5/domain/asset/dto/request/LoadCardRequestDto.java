package com.h5.domain.asset.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoadCardRequestDto {
    private int childUserId;
}