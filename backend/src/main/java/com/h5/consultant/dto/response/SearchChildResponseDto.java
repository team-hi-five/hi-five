package com.h5.consultant.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
@Builder
public class SearchChildResponseDto {
    private String childUserName;
    private String parentUserName;
    private String parentUserEmail;
}
