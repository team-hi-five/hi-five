package com.h5.domain.parent.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MyChildrenResponseDto {
    private int childUserId;
    private String childUserName;
}
