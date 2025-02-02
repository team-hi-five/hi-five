package com.h5.qna.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaSearchRequestDto {
    private String keyword;
    private int pageNumber = 0;
    private int pageSize = 10;
}
