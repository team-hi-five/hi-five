package com.h5.deleterequest.service;

import com.h5.deleterequest.dto.response.GetMyDeleteResponseDto;
import com.h5.deleterequest.entity.DeleteUserRequestEntity;

import java.util.List;

public interface DeleteUserRequestService {
    // 탈퇴 요청
    DeleteUserRequestEntity deleteRequest();

    // 탈퇴 승인
    DeleteUserRequestEntity deleteApprove(int deleteUserRequestId);

    // 탈퇴 거절
    DeleteUserRequestEntity deleteReject(int deleteUserRequestId);

    // 내 탈퇴 요청 리스트
    List<GetMyDeleteResponseDto> getMyDelete();
}
