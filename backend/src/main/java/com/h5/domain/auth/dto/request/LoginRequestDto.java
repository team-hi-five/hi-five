package com.h5.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "로그인 요청 DTO")
public class LoginRequestDto {

    @Schema(description = "로그인에 사용하는 email", example = "hello@hifive.com")
    @NotBlank(message = "email은 필수입니다.")
    private String email;

    @Schema(description = "비밀번호", example = "q1w2e3r4")
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String pwd;

    @Schema(description = "권한", example = "PARENT")
    @NotBlank(message = "권한은 필수입니다.")
    private String role;
}
