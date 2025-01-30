package com.h5.qna.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaResponseDto {
    private int id;
    private String title;
    private String parentUserEmail;
    private int viewCnt;
    private String createDttm;
}
