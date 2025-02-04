package com.h5.session.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EndMeetingRequest {
    private int schdlId;
    private String type;
}
