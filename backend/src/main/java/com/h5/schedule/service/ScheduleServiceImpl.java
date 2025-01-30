package com.h5.schedule.service;

import com.h5.child.repository.ChildUserRepository;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.exception.UserNotFoundException;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import com.h5.schedule.dto.request.*;
import com.h5.schedule.dto.response.ScheduleResponseDto;
import com.h5.schedule.entity.ConsultMeetingScheduleEntity;
import com.h5.schedule.entity.GameMeetingScheduleEntity;
import com.h5.schedule.repository.ConsultMeetingScheduleRepository;
import com.h5.schedule.repository.GameMeetingScheduleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {
    private final ConsultMeetingScheduleRepository consultMeetingScheduleRepository;
    private final GameMeetingScheduleRepository gameMeetingScheduleRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;
    private final ChildUserRepository childUserRepository;


    @Override
    public List<ScheduleResponseDto> getSchedulesByDate(ScheduleSearchByDateRequestDto scheduleSearchByDateRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String ConsultantEmail = authentication.getName();

        int consultantId = consultantUserRepository.findByEmail(ConsultantEmail)
                .orElseThrow(() -> new UserNotFoundException())
                .getId();

        String date = scheduleSearchByDateRequestDto.getDate();

        List<ConsultMeetingScheduleEntity> consultMeetings = consultMeetingScheduleRepository
                .findByHostIdAndSchdlDttm(consultantId, date);

        List<GameMeetingScheduleEntity> gameMeetings = gameMeetingScheduleRepository
                .findByHostIdAndSchdlDttm(consultantId, date);

        List<ScheduleResponseDto> schedules = new ArrayList<>();

        consultMeetings.forEach(consult -> schedules.add(
                ScheduleResponseDto.builder()
                        .scheduleId(consult.getId())
                        .schdlDttm(String.valueOf(consult.getSchdlDttm()))
                        .type("consult")
                        .consultantName(consult.getHost().getName())
                        .childName(consult.getChildUser().getName())
                        .parentName(consult.getParentUser().getName())
                        .status(consult.getStatus())
                        .build()
        ));

        gameMeetings.forEach(game -> schedules.add(
                ScheduleResponseDto.builder()
                        .scheduleId(game.getId())
                        .schdlDttm(String.valueOf(game.getSchdlDttm()))
                        .type("game")
                        .consultantName(game.getHost().getName())
                        .childName(game.getChildUser().getName())
                        .parentName(null)
                        .status(game.getStatus())
                        .build()
        ));

        return schedules.stream()
                .sorted(Comparator.comparing(ScheduleResponseDto::getSchdlDttm))
                .collect(Collectors.toList());
    }


    @Override
    public List<String> getScheduleDatesByChildId(ScheduleSearchByChildRequestDto scheduleSearchByChildRequestDto) {
        int childId = scheduleSearchByChildRequestDto.getChildId();

        List<String> consultDates = consultMeetingScheduleRepository.findDatesByChildId(childId);

        List<String> gameDates = gameMeetingScheduleRepository.findDatesByChildId(childId);

        return Stream.concat(consultDates.stream(), gameDates.stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleResponseDto> getSchedulesByChildId(ScheduleSearchByChildRequestDto scheduleSearchByChildRequestDto) {
        int childId = scheduleSearchByChildRequestDto.getChildId();

        List<ConsultMeetingScheduleEntity> consultMeetings = consultMeetingScheduleRepository.findByChildId(childId);

        List<GameMeetingScheduleEntity> gameMeetings = gameMeetingScheduleRepository.findByChildId(childId);

        List<ScheduleResponseDto> schedules = new ArrayList<>();

        consultMeetings.forEach(consult -> schedules.add(
                ScheduleResponseDto.builder()
                        .scheduleId(consult.getId())
                        .schdlDttm(String.valueOf(consult.getSchdlDttm()))
                        .type("consult")
                        .consultantName(consult.getHost().getName())
                        .childName(consult.getChildUser().getName())
                        .parentName(consult.getParentUser().getName())
                        .status(consult.getStatus())
                        .build()
        ));

        gameMeetings.forEach(game -> schedules.add(
                ScheduleResponseDto.builder()
                        .scheduleId(game.getId())
                        .schdlDttm(String.valueOf(game.getSchdlDttm()))
                        .type("game")
                        .consultantName(game.getHost().getName())
                        .childName(game.getChildUser().getName())
                        .parentName(null)
                        .status(game.getStatus())
                        .build()
        ));

        return schedules.stream()
                .sorted(Comparator.comparing(ScheduleResponseDto::getSchdlDttm))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAvailableTimes(ScheduleAvailableTimeRequestDto scheduleAvailableTimeRequestDto) {
        Integer consultantId = scheduleAvailableTimeRequestDto.getConsultantId();
        String date = scheduleAvailableTimeRequestDto.getDate();

        List<String> bookedTimes = new ArrayList<>();
        bookedTimes.addAll(consultMeetingScheduleRepository.findBookedTimesByConsultant(consultantId, date));
        bookedTimes.addAll(gameMeetingScheduleRepository.findBookedTimesByConsultant(consultantId, date));

        List<String> allTimes = new ArrayList<>();
        LocalTime start = LocalTime.of(9, 0);  // 상담 시작 시간
        LocalTime end = LocalTime.of(18, 0);   // 상담 종료 시간

        while (start.isBefore(end)) {
            allTimes.add(start.toString());
            start = start.plusHours(1);
        }

        return allTimes.stream()
                .filter(time -> !bookedTimes.contains(time))
                .collect(Collectors.toList());
    }

    @Override
    public void createSchedule(ScheduleSaveRequestDto scheduleSaveRequestDto) {
        Integer consultantId = scheduleSaveRequestDto.getConsultantId();
        Integer childId = scheduleSaveRequestDto.getChildId();
        String schdlDttm = scheduleSaveRequestDto.getSchdlDttm();
        String type = scheduleSaveRequestDto.getType();

        boolean isBooked = consultMeetingScheduleRepository.existsByConsultantAndDateTime(consultantId, schdlDttm)
                || gameMeetingScheduleRepository.existsByConsultantAndDateTime(consultantId, schdlDttm);

        if (isBooked) {
            throw new RuntimeException("Duplicated Schedule");
        }

        ParentUserEntity parent = parentUserRepository.findByChildId(childId)
//        @Query("SELECT p FROM ParentUserEntity p WHERE p.id = (SELECT c.parentUser.id FROM ChildUserEntity c WHERE c.id = :childId)")
//        Optional<ParentUserEntity> findByChildId(@Param("childId") Integer childId);
                .orElseThrow(() -> new UserNotFoundException());

        if ("consult".equals(type)) {
            ConsultMeetingScheduleEntity consultSchedule = ConsultMeetingScheduleEntity.builder()
                    .host(consultantUserRepository.findById(consultantId)
                            .orElseThrow(() -> new UserNotFoundException()))
                    .childUser(childUserRepository.findById(childId)
                            .orElseThrow(() -> new UserNotFoundException()))
                    .parentUser(parent)
                    .schdlDttm(LocalDateTime.parse(schdlDttm))
                    .status("P")
                    .build();
            consultMeetingScheduleRepository.save(consultSchedule);
        } else if ("game".equals(type)) {
            GameMeetingScheduleEntity gameSchedule = GameMeetingScheduleEntity.builder()
                    .host(consultantUserRepository.findById(consultantId)
                            .orElseThrow(() -> new RuntimeException("Consultant not found")))
                    .childUser(childUserRepository.findById(childId)
                            .orElseThrow(() -> new RuntimeException("Child not found")))
                    .schdlDttm(LocalDateTime.parse(schdlDttm))
                    .status("P")
                    .build();
            gameMeetingScheduleRepository.save(gameSchedule);
        } else {
            throw new RuntimeException("Invalid Schedule type");
        }
    }

    @Override
    public void updateSchedule(ScheduleSaveRequestDto scheduleSaveRequestDto) {
        Integer scheduleId = scheduleSaveRequestDto.getScheduleId();
        Integer consultantId = scheduleSaveRequestDto.getConsultantId();
        String schdlDttm = scheduleSaveRequestDto.getSchdlDttm();
        String type = scheduleSaveRequestDto.getType();

        if ("consult".equals(type)) {
            ConsultMeetingScheduleEntity consultSchedule = consultMeetingScheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new RuntimeException("Can not find Schedule"));

            boolean isBooked = consultMeetingScheduleRepository.existsByConsultantAndDateTime(consultantId, schdlDttm)
                    || gameMeetingScheduleRepository.existsByConsultantAndDateTime(consultantId, schdlDttm);

            if (isBooked && !String.valueOf(consultSchedule.getSchdlDttm()).equals(schdlDttm)) {
                throw new RuntimeException("Duplicated Schedule");
            }

            consultSchedule.setSchdlDttm(LocalDateTime.parse(schdlDttm));
            consultMeetingScheduleRepository.save(consultSchedule);

        } else if ("game".equals(type)) {
            GameMeetingScheduleEntity gameSchedule = gameMeetingScheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new RuntimeException("Can not find Schedule"));

            boolean isBooked = consultMeetingScheduleRepository.existsByConsultantAndDateTime(consultantId, schdlDttm)
                    || gameMeetingScheduleRepository.existsByConsultantAndDateTime(consultantId, schdlDttm);

            if (isBooked && !String.valueOf(gameSchedule.getSchdlDttm()).equals(schdlDttm)) {
                throw new RuntimeException("Duplicated Schedule");
            }

            gameSchedule.setSchdlDttm(LocalDateTime.parse(schdlDttm));
            gameMeetingScheduleRepository.save(gameSchedule);
        } else {
            throw new RuntimeException("Invalid schedule type.");
        }
    }

    @Override
    public void deleteSchedule(ScheduleDeleteRequestDto scheduleDeleteRequestDto) {
        int id = scheduleDeleteRequestDto.getId();
        String type = scheduleDeleteRequestDto.getType();

        if ("consult".equals(type)) {
            ConsultMeetingScheduleEntity consultSchedule = consultMeetingScheduleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Can not find ConsultMeetingSchedule"));

            if (consultSchedule.getDeleteDttm() != null) {
                throw new RuntimeException("This consultMeetingSchedule is already deleted");
            }

            consultMeetingScheduleRepository.modifyDeleteDttmById(id);

        } else if ("game".equals(type)) {
            GameMeetingScheduleEntity gameSchedule = gameMeetingScheduleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Can not find GameMeetingSchedule"));

            if (gameSchedule.getDeleteDttm() != null) {
                throw new RuntimeException("This schedule is already deleted.");
            }

            gameMeetingScheduleRepository.modifyDeleteDttmById(id);
        } else {
            throw new RuntimeException("Invalid schedule type.");
        }
    }

    @Override
    public List<ScheduleResponseDto> getSchedulesByParentId(ScheduleSearchByParentRequestDto scheduleSearchByParentRequestDto) {
        return List.of();
    }
}
