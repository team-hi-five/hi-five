package com.h5.consultant.controller;

import com.h5.consultant.dto.request.FindEmailRequestDto;
import com.h5.consultant.dto.request.UpdatePwdRequestDto;
import com.h5.consultant.dto.request.UpdateToTempPwdRequestDto;
import com.h5.consultant.service.ConsultantUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/consultant")
public class ConsultantUserController {

    private final ConsultantUserService consultantUserService;

    @Autowired
    public ConsultantUserController(ConsultantUserService consultantUserService) {
        this.consultantUserService = consultantUserService;
    }

    @PostMapping("/find-id")
    public ResponseEntity<String> findId(@Valid @RequestBody FindEmailRequestDto findEmailRequestDto) {
        String email = consultantUserService.findId(findEmailRequestDto.getName(), findEmailRequestDto.getPhone()).getEmail();
        return ResponseEntity.ok(email);
    }

    @PostMapping("/temp-pwd")
    public ResponseEntity<String> updateToTempPwd(@Valid @RequestBody UpdateToTempPwdRequestDto updateToTempPwdRequestDto) {
        consultantUserService.updateToTempPwd(updateToTempPwdRequestDto.getName(), updateToTempPwdRequestDto.getEmail());
        return ResponseEntity.ok("Temporary password sent successfully and updated.");
    }

    @PostMapping("/change-pwd")
    public ResponseEntity<String> updatePwd(@Valid @RequestBody UpdatePwdRequestDto updatePwdRequestDto) {
        consultantUserService.updatePwd(updatePwdRequestDto.getEmail(),
                updatePwdRequestDto.getOldPwd(),
                updatePwdRequestDto.getNewPwd());
        return ResponseEntity.ok("Password changed successfully.");
    }

}
