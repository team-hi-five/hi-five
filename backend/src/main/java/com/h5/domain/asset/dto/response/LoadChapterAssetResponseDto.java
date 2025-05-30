package com.h5.domain.asset.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadChapterAssetResponseDto {
    private List<ChapterAssetResponseDto> chapterAssetDtoList;
    private int limit;
}
