package com.h5.session.service;

import com.h5.global.exception.ScheduleNotFoundException;
import com.h5.schedule.entity.ConsultMeetingScheduleEntity;
import com.h5.schedule.entity.GameMeetingScheduleEntity;
import com.h5.schedule.repository.ConsultMeetingScheduleRepository;
import com.h5.schedule.repository.GameMeetingScheduleRepository;
import com.h5.session.dto.request.CloseSessionRequestDto;
import com.h5.session.dto.request.JoinSessionRequestDto;
import com.h5.session.repository.ConsultSessionRepository;
import com.h5.session.repository.GameSessionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {
    private final GameMeetingScheduleRepository gameMeetingScheduleRepository;
    private final OpenViduServiceImpl openViduServiceImpl;
    private final GameSessionRepository gameSessionRepository;
    private final ConsultMeetingScheduleRepository consultMeetingScheduleRepository;
    private final OpenViduService openViduService;
    private final ConsultSessionRepository consultSessionRepository;

    public String startMeeting(String type, int scheduleId) {

        if("game".equals(type)){
            GameMeetingScheduleEntity gameMeetingScheduleEntity = gameMeetingScheduleRepository.findById(scheduleId)
                    .orElseThrow(ScheduleNotFoundException::new);

            if(gameMeetingScheduleEntity.getSessionId() != null) {
                throw new IllegalArgumentException("Meeting already started");
            }
            if(gameMeetingScheduleEntity.getDeleteDttm() != null){
                throw new IllegalArgumentException("Meeting already ended");
            }

            String sessionId = openViduServiceImpl.createSession();
            gameSessionRepository.updateSessionId(gameMeetingScheduleEntity.getId(), sessionId);

            return sessionId;

        } else if ("consult".equals(type)) {
            ConsultMeetingScheduleEntity consultMeetingScheduleEntity = consultMeetingScheduleRepository.findById(scheduleId)
                    .orElseThrow(ScheduleNotFoundException::new);

            if(consultMeetingScheduleEntity.getSessionId() != null) {
                throw new IllegalArgumentException("Meeting already started");
            }
            if(consultMeetingScheduleEntity.getDeleteDttm() != null){
                throw new IllegalArgumentException("Meeting already ended");
            }

            String sessionId = openViduServiceImpl.createSession();
            consultSessionRepository.updateSessionId(consultMeetingScheduleEntity.getId(), sessionId);

            return sessionId;

        }else{
            throw new RuntimeException("wrong type");
        }
    }

    @Override
    public String joinMeeting(JoinSessionRequestDto joinSessionRequestDto) {
        String type = joinSessionRequestDto.getType();
        int scheduleId = joinSessionRequestDto.getScheduleId();

        if ("game".equals(type)) {
            GameMeetingScheduleEntity gameMeetingScheduleEntity = gameMeetingScheduleRepository.findById(scheduleId)
                    .orElseThrow(ScheduleNotFoundException::new);

            String sessionId;
            if(gameMeetingScheduleEntity.getSessionId() == null) {
                sessionId = startMeeting(type, scheduleId);
            }else{
                sessionId = gameMeetingScheduleEntity.getSessionId();
            }

            return openViduService.createConnection(sessionId);

        }else if("consult".equals(type)) {
            ConsultMeetingScheduleEntity consultMeetingScheduleEntity = consultMeetingScheduleRepository.findById(scheduleId)
                    .orElseThrow(ScheduleNotFoundException::new);

            String sessionId;
            if(consultMeetingScheduleEntity.getSessionId() == null) {
                sessionId = startMeeting(type, scheduleId);
            }else{
                sessionId = consultMeetingScheduleEntity.getSessionId();
            }

            return openViduService.createConnection(sessionId);

        }else{
            throw new RuntimeException("wrong type");
        }
    }

    @Override
    @Transactional
    public void endMeeting(CloseSessionRequestDto closeSessionRequestDto) {
        String type = closeSessionRequestDto.getType();
        int schdlId = closeSessionRequestDto.getSchdlId();

        if ("game".equals(type)) {
            GameMeetingScheduleEntity gameMeeting = gameMeetingScheduleRepository.findById(schdlId)
                    .orElseThrow(() -> new IllegalArgumentException("Game meeting not found"));

            if ("E".equals(gameMeeting.getStatus())) {
                throw new IllegalStateException("Meeting already ended");
            }

            gameMeeting.setStatus("E");
            gameSessionRepository.save(gameMeeting);

        } else if ("consult".equals(type)) {
            ConsultMeetingScheduleEntity consultMeeting = consultMeetingScheduleRepository.findById(schdlId)
                    .orElseThrow(() -> new IllegalArgumentException("Consult meeting not found"));

            if ("E".equals(consultMeeting.getStatus())) {
                throw new IllegalStateException("Meeting already ended");
            }

            consultMeeting.setStatus("E");
            consultSessionRepository.save(consultMeeting);
        } else{
            throw new RuntimeException("wrong type");
        }

    }

}
