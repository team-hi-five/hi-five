package com.h5.statistic.dto.response;

import lombok.Builder;
import lombok.Setter;

@Setter
@Builder
public class GetGameVideoLengthResponseDto {
    private int tryIndex;
    private int gameLogId;
}
