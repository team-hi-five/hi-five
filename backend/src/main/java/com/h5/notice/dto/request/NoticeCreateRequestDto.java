package com.h5.notice.dto.request;

import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeCreateRequestDto {
    private String title;
    private String content;
    private String accessToken;
}
