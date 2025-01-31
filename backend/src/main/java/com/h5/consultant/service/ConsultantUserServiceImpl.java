package com.h5.consultant.service;

import com.h5.child.entity.ChildUserEntity;
import com.h5.child.repository.ChildUserRepository;
import com.h5.consultant.dto.request.RegisterParentAccountDto;
import com.h5.consultant.dto.response.GetChildResponseDto;
import com.h5.consultant.dto.response.GetMyChildrenResponseDto;
import com.h5.consultant.dto.response.MyProfileResponseDto;
import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.file.entity.FileEntity;
import com.h5.file.service.FileService;
import com.h5.global.exception.ParentAccountRegistrationException;
import com.h5.global.exception.UserNotFoundException;
import com.h5.global.util.MailUtil;
import com.h5.global.util.PasswordUtil;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final FileService fileService;

    @Autowired
    public ConsultantUserServiceImpl(ConsultantUserRepository consultantUserRepository,
                                     ParentUserRepository parentUserRepository,
                                     ChildUserRepository childUserRepository,
                                     PasswordUtil passwordUtil,
                                     PasswordEncoder passwordEncoder,
                                     MailUtil mailUtil,
                                     FileService fileService) {
        this.consultantUserRepository = consultantUserRepository;
        this.parentUserRepository = parentUserRepository;
        this.childUserRepository = childUserRepository;
        this.passwordUtil = passwordUtil;
        this.passwordEncoder = passwordEncoder;
        this.mailUtil = mailUtil;
        this.fileService = fileService;
    }

    private String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private int calculateAge(String birthDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate birthLocalDate = LocalDate.parse(birthDate, formatter);
        return Period.between(birthLocalDate, LocalDate.now()).getYears();
    }

    private String getFileUrl(int tblId) {
        return fileService.getFileUrl(FileEntity.TblType.P, tblId).get(0).getUrl();
    }

    @Override
    public ConsultantUserEntity findId(String name, String phone) {
        return consultantUserRepository.findEmailByNameAndPhone(name, phone)
                .orElseThrow(UserNotFoundException::new);
    }

    @Override
    public void updateToTempPwd(String name, String email) {
        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        String tempPwd = passwordUtil.generatePassword();
        consultantUser.setPwd(passwordEncoder.encode(tempPwd));
        consultantUser.setTempPwd(true);

        consultantUserRepository.save(consultantUser);
        mailUtil.sendTempPasswordEmail(email, email, tempPwd);
    }

    @Override
    public void updatePwd(String email, String oldPwd, String newPwd) {
        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(oldPwd, consultantUser.getPwd())) {
            throw new IllegalArgumentException("Old password does not match.");
        }

        consultantUser.setPwd(passwordEncoder.encode(newPwd));
        consultantUser.setTempPwd(false);

        consultantUserRepository.save(consultantUser);
    }

    @Override
    public boolean registerParentAccount(RegisterParentAccountDto registerParentAccountDto) {
        String consultantEmail = getAuthenticatedEmail();

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(UserNotFoundException::new);

        String initPwd = passwordUtil.generatePassword();
        ParentUserEntity parentUser = ParentUserEntity.builder()
                .name(registerParentAccountDto.getParentName())
                .email(registerParentAccountDto.getParentEmail())
                .pwd(passwordEncoder.encode(initPwd))
                .phone(registerParentAccountDto.getParentPhone())
                .tempPwd(true)
                .consultantUserEntity(consultantUser)
                .build();

        parentUserRepository.save(parentUser);



        ChildUserEntity childUser = ChildUserEntity.builder()
                .name(registerParentAccountDto.getChildName())
                .birth(LocalDate.parse(registerParentAccountDto.getChildBirth()))
                .gender(registerParentAccountDto.getChildGender())
                .firstConsultDt(LocalDate.parse(registerParentAccountDto.getFirstConsultDt()))
                .interest(registerParentAccountDto.getChildInterest())
                .additionalInfo(registerParentAccountDto.getChildAdditionalInfo())
                .parentUserEntity(parentUser)
                .consultantUserEntity(consultantUser)
                .build();

        childUserRepository.save(childUser);

        try {
            mailUtil.sendRegistrationEmail(registerParentAccountDto.getParentEmail(), registerParentAccountDto.getParentEmail(), initPwd);
        } catch (Exception e) {
            throw new ParentAccountRegistrationException("Failed to send registration email", e);
        }

        return true;
    }

    @Override
    public List<GetMyChildrenResponseDto> getChildrenForAuthenticatedConsultant() {
        String consultantEmail = getAuthenticatedEmail();

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(UserNotFoundException::new);

        List<ChildUserEntity> childUsers = childUserRepository.findByConsultantUserEntity_Id(consultantUser.getId())
                .orElse(new ArrayList<>());

        List<GetMyChildrenResponseDto> responseDtos = new ArrayList<>();
        for (ChildUserEntity child : childUsers) {
            responseDtos.add(
                    GetMyChildrenResponseDto.builder()
                            .childUserID(child.getId())
                            .profileImgUrl(getFileUrl(child.getId()))
                            .childName(child.getName())
                            .birth(String.valueOf(child.getBirth()))
                            .age(calculateAge(String.valueOf(child.getBirth())))
                            .parentName(child.getParentUserEntity().getName())
                            .build()
            );
        }
        return responseDtos;
    }

    @Transactional
    @Override
    public GetChildResponseDto getChild(int childUserId) {
        String consultantEmail = getAuthenticatedEmail();

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(UserNotFoundException::new);

        ChildUserEntity childUser = childUserRepository.findByIdAndConsultantUserEntity_Id(childUserId, consultantUser.getId())
                .orElseThrow(UserNotFoundException::new);

        return GetChildResponseDto.builder()
                .childUserId(childUser.getId())
                .profileImgUrl(getFileUrl(childUser.getId()))
                .childName(childUser.getName())
                .age(calculateAge(String.valueOf(childUser.getBirth())))
                .birth(String.valueOf(childUser.getBirth()))
                .firstConsultDate(String.valueOf(childUser.getFirstConsultDt()))
                .interest(childUser.getInterest())
                .additionalInfo(childUser.getAdditionalInfo())
                .parentName(childUser.getParentUserEntity().getName())
                .parentPhone(childUser.getParentUserEntity().getPhone())
                .parentEmail(childUser.getParentUserEntity().getEmail())
                .build();
    }

    @Override
    public MyProfileResponseDto getMyProfile() {
        String consultantEmail = getAuthenticatedEmail();

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(consultantEmail)
                .orElseThrow(UserNotFoundException::new);

        return MyProfileResponseDto.builder()
                .profileImgUrl(getFileUrl(consultantUser.getId()))
                .name(consultantUser.getName())
                .email(consultantUser.getEmail())
                .phone(consultantUser.getPhone())
                .centerName(consultantUser.getCenter().getCenterName())
                .centerPhone(consultantUser.getCenter().getCenterContact())
                .build();
    }
}
