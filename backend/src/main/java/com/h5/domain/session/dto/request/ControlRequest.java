package com.h5.domain.session.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ControlRequest {
    private String sessionId;
    private String action;

}
