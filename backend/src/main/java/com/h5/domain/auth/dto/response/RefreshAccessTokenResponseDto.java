package com.h5.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RefreshAccessTokenResponseDto {
    private String accessToken;
}
