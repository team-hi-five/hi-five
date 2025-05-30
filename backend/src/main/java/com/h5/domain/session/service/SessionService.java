package com.h5.domain.session.service;

import com.h5.domain.session.dto.request.CloseSessionRequestDto;
import com.h5.domain.session.dto.request.ControlRequest;
import com.h5.domain.session.dto.request.JoinSessionRequestDto;

public interface SessionService {

//    String startMeeting(SessionCreateRequestDto sessionCreateRequestDto);

    String joinMeeting(JoinSessionRequestDto joinSessionRequestDto);

    void endMeeting(CloseSessionRequestDto closeSessionRequestDto);

    void processControlMessage(ControlRequest controlRequest);
}
