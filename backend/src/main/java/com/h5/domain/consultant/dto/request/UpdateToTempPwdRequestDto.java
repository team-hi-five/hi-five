package com.h5.domain.consultant.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateToTempPwdRequestDto {
    private String name;
    private String email;
}
