package com.h5.notice.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeDeleteRequestDto {
    private int Id;
    private String accessToken;
}
