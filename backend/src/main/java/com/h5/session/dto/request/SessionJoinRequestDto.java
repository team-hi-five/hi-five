package com.h5.session.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SessionJoinRequestDto {
    @NotNull
    private int sessionId;

    @NotNull
    private int scheduleId;

    private String type;
}
