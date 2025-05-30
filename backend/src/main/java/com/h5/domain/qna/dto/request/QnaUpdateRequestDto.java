package com.h5.domain.qna.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaUpdateRequestDto {
    private int id;
    private String title;
    private String content;
}
