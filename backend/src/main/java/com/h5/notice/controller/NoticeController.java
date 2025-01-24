package com.h5.notice.controller;

import com.h5.notice.dto.request.NoticeCreateRequestDto;
import com.h5.notice.dto.response.NoticeDetailResponseDto;
import com.h5.notice.dto.response.NoticeResponseDto;
import com.h5.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Slf4j
@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
@Tag(name = "공지사항 API", description = "공지사항 관련 API")
public class NoticeController {
    
    private final NoticeService noticeService;

    @PostMapping("/list")
    @Operation(summary = "공지 목록 조회", description = "삭제되지 않은 공지사항 목록을 페이징 형태로 반환합니다.")
    public ResponseEntity<?> findAllByDeleteDttmIsNull(Pageable pageable) {
        try{
            Page<NoticeResponseDto> noticeResponseDto = noticeService.findAllByDeleteDttmIsNull(pageable);
            return ResponseEntity.ok(noticeResponseDto);
        } catch (Exception e) {
            throw new RuntimeException("공지사항을 불러올 수 없습니다", e);
        }
    }

    @PostMapping("/search-by-title")
    @Operation(summary = "공지사항 제목 검색", description = "제목으로 검색한 공지사항 목록을 페이징 형태로 반환합니다.")
    public ResponseEntity<?> findByTitleAndDeleteDttmIsNull(@RequestParam("title") String title, Pageable pageable) {
        try{
            Page<NoticeResponseDto> noticeResponseDto =  noticeService.findByTitle(title, pageable);
            return ResponseEntity.ok(noticeResponseDto);
        } catch (Exception e) {
            throw new RuntimeException(e);

        }
    }

    @PostMapping("/search-by-writer")
    @Operation(summary = "공지사항 작성자로 검색", description = "작성자로 검색한 공지사항 목록을 페이징 형태로 반환합니다.")
    public ResponseEntity<?> findByEmail(@RequestParam("email") String email, Pageable pageable) {
        try{
            Page<NoticeResponseDto> noticeResponseDto = noticeService.findByEmail(email, pageable);
            return ResponseEntity.ok(noticeResponseDto);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/{noticeId}")
    @Operation(summary = "공지사항 글 상세", description = "공지사항 글 상세내용을 조회합니다.")
    public ResponseEntity<?> findByNoticeId(@PathVariable int noticeId) {
        try{
            NoticeDetailResponseDto noticeDetailResponseDto = noticeService.findById(noticeId);
            if(noticeDetailResponseDto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(noticeDetailResponseDto);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/write")
    @Operation(summary = "공지사항 작성", description = "새로운 공지사항을 생성합니다.")
    public ResponseEntity<?> createNotice(NoticeCreateRequestDto noticeCreateRequestDto) {
        try{
            int result = noticeService.createNotice(noticeCreateRequestDto);
            if(result == 1) {
                return ResponseEntity.ok().build();
            }
        } catch (Exception e) {
            throw new RuntimeException("공지사항 등록 중 오류 발생", e);
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/delete/{id}")
    @Operation(summary = "공지사항 삭제", description = "특정 공지사항 글을 삭제합니다.")
    public ResponseEntity<?> deleteNotice(NoticeDetailResponseDto noticeDetailResponseDto) {
        try{

        }catch (Exception e) {

        }
        return ResponseEntity.badRequest().build();
    }
}
