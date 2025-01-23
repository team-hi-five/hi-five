package com.h5.notice.controller;

import com.h5.notice.dto.response.NoticeDetailResponseDto;
import com.h5.notice.dto.response.NoticeResponseDto;
import com.h5.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
@Tag(name = "공지사항 API", description = "공지사항 관련 API")
public class NoticeController {
    
    private final NoticeService noticeService;

    //전체 글 리스트
    @PostMapping("/list")
    @Operation(summary = "공지 목록 조회", description = "삭제되지 않은 공지사항 목록을 페이징 형태로 반환합니다.")
    public Page<NoticeResponseDto> findAllByDeleteDttmIsNull(Pageable pageable) {
        return noticeService.findAllByDeleteDttmIsNull(pageable);
    }

    //제목으로 검색
    @PostMapping("/search-by-title")
    @Operation(summary = "공지사항 제목 검색", description = "제목으로 검색한 공지사항 목록을 페이징 형태로 반환합니다.")
    public Page<NoticeResponseDto> findByTitleAndDeleteDttmIsNull(@RequestParam("title") String title, Pageable pageable) {
        return noticeService.findByTitle(title, pageable);
    }

    //작성자로 검색
    @PostMapping("/search-by-writer")
    @Operation(summary = "공지사항 작성자로 검색", description = "작성자로 검색한 공지사항 목록을 페이징 형태로 반환합니다.")
    public Page<NoticeResponseDto> findByEmail(@RequestParam("email") String email, Pageable pageable) {
        return noticeService.findByEmail(email, pageable);
    }

    //상세글 보기
    @GetMapping("/{noticeId}")
    @Operation
    public NoticeDetailResponseDto findByNoticeId(@PathVariable int noticeId) {
        return noticeService.findById(noticeId);
    }


}
