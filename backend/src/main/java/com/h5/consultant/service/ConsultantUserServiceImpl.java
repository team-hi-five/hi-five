package com.h5.consultant.service;

import com.h5.child.entity.ChildUserEntity;
import com.h5.child.repository.ChildUserRepository;
import com.h5.consultant.dto.request.RegisterParentAccountDto;
import com.h5.consultant.dto.response.GetChildResponseDto;
import com.h5.consultant.dto.response.GetMyChildrenResponseDto;
import com.h5.consultant.dto.response.MyProfileResponseDto;
import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.exception.ParentAccountRegistrationException;
import com.h5.global.exception.UserNotFoundException;
import com.h5.global.util.MailUtil;
import com.h5.global.util.PasswordUtil;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSendException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConsultantUserServiceImpl implements ConsultantUserService {

    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;
    private final ChildUserRepository childUserRepository;
    private final PasswordUtil passwordUtil;
    private final PasswordEncoder passwordEncoder;
    private final MailUtil mailUtil;

    @Autowired
    public ConsultantUserServiceImpl(ConsultantUserRepository consultantUserRepository,
                                     ParentUserRepository parentUserRepository,
                                     ChildUserRepository childUserRepository,
                                     PasswordUtil passwordUtil,
                                     PasswordEncoder passwordEncoder,
                                     MailUtil mailUtil) {
        this.consultantUserRepository = consultantUserRepository;
        this.parentUserRepository = parentUserRepository;
        this.childUserRepository = childUserRepository;
        this.passwordUtil = passwordUtil;
        this.passwordEncoder = passwordEncoder;
        this.mailUtil = mailUtil;
    }

    @Override
    public ConsultantUserEntity findId(String name, String phone) {
        return consultantUserRepository.findEmailByNameAndPhone(name, phone)
                .orElseThrow(() -> new UserNotFoundException("User not found for Name: " + name + ", Phone: " + phone));
    }

    @Override
    public void updateToTempPwd(String name, String email) {
        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for Email: " + email));

        String tempPwd = passwordUtil.generatePassword();
        consultantUser.setPwd(passwordEncoder.encode(tempPwd));
        consultantUser.setTempPwd(true);

        consultantUserRepository.save(consultantUser);
        mailUtil.sendTempPasswordEmail(email, email, tempPwd);
    }

    @Override
    public void updatePwd(String email, String oldPwd, String newPwd) {
        ConsultantUserEntity consultantUserEntity = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for Email: " + email));

        if (!passwordEncoder.matches(oldPwd, consultantUserEntity.getPwd())) {
            throw new IllegalArgumentException("Old password does not match.");
        }

        consultantUserEntity.setPwd(passwordEncoder.encode(newPwd));
        consultantUserEntity.setTempPwd(false);

        consultantUserRepository.save(consultantUserEntity);
    }

    @Override
    public boolean registerParentAccount(RegisterParentAccountDto registerParentAccountDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String consultantEmail = authentication.getName();

            ConsultantUserEntity consultantUserEntity = consultantUserRepository.findByEmail(consultantEmail)
                    .orElseThrow(() -> new UserNotFoundException("Consultant user not found for Email: " + consultantEmail));

            String initPwd = passwordUtil.generatePassword();
            String encodedPwd = passwordEncoder.encode(initPwd);

            ParentUserEntity parentUserEntity = ParentUserEntity.builder()
                    .name(registerParentAccountDto.getParentName())
                    .email(registerParentAccountDto.getParentEmail())
                    .pwd(encodedPwd)
                    .phone(registerParentAccountDto.getParentPhone())
                    .tempPwd(true)
                    .consultantUserEntity(consultantUserEntity)
                    .build();

            parentUserEntity = parentUserRepository.save(parentUserEntity);

            ChildUserEntity childUserEntity = ChildUserEntity.builder()
                    .name(registerParentAccountDto.getChildName())
                    .birth(registerParentAccountDto.getChildBirth())
                    .gender(registerParentAccountDto.getChildGender())
                    .firstConsultDt(registerParentAccountDto.getFirstConsultDt())
                    .interest(registerParentAccountDto.getChildInterest())
                    .additionalInfo(registerParentAccountDto.getChildAdditionalInfo())
                    .parentUserEntity(parentUserEntity)
                    .consultantUserEntity(consultantUserEntity)
                    .build();

            childUserRepository.save(childUserEntity);

            try {
                mailUtil.sendRegistrationEmail(registerParentAccountDto.getParentEmail(), registerParentAccountDto.getParentEmail(), initPwd);
            } catch (Exception e) {
                throw new MailSendException("Failed to send registration email to: " + registerParentAccountDto.getParentEmail(), e);
            }

            return true;
        } catch (UserNotFoundException | MailSendException e) {
            throw e;
        } catch (Exception e) {
            throw new ParentAccountRegistrationException("Failed to register parent account", e);
        }
    }

    @Override
    public List<GetMyChildrenResponseDto> getChildrenForAuthenticatedConsultant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String consultantEmail = authentication.getName();

        int consultantId = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found for Email: " + consultantEmail)).getId();

        List<ChildUserEntity> childUserEntities = childUserRepository.findByConsultantUserEntity_Id(consultantId)
                .orElse(new ArrayList<>());

        List<GetMyChildrenResponseDto> getMyChildrenResponseDtos = new ArrayList<>();
        for (ChildUserEntity childUserEntity : childUserEntities) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate localDate = LocalDate.parse(childUserEntity.getBirth(), formatter);

            LocalDate currentDate = LocalDate.now();

            String parentName = parentUserRepository.findNameById(childUserEntity.getParentUserEntity().getId())
                    .orElseThrow(() -> new UserNotFoundException("Parent user not found for child name: " + childUserEntity.getName()));

            getMyChildrenResponseDtos.add(
                    GetMyChildrenResponseDto.builder()
                            .childUserID(childUserEntity.getId())
                            .childName(childUserEntity.getName())
                            .birth(childUserEntity.getBirth())
                            .age(Period.between(localDate, currentDate).getYears())
                            .parentName(parentName)
                            .build()
            );
        }

        return getMyChildrenResponseDtos;
    }

    @Transactional
    @Override
    public GetChildResponseDto getChild(int childUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String consultantEmail = authentication.getName();

        int consultantId = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found for Email: " + consultantEmail)).getId();

        ChildUserEntity childUserEntity = childUserRepository.findByIdAndConsultantUserEntity_Id(childUserId, consultantId)
                .orElseThrow(() -> new UserNotFoundException("Child user not found for childUserId: " + childUserId + " consuntant email: " + consultantEmail));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate localDate = LocalDate.parse(childUserEntity.getBirth(), formatter);

        LocalDate currentDate = LocalDate.now();

        // TODO: 프로필 사진 해야함

        return GetChildResponseDto.builder()
                .childUserId(childUserEntity.getId())
                .profileImgUrl(null)
                .childName(childUserEntity.getName())
                .age(Period.between(localDate, currentDate).getYears())
                .birth(childUserEntity.getBirth())
                .firstConsultDate(childUserEntity.getFirstConsultDt())
                .interest(childUserEntity.getInterest())
                .additionalInfo(childUserEntity.getAdditionalInfo())
                .parentName(childUserEntity.getParentUserEntity().getName())
                .parentPhone(childUserEntity.getParentUserEntity().getPhone())
                .parentEmail(childUserEntity.getParentUserEntity().getEmail())
                .build();
    }

    @Override
    public MyProfileResponseDto getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String consultantEmail = authentication.getName();

        ConsultantUserEntity consultantUserEntity = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found for Email: " + consultantEmail));

        return MyProfileResponseDto.builder()
                .name(consultantUserEntity.getName())
                .email(consultantUserEntity.getEmail())
                .phone(consultantUserEntity.getPhone())
                .centerName(consultantUserEntity.getCenter().getCenterName())
                .centerPhone(consultantUserEntity.getCenter().getCenterContact())
                .build();
    }
}
