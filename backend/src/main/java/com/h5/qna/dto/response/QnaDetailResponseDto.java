package com.h5.qna.dto.response;

import com.h5.qna.entity.QnaAnswerEntity;
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
    private String parentUserEmail;
    private String createDttm;
    private int viewCnt;

    private QnaAnswerResponseDto qnaAnswerResponseDto;
}
