package com.h5.notice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NoticeSearchRequestDto {
    private String keyword;
    private int pageNumber = 0;
    private int pageSize = 10;

}
