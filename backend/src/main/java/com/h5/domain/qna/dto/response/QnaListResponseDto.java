package com.h5.domain.qna.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaListResponseDto {
    private List<QnaResponseDto> qnaList;
    private PaginationResponseDto pagination;
}
