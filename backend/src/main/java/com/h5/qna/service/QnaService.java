package com.h5.qna.service;

import com.h5.qna.dto.request.QnaCreateRequestDto;
import com.h5.qna.dto.request.QnaRequestDto;
import com.h5.qna.dto.request.QnaUpdateRequestDto;
import com.h5.qna.dto.response.QnaDetailResponseDto;
import com.h5.qna.dto.response.QnaResponseDto;
import org.springframework.data.domain.Page;

public interface QnaService {
    //c
    void createQna(QnaCreateRequestDto qnaCreateRequestDto, String authorizationHeader);

    //r
    //전체 글
    Page<QnaResponseDto> findAll(QnaRequestDto qnaRequestDto, String authorizationHeader);

    //제목으로
    Page<QnaResponseDto> findByTitle(QnaRequestDto qnaRequestDto, String authorizationHeader);

    //작성자로
    Page<QnaResponseDto> findByEmail(QnaRequestDto qnaRequestDto, String authorizationHeader);

    //상세
    QnaDetailResponseDto findById(int qnaId);

    //u
    void updateViewCnt(int qnaId);

    void updateQna(QnaUpdateRequestDto qnaUpdateRequestDto, String authorizationHeader);

    //d
    void deleteQna(int qnaId, String authorizationHeader);
}
