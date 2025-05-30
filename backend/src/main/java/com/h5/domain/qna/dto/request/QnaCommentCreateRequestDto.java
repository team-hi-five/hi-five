package com.h5.domain.qna.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QnaCommentCreateRequestDto {
    private int qnaId;
    private String content;
}
