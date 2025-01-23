package com.h5.notice.service;

import com.h5.notice.dto.response.NoticeDetailResponseDto;
import com.h5.notice.dto.response.NoticeResponseDto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NoticeService {

    //삭제안된 전체 글 + 페이징
    Page<NoticeResponseDto> findAllByDeleteDttmIsNull(Pageable pageable);

    //제목으로 검색 + 페이징
    Page<NoticeResponseDto> findByTitle(@NotNull String title, Pageable pageable);

    //작성자로 검색 + 페이징
    Page<NoticeResponseDto> findByEmail(@Size(max = 30) @NotNull String consultantUserEmail, Pageable pageable);

    //상세글 보기
    NoticeDetailResponseDto findById(int noticeId);

    // 조회수 증가
    void updateViewCnt(int noticeId);
}
