package com.h5.qna.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QnaCommentCreateRequestDto {
    private int qnaId;
    private String content;
}
