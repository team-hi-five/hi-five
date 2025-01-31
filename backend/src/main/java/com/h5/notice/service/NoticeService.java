package com.h5.notice.service;

import com.h5.notice.dto.request.*;
import com.h5.notice.dto.response.NoticeDetailResponseDto;
import com.h5.notice.dto.response.NoticeListResponseDto;

public interface NoticeService {

    // 전체 글 + 페이징
    NoticeListResponseDto findAll(NoticeSearchRequestDto noticeSearchRequestDto);

    // 제목으로 검색 + 페이징
    NoticeListResponseDto findByTitle(NoticeSearchRequestDto noticeSearchRequestDto);

    // 작성자로 검색 + 페이징
    NoticeListResponseDto findByEmail(NoticeSearchRequestDto noticeSearchRequestDto);

    // 상세글 보기
    NoticeDetailResponseDto findById(int noticeId);

    // 조회수 증가
    void updateViewCnt(int noticeId);

    // 글 등록
    void createNotice(NoticeCreateRequestDto noticeCreateRequestDto);

    // 글 삭제
    void deleteNotice(int noticeId);

    // 글 수정
    int updateNotice(NoticeUpdateRequestDto noticeUpdateRequestDto);
}
