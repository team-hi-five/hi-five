package com.h5.deleterequest.service;

import com.h5.child.entity.ChildUserEntity;
import com.h5.child.repository.ChildUserRepository;
import com.h5.deleterequest.dto.response.GetMyDeleteChildResponseDto;
import com.h5.deleterequest.dto.response.GetMyDeleteResponseDto;
import com.h5.deleterequest.entity.DeleteUserRequestEntity;
import com.h5.deleterequest.repository.DeleteUserRequestRepository;
import com.h5.global.exception.UserNotFoundException;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DeleteUserRequestServiceImpl implements DeleteUserRequestService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final DeleteUserRequestRepository deleteUserRequestRepository;
    private final ParentUserRepository parentUserRepository;
    private final ChildUserRepository childUserRepository;

    @Autowired
    public DeleteUserRequestServiceImpl(DeleteUserRequestRepository deleteUserRequestRepository,
                                        ParentUserRepository parentUserRepository,
                                        ChildUserRepository childUserRepository) {
        this.deleteUserRequestRepository = deleteUserRequestRepository;
        this.parentUserRepository = parentUserRepository;
        this.childUserRepository = childUserRepository;
    }

    @Transactional
    @Override
    public DeleteUserRequestEntity deleteRequest() {
        String parentEmail = getAuthenticatedUserEmail();
        ParentUserEntity parentUserEntity = parentUserRepository.findByEmail(parentEmail)
                .orElseThrow(UserNotFoundException::new);

        return deleteUserRequestRepository.save(
                DeleteUserRequestEntity.builder()
                        .status(DeleteUserRequestEntity.Status.P)
                        .parentUser(parentUserEntity)
                        .consultantUser(parentUserEntity.getConsultantUserEntity())
                        .build()
        );
    }

    @Transactional
    @Override
    public DeleteUserRequestEntity deleteApprove(int deleteUserRequestId) {
        DeleteUserRequestEntity deleteUserRequestEntity = deleteUserRequestRepository.findById(deleteUserRequestId)
                .orElseThrow(UserNotFoundException::new);

        String deleteDttm = getDatetimeStr();

        Set<Integer> childUserIds = deleteUserRequestEntity.getParentUser().getChildUserEntities()
                .stream()
                .map(ChildUserEntity::getId)
                .collect(Collectors.toSet());
        childUserRepository.updateDeleteDttmForChildUsers(childUserIds, deleteDttm);

        // Update parent user
        ParentUserEntity parentUserEntity = deleteUserRequestEntity.getParentUser();
        parentUserEntity.setDeleteDttm(deleteDttm);
        parentUserRepository.save(parentUserEntity);

        // Update delete request entity
        deleteUserRequestEntity.setDeleteConfirmDttm(deleteDttm);
        deleteUserRequestEntity.setStatus(DeleteUserRequestEntity.Status.A);

        return deleteUserRequestRepository.save(deleteUserRequestEntity);
    }

    @Transactional
    @Override
    public DeleteUserRequestEntity deleteReject(int deleteUserRequestId) {
        DeleteUserRequestEntity deleteUserRequestEntity = deleteUserRequestRepository.findById(deleteUserRequestId)
                .orElseThrow(UserNotFoundException::new);

        deleteUserRequestEntity.setDeleteConfirmDttm(getDatetimeStr());
        deleteUserRequestEntity.setStatus(DeleteUserRequestEntity.Status.R);

        return deleteUserRequestRepository.save(deleteUserRequestEntity);
    }

    @Transactional
    @Override
    public List<GetMyDeleteResponseDto> getMyDelete() {
        String consultantEmail = getAuthenticatedUserEmail();

        return deleteUserRequestRepository.findALlByStatusAndConsultantUser_Email(DeleteUserRequestEntity.Status.P, consultantEmail)
                .stream()
                .map(deleteUserRequestEntity -> {
                    Set<GetMyDeleteChildResponseDto> childDtos = deleteUserRequestEntity.getParentUser().getChildUserEntities()
                            .stream()
                            .map(childUserEntity -> GetMyDeleteChildResponseDto.builder()
                                    .child_user_id(childUserEntity.getId())
                                    .child_name(childUserEntity.getName())
                                    .child_age(getAge(String.valueOf(childUserEntity.getBirth())))
                                    .gender(childUserEntity.getGender())
                                    .build())
                            .collect(Collectors.toSet());

                    return GetMyDeleteResponseDto.builder()
                            .delete_user_request_id(deleteUserRequestEntity.getId())
                            .parent_user_id(deleteUserRequestEntity.getParentUser().getId())
                            .parent_name(deleteUserRequestEntity.getParentUser().getName())
                            .children(childDtos)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private int getAge(String birth) {
        LocalDate childBirthDate = LocalDate.parse(birth, DATE_FORMATTER);
        return Period.between(childBirthDate, LocalDate.now()).getYears();
    }

    private String getDatetimeStr() {
        return LocalDateTime.now().format(DATETIME_FORMATTER);
    }
}
