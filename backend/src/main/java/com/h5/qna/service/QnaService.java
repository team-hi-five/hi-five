package com.h5.qna.service;

import com.h5.qna.dto.request.QnaCreateRequestDto;
import com.h5.qna.dto.request.QnaRequestDto;
import com.h5.qna.dto.request.QnaUpdateRequestDto;
import com.h5.qna.dto.response.QnaDetailResponseDto;
import com.h5.qna.dto.response.QnaResponseDto;
import org.springframework.data.domain.Page;

public interface QnaService {
    //c
    void createQna(QnaCreateRequestDto qnaCreateRequestDto);

    //r
    //전체 글
    Page<QnaResponseDto> findAll(QnaRequestDto qnaRequestDto);

    //제목으로
    Page<QnaResponseDto> findByTitle(QnaRequestDto qnaRequestDto);

    //작성자로
    Page<QnaResponseDto> findByEmail(QnaRequestDto qnaRequestDto);

    //상세
    QnaDetailResponseDto findById(int qnaId);

    //u
    void updateViewCnt(int qnaId);

    void updateQna(QnaUpdateRequestDto qnaUpdateRequestDto);

    //d
    void deleteQna(int qnaId);
}
