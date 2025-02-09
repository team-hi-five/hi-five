package com.h5.game.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SaveGameLogRequestDto {
    private String childId;
    private int stage;
    private int selectedOption;
    private boolean corrected;
    private LocalDateTime submitDttm;
    private boolean consulted;

    private GameAiLogDto gameAiLog;
}
