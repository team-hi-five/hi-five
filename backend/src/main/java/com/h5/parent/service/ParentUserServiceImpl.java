package com.h5.parent.service;

import com.h5.child.entity.ChildUserEntity;
import com.h5.child.repository.ChildUserRepository;
import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.file.entity.FileEntity;
import com.h5.file.service.FileService;
import com.h5.global.exception.UserNotFoundException;
import com.h5.global.util.MailUtil;
import com.h5.global.util.PasswordUtil;
import com.h5.parent.dto.info.ConsultantInfo;
import com.h5.parent.dto.info.MyChildInfo;
import com.h5.parent.dto.info.MyInfo;
import com.h5.parent.dto.response.MyPageResponseDto;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ParentUserServiceImpl implements ParentUserService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ParentUserRepository parentUserRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ChildUserRepository childUserRepository;
    private final MailUtil mailUtil;
    private final PasswordEncoder passwordEncoder;
    private final PasswordUtil passwordUtil;
    private final FileService fileService;

    @Autowired
    public ParentUserServiceImpl(ParentUserRepository parentUserRepository,
                                 ConsultantUserRepository consultantUserRepository,
                                 ChildUserRepository childUserRepository,
                                 MailUtil mailUtil,
                                 PasswordEncoder passwordEncoder,
                                 PasswordUtil passwordUtil, FileService fileService) {
        this.parentUserRepository = parentUserRepository;
        this.consultantUserRepository = consultantUserRepository;
        this.childUserRepository = childUserRepository;
        this.mailUtil = mailUtil;
        this.passwordEncoder = passwordEncoder;
        this.passwordUtil = passwordUtil;
        this.fileService = fileService;
    }

    @Transactional
    @Override
    public MyPageResponseDto getMyPageInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String parentEmail = authentication.getName();

        ParentUserEntity parentUserEntity = findParentByEmail(parentEmail);
        MyInfo myInfo = buildMyInfo(parentUserEntity);
        List<MyChildInfo> myChildInfos = buildMyChildInfos(parentUserEntity.getId());
        ConsultantInfo consultantInfo = buildConsultantInfo(parentUserEntity);

        return MyPageResponseDto.builder()
                .myChildren(myChildInfos)
                .myInfo(myInfo)
                .consultantInfo(consultantInfo)
                .build();
    }

    private ParentUserEntity findParentByEmail(String email) {
        return parentUserRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Parent user not found for email: " + email));
    }

    private MyInfo buildMyInfo(ParentUserEntity parentUserEntity) {
        return MyInfo.builder()
                .parentId(parentUserEntity.getId())
                .email(parentUserEntity.getEmail())
                .name(parentUserEntity.getName())
                .phone(parentUserEntity.getPhone())
                .build();
    }

    private List<MyChildInfo> buildMyChildInfos(int parentId) {
        List<ChildUserEntity> childUserEntities = childUserRepository.findByParentUserEntity_Id(parentId)
                .orElseThrow(() -> new UserNotFoundException("Children not found for parent ID: " + parentId));

        List<MyChildInfo> myChildInfos = new ArrayList<>();
        for (ChildUserEntity child : childUserEntities) {
            LocalDate childBirthDate = LocalDate.parse(child.getBirth(), DATE_FORMATTER);
            int age = Period.between(childBirthDate, LocalDate.now()).getYears();

            myChildInfos.add(MyChildInfo.builder()
                    .childId(child.getId())
                    .profileImgUrl(fileService.getFileUrl(FileEntity.TblType.P, child.getId()).get(0).getUrl())
                    .name(child.getName())
                    .age(age)
                    .gender(child.getGender())
                    .build());
        }
        return myChildInfos;
    }

    private ConsultantInfo buildConsultantInfo(ParentUserEntity parentUserEntity) {
        ConsultantUserEntity consultant = consultantUserRepository.findById(parentUserEntity.getConsultantUserEntity().getId())
                .orElseThrow(() -> new UserNotFoundException("Consultant not found for parent ID: " + parentUserEntity.getId()));

        return ConsultantInfo.builder()
                .consultantId(consultant.getId())
                .consultantPhone(consultant.getPhone())
                .consultantEmail(consultant.getEmail())
                .centerName(consultant.getCenter().getCenterName())
                .centerPhone(consultant.getCenter().getCenterContact())
                .build();
    }

    @Override
    public ParentUserEntity findId(String name, String phone) {
        return parentUserRepository.findEmailByNameAndPhone(name, phone)
                .orElseThrow(() -> new UserNotFoundException("User not found for Name: " + name + ", Phone: " + phone));
    }

    @Override
    public void updateToTempPwd(String name, String email) {
        ParentUserEntity parentUserEntity = findParentByEmail(email);

        String tempPwd = passwordUtil.generatePassword();
        parentUserEntity.setPwd(passwordEncoder.encode(tempPwd));
        parentUserEntity.setTempPwd(true);

        parentUserRepository.save(parentUserEntity);
        mailUtil.sendTempPasswordEmail(email, email, tempPwd);
    }

    @Override
    public void updatePwd(String email, String oldPwd, String newPwd) {
        ParentUserEntity parentUserEntity = findParentByEmail(email);

        if (!passwordEncoder.matches(oldPwd, parentUserEntity.getPwd())) {
            throw new IllegalArgumentException("Old password does not match.");
        }

        parentUserEntity.setPwd(passwordEncoder.encode(newPwd));
        parentUserEntity.setTempPwd(false);

        parentUserRepository.save(parentUserEntity);
    }
}
