package com.h5.consultant.service;

import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.exception.UserNotFoundException;
import com.h5.global.util.MailUtil;
import com.h5.global.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ConsultantUserServiceImpl implements ConsultantUserService {

    private final ConsultantUserRepository consultantUserRepository;
    private final PasswordUtil passwordUtil;
    private final PasswordEncoder passwordEncoder;
    private final MailUtil mailUtil;

    @Autowired
    public ConsultantUserServiceImpl(ConsultantUserRepository consultantUserRepository,
                                     PasswordUtil passwordUtil,
                                     PasswordEncoder passwordEncoder,
                                     MailUtil mailUtil) {
        this.consultantUserRepository = consultantUserRepository;
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
}
