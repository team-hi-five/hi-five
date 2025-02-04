package com.h5.session.controller;

import com.h5.session.dto.request.EndMeetingRequest;
import com.h5.session.dto.request.SessionJoinRequestDto;
import com.h5.session.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ssesion")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/join")
    public ResponseEntity<String> joinOrCreateMeeting(@Valid @RequestBody SessionJoinRequestDto sessionJoinRequestDto) {
        return ResponseEntity.ok(sessionService.joinMeeting(sessionJoinRequestDto));
    }

    @PostMapping("/end")
    public ResponseEntity<?> endMeeting(@RequestBody EndMeetingRequest endMeetingRequest) {
//        sessionService.endMeeting(endMeetingRequest.getType(), endMeetingRequest.getSchdlId());
        return ResponseEntity.ok("Meeting ended successfully");
    }
}
