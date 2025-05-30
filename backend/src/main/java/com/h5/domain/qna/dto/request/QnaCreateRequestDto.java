package com.h5.domain.qna.dto.request;

import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaCreateRequestDto {
    private String title;
    private String content;
}
