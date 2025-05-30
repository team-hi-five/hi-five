package com.h5.domain.consultant.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RegisterParentAccountResponseDto {
    private int parentUserId;
    private int childUserId;
}
