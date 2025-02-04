package com.h5.session.service;

import com.h5.session.dto.request.SessionCreateRequestDto;
import com.h5.session.dto.request.SessionJoinRequestDto;

public interface SessionService {

//    String startMeeting(SessionCreateRequestDto sessionCreateRequestDto);

    String joinMeeting(SessionJoinRequestDto sessionJoinRequestDto);

    void endMeeting(SessionJoinRequestDto sessionJoinRequestDto);
}
