package com.h5.consultant.dto.response;

import io.jsonwebtoken.JwtParserBuilder;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MyProfileResponseDto {
    private String name;
    private String phone;
    private String email;
    private String centerName;
    private String centerPhone;

}
