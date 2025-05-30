package com.h5.domain.game.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StartGameStageRequestDto {
    private int gameStageId;
    private int childGameChapterId;
}
