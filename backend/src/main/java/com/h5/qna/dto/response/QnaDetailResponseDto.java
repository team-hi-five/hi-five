package com.h5.qna.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaDetailResponseDto {
    private int id;
    private String title;
    private String content;
    private String name;
    private String createDttm;
    private int viewCnt;

    private QnaAnswerResponseDto qnaAnswerResponseDto;
}
