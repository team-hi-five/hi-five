package com.h5.alarm.service;

import com.h5.alarm.dto.AlarmDto;
import com.h5.alarm.dto.request.AlarmRequestDto;
import com.h5.child.repository.ChildUserRepository;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.exception.UserNotFoundException;
import com.h5.parent.repository.ParentUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AlarmServiceImpl implements AlarmService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ParentUserRepository parentUserRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ChildUserRepository childUserRepository;

    @Override
    public void sendAlarm(AlarmRequestDto alarmRequestDto) {
        boolean isGame = "game".equals(alarmRequestDto.getSessionType());
        boolean isConsultantSender = "ROLE_CONSULTANT".equals(alarmRequestDto.getSenderRole());

        String message;
        String toUserEmail;

        if (isConsultantSender) {
            message = isGame
                    ? "선생님이 기다리고 있어요!"
                    : "상담사가 기다리고 있습니다!";
            toUserEmail = getParentEmail(alarmRequestDto.getToUserId());
        } else {
            String childUserName = getChildUserName(alarmRequestDto.getSenderUserId());
            message = isGame
                    ? childUserName + " 이(가) 기다리고 있습니다!"
                    : childUserName + " 학부모님이 기다리고 있습니다!";
            toUserEmail = getConsultantEmail(alarmRequestDto.getToUserId());
        }

        AlarmDto alarmDto = AlarmDto.builder()
                .message(message)
                .toUserEmail(toUserEmail)
                .time(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSendToUser(alarmDto.getToUserEmail(), "/queue/alarms", alarmDto);
    }

    private String getParentEmail(int childUserId) {
        int parentUserId = childUserRepository.findById(childUserId)
                .orElseThrow(UserNotFoundException::new)
                .getParentUserEntity()
                .getId();
        return parentUserRepository.findById(parentUserId)
                .orElseThrow(UserNotFoundException::new)
                .getEmail();
    }

    private String getConsultantEmail(int consultantUserId) {
        return consultantUserRepository.findById(consultantUserId)
                .orElseThrow(UserNotFoundException::new)
                .getEmail();
    }

    private String getChildUserName(int childUserId) {
        return childUserRepository.findById(childUserId)
                .orElseThrow(UserNotFoundException::new)
                .getName();
    }

}
