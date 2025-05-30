package com.h5.domain.asset.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChapterAssetResponseDto {
    private int gameChapterId;
    private String title;
    private String chapterPic;
}
