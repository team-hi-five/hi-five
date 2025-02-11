package com.h5.game.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.service.annotation.GetExchange;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StartGameChapterRequsetDto {
    private int childUserId;
    private int gameChapterId;
    private String startDttm;
}
