package com.h5.notice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Pageable;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NoticeSearchRequestDto {
    private String keyword;
    private Pageable pageable;
}
